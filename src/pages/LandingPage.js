import React, { useEffect } from 'react';
import { BookOpen, Brain, Code, X, Check, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {

    useEffect(() => {
    // Al entrar a la landing, forzamos el scroll
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.position = 'static';

    // Limpieza al salir de la landing (opcional, para que el curso vuelva a su estado)
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
    };
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section - Full viewport */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Aprende a Programar<br />
            <span className="hero-title-highlight">Desde Cero</span>
          </h1>
            
          <p className="hero-subtitle">
            Bases sólidas + Enfoque 100% práctico.
          </p>

          <a href="/curso" className="cta-button">
            Empezar Gratis
            <ArrowRight size={24} />
          </a>
          
          <p className="hero-level-test">
            ¿Ya tienes experiencia?{' '}
            <a href="/level_exercise">Prueba de nivel</a>
          </p>

          <div className="pricing-container">
            <div>
              <div className="pricing-label">Módulos 1 y 2</div>
              <div className="pricing-value-free">Gratis</div>
            </div>
            <div className="pricing-divider"></div>
            <div>
              <div className="pricing-label">Curso completo</div>
              <div className="pricing-value-paid">14,99€</div>
              <div className="pricing-note">pago único</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">↓</div>
      </section>

      {/* Cómo funciona */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">Cómo Funciona</h2>
          <p className="section-subtitle">
            Cada lección termina escribiendo código. Nada de quedarse solo en teoría.
          </p>

          <div className="steps-grid">
            <div className="step-item">
              <div className="step-icon">
                <BookOpen size={40} color="#58a6ff" />
              </div>
              <div className="step-title">Teoría</div>
              <div className="step-description">
                Clara y sin rodeos. Solo lo necesario.
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <Brain size={40} color="#58a6ff" />
              </div>
              <div className="step-title">Test</div>
              <div className="step-description">
                Validas que has entendido la teoría.
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <Code size={40} color="#58a6ff" />
              </div>
              <div className="step-title">Práctica</div>
              <div className="step-description">
                Programas de verdad. En el navegador.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="for-whom-section">
        <h2 className="section-title">¿Es Para Ti?</h2>

        <div className="audience-grid">
          {/* Para quién SÍ */}
          <div className="audience-card-yes">
            <div className="audience-header">
              <div className="audience-icon-yes">
                <Check size={32} color="#3fb950" />
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
                <X size={32} color="#f85149" />
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
      </section>

      {/* CTA Final */}
      <section className="cta-final-section">
        <div className="cta-final-container">
          <h2 className="cta-final-title">Empieza Ahora</h2>
          
          <p className="cta-final-subtitle">
            Sin compromiso. Sin tarjeta. Solo tú y el código.
          </p>

          <a href="/curso" className="cta-button-large">
            Empezar Gratis
            <ArrowRight size={28} />
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
    </div>
  );
};

export default LandingPage;