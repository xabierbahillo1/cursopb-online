import { useState } from 'react';
import { KeyRound, Printer, Globe, LogIn, Type, Lock, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import './PdfCodigoPage.css';

// -----------------------------------------------------------------------------
// Herramienta LOCAL para generar PDFs de canje.
//
// IMPORTANTE: el código se guarda SOLO en el estado de React (en tu navegador).
// Nunca se envía a ningún servidor: no hay fetch, ni POST, ni almacenamiento.
// Escribes el código -> se pinta un documento A4 -> "Descargar PDF" abre el
// diálogo de impresión del navegador (Guardar como PDF).
//
// Aunque alguien acabe entrando a /pdfcodigo, aquí no hay nada que canjear:
// solo maqueta un PDF con instrucciones. El canje real ocurre en /redeem.
// -----------------------------------------------------------------------------

const REDEEM_URL = 'cursoprogramacionbasica.es/redeem';
const COURSE_URL = 'cursoprogramacionbasica.es/curso';
const REDEEM_HREF = 'https://cursoprogramacionbasica.es/redeem';
const COURSE_HREF = 'https://cursoprogramacionbasica.es/curso';
const PUB = process.env.PUBLIC_URL || '';

// Enlace clicable dentro del PDF (Chrome conserva los <a href> al guardar).
const PdfLink = ({ href, children }) => (
  <a className="pdf-link" href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

// Imagen con hueco de reserva: si el screenshot no existe, muestra un marcador
// en vez de un icono roto. Deja tus capturas en public/pdf-assets/.
const Shot = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="pdf-shot pdf-shot-missing">
        <span>Captura pendiente</span>
        <code>{src.replace(PUB, '')}</code>
      </div>
    );
  }
  return <img className="pdf-shot" src={src} alt={alt} onError={() => setFailed(true)} />;
};

const STEPS = [
  {
    icon: Globe,
    title: 'Entra en la página de canje',
    body: (
      <>Abre tu navegador y ve a <PdfLink href={REDEEM_HREF}>{REDEEM_URL}</PdfLink>.
      Puedes hacerlo desde el móvil o el ordenador, da igual.</>
    ),
  },
  {
    icon: LogIn,
    title: 'Inicia sesión con Google',
    body: (
      <>Pulsa <strong>“Iniciar sesión con Google”</strong> y elige tu cuenta.
      El código quedará ligado a <strong>esa cuenta para siempre</strong>, así
      que usa la cuenta con la que quieras acceder al curso.</>
    ),
    shot: `${PUB}/pdf-assets/paso2.png`,
  },
  {
    icon: Type,
    title: 'Escribe tu código',
    body: (
      <>Escribe (o copia) tu código y pulsa <strong>“Continuar”</strong>.</>
    ),
    showCode: true,
    shot: `${PUB}/pdf-assets/paso3.png`,
  },
  {
    icon: Lock,
    title: 'Confirma el canje',
    body: (
      <>Revisa que la cuenta es la correcta y pulsa
      <strong> “Confirmar canje”</strong>. El código quedará ligado a esa cuenta.</>
    ),
    shot: `${PUB}/pdf-assets/paso4.png`,
  },
  {
    icon: CheckCircle,
    title: '¡Listo! Ya tienes acceso',
    body: (
      <>Verás el mensaje <strong>“¡Acceso activado!”</strong>. Pulsa
      <strong> “Ir al curso”</strong> y empieza a aprender.</>
    ),
    shot: `${PUB}/pdf-assets/paso5.png`,
  },
];

const PdfCodigoPage = () => {
  const [draft, setDraft] = useState('');
  const [code, setCode] = useState('');

  const normalized = draft.trim().toUpperCase().replace(/\s+/g, '');

  const generate = (e) => {
    e.preventDefault();
    if (!normalized) return;
    setCode(normalized);
  };

  return (
    <div className="pdf-page">
      {/* ------- BARRA DE CONTROL (no sale en el PDF) ------- */}
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-brand">
          <KeyRound size={18} />
          <span>Generador de PDF de canje</span>
        </div>

        <form className="pdf-toolbar-form" onSubmit={generate}>
          <input
            className="pdf-toolbar-input"
            type="text"
            placeholder="CPB-XXXX-XXXX-XXXX"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <button className="pdf-btn" type="submit">Generar</button>
          <button
            className="pdf-btn ghost"
            type="button"
            onClick={() => window.print()}
            disabled={!code}
            title={code ? 'Guardar como PDF' : 'Genera un código primero'}
          >
            <Printer size={16} /> Descargar PDF
          </button>
        </form>

        <p className="pdf-toolbar-note">
          El código no sale de este navegador. En el diálogo de impresión deja
          <strong> Márgenes: Predeterminado</strong>, activa
          <strong> “Gráficos de fondo”</strong> y elige <strong>“Guardar como PDF”</strong>.
        </p>
      </div>

      {/* ------- DOCUMENTO A4 (esto es lo que se imprime) ------- */}
      {code ? (
        <div className="pdf-sheet">
          {/* Portada / cabecera de marca */}
          <header className="pdf-cover">
            <div className="pdf-cover-brand">
              <img className="pdf-logo" src={`${PUB}/logo512.png`} alt="" />
              <span>Curso de Programación Básica</span>
            </div>
            <h1>Tu acceso al curso</h1>
            <p className="pdf-cover-sub">
              Aprende a programar desde cero. 100% práctico, todo en el navegador.
            </p>
          </header>

          <div className="pdf-body">
            {/* Código */}
            <section className="pdf-code-block">
              <span className="pdf-overline">Tu código de acceso</span>
              <div className="pdf-code">{code}</div>
              <span className="pdf-code-hint">
                De un solo uso · Acceso completo y permanente al curso
              </span>
            </section>

            {/* Pasos */}
            <section className="pdf-steps">
              <span className="pdf-overline">Cómo canjearlo</span>
              <h2>{STEPS.length} pasos y estás dentro</h2>
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div className="pdf-step" key={i}>
                    <div className="pdf-step-num">{i + 1}</div>
                    <div className="pdf-step-text">
                      <h3><Icon size={16} /> {step.title}</h3>
                      <p>{step.body}</p>
                      {step.showCode && (
                        <div className="pdf-step-code">{code}</div>
                      )}
                      {step.shot && <Shot src={step.shot} alt={`Paso ${i + 1}`} />}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Acceso futuro */}
            <section className="pdf-access">
              <div className="pdf-access-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <h3>A partir de ahora, para entrar al curso</h3>
                <p>
                  Ve a <PdfLink href={COURSE_HREF}>{COURSE_URL}</PdfLink> e inicia
                  sesión con la{' '}
                  <strong>misma cuenta de Google</strong> con la que canjeaste el
                  código. Solo se canjea una vez: después entras siempre desde ahí.
                </p>
              </div>
              <ArrowRight className="pdf-access-arrow" size={20} />
            </section>

          </div>

          <footer className="pdf-footer">
            <span>Curso de Programación Básica</span>
            <PdfLink href={COURSE_HREF}>{COURSE_URL}</PdfLink>
          </footer>
        </div>
      ) : (
        <div className="pdf-empty">
          <KeyRound size={40} />
          <p>Escribe un código arriba y pulsa <strong>Generar</strong> para ver el PDF.</p>
        </div>
      )}
    </div>
  );
};

export default PdfCodigoPage;
