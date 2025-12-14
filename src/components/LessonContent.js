import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { LessonViewer } from "./LessonViewer";
import { Quiz } from "./Quiz";
import { Exercise } from "./Exercise";
import { Playground } from "./Playground";
import { Survey } from "./Survey";
import { Payment } from "./Payment";
import { fetchLessonContent } from "../services/LessonService";
import { useAuth } from "../hooks/useAuth";

export default function LessonContent({ lesson, onComplete }) {
  const { user } = useAuth();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // Recargar cuando cambia el ID de lección O el usuario
  useEffect(() => {
    const loadLesson = async () => {
      if (!lesson?.id) return;

      setLoading(true);
      setError(null);
      setIsLocked(false);

      const result = await fetchLessonContent(lesson.id);

      if (result.isLocked) {
        setIsLocked(true);
      } else if (result.error) {
        setError(result.error);
      } else {
        setLessonData(result.data);
      }

      setLoading(false);
    };

    loadLesson();
  }, [lesson?.id, user?.uid]);

  // Recargar si volvemos de un pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    
    if (paymentSuccess === 'true' && lesson?.id) {
      console.log('Pago completado exitosamente, recargando...');
      
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Recargar la lección
      const reloadLesson = async () => {
        setLoading(true);
        const result = await fetchLessonContent(lesson.id);
        
        if (!result.isLocked && !result.error) {
          setLessonData(result.data);
          setIsLocked(false);
        }
        
        setLoading(false);
      };
      
      reloadLesson();
    }
  }, []);

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="loading-spinner"></div>
        <p>Cargando contenido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-error">
        <h3>Error al cargar la lección</h3>
        <p>{error}</p>
        <button 
          className="submit-btn" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <Payment 
        lessonTitle={lesson.title}
        lessonId={lesson.id}
      />
    );
  }

  if (!lessonData) {
    return <div className="lesson-empty">No se encontró el contenido.</div>;
  }

  const renderContent = () => {
    switch (lessonData.type) {
      case "quiz":
        return (
          <Quiz 
            content={lessonData.content} 
            onComplete={onComplete} 
          />
        );
      
      case "exercise":
        return (
          <Exercise 
            content={lessonData.content} 
            onComplete={onComplete} 
            id={lessonData.id} 
          />
        );
      
      case "playground":
        return (
          <Playground 
            content={lessonData.content} 
            onComplete={onComplete} 
            id={lessonData.id} 
          />
        );

      case "survey":
        return (
          <Survey 
            content={lessonData.content} 
            onComplete={onComplete}
            surveyId={lessonData.id}
          />
        );
      
      case "content":
      default:
        return (
          <>
            <LessonViewer 
              lesson={lessonData.content} 
            />
            <button className="complete-btn" onClick={onComplete}>
              <CheckCircle size={16} />
              Continuar
            </button>
          </>
        );
    }
  };

  return (
    <div className="lesson-content-wrapper">
      {renderContent()}
    </div>
  );
}