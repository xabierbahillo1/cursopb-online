export const FinalExerciseScreen = ({
    score,
    hasPassed,
    passMessage,
    failMessage,
    onContinue,
    onRetry,
    continueBtnText = 'Continuar',
    retryBtnText = 'Reintentar'
}) => {
    return (
        <div className="final-screen">
            <h2>{hasPassed ? '¡Felicidades! 🎉' : 'No has aprobado 😔'}</h2>
            <div className="final-score-big">
                {score}/10
            </div>
            {hasPassed ? (
                <>
                    <p className="success-message">{passMessage}</p>
                    <button className="submit-btn" onClick={onContinue}>
                        {continueBtnText}
                    </button>
                </>
            ) : (
                <>
                    <p className="retry-message">{failMessage}</p>
                    <div className="final-buttons">
                        <button className="submit-btn" onClick={onRetry}>
                            {retryBtnText}
                        </button>
                        <button className="skip-btn" onClick={onContinue}>
                            Continuar de todas formas (no recomendado)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};