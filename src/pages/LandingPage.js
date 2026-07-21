import React, { useEffect } from 'react';
import { BookOpen, Brain, Code, X, Check, ArrowRight, Zap, Globe } from 'lucide-react';
import './LandingPage.css';

const EBAY_OFFER = process.env.REACT_APP_EBAY === 'true';

const LandingPage = () => {

  useEffect(() => {
    // Al entrar a la landing, forzamos el scroll
    document.body.style.overflow = 'auto';
    // Limpieza al salir de la landing
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="landing-grain" aria-hidden="true"></div>

      {/* Barra de navegación */}
      <header className="nav-bar">
        <a href="/" className="nav-brand" aria-label="Curso de Programación Básica - Inicio">
          <Code size={20} className="nav-brand-icon" />
          <span className="nav-brand-text">Programación <span className="nav-brand-accent">Básica</span></span>
        </a>
        <nav className="nav-links" aria-label="Navegación principal">
          <a href="/level_exercise" className="nav-link">Prueba de nivel</a>
          <a href="/curso" className="nav-cta">
            Acceso al curso
            <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow" aria-hidden="true"></div>

        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">
              <Globe size={15} />
              Sin instalaciones · Todo en el navegador
            </span>

            <h1 className="hero-title">
              Aprende a Programar<br />
              <span className="hero-title-highlight">Desde Cero</span>
            </h1>

            <p className="hero-subtitle">
              Bases sólidas + Enfoque 100% práctico.
            </p>

            <div className="hero-actions">
              <a href="/curso" className="cta-button">
                Empezar Gratis
                <ArrowRight size={22} />
              </a>
              <a href="/level_exercise" className="cta-secondary">
                Haz la prueba de nivel
              </a>
            </div>

            <div className="hero-trust">
              <Zap size={16} className="hero-trust-icon" />
              <span>Ejercicios autocorregibles con feedback inmediato</span>
            </div>

            <div className="pricing-container">
              <div className="pricing-item">
                <div className="pricing-label">Módulos 1 y 2</div>
                <div className="pricing-value-free">Gratis</div>
              </div>
              <div className="pricing-divider"></div>
              <div className="pricing-item">
                <div className="pricing-label">Curso completo</div>
                <div className="pricing-value-paid">14,99€</div>
                <div className="pricing-note">pago único</div>
              </div>

              {EBAY_OFFER && (
                <>
                  <div className="pricing-divider"></div>
                  <div className="pricing-item pricing-item-ebay">
                    <div className="pricing-label pricing-label-ebay">🔥 Oferta eBay</div>
                    <div className="pricing-value-ebay">6,99€</div>
                    <div className="pricing-note">pago único</div>
                  </div>
                </>
              )}
            </div>

            {EBAY_OFFER && (
              <a href="/redeem" className="ebay-redeem-button">
                Canjear código eBay
                <ArrowRight size={20} />
              </a>
            )}
          </div>

          {/* Mockup: ventana de código autocorregible */}
          <div className="hero-visual" aria-hidden="true">
            <div className="code-window">
              <div className="code-window-bar">
                <span className="code-dot code-dot-red"></span>
                <span className="code-dot code-dot-yellow"></span>
                <span className="code-dot code-dot-green"></span>
                <span className="code-window-title">ejercicio.js</span>
              </div>
              <pre className="code-window-body">
<span className="cw-comment">{'// Ejercicio: devuelve la suma'}</span>{'\n'}
<span className="cw-key">function</span> <span className="cw-fn">suma</span>(<span className="cw-var">a</span>, <span className="cw-var">b</span>) {'{'}{'\n'}
{'  '}<span className="cw-key">return</span> <span className="cw-var">a</span> + <span className="cw-var">b</span>;{'\n'}
{'}'}
              </pre>
              <div className="code-window-output">
                <div className="output-line output-pass">
                  <Check size={15} /> Test 1/3 — suma(2, 3) → 5
                </div>
                <div className="output-line output-pass">
                  <Check size={15} /> Test 2/3 — suma(-1, 1) → 0
                </div>
                <div className="output-line output-pass">
                  <Check size={15} /> Test 3/3 — suma(10, 5) → 15
                </div>
                <div className="output-grade">
                  <Zap size={15} /> Nota: <b>10/10</b> · ¡Lección superada!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" aria-hidden="true">↓</div>
      </section>

      {/* Cómo funciona */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">Cómo Funciona</h2>
          <p className="section-subtitle">
            Usamos JavaScript como herramienta práctica, pero te enseñamos la lógica universal que usarás en cualquier lenguaje.
          </p>

          <div className="steps-grid">
            <div className="step-item">
              <span className="step-number">01</span>
              <div className="step-icon">
                <BookOpen size={36} />
              </div>
              <div className="step-title">Teoría</div>
              <div className="step-description">
                Aprendes lógica pura. Clara y sin rodeos. Aplicable a cualquier lenguaje.
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">02</span>
              <div className="step-icon">
                <Brain size={36} />
              </div>
              <div className="step-title">Test</div>
              <div className="step-description">
                Validas que has entendido la teoría.
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">03</span>
              <div className="step-icon">
                <Code size={36} />
              </div>
              <div className="step-title">Práctica</div>
              <div className="step-description">
                Escribes código directamente en tu navegador. Sin instalar nada.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="for-whom-section">
        <div className="section-container">
          <h2 className="section-title">¿Es Para Ti?</h2>

          <div className="audience-grid">
            {/* Para quién SÍ */}
            <div className="audience-card-yes">
              <div className="audience-header">
                <div className="audience-icon-yes">
                  <Check size={30} />
                </div>
                <h3 className="audience-title-yes">Este curso SÍ</h3>
              </div>
              <ul className="audience-list">
                <li>Nunca has programado</li>
                <li>Te bloqueas cuando ves código</li>
                <li>Quieres entender, no copiar</li>
              </ul>
            </div>

            {/* Para quién NO */}
            <div className="audience-card-no">
              <div className="audience-header">
                <div className="audience-icon-no">
                  <X size={30} />
                </div>
                <h3 className="audience-title-no">Este curso NO</h3>
              </div>
              <ul className="audience-list">
                <li>Ya programas con soltura</li>
                <li>Buscas trabajo en 3 días</li>
                <li>Solo quieres copiar soluciones</li>
              </ul>
            </div>
          </div>

          <div className="conversion-test-container">
            <p>¿Dudas de tu nivel?</p>
            <a href="/level_exercise" className="secondary-test-link">
              Haz la prueba de nivel.
            </a>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final-section">
        <div className="cta-final-container">
          <h2 className="cta-final-title">Empieza Ahora</h2>

          <p className="cta-final-subtitle">
            Sin compromiso. Sin tarjeta. Sin instalaciones.
          </p>

          <a href="/curso" className="cta-button-large">
            Empezar Gratis
            <ArrowRight size={26} />
          </a>

          <a href="https://xabierbahillo.dev/" target="_blank" rel="noopener noreferrer" className="creator-card">
            <div className="creator-label">Creado por</div>
            <div className="creator-name">Xabier Bahillo</div>
            <div className="creator-title">
              Ingeniero Informático • +5 años en proyectos reales
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="footer-brand">
            <Code size={16} className="nav-brand-icon" />
            Programación <span className="nav-brand-accent">Básica</span>
          </span>
          <nav className="footer-links" aria-label="Enlaces del pie de página">
            <a href="/curso">Curso</a>
            <a href="/level_exercise">Prueba de nivel</a>
            <a href="https://xabierbahillo.dev/" target="_blank" rel="noopener noreferrer">Sobre el autor</a>
          </nav>
          <span className="footer-copy">© 2026 Curso de Programación Básica</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
