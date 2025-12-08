import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const parseMarkdown = (text) => {
  // Negritas, inline code y enlaces
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convertir listas con viñetas (•) en sublistas HTML
  if (html.includes('\n•')) {
    const parts = html.split('\n•');
    const mainText = parts[0];
    const subItems = parts.slice(1).map(item => `<li>${item.trim()}</li>`).join('');
    html = mainText + (subItems ? `<ul style="margin-top: 0.5rem;">${subItems}</ul>` : '');
  }
  
  // Convertir saltos de línea en <br>
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

export const LessonViewer = ({ lesson }) => {
  if (!lesson) return <div>Cargando lección...</div>;

  return (
    <div className="lesson-content">
      <div className="prose">
        {lesson.blocks.map((block, i) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <p 
                  key={i} 
                  className="paragraph"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }} 
                />
              );

            case 'heading':
              const Tag = `h${block.level}`;
              return (
                <Tag key={i} className={`section-h${block.level}`}>
                  {block.content}
                </Tag>
              );

            case 'list':
              return (
                <div className="key-points" key={i}>
                  <ul>
                    {block.items.map((item, j) => {
                      // Item puede ser string o objeto {text, code}
                      if (typeof item === 'string') {
                        return (
                          <li 
                            key={j} 
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }}
                          />
                        );
                      } else if (item.text !== undefined) {
                        // Objeto con texto y posiblemente código
                        return (
                          <li key={j}>
                            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item.text) }} />
                            {item.code && (
                              <div 
                                className={`pseudocode-block ${item.code.className || ''}`}
                                dangerouslySetInnerHTML={{ 
                                  __html: item.code.content.replace(/className="/g, 'class="')
                                }}
                              />
                            )}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              );

            case 'code':
              let htmlContent = block.content;
              
              htmlContent = htmlContent.replace(/className="/g, 'class="');
              
              htmlContent = htmlContent.replace(/\n/g, '<br/>');
              
              return (
                <div 
                  key={i} 
                  className={`pseudocode-block ${block.className || ''}`}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              );

            case 'formula':
              return (
                <div key={i} className="math-block">
                  {block.mode === 'display' ? (
                    <BlockMath math={block.content} />
                  ) : (
                    <InlineMath math={block.content} />
                  )}
                </div>
              );
            
            case 'image':
              return (
                <div key={i} className="image-container">
                  <img 
                    src={block.src}
                    alt={block.alt}
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                  />
                </div>
              );

            case 'separator':
              return <br key={i} />;

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};