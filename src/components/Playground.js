import { useState, useEffect } from 'react';
import { Play, CheckCircle } from "lucide-react";
import { CodeEditor } from './CodeEditor';
import { runCode } from '../utils/runCode';
import { useAuth } from '../hooks/useAuth';
import { saveProgress, removeProgress } from '../services/ProgressService';
import { Modal } from './Modal';

export const Playground = ({ content, onComplete, id }) => {
    const { user } = useAuth();
    const storageKey = `playground_code_${id}`;
    const [code, setCode] = useState(() => {
        const savedCode = localStorage.getItem(storageKey);
        return savedCode || content.starterCode;
    });
    const [logOutput, setLogOutput] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        const savedCode = localStorage.getItem(storageKey);
        setCode(savedCode || content.starterCode);
        setLogOutput('');
    }, [content, storageKey]);

    const saveCode = () => {
        saveProgress(storageKey, code, user?.uid);
        setShowSaveModal(true);
    };

    const resetCode = () => {
        setShowResetModal(true);
    };

    const confirmReset = () => {
        removeProgress(storageKey, user?.uid);
        setCode(content.starterCode);
        setLogOutput('');
        setShowResetModal(false);
    };

    const runCodeOnly = async () => {
        setLogOutput('Ejecutando...');
        const result = await runCode(code);
        setLogOutput(result.output);
    };

    return (
        <div className="exercise-content">
            <div className="instructions">
                {content.title && (
                    <h3>→ {content.title}</h3>
                )}
                <p>{content.instructions}</p>
                {content.tips && content.tips.length > 0 && (
                    <div className="playground-tips">
                        <h4>💡 Ideas para probar:</h4>
                        <ul>
                            {content.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="action-buttons">
                <button className="run-btn" onClick={runCodeOnly}>
                    <Play size={16} />
                    Ejecutar
                </button>
            </div>

            <CodeEditor 
                code={code} 
                setCode={setCode} 
                logOutput={logOutput}
                onSave={saveCode}
                onReset={resetCode}
                height="150px"
            />

            <Modal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                title="✅ Código Guardado"
                message="Tu código se ha guardado correctamente."
                type="success"
            />
            
            <Modal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                title="⚠️ Resetear Código"
                message="¿Estás seguro de que quieres resetear el código al estado inicial? Se perderá todo tu progreso actual y no podrás recuperarlo."
                type="warning"
                onConfirm={confirmReset}
                confirmText="Sí, resetear"
                cancelText="Cancelar"
            />

            <button className="complete-btn" onClick={onComplete}>
                <CheckCircle size={16} />
                Continuar
            </button>
        </div>
    );
};