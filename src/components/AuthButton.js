import { useState, useEffect } from 'react';
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BugReportLink } from './BugReportLink';

const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

export const AuthButton = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  
  const [showMenu, setShowMenu] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Resetear actionInProgress cuando el usuario cambia
  useEffect(() => {
    setActionInProgress(false);
    setImageError(false);
  }, [user]);

  // Si no estamos en modo FIREBASE, no renderizar nada
  if (DATA_MODE !== 'FIREBASE') {
    return null;
  }

  const handleSignIn = async () => {
    setActionInProgress(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
        setActionInProgress(false);
      }
    } catch (error) {
      setActionInProgress(false);
    }
  };

  const handleLogout = async () => {
    setShowMenu(false);
    setActionInProgress(true);
    try {
      await logout();
    } catch (error) {
      setActionInProgress(false);
    }
  };

  const handleImageError = () => {
    console.log('Error cargando imagen del avatar');
    setImageError(true);
  };

  const hasValidPhoto = user?.photoURL && user.photoURL.trim() !== '' && !imageError;

  // Mostrar spinner solo durante la inicialización
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner"></div>
      </div>
    );
  }

  // No hay usuario, mostrar botón de login
  if (!user) {
    return (
      <>
        <BugReportLink />
        <button 
          className="auth-button sign-in" 
          onClick={handleSignIn}
          disabled={actionInProgress}
        >
          <LogIn size={16} />
          <span>{actionInProgress ? 'Iniciando...' : 'Iniciar Sesión'}</span>
        </button>
        
      </>
      
    );
  }

  // Hay usuario, mostrar info del usuario
  return (
    <div className="auth-container">
      <BugReportLink />
      <button 
        className="auth-button user-info"
        onClick={() => setShowMenu(!showMenu)}
        disabled={actionInProgress}
      >
        {hasValidPhoto ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'Usuario'}
            className="user-avatar"
            onError={handleImageError}
          />
        ) : (
          <div className="user-avatar-placeholder">
            <User size={16} />
          </div>
        )}
        <span className="user-name">
          {user.displayName || user.email?.split('@')[0] || 'Usuario'}
        </span>
        <ChevronDown 
          size={14} 
          className={`chevron ${showMenu ? 'open' : ''}`}
        />
      </button>

      {showMenu && (
        <>
          <div 
            className="auth-backdrop" 
            onClick={() => setShowMenu(false)}
          />
          <div className="auth-menu">
            <div className="auth-menu-header">
              <div className="auth-menu-user-info">
                <p className="auth-menu-name">{user.displayName}</p>
                <p className="auth-menu-email">{user.email}</p>
              </div>
            </div>
            <div className="auth-menu-divider" />
            <button 
              className="auth-menu-item logout"
              onClick={handleLogout}
              disabled={actionInProgress}
            >
              <LogOut size={16} />
              <span>{actionInProgress ? 'Cerrando...' : 'Cerrar Sesión'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};