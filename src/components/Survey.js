import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';
const FIREBASE_ACTIVE = DATA_MODE === 'FIREBASE';

export const Survey = ({ content, onComplete, surveyId }) => {
  const { user, signInWithGoogle } = useAuth();
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [missingFields, setMissingFields] = useState(new Set()); 

  // =========================================================
  // HOOKS Y VALIDACIÓN
  // =========================================================

  useEffect(() => {
    checkIfCompleted();
  }, [user]); 


  const isFormValid = useMemo(() => {
    if (!content?.questions || content.questions.length === 0) {
      return true;
    }
    
    return content.questions.every(question => {
      const response = responses[question.id];
      
      // La respuesta es considerada "vacía" si es undefined, null, o una cadena vacía
      const isEmpty = response === undefined || response === null || (typeof response === 'string' && response.trim() === '');

      if (isEmpty) {
        return question.type === 'rating' && response === 0;
      }

      // Validación específica para 'multipleChoiceWithText'
      if (question.type === 'multipleChoiceWithText') {
        // Debe haber una elección
        if (!response.choice) {
          return false;
        }
        // Si la elección requiere explicación y el campo de texto está vacío
        if (question.requiresExplanation?.includes(response.choice) && !response.text?.trim()) {
          return false;
        }
      }
      
      return true;
    });
  }, [responses, content]);

  const checkIfCompleted = async () => {
    if (!user || !FIREBASE_ACTIVE || !db) {
      setLoading(false);
      return;
    }

    try {
      const docId = `${user.uid}_${surveyId}`;
      const surveyRef = doc(db, 'surveys', docId);
      const surveySnap = await getDoc(surveyRef);

      if (surveySnap.exists()) {
        setAlreadyCompleted(true);
      }
    } catch (error) {
      console.error('Error checking survey completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !FIREBASE_ACTIVE || !db) {
      console.error("Error: Usuario no logueado o FIREBASE_ACTIVE no está activado.");
      return;
    }

    // Si no es válido, identificar campos faltantes y salir
    if (!isFormValid) {
      const missing = new Set();
      content.questions.forEach(question => {
        if (!responses[question.id] && responses[question.id] !== 0) {
          missing.add(question.id);
        } else if (question.type === 'multipleChoiceWithText') {
            const response = responses[question.id];
            if (!response?.choice || (question.requiresExplanation?.includes(response.choice) && !response.text?.trim())) {
                missing.add(question.id);
            }
        } else if (typeof responses[question.id] === 'string' && responses[question.id].trim() === '') {
            missing.add(question.id);
        }
      });
      setMissingFields(missing);
      alert('Por favor, completa todas las preguntas obligatorias antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const docId = `${user.uid}_${surveyId}`;
      const surveyRef = doc(db, 'surveys', docId);
      
      await setDoc(surveyRef, {
        userId: user.uid,
        userEmail: user.email,
        surveyId: surveyId,
        responses: responses,
        completedAt: serverTimestamp(),
      });

      setSubmitted(true);
      setAlreadyCompleted(true);
      console.log('✅ Encuesta guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando encuesta:', error);
      alert('Error al guardar la encuesta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    setMissingFields(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
    });
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    const result = await signInWithGoogle();
    setLoginLoading(false);

    if (!result.success) {
      alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  const RenderSurveyHeader = () => (
    <div className="survey-header">
      <div className="survey-optional-notice">
        <AlertCircle size={16} />
        <span>
          Esta encuesta es completamente <strong>opcional</strong>, pero tu feedback me ayudaría enormemente
          a mejorar el contenido y la experiencia del curso.
        </span>
      </div>
    </div>
  );

  const RenderCompletionState = () => {
    const title = submitted ? '¡Gracias por tu feedback!' : 'Encuesta ya realizada';
    const message = submitted 
      ? 'Tu opinión es muy valiosa y me ayudará a mejorar el curso para futuros estudiantes.'
      : 'Ya has completado esta encuesta anteriormente. ¡Muchas gracias por tu tiempo y feedback!';
    
    return (
      <div className="survey-content">
        <div className="survey-completed">
          <div className="survey-completed-icon">
            <CheckCircle size={64} />
          </div>
          <h3>{title}</h3>
          <p>{message}</p>
          <button className="submit-btn" onClick={onComplete}>
            Continuar
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="survey-content">
        <div className="lesson-loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  // 1. Si no hay usuario logueado
  if (!user) {
    return (
      <div className="survey-content">
        <RenderSurveyHeader />
        <div className="survey-login-required">
          <div className="survey-login-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Inicia sesión para completar la encuesta</h3>
          <p>
            Necesitas iniciar sesión para poder responder a la encuesta de satisfacción.
          </p>
          <div className="final-buttons">
            <button 
                className="submit-btn" 
                onClick={handleLogin}
                disabled={loginLoading}
            >
                {loginLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : 'Iniciar Sesión'}
            </button>
            <button className="skip-btn" onClick={onComplete}>
                Saltar Encuesta
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  // 2. Si ya completó la encuesta o acaba de enviarla
  if (alreadyCompleted) {
    return <RenderCompletionState />;
  }

  // 3. Formulario de encuesta
  return (
    <div className="survey-content">
      <RenderSurveyHeader />

      <div className="survey-form">
        {content.questions.map((question, index) => {
            const isMissing = missingFields.has(question.id);
            
            return (
              <div 
                key={question.id} 
                className={`survey-question ${isMissing ? 'required-missing' : ''}`}
              >
                <h4 className="survey-question-title">
                  {index + 1}. {question.question}
                </h4>

                {question.type === 'rating' && (
                  <>
                    <div className="survey-rating">
                      {[0, 1, 2, 3, 4, 5].map(value => (
                        <button
                          key={value}
                          className={`rating-btn ${responses[question.id] === value ? 'selected' : ''}`}
                          onClick={() => handleResponseChange(question.id, value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <div className="survey-rating-labels">
                      <span>{question.minLabel}</span>
                      <span>{question.maxLabel}</span>
                    </div>
                  </>
                )}

                {question.type === 'text' && (
                  <textarea
                    className="survey-textarea"
                    placeholder={question.placeholder || 'Escribe tu respuesta aquí...'}
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    rows={4}
                  />
                )}

                {question.type === 'multipleChoice' && (
                  <div className="survey-options">
                    {question.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        className={`survey-option ${responses[question.id] === option ? 'selected' : ''}`}
                        onClick={() => handleResponseChange(question.id, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multipleChoiceWithText' && (
                  <>
                    <div className="survey-options">
                      {question.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className={`survey-option ${responses[question.id]?.choice === option ? 'selected' : ''}`}
                          onClick={() => handleResponseChange(question.id, { 
                            choice: option, 
                            text: responses[question.id]?.text || '' 
                          })}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {responses[question.id]?.choice && question.requiresExplanation?.includes(responses[question.id]?.choice) && (
                      <textarea
                        className="survey-textarea"
                        placeholder={question.explanationPlaceholder || '¿Por qué?'}
                        value={responses[question.id]?.text || ''}
                        onChange={(e) => handleResponseChange(question.id, { 
                          ...responses[question.id],
                          text: e.target.value 
                        })}
                        rows={3}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </>
                )}

                {isMissing && (
                    <p className="error-message">Este campo es obligatorio.</p>
                )}
              </div>
            );
        })}
      </div>

      <div className="final-buttons">
        <button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={isSubmitting} // Deshabilitamos solo si se está enviando
        >
          {isSubmitting ? (
             <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <CheckCircle size={16} />
          )}
          {isSubmitting ? 'Enviando...' : 'Enviar Encuesta'}
        </button>
        
        <button className="skip-btn" onClick={onComplete}>
          Saltar Encuesta
        </button>
      </div>
    </div>
  );
};