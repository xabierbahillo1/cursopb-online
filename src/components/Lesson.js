import { useEffect, useState } from 'react';
import { LessonViewer } from './LessonViewer';

export const Lesson = ({ content }) => {
  const lessonId = content.component;
  console.log("Cargando lección con ID:", lessonId);
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    if (!lessonId) return;

    import(`./firestore-lessons/${lessonId}.json`)
      .then((module) => setLessonData(module.default || module))
      .catch((err) => {
        console.error(`No se pudo cargar la lección ${lessonId}:`, err);
        setLessonData(null);
      });
  }, [lessonId]);

  if (!lessonData) return <div>Cargando lección...</div>;

  return <LessonViewer lesson={lessonData} />;
};
