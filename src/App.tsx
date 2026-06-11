import { useState } from "react";
import { findLesson } from "./data/course";
import { useAuth } from "./lib/auth";
import { useProgress } from "./lib/progress";
import Home from "./components/Home";
import LessonScreen from "./components/LessonScreen";

type View =
  | { screen: "home" }
  | { screen: "lesson"; unitId: string; lessonId: string; practice: boolean };

export default function App() {
  const [view, setView] = useState<View>({ screen: "home" });
  const auth = useAuth();
  const { progress, completeLesson } = useProgress(auth.user?.id ?? null);

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
      onStartLesson={(unitId, lessonId, practice) =>
        setView({ screen: "lesson", unitId, lessonId, practice })
      }
    />
  );
}
