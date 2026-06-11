import { useState } from "react";
import { findLesson } from "./data/course";
import { useAuth } from "./lib/auth";
import { useProgress } from "./lib/progress";
import Home from "./components/Home";
import LessonScreen from "./components/LessonScreen";
import LoginGate from "./components/LoginGate";

type View =
  | { screen: "home" }
  | { screen: "lesson"; unitId: string; lessonId: string; practice: boolean };

const SKIP_KEY = "lingua-skip-login";

export default function App() {
  const [view, setView] = useState<View>({ screen: "home" });
  const auth = useAuth();
  const [skippedLogin, setSkippedLogin] = useState(
    () => localStorage.getItem(SKIP_KEY) === "1",
  );
  const { progress, completeLesson } = useProgress(auth.user?.id ?? null);

  // Laisse Firebase restaurer la session avant d'afficher quoi que ce soit
  if (auth.enabled && !auth.ready) {
    return <div className="loading-screen">🇪🇸</div>;
  }

  // Page de connexion Google à l'entrée du site
  if (auth.enabled && !auth.user && !skippedLogin) {
    return (
      <LoginGate
        auth={auth}
        onSkip={() => {
          localStorage.setItem(SKIP_KEY, "1");
          setSkippedLogin(true);
        }}
      />
    );
  }

  if (view.screen === "lesson") {
    const { unit, lesson } = findLesson(view.unitId, view.lessonId);
    return (
      <LessonScreen
        key={`${view.lessonId}-${view.practice}`}
        unit={unit}
        lesson={lesson}
        practice={view.practice}
        onComplete={(perfect) =>
          completeLesson(lesson.id, { perfect, practice: view.practice })
        }
        onExit={() => setView({ screen: "home" })}
      />
    );
  }

  return (
    <Home
      progress={progress}
      auth={auth}
      onShowLogin={() => {
        localStorage.removeItem(SKIP_KEY);
        setSkippedLogin(false);
      }}
      onStartLesson={(unitId, lessonId, practice) =>
        setView({ screen: "lesson", unitId, lessonId, practice })
      }
    />
  );
}
