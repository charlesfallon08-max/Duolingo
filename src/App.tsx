import { useState } from "react";
import { findLesson } from "./data/course";
import { useProgress } from "./lib/progress";
import Home from "./components/Home";
import LessonScreen from "./components/LessonScreen";

type View =
  | { screen: "home" }
  | { screen: "lesson"; unitId: string; lessonId: string; practice: boolean };

export default function App() {
  const [view, setView] = useState<View>({ screen: "home" });
  const { progress, loseHeart, completeLesson } = useProgress();

  if (view.screen === "lesson") {
    const { unit, lesson } = findLesson(view.unitId, view.lessonId);
    return (
      <LessonScreen
        key={`${view.lessonId}-${view.practice}`}
        unit={unit}
        lesson={lesson}
        practice={view.practice}
        hearts={progress.hearts}
        onLoseHeart={loseHeart}
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
      onStartLesson={(unitId, lessonId, practice) =>
        setView({ screen: "lesson", unitId, lessonId, practice })
      }
    />
  );
}
