import { useState } from "react";
import { Exercise } from "./Exercise";
import { levelExerciseContent } from "../data/levelExercise";

export const LevelExercise = () => {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
  };

  return (
    <div className="level-exercise">
      <h2 className="section-h2">{levelExerciseContent.title}</h2>

      {!completed && (
        <Exercise
          content={levelExerciseContent.content}
          id={levelExerciseContent.id}
          onComplete={handleComplete}
        />
      )}

      {completed && (
        <div>
          <h3 className="section-h3">¡Felicidades! Has completado la Prueba de Nivel.</h3>
          <button className="submit-btn" onClick={() => (window.location.href = "/")}>
            ← Volver al curso
          </button>
        </div>
      )}
    </div>
  );
};
