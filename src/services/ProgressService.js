import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

function isProgressKey(key) {
  // Detectar si una key es de progreso
  return /^\d+-\d+$/.test(key) || /^exercise_code_/.test(key);
}

// ============================================================
// FUNCIONES DE LOCALSTORAGE
// ============================================================

export function getLocalProgress() {
  try {
    const progress = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isProgressKey(key)) {
        const value = localStorage.getItem(key);
        progress[key] = value;
      }
    }
    return progress;
  } catch (error) {
    console.error('Error obteniendo progreso local:', error);
    return {};
  }
}

export function setLocalProgress(progress) {
  try {
    Object.entries(progress).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    return true;
  } catch (error) {
    console.error('Error guardando progreso local:', error);
    return false;
  }
}

export function clearLocalProgress() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isProgressKey(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error limpiando progreso local:', error);
    return false;
  }
}

// ============================================================
// FUNCIONES DE FIREBASE
// ============================================================

export async function getFirebaseProgress(userId) {
  // Obtiene el progreso completo del usuario desde Firebase
  if (DATA_MODE !== 'FIREBASE' || !userId || !db) {
    return null;
  }

  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
      console.log('📭 No hay progreso guardado en Firebase para este usuario');
      return null;
    }

    const data = progressSnap.data();
    console.log('✅ Progreso obtenido de Firebase:', data);
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo progreso de Firebase:', error);
    return null;
  }
}

export async function saveFirebaseProgress(userId, { completed, currentModule, currentLesson }) {
  // Guarda el progreso del usuario en Firebase
  if (DATA_MODE !== 'FIREBASE' || !userId || !db) {
    return false;
  }

  try {
    const progressRef = doc(db, 'userProgress', userId);
    
    // Obtener progreso actual (solo para el merge de completed lessons)
    const currentSnap = await getDoc(progressRef);
    const currentData = currentSnap.exists() ? currentSnap.data() : {};
    const currentProgress = currentData.progress || {};
    
    // Mergear completed lessons
    const mergedProgress = { ...currentProgress, ...completed };
    
    // Crear el objeto a guardar
    const dataToSave = {
      progress: mergedProgress,
      current: { 
          module: currentModule,
          lesson: currentLesson,
      }, 
      lastUpdated: new Date().toISOString(),
    };
    
    await setDoc(progressRef, dataToSave, { merge: true });

    console.log('✅ Progreso guardado en Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error guardando progreso en Firebase:', error);
    return false;
  }
}

export async function syncProgressFromFirebase(userId) {
  // Sincroniza el progreso desde Firebase al localStorage
  if (DATA_MODE !== 'FIREBASE' || !userId) {
    console.log('⏭️  Modo API o sin usuario, no se sincroniza desde Firebase');
    const local = getLocalProgress();
    return { completed: local, current: { module: 0, lesson: 0 } }; 
  }

  try {
    console.log('🔄 Sincronizando progreso desde Firebase...');
    
    // 1. Obtener progreso de Firebase (devuelve todo el documento)
    const firebaseData = await getFirebaseProgress(userId);
    const firebaseProgress = firebaseData?.progress || {};
    const firebaseCurrent = firebaseData?.current || { module: 0, lesson: 0 }; 

    // 2. Obtener progreso local
    const localProgress = getLocalProgress();
    
    // 3. Decidir qué progreso usar
    if (!firebaseData || Object.keys(firebaseProgress).length === 0) {
      // Si no hay completed en Firebase, subir el progreso local (si existe)
      if (Object.keys(localProgress).length > 0) {
        console.log('📤 Subiendo progreso local a Firebase');
        await saveFirebaseProgress(userId, { 
            completed: localProgress, 
            currentModule: firebaseCurrent.module, 
            currentLesson: firebaseCurrent.lesson
        });
      }
      return { completed: localProgress, current: firebaseCurrent };
    }
    
    if (Object.keys(localProgress).length === 0) {
      // Si no hay nada local, usar el de Firebase
      console.log('📥 No hay progreso local, usando progreso de Firebase');
      setLocalProgress(firebaseProgress);
      return { completed: firebaseProgress, current: firebaseCurrent };
    }
    
    // 4. Ambos tienen datos: mergear
    console.log('🔀 Mergeando progreso de Firebase y local');
    const mergedProgress = { ...localProgress, ...firebaseProgress };
    setLocalProgress(mergedProgress);
    
    return { completed: mergedProgress, current: firebaseCurrent };
    
  } catch (error) {
    console.error('❌ Error sincronizando desde Firebase:', error);
    const local = getLocalProgress();
    return { completed: local, current: { module: 0, lesson: 0 } }; 
  }
}

export async function syncProgressToFirebase(userId, state) {
  // Sincroniza el progreso desde localStorage a Firebase
  
  if (DATA_MODE !== 'FIREBASE' || !userId) {
    return false;
  }

  try {
    const progressToSave = state ? state : { 
        completed: getLocalProgress(), 
        currentModule: 0, 
        currentLesson: 0 
    };
    
    await saveFirebaseProgress(userId, progressToSave); 
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando a Firebase:', error);
    return false;
  }
}

export function saveProgress(key, value, userId = null) {
  // Guarda una entrada de progreso y sincroniza
  try {
    // 1. Guardar en localStorage
    localStorage.setItem(key, value);
    
    // 2. Si hay usuario logueado, sincronizar SOLO esta key con Firebase
    if (userId && DATA_MODE === 'FIREBASE') {
      // Crear objeto para el merge de una sola key
      const singleKeyProgress = { 
          completed: { [key]: value },
          // Estos valores no son relevantes al guardar una sola key, pero se necesitan para la función
          currentModule: 0, 
          currentLesson: 0
      };
      
      saveFirebaseProgress(userId, singleKeyProgress).catch(err => {
        console.error('Error sincronizando progreso:', err);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error guardando progreso:', error);
    return false;
  }
}

export async function removeProgress(key, userId = null) {
  // Elimina una entrada de progreso y sincroniza
  try {
    // 1. Eliminar de localStorage
    localStorage.removeItem(key);
    
    // 2. Sincronizar con Firebase si hay usuario
    if (userId && DATA_MODE === 'FIREBASE' && db) {
      // Eliminar la key específica de Firebase
      const { deleteField } = await import('firebase/firestore');
      const progressRef = doc(db, 'userProgress', userId);
      
      await setDoc(progressRef, {
        progress: {
          [key]: deleteField()
        },
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log(`✅ Key "${key}" eliminada de Firebase`);
    }
    
    return true;
  } catch (error) {
    console.error('Error eliminando progreso:', error);
    return false;
  }
}

const ProgressService = {
  getLocalProgress,
  setLocalProgress,
  clearLocalProgress,
  getFirebaseProgress,
  saveFirebaseProgress,
  syncProgressFromFirebase,
  syncProgressToFirebase,
  saveProgress,
  removeProgress,
};

export default ProgressService;