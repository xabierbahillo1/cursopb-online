import { Code, ChevronRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthButton } from "./AuthButton";

export function Modules({ 
  courseData, 
  currentModule, 
  currentLesson, 
  completed, 
  progress,
  onLessonSelect 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openModule, setOpenModule] = useState(currentModule);
  const DATA_MODE = process.env.REACT_APP_DATA_MODE || 'API';

  const getLessonIcon = (type) => {
    switch(type) {
      case 'quiz': return '[?]';
      case 'exercise': return '[>]';
      default: return '[·]';
    }
  };

  const isLessonUnlocked = (mIdx, lIdx) => {
    if (mIdx === 0 && lIdx === 0) return true;

    const prevModule = lIdx > 0 ? mIdx : mIdx - 1;
    const prevLesson = lIdx > 0 ? lIdx - 1 : courseData[prevModule].lessons.length - 1;
    const prevKey = `${prevModule}-${prevLesson}`;
    return !!completed[prevKey];
  };

  const handleLessonClick = (mIdx, lIdx) => {
    if (isLessonUnlocked(mIdx, lIdx)) {
      onLessonSelect(mIdx, lIdx);
      // Cerrar sidebar en móvil después de seleccionar
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      }
    }
  };

  // Cerrar sidebar al cambiar el tamaño de ventana a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevenir scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

    // Llevo arriba al cambiar de módulo o lección
    useEffect(() => {
    const contentEl = document.querySelector('.content');

    requestAnimationFrame(() => {
      if (contentEl) {
        contentEl.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }, [currentModule, currentLesson, ]);

  return (
    <>
      {/* Botón hamburguesa en moviles*/}
      <button 
        className="menu-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Overlay para cerrar el sidebar en movil */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Code size={20} />
            <span>Programación Básica</span>
          </div>
          <div className="progress-badge">
            {progress}%
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        
      {DATA_MODE === 'FIREBASE' && (
        <div className="auth-section">
          <AuthButton />
        </div>
      )}


        <div className="modules-container">
          <div className="modules">
            {courseData.map((mod, mIdx) => {
              const isCurrentModule = currentModule === mIdx;
              const isOpenModule = isCurrentModule || openModule === mIdx; // el activo siempre abierto

              return (
                <div key={mod.id} className="module">
                  <h4 
                    className="module-title"
                    onClick={() => {
                      if(!isCurrentModule){ // no permitir cerrar el modulo activo
                        setOpenModule(openModule === mIdx ? null : mIdx);
                      }
                    }}
                    style={{ cursor: isCurrentModule ? 'default' : 'pointer' }}
                  >
                    {`Módulo ${mod.id}: ${mod.title}`}
                  </h4>

                  {isOpenModule && (
                    <ul className="lessons">
                      {mod.lessons.map((les, lIdx) => {
                        const isCompleted = completed[`${mIdx}-${lIdx}`];
                        const isCurrent = currentModule === mIdx && currentLesson === lIdx;
                        const unlocked = isLessonUnlocked(mIdx, lIdx);

                        return (
                          <li
                            key={les.id}
                            className={`lesson-item 
                              ${isCurrent ? 'active' : ''} 
                              ${isCompleted ? 'completed' : ''} 
                              ${!unlocked ? 'locked' : ''}`}
                            onClick={() => handleLessonClick(mIdx, lIdx)}
                            style={{ cursor: unlocked ? 'pointer' : 'not-allowed' }}
                          >
                            <span className="lesson-status">
                              {isCompleted ? '[✓]' : (!unlocked ? '[🔒]' : '[ ]')}
                            </span>
                            <span className="lesson-text">
                              {getLessonIcon(les.type)} {les.title}
                            </span>
                            {isCurrent && <ChevronRight size={14} />}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}