import * as LessonAPI from './LessonAPIService';
import * as LessonFirebase from './LessonFirebaseService';

export const CONFIG = {
  mode: process.env.REACT_APP_DATA_MODE || 'API',
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
};

export async function fetchLessonContent(lessonId) {
  // Obtiene el contenido de una lección según el modo configurado
  console.log(`📚 Obteniendo lección con ID: "${lessonId}"`);
  console.log(`🔀 Modo actual: ${CONFIG.mode}`);
  
  switch (CONFIG.mode) {
    case 'API':
      return LessonAPI.fetchLesson(lessonId);
    case 'FIREBASE':
      return LessonFirebase.fetchLesson(lessonId);
    default:
      console.error('❌ Modo no configurado:', CONFIG.mode);
      return { data: null, isLocked: false, error: 'Modo no configurado' };
  }
}

export async function checkUserAccess() {
  // Verifica si el usuario tiene acceso a lecciones pagadas según el modo configurado
  switch (CONFIG.mode) {
    case 'API':
      return LessonAPI.checkAccess();
    case 'FIREBASE':
      return LessonFirebase.checkAccess();
    default:
      return false;
  }
}

const LessonService = {
  fetchLessonContent,
  checkUserAccess,
  CONFIG,
};

export default LessonService;