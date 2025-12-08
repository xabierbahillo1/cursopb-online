import { Lock, CheckCircle, ChevronRight, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PRICE = {
  amount: 14.99,
  currency: '€',
  original: 19.99,
};

const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || 'xabierbahillo1@gmail.com';

export const Payment = ({ lessonId }) => {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetAccess = async () => {
    setError(null);

    // 1. Si no hay usuario → solo inicia sesión
    if (!user) {
      try {
        setLoading(true);
        const result = await signInWithGoogle();

        if (!result.success) {
          setError('Debes iniciar sesión para continuar');
          setLoading(false);
          return;
        }

        setLoading(false);
        return;
      } catch (err) {
        setError('Error al iniciar sesión');
        setLoading(false);
        return;
      }
    }

    // 2. Si ya hay usuario → inicia el proceso de pago
    try {
      setLoading(true);

      // Guardar para redirigir
      localStorage.setItem('redirectAfterPayment', lessonId);

      await initiateStripeCheckout(user.uid, lessonId);
    } catch (err) {
      console.error('Error iniciando checkout:', err);
      setError('Error al procesar el pago. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const initiateStripeCheckout = async (userId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl: window.location.href,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error creating checkout session');
    }

    const { sessionUrl } = await response.json();

    window.location.href = sessionUrl;
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Problema con el acceso al curso');
    const body = encodeURIComponent(
      `Hola,\n\n` +
      `Explica aquí tu problema con el pago o acceso al curso.\n` +
      `(Mantén tu email e ID de usuario para que podamos ayudarte)\n\n` +
      `----------------------------------------\n` +
      `Email de mi cuenta: ${user?.email || ''}\n` +
      `ID de usuario: ${user?.uid || ''}\n` +
      `----------------------------------------\n\n` +
      `Gracias.`
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="payment-required">
      <div className="payment-header">
        <div className="payment-header-icon">
          <Lock size={18} />
        </div>
        <span>Contenido bloqueado</span>
      </div>

      <div className="payment-content">
        <div className="payment-left">
          <h2>Desbloquea el curso completo</h2>
          <p className="payment-lesson-info">
            Esta lección y todo el contenido están disponibles con el acceso completo al curso.
          </p>

          <div className="payment-benefits">
            <ul>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Acceso a todas las lecciones del curso</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Ejercicios prácticos con corrección automática</span>
              </li>
              <li>
                <CheckCircle size={16} className="check-icon" />
                <span>Tests de evaluación para medir tu progreso</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="payment-right">
          <div className="payment-price-card">
            <div className="payment-price">
              {PRICE.original && (
                <span className="payment-price-original">
                  {PRICE.original}{PRICE.currency}
                </span>
              )}
              <span className="payment-price-current">
                {PRICE.amount}{PRICE.currency}
              </span>
              <span className="payment-price-period">pago único</span>
            </div>

            {error && <div className="payment-error">{error}</div>}

            <button
              className="payment-btn primary"
              onClick={handleGetAccess}
              disabled={loading}
            >
              {loading ? (
                <span>Procesando...</span>
              ) : user ? (
                <>
                  <span>Obtener Acceso</span>
                  <ChevronRight size={18} />
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <div className="payment-support">
              <button
                className="payment-support-link"
                onClick={handleContactSupport}
              >
                <Mail size={14} />
                <span>¿Problemas con tu pago?</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;