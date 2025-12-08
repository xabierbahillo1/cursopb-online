import { useState, useMemo } from 'react';
import { FinalExerciseScreen } from './FinalExerciseScreen';

export const Quiz = ({ content, onComplete }) => {
  // Mezclar preguntas una sola vez al inicio
  const questions = useMemo(() => {
    return [...content.questions].sort(() => Math.random() - 0.5);
  }, [content.questions]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSubmit = () => {
    if (selected === null) return;

    const isCorrect = selected === question.correctAnswer;
    setAnswers(prev => [...prev, isCorrect]);
    setShowResult(true); // Mostrar la explicación
  };

  const handleContinue = () => {
    setShowResult(false);
    setSelected(null);
    setShowHint(false);
    if (isLastQuestion) {
      // Mostrar pantalla final
      setShowFinalScreen(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelected(null);
    setShowResult(false);
    setAnswers([]);
    setShowFinalScreen(false);
    setShowHint(false);
  };

  const correctCount = answers.filter(Boolean).length;
  const totalAnswered = answers.length;
  const finalScore = ((correctCount / questions.length) * 10).toFixed(2);
  const hasPassed = finalScore >= 8;

  if (showFinalScreen) {
    return (
      <div className="quiz-content">
        <FinalExerciseScreen
            score={finalScore}
            hasPassed={hasPassed}
            passMessage={`Has respondido correctamente ${correctCount} de ${questions.length} preguntas. ¡Has superado el test con éxito!`}
            failMessage={`Has respondido correctamente ${correctCount} de ${questions.length} preguntas. Necesitas al menos un 8.0 para aprobar. ¡Inténtalo de nuevo!`}
            onContinue={onComplete}
            onRetry={handleRetry}
            continueBtnText="Continuar"
            retryBtnText="Repetir Test"
        />
      </div>
    );
  }

  return (
    <div className="quiz-content">
      <div className="quiz-header">
        <div className="quiz-progress">
          Pregunta {currentQuestion + 1} de {questions.length}
        </div>
        {totalAnswered > 0 && (
          <div className="quiz-score">
            Correctas: {correctCount}/{totalAnswered}
          </div>
        )}
      </div>

      <div className="quiz-progress-bar">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${
              i < currentQuestion
                ? answers[i]
                  ? 'correct'
                  : 'incorrect'
                : i === currentQuestion
                ? 'active'
                : ''
            }`}
          />
        ))}
      </div>

      <h3 className="quiz-question">{question.question}</h3>

      <div className="quiz-options">
        {question.options.map((option, i) => (
          <button
            key={i}
            className={`quiz-option ${selected === i ? 'selected' : ''} ${
              showResult
                ? i === question.correctAnswer
                  ? 'correct'
                  : selected === i
                  ? 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => !showResult && setSelected(i)}
            disabled={showResult}
          >
            {option}
          </button>
        ))}
      </div>

      {!showResult && (
        <div className="quiz-actions">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={selected === null}
          >
            {isLastQuestion ? 'Finalizar Test' : 'Ver Respuesta'}
          </button>

          {question.hint && (
            <button
              className="hint-btn"
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? 'Ocultar Pista' : 'Pista'}
            </button>
          )}
        </div>
      )}

      {showHint && !showResult && (
        <div className="hint-box">
          {question.hint}
        </div>
      )}
      

      {showResult && (
        <div className={`result ${selected === question.correctAnswer ? 'correct' : 'incorrect'}`}>
          {selected === question.correctAnswer ? '✓ Correcto' : '✗ Incorrecto'}
          <p>{question.explanation}</p>
          <button className="submit-btn" onClick={handleContinue}>
            Continuar
          </button>
        </div>
      )}

      
    </div>
  );
};