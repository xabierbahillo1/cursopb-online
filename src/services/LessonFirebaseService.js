let db = null;

async function getFirestore() {
  if (db) return db;
  const { getFirestore: getFS } = await import('firebase/firestore');
  const { app } = await import('../firebase.config');
  db = getFS(app);
  return db;
}

export async function fetchLesson(lessonId) {
  console.log(`fetchLesson (MODO FIREBASE) - ID de lección: "${lessonId}"`);
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const firestore = await getFirestore();
    
    console.log(`📄 Obteniendo documento: lessons/${lessonId}`);
    const lessonRef = doc(firestore, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);

    if (!lessonSnap.exists()) {
      console.error('❌ El documento de la lección no existe');
      return { data: null, isLocked: false, error: 'Lección no encontrada' };
    }

    const lessonData = lessonSnap.data();
    console.log('Datos de la lección:', lessonData);
    
    let parsedContent = lessonData.content;
    if (typeof lessonData.content === 'string') {
      console.log('🔄 Parseando content desde string...');
      parsedContent = JSON.parse(lessonData.content);
    }

    const data = {
      id: lessonId,
      type: lessonData.type || 'content',
      title: lessonData.title || lessonId,
      content: parsedContent
    };

    const result = { data, isLocked: false, error: null };
    console.log('✅ Devolviendo datos de la lección:', result);
    return result;

  } catch (err) {
    console.error(`❌ Error obteniendo lección de Firebase:`, err);
    console.error('Traza del error:', err.stack);
    
    // Si es un error de permisos, la lección está bloqueada
    if (err.code === 'permission-denied') {
      console.log('Acceso denegado por Firebase Security Rules');
      return { data: null, isLocked: true, error: null };
    }
    
    return { data: null, isLocked: false, error: err.message };
  }
}

export async function checkAccess() {
  try {
    const { getAuth } = await import('firebase/auth');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return false;

    const firestore = await getFirestore();
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    return userData.paid === true;

  } catch {
    return false;
  }
}
