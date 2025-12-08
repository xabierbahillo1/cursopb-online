import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Leer el modo desde las variables de entorno
const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

let appInstance = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;

// Solo inicializar Firebase si el modo es FIREBASE
if (DATA_MODE === 'FIREBASE') {
  // Inicializar Firebase
  appInstance = initializeApp(firebaseConfig);

  // Servicios
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  googleProviderInstance = new GoogleAuthProvider();

  // Configurar el provider de Google para siempre mostrar selector de cuenta
  googleProviderInstance.setCustomParameters({
    prompt: 'select_account'
  });

  console.log('✅ Firebase inicializado correctamente');
} else {
  console.log('ℹ️ Modo API - Firebase no inicializado');
}

export {
  appInstance as app,
  authInstance as auth,
  dbInstance as db,
  googleProviderInstance as googleProvider
};
