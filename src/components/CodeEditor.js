import { Code, Save, RotateCcw } from "lucide-react";
import Editor from "@monaco-editor/react";

export const CodeEditor = ({ code, setCode, logOutput, onSave, onReset }) => {
    return (
        <div className="code-editor-section">
            <div className="code-editor" style={{ marginBottom: '1rem' }}>
                <div className="editor-header">
                    <div className="editor-header-left">
                        <Code size={16} />
                        <span>editor.js</span>
                    </div>
                    <div className="editor-header-right">
                        <button className="editor-action-btn save" onClick={onSave} title="Guardar código">
                            <Save size={14} />
                            <span>Guardar</span>
                        </button>
                        <button className="editor-action-btn reset" onClick={onReset} title="Resetear código">
                            <RotateCcw size={14} />
                            <span>Resetear</span>
                        </button>
                    </div>
                </div>
                <Editor
                    height="300px"
                    defaultLanguage="javascript"
                    value={code}
                    onChange={setCode}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        automaticLayout: true,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
            <div className="output">
                <div className="output-header">→ Salida del programa:</div>
                <pre>{logOutput || 'Haz clic en "Ejecutar (Salida)" para ver la salida de tu código.'}</pre>
            </div>
        </div>
    );
};