import LessonContent from "./LessonContent";
import { useAuth } from "../hooks/useAuth";
import { saveProgress } from "../services/ProgressService";

export default function CourseContainer({
  courseData,
  currentModule,
  currentLesson,
  completed,
  setCompleted,
  setCurrentLesson,
  setCurrentModule,
}) {
  const { user } = useAuth();
  const lesson = courseData[currentModule].lessons[currentLesson];

  const handleCompleteLesson = () => {
    const key = `${currentModule}-${currentLesson}`;
    const newCompleted = { ...completed, [key]: true };
    
    // Actualizar estado
    setCompleted(newCompleted);
    
    // Guardar en localStorage y sincronizar con Firebase
    saveProgress(key, 'true', user?.uid);

    // Navegar a la siguiente lección
    if (currentLesson < courseData[currentModule].lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else if (currentModule < courseData.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
    
    // Scroll para móvil y desktop
    const contentElement = document.querySelector('.content');
    if (contentElement) {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="content-header">
        <div className="breadcrumb">
          MÓDULO {currentModule + 1} / LECCIÓN {currentLesson + 1}
        </div>
        <h1 className="lesson-title">{lesson.title}</h1>
      </div>

      <div className="lesson-container">
        <LessonContent lesson={lesson} onComplete={handleCompleteLesson} />
      </div>
    </>
  );
}