import React from 'react';
import { BlockMath } from 'react-katex'; 

export const LatexRenderer = ({ text }) => {
    // 1. Divide el texto en partes: texto plano y bloques de fórmula ($$formula$$)
    const parts = text.split(/(\$\$[^\$]*\$\$)/g);

    return (
        <React.Fragment>
            {parts.map((part, index) => {
                // 2. Identifica la fórmula
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    
                    // Limpia la fórmula: elimina los $$ iniciales y finales.
                    let formula = part.substring(2, part.length - 2).trim();
                    
                    return <BlockMath key={index} math={formula} />;
                } 
                
                // 3. Renderiza el texto plano
                // Usamos dangerouslySetInnerHTML para que el HTML (<strong>, <code>) se renderice.
                // Reemplazamos los saltos de línea (\n) con <br /> para que se vean.
                const htmlContent = part.replace(/\n/g, '<br />');

                return (
                    <div 
                        key={index} 
                        dangerouslySetInnerHTML={{ __html: htmlContent }} 
                        className="latex-text-part" 
                        style={{ display: 'inline', whiteSpace: 'pre-wrap' }}
                    />
                );
            })}
        </React.Fragment>
    );
};

export default LatexRenderer;