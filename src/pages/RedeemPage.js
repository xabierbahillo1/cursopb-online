import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, KeyRound, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { checkAccess } from '../services/LessonFirebaseService';
import './RedeemPage.css';

// Estados de la pantalla:
//   'login'   -> no hay sesión, pedimos iniciar sesión
//   'input'   -> hay sesión, pedimos el código
//   'confirm' -> mostramos a qué cuenta se va a canjear, pedimos confirmar
//   'success' -> canjeado correctamente
const RedeemPage = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingPaid, setCheckingPaid] = useState(false);

  // Si el usuario ya tiene acceso de pago, no le pedimos código.
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setAlreadyPaid(false);
      return;
    }

    setCheckingPaid(true);
    checkAccess()
      .then((paid) => {
        if (!cancelled) setAlreadyPaid(paid === true);
      })
      .finally(() => {
        if (!cancelled) setCheckingPaid(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  // Código normalizado tal y como lo verá el usuario en la confirmación
  const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');

  const handleLogin = async () => {
    setError(null);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.error || 'No se pudo iniciar sesión');
    }
  };

  const handleChangeAccount = async () => {
    setError(null);
    setConfirming(false);
    await logout();
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError(null);
    if (!normalizedCode) {
      setError('Escribe tu código para continuar');
      return;
    }
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const idToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/redeem-code`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, code: normalizedCode }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'No se pudo canjear el código');
        setConfirming(false);
        setSubmitting(false);
        return;
      }

      setDone(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error canjeando código:', err);
      setError('Error de conexión. Inténtalo de nuevo.');
      setConfirming(false);
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="redeem-page">
        <div className="redeem-card">
          <p className="redeem-loading">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="redeem-page">
      <div className="redeem-card">
        <div className="redeem-icon">
          <KeyRound size={28} />
        </div>
        <h1>Canjear código de acceso</h1>

        {/* ESTADO: éxito */}
        {done && (
          <div className="redeem-state">
            <div className="redeem-success">
              <CheckCircle size={40} />
              <h2>¡Acceso activado!</h2>
              <p>Tu cuenta <strong>{user?.email}</strong> ya tiene acceso completo al curso.</p>
            </div>
            <button className="redeem-btn primary" onClick={() => navigate('/curso')}>
              Ir al curso
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Comprobando si ya es de pago */}
        {!done && user && checkingPaid && (
          <div className="redeem-state">
            <p className="redeem-loading">Comprobando tu cuenta…</p>
          </div>
        )}

        {/* ESTADO: ya es usuario de pago */}
        {!done && user && !checkingPaid && alreadyPaid && (
          <div className="redeem-state">
            <div className="redeem-success">
              <CheckCircle size={40} />
              <h2>Ya eres usuario de pago</h2>
              <p>Tu cuenta <strong>{user.email}</strong> ya tiene acceso completo al curso. No necesitas canjear ningún código.</p>
            </div>
            <button className="redeem-btn primary" onClick={() => navigate('/curso')}>
              Acceder al curso
              <ChevronRight size={18} />
            </button>
            <div className="redeem-account">
              <button className="redeem-link" onClick={handleChangeAccount}>
                <LogOut size={13} /> ¿Otra cuenta? Cambiar
              </button>
            </div>
          </div>
        )}

        {/* ESTADO A: sin sesión */}
        {!done && !user && (
          <div className="redeem-state">
            <p className="redeem-intro">
              Para canjear tu código necesitas iniciar sesión.
              El código quedará <strong>enlazado a esa cuenta de forma permanente</strong>,
              así que usa la cuenta con la que quieres acceder al curso.
            </p>
            {error && <div className="redeem-error"><AlertCircle size={16} /> {error}</div>}
            <button className="redeem-btn primary" onClick={handleLogin}>
              Iniciar sesión con Google
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ESTADO B: con sesión, meter código */}
        {!done && user && !checkingPaid && !alreadyPaid && !confirming && (
          <div className="redeem-state">
            <div className="redeem-account">
              <span>Sesión iniciada como <strong>{user.email}</strong></span>
              <button className="redeem-link" onClick={handleChangeAccount}>
                <LogOut size={13} /> Cambiar cuenta
              </button>
            </div>

            <form onSubmit={handleContinue}>
              <label className="redeem-label" htmlFor="redeem-code">Tu código</label>
              <input
                id="redeem-code"
                className="redeem-input"
                type="text"
                placeholder="CPB-XXXX-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                autoFocus
              />
              {error && <div className="redeem-error"><AlertCircle size={16} /> {error}</div>}
              <button className="redeem-btn primary" type="submit">
                Continuar
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* ESTADO C: confirmación */}
        {!done && user && !alreadyPaid && confirming && (
          <div className="redeem-state">
            <div className="redeem-confirm">
              <Lock size={18} />
              <p>
                El código <strong>{normalizedCode}</strong> se canjeará para{' '}
                <strong>{user.displayName || user.email}</strong> ({user.email}).
              </p>
              <p className="redeem-warning">Esta acción no se puede deshacer.</p>
            </div>

            {error && <div className="redeem-error"><AlertCircle size={16} /> {error}</div>}

            <div className="redeem-actions">
              <button
                className="redeem-btn ghost"
                onClick={() => { setConfirming(false); setError(null); }}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="redeem-btn primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Canjeando…' : 'Confirmar canje'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemPage;
