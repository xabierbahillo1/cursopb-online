import { useState, useEffect } from "react";
import { Modules } from "../components/Modules";
import CourseContainer from "../components/CourseContainer";
import { courseData } from "../data/courseData";
import { useAuth } from "../hooks/useAuth";
import { syncProgressFromFirebase, getLocalProgress } from "../services/ProgressService";
import "./CoursePage.css";

const STORAGE_KEY = "courseProgress";
const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

function CoursePage() {
  const { user, loading: authLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completed, setCompleted] = useState({});
  const [progress, setProgress] = useState(0);
  const [progressSynced, setProgressSynced] = useState(false);

  useEffect(() => {
    const syncUserProgress = async () => {
      if (DATA_MODE === 'FIREBASE' && user && !progressSynced) {
        console.log('👤 Usuario autenticado, sincronizando progreso...');
        
        try {
          const syncData = await syncProgressFromFirebase(user.uid);
          
          if (syncData && syncData.completed) {
            setCompleted(syncData.completed);
          }
          
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
    if (!user && !authLoading) {
      const localProgress = getLocalProgress();
      
      if (Object.keys(localProgress).length > 0) {
        setCompleted(localProgress);
      }
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          setCurrentModule(parsed.currentModule || 0);
          setCurrentLesson(parsed.currentLesson || 0);
          
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
    if (authLoading || (user && !progressSynced)) {
      return;
    }

    const state = {
      completed,
      currentModule,
      currentLesson,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (user && DATA_MODE === 'FIREBASE') {
      import('../services/ProgressService').then(({ syncProgressToFirebase }) => {
        syncProgressToFirebase(user.uid, state).catch(err => {
          console.error('Error sincronizando progreso:', err);
        });
      });
    }
  }, [completed, currentModule, currentLesson, user, authLoading, progressSynced]);

  useEffect(() => {
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

export default CoursePage;