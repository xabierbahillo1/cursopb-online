import { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.config';

const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(DATA_MODE === 'FIREBASE');

  useEffect(() => {
    // Solo configurar listener si estamos en modo FIREBASE
    if (DATA_MODE !== 'FIREBASE' || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOrUpdateUserDocument = async (user) => {
    // Crea o actualiza el usuario solo si estamos en modo FIREBASE
    if (!user || DATA_MODE !== 'FIREBASE' || !db) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      
      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
      };

      // Usar merge: true para no sobrescribir campos existentes
      await setDoc(userRef, userData, { merge: true });
      
      console.log('✅ User document created/updated successfully');
    } catch (error) {
      console.error('❌ Error creating/updating user document:', error);
    }
  };

  const signInWithGoogle = async () => {
    if (DATA_MODE !== 'FIREBASE') {
      return { success: false, error: 'Firebase no está configurado (modo API)' };
    }

    // Verificar que todo esté inicializado
    if (!auth) {
      console.error('❌ auth es null o undefined');
      return { success: false, error: 'Firebase Auth no está inicializado' };
    }

    if (!googleProvider) {
      console.error('❌ googleProvider es null o undefined');
      return { success: false, error: 'Google Provider no está inicializado' };
    }

    try {
      console.log('🔄 Iniciando proceso de login con Google...');
      console.log('Auth:', auth);
      console.log('GoogleProvider:', googleProvider);
      
      // Llamar a signInWithPopup con los argumentos correctos
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log('✅ Login exitoso:', result.user.email);
      
      // Crear/actualizar documento del usuario en Firestore
      await createOrUpdateUserDocument(result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      // Manejar errores específicos
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Popup cerrado antes de completar el inicio de sesión';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'El navegador bloqueó el popup. Por favor, permite popups para este sitio.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Se canceló la solicitud de popup';
          break;
        case 'auth/argument-error':
          console.error('❌ Detalles del argumento:');
          console.error('- auth:', typeof auth, auth);
          console.error('- googleProvider:', typeof googleProvider, googleProvider);
          errorMessage = 'Error de configuración. Revisa la consola para más detalles.';
          break;
        case 'auth/configuration-not-found':
          errorMessage = 'Configuración de Firebase incompleta. Verifica tu .env';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'API Key de Firebase inválida';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    if (DATA_MODE !== 'FIREBASE' || !auth) {
      return { success: false, error: 'Firebase no está configurado' };
    }

    try {
      await signOut(auth);
      console.log('✅ Sesión cerrada correctamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };
};