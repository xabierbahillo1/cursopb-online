import { useState, useEffect } from "react";
import { Modules } from "./components/Modules";
import CourseContainer from "./components/CourseContainer";
import { courseData } from "./data/courseData";
import { useAuth } from "./hooks/useAuth";
import { syncProgressFromFirebase, getLocalProgress } from "./services/ProgressService";
import { LevelExercise } from "./components/LevelExercise";
import "./App.css";

const STORAGE_KEY = "courseProgress";
const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completed, setCompleted] = useState({});
  const [progress, setProgress] = useState(0);
  const [progressSynced, setProgressSynced] = useState(false);

  useEffect(() => {
    // Sincronizar progreso desde Firebase cuando el usuario se autentica
    const syncUserProgress = async () => {
      if (DATA_MODE === 'FIREBASE' && user && !progressSynced) {
        console.log('👤 Usuario autenticado, sincronizando progreso...');
        
        try {
          // Obtener el objeto completo { completed, current }
          const syncData = await syncProgressFromFirebase(user.uid);
          
          if (syncData && syncData.completed) {
            setCompleted(syncData.completed);
          }
          
          // Cargar la última lección vista desde Firebase
          if (syncData && syncData.current) {
            setCurrentModule(syncData.current.module || 0);
            setCurrentLesson(syncData.current.lesson || 0);
          }
          
          setProgressSynced(true);
        } catch (error) {
          console.error('Error sincronizando progreso:', error);
          setProgressSynced(true);
        }
      }
    };

    syncUserProgress();
  }, [user, progressSynced]);

  useEffect(() => {
    // Carga proceso desde localstorage (solo si no hay usuario)
    if (!user && !authLoading) {
      const localProgress = getLocalProgress();
      
      if (Object.keys(localProgress).length > 0) {
        setCompleted(localProgress);
      }
      
      // Cargar la última lección vista
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Establecer la lección actual guardada
          setCurrentModule(parsed.currentModule || 0);
          setCurrentLesson(parsed.currentLesson || 0);
          
          // Fallback para completed si no se cargó con getLocalProgress()
          if (Object.keys(localProgress).length === 0 && parsed.completed) {
            setCompleted(parsed.completed);
          }

        } catch (error) {
          console.error("Error parsing saved progress:", error);
        }
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Guardar progreso en localStorage y Firebase

    // No guardar durante la carga inicial o sincronización
    if (authLoading || (user && !progressSynced)) {
      return;
    }

    const state = {
      completed,
      currentModule, // <-- Incluido en el objeto
      currentLesson, // <-- Incluido en el objeto
    };

    // Guardar en localStorage (incluye currentModule y currentLesson)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Si hay usuario, también sincronizar con Firebase
    if (user && DATA_MODE === 'FIREBASE') {
      import('./services/ProgressService').then(({ syncProgressToFirebase }) => {
        // Pasamos el estado completo (incluyendo currentModule/Lesson)
        syncProgressToFirebase(user.uid, state).catch(err => {
          console.error('Error sincronizando progreso:', err);
        });
      });
    }
  }, [completed, currentModule, currentLesson, user, authLoading, progressSynced]);

  useEffect(() => {
    // Calcular el porcentaje de progreso
    const totalLessons = courseData.reduce(
      (sum, mod) => sum + mod.lessons.length,
      0
    );
    const completedCount = Object.keys(completed).length;
    let percentage = Math.round((completedCount / totalLessons) * 100);
    if (percentage > 100) {
      percentage = 100;
    }
    console.log("Lecciones completadas:", completedCount, "/", totalLessons);
    setProgress(percentage);
  }, [completed]);


  const handleLessonSelect = (moduleIdx, lessonIdx) => {
    setCurrentModule(moduleIdx);
    setCurrentLesson(lessonIdx);
  };


  // Mostrar loading mientras se autentica y sincroniza
  if (authLoading || (user && !progressSynced)) {
    return (
      <div className="app">
        <div className="lesson-loading" style={{ 
          width: '100%', 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="loading-spinner"></div>
          <p>Cargando curso...</p>
        </div>
      </div>
    );
  }

  // Lógica para la ruta /level_exercise
  const isLevelExerciseRoute = window.location.pathname.includes("/level_exercise");

  if (isLevelExerciseRoute) {
    return (
      <div className="app">
        <div className="content">
          <LevelExercise
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Modules
        courseData={courseData}
        currentModule={currentModule}
        currentLesson={currentLesson}
        completed={completed}
        progress={progress}
        onLessonSelect={handleLessonSelect}
      />
      <div className="content">
        <CourseContainer
          courseData={courseData}
          currentModule={currentModule}
          currentLesson={currentLesson}
          completed={completed}
          setCompleted={setCompleted}
          setCurrentLesson={setCurrentLesson}
          setCurrentModule={setCurrentModule}
        />
      </div>
    </div>
  );
}

export default App;