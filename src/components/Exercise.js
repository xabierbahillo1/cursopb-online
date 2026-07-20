import { useState, useEffect } from 'react';
import { Play, CheckCircle } from "lucide-react";
import { CodeEditor } from './CodeEditor';
import { FinalExerciseScreen } from './FinalExerciseScreen';
import { runCode } from '../utils/runCode';
import { LatexRenderer } from './LatexRenderer';
import { Modal } from './Modal';
import { useAuth } from '../hooks/useAuth';
import { saveProgress, removeProgress } from '../services/ProgressService';

export const Exercise = ({ content, onComplete, id }) => {
    const { user } = useAuth();
    const storageKey = `exercise_code_${id || 'default'}`;
    const [code, setCode] = useState(() => {
        const savedCode = localStorage.getItem(storageKey);
        return savedCode || content.starterCode;
    });
    const [logOutput, setLogOutput] = useState('');
    const [, setTestResults] = useState([]);
    const [testStatusMessage, setTestStatusMessage] = useState('');
    const [showFinalScreen, setShowFinalScreen] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    // Estado para las pestañas de pre y postcondiciones por función
    const [activeConditionTab, setActiveConditionTab] = useState(null);

    useEffect(() => {
        // Cargar código guardado o usar starterCode cuando cambie el contenido
        const savedCode = localStorage.getItem(storageKey);
        setCode(savedCode || content.starterCode);
        setLogOutput('');
        setTestResults([]);
        setTestStatusMessage('');
        setShowFinalScreen(false);
        setFinalScore(0);

        // Inicializar la primera pestaña si existen pre y postcondiciones por función
        if (content.preconditionsByFunction || content.postconditionsByFunction) {
            const functions = Object.keys(content.preconditionsByFunction || content.postconditionsByFunction || {});
            if (functions.length > 0) {
                setActiveConditionTab(functions[0]);
            }
        }
    }, [content, storageKey]);

    const saveCode = () => {
        // Guarda el codigo escrito por el usuario en localStorage y sincroniza con Firebase
        saveProgress(storageKey, code, user?.uid);
        setShowSaveModal(true);
    };

    const resetCode = () => {
        // Restea el codigo escrito por el usuario al estado inicial
        setShowResetModal(true);
    };

    const confirmReset = () => {
        // Solicito confirmar el reseteo del codigo
        removeProgress(storageKey, user?.uid);
        setCode(content.starterCode);
        setLogOutput('');
        setTestResults([]);
        setTestStatusMessage('');
        setShowResetModal(false);
    };

    const runCodeOnly = async () => {
        // Ejecuta el código sin evaluar los tests. Opcion Ejecutar
        setLogOutput('');
        setTestResults([]);
        setTestStatusMessage('');
        setShowFinalScreen(false);

        const result = await runCode(code);
        setLogOutput(result.output);
    };

    const extractCode = (fullCode) => {
        // Extrae el código del alumno a partir de la marca especial

        const startMarker = '// Escribe a partir de aquí tu código:';
        
        // Busca el índice de la marca especial en el código.
        const markerIndex = fullCode.indexOf(startMarker);
        
        if (markerIndex === -1) {
            return ""; 
        }

        // Calcula el punto de inicio justo después de la marca especial.
        const startIndex = markerIndex + startMarker.length;
        
        // Extrae la subcadena desde el punto de inicio hasta el final.
        const extractedCode = fullCode.substring(startIndex);
        
        return extractedCode;
    };

    const evaluateCode = async () => {
        // Evalua el código ejecutando los tests definidos. Opcion Evaluar Ejercicio

        const debug = true; // Cambiar a true para ver información de debug
        
        setShowFinalScreen(false);
        setTestStatusMessage('Evaluando...');

        const funcName = content.functionName;
        
        let codeToRun = "";
        if (content.inyectCode) {
            // Extraer el código del alumno
            const studentCode = extractCode(code);
            // Reemplazar el marcador en el mainCode con el código del alumno
            codeToRun = content.mainCode.replace('// INJECT_CODE_HERE', studentCode);
        }
        else {
            // Combinar el código del usuario con el código del test
            codeToRun = `${code}\n${content.mainCode}`;
        }

        if (debug) {
            console.log('🔍 DEBUG - Código a ejecutar:', codeToRun);
        }

        // Limpieza de comentarios (necesario para evitar falsos positivos)
        let cleanCode = codeToRun.replace(/\/\/.*$/gm, '');
        cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');

        // Comprueba que no se usen funciones prohibidas
        if (content.forbiddenFunctions && content.forbiddenFunctions.length > 0) {
            for (const method of content.forbiddenFunctions) {
                if (cleanCode.includes(method)) {
                    setTestStatusMessage(`❌ Solución rechazada. Uso de función ${method} no permitido.`);
                    setFinalScore(0);
                    return;
                }
            }
        }

        // Primero, probamos si el código se puede ejecutar sin errores graves, para dar error de bucles infinitos o errores de sintaxis
        const syntaxCheck = await runCode(codeToRun, 2000);
        if (syntaxCheck.type === 'error' || syntaxCheck.type === 'timeout') {
            // Si hay error o bucle, lo mostramos en output y cancelamos la evaluación
            setLogOutput(syntaxCheck.output);
            setTestStatusMessage(syntaxCheck.output);
            setFinalScore(0);
            setTimeout(() => setShowFinalScreen(true), 500);
            return;
        }

        try {
            // Ejecutamos el código dentro del worker para evaluar los tests
            const blob = new Blob(
                [`
                self.onmessage = (event) => {
                    const { code, funcName, tests, debug } = event.data;
                    let logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => logs.push(args.map(a => String(a)).join(' '));

                    if (debug) {
                        self.postMessage({ type: 'debug', message: '🔍 Worker iniciado' });
                        self.postMessage({ type: 'debug', message: '🔍 Función a buscar: ' + funcName });
                        self.postMessage({ type: 'debug', message: '🔍 Tests a ejecutar: ' + tests.length });
                    }

                    // Función para comparar valores 
                    function deepEqual(a, b) {
                        if (a === b) return true;
                        
                        if (a == null || b == null) return false;
                        if (typeof a !== typeof b) return false;
                        
                        // Comparar arrays
                        if (Array.isArray(a) && Array.isArray(b)) {
                            if (a.length !== b.length) return false;
                            for (let i = 0; i < a.length; i++) {
                                if (!deepEqual(a[i], b[i])) return false;
                            }
                            return true;
                        }
                        
                        // Comparar objetos
                        if (typeof a === 'object' && typeof b === 'object') {
                            const keysA = Object.keys(a);
                            const keysB = Object.keys(b);
                            
                            if (keysA.length !== keysB.length) return false;
                            
                            for (const key of keysA) {
                                if (!keysB.includes(key)) return false;
                                if (!deepEqual(a[key], b[key])) return false;
                            }
                            return true;
                        }
                        
                        return false;
                    }

                    // Función para crear un proxy que cuenta accesos a un array
                    function createArrayProxy(arr) {
                        const accessCount = { count: 0 };
                        const writeCount = { count: 0 };
                        const proxy = new Proxy(arr, {
                            get(target, prop) {
                                // Contar solo accesos numéricos (índices del array)
                                if (!isNaN(prop) && prop !== 'length') {
                                    accessCount.count++;
                                }
                                return target[prop];
                            },
                            set(target, prop, value) {
                                // Contar solo escrituras numéricas (índices del array)
                                if (!isNaN(prop) && prop !== 'length') {
                                    writeCount.count++;
                                }
                                target[prop] = value;
                                return true;
                            }
                        });
                        return { proxy, accessCount, writeCount };
                    }

                    function getExtraParams(test) {
                        const reservedKeys = ['input', 'expected', 'maxAccesses', 'maxWrites'];
                        const extraParams = {};
                        for (const key of Object.keys(test)) {
                            if (!reservedKeys.includes(key)) {
                                extraParams[key] = test[key];
                            }
                        }
                        return extraParams;
                    }

                    try {
                        const func = new Function(\`\${code}; return typeof \${funcName} !== 'undefined' ? \${funcName} : null;\`)();
                        
                        if (debug) {
                            self.postMessage({ type: 'debug', message: '🔍 Función encontrada: ' + (func !== null) });
                            self.postMessage({ type: 'debug', message: '🔍 Es función: ' + (typeof func === 'function') });
                        }

                        if (typeof func !== 'function') {
                            self.postMessage({ type: 'error', output: '❌ Error: La función "' + funcName + '" no está definida.' });
                            return;
                        }

                        const results = tests.map((test, index) => {
                            try {
                                const extraParams = getExtraParams(test);
                                const extraParamValues = Object.values(extraParams);
                                const hasExtraParams = extraParamValues.length > 0;

                                if (debug) {
                                    self.postMessage({ type: 'debug', message: \`🔍 Test \${index + 1}: input=\${JSON.stringify(test.input)}, expected=\${JSON.stringify(test.expected)}, maxAccesses=\${test.maxAccesses || 'sin límite'}\` });
                                }
                                
                                let result;
                                let actualAccesses = null;
                                let actualWrites = null;
                                
                                // Si el input es un array y hay maxAccesses O maxWrites definido, usar proxy
                                if (Array.isArray(test.input) && (test.maxAccesses !== undefined || test.maxWrites !== undefined)) {
                                    const { proxy, accessCount, writeCount } = createArrayProxy(test.input);
                                    if (hasExtraParams) {
                                        result = func(proxy, ...extraParamValues);
                                    } else {
                                        result = func(proxy);
                                    }
                                    actualAccesses = accessCount.count;
                                    actualWrites = writeCount.count;
                                } else {
                                    result = func(test.input);
                                }
                                
                                const correctResult = deepEqual(result, test.expected);
                                let accessCheck = true;
                                let writeCheck = true;
                                let accessMessage = '';
                                
                                // Validar accesos si maxAccesses está definido
                                if (test.maxAccesses !== undefined && actualAccesses !== null) {
                                    accessCheck = actualAccesses <= test.maxAccesses;
                                    accessMessage = \` (accesos: \${actualAccesses}/\${test.maxAccesses})\`;
                                    
                                    if (debug) {
                                        self.postMessage({ type: 'debug', message: \`🔍 Test \${index + 1}: accesos=\${actualAccesses}, límite=\${test.maxAccesses}, ok=\${accessCheck}\` });
                                    }
                                }

                                // Validar escrituras si maxWrites está definido
                                if (test.maxWrites !== undefined && actualWrites !== null) {
                                    writeCheck = actualWrites <= test.maxWrites;
                                    accessMessage += \` (escrituras: \${actualWrites}/\${test.maxWrites})\`;
                                    
                                    if (debug) {
                                        self.postMessage({ type: 'debug', message: \`🔍 Test \${index + 1}: escrituras=\${actualWrites}, límite=\${test.maxWrites}, ok=\${writeCheck}\` });
                                    }
                                }
                                
                                const passed = correctResult && accessCheck && writeCheck;
                                
                                if (debug) {
                                    self.postMessage({ type: 'debug', message: \`🔍 Test \${index + 1}: result=\${JSON.stringify(result)}, correctResult=\${correctResult}, accessCheck=\${accessCheck}, writeCheck=\${writeCheck}, passed=\${passed}\` });
                                }
                                
                                return { 
                                    passed, 
                                    correctResult,
                                    accessCheck,
                                    actualAccesses,
                                    maxAccesses: test.maxAccesses,
                                    maxWrites: test.maxWrites,
                                    accessMessage 
                                };
                            } catch (err) {
                                if (debug) {
                                    self.postMessage({ type: 'debug', message: \`🔍 Test \${index + 1}: ERROR - \${err.message}\` });
                                }
                                return { passed: false, correctResult: false, accessCheck: true };
                            }
                        });

                        const passedCount = results.filter(r => r.passed).length;
                        const totalTests = results.length;
                        const score = totalTests > 0 ? ((passedCount / totalTests) * 10).toFixed(2) : 10;

                        // Crear mensaje detallado de resultados
                        let detailedOutput = logs.join('\\n') || 'Evaluación completada.';
                        
                        const failedAccessTests = results.filter((r, i) => r.correctResult && !r.accessCheck);
                        if (failedAccessTests.length > 0) {
                            failedAccessTests.forEach((r, i) => {
                                const testIndex = results.indexOf(r) + 1;
                            });
                        }

                        if (debug) {
                            self.postMessage({ type: 'debug', message: \`🔍 Resultado final: \${passedCount}/\${totalTests} tests superados (nota: \${score})\` });
                        }

                        self.postMessage({
                            type: 'success',
                            score,
                            output: detailedOutput,
                            passedCount,
                            totalTests,
                            results
                        });

                    } catch (err) {
                        if (debug) {
                            self.postMessage({ type: 'debug', message: '🔍 ERROR GENERAL: ' + err.message });
                        }
                        self.postMessage({ type: 'error', output: '❌ Error en evaluación: ' + err.message });
                    } finally {
                        console.log = originalLog;
                    }
                };
                `],
                { type: "application/javascript" }
            );

            const worker = new Worker(URL.createObjectURL(blob));

            const timeout = setTimeout(() => {
                worker.terminate();
                setLogOutput("⚠️ Evaluación detenida: posible bucle infinito o tiempo de ejecución excesivo.");
                setTestStatusMessage("⚠️ Evaluación detenida: bucle infinito detectado.");
                setFinalScore(0);
                setTimeout(() => setShowFinalScreen(true), 500);
            }, 2000);

            worker.onmessage = (e) => {
                const { type, score, output, passedCount, totalTests, message, results } = e.data;

                if (type === 'debug') {
                    console.log(message);
                    return;
                }

                clearTimeout(timeout);
                worker.terminate();

                if (type === 'success') {
                    setFinalScore(score);
                    setLogOutput(output);
                    
                    const failedAccess = results?.some(r => r.correctResult && !r.accessCheck);
                    if (failedAccess) {
                        setTestStatusMessage(`⚠️ ${passedCount}/${totalTests} tests superados (algunos con demasiados accesos).`);
                    } else {
                        setTestStatusMessage(`✅ ${passedCount}/${totalTests} tests superados.`);
                    }
                } else {
                    setFinalScore(0);
                    setLogOutput(output);
                    setTestStatusMessage(output);
                }

                setTimeout(() => setShowFinalScreen(true), 500);
            };

            worker.postMessage({ 
                code: codeToRun, 
                funcName, 
                tests: content.tests,
                debug 
            });
        } catch (err) {
            const errorMsg = `❌ Error al evaluar el código: ${err.message}`;
            setLogOutput(errorMsg);
            setTestStatusMessage(errorMsg);
            setFinalScore(0);
            setTimeout(() => setShowFinalScreen(true), 500);
        }
    };

    const handleRetry = () => {
        setShowFinalScreen(false);
        setTestStatusMessage('');
    };

    if (showFinalScreen) {
        const hasPassed = finalScore >= 8;
        return (
            <div className="exercise-content">
                <FinalExerciseScreen 
                    score={finalScore} 
                    hasPassed={hasPassed} 
                    passMessage="¡Has superado el ejercicio con éxito! Puedes continuar."
                    failMessage={`Has superado el ${Math.round(finalScore * 0.1 * 100)}% de los tests. Necesitas al menos un 8.0 para aprobar. ¡Inténtalo de nuevo!`}
                    onContinue={onComplete} 
                    onRetry={handleRetry} 
                    continueBtnText="Continuar"
                    retryBtnText="Volver a Codificar"
                />
            </div>
        );
    }

    // Determinar si usar pre-postcondiciones por función o pre-postcondiciones generales
    const hasConditionsByFunction = content.preconditionsByFunction || content.postconditionsByFunction;

    return (
        <div className="exercise-content">
            <div className="instructions">
                <h3>→ Instrucciones</h3>
                <LatexRenderer text={content.instructions} />
            </div>

            {/* Pre y postcondiciones generales */}
            {!hasConditionsByFunction && (
                <div className="conditions">
                    {content.preconditions && content.preconditions.length > 0 && (
                        <div className="preconditions">
                            <h4>⚠️ Precondiciones:</h4>
                            <ul>
                                {content.preconditions.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {content.postconditions && content.postconditions.length > 0 && (
                        <div className="postconditions" style={{ marginTop: '10px' }}>
                            <h4>✅ Postcondiciones:</h4>
                            <ul>
                                {content.postconditions.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Pre y postcondiciones por funcion */}
            {hasConditionsByFunction && (
                <div className="conditions-by-function">
                    <div className="function-tabs">
                        {Object.keys(content.preconditionsByFunction || content.postconditionsByFunction || {}).map(funcName => (
                            <button
                                key={funcName}
                                className={`function-tab ${activeConditionTab === funcName ? 'active' : ''}`}
                                onClick={() => setActiveConditionTab(funcName)}
                            >
                                {funcName}{funcName !== 'Global' ? '()' : ''}
                            </button>
                        ))}
                    </div>

                    {activeConditionTab && (
                        <div className="conditions">
                            {content.preconditionsByFunction && content.preconditionsByFunction[activeConditionTab] && (
                                <div className="preconditions">
                                    <h4>⚠️ Precondiciones:</h4>
                                    <ul>
                                        {content.preconditionsByFunction[activeConditionTab].map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {content.postconditionsByFunction && content.postconditionsByFunction[activeConditionTab] && (
                                <div className="postconditions" style={{ marginTop: '10px' }}>
                                    <h4>✅ Postcondiciones:</h4>
                                    <ul>
                                        {content.postconditionsByFunction[activeConditionTab].map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="action-buttons">
                <button className="run-btn" onClick={runCodeOnly}>
                    <Play size={16} />
                    Ejecutar (Salida)
                </button>
                <button className="submit-btn" onClick={evaluateCode} style={{ marginLeft: '10px' }}>
                    <CheckCircle size={16} />
                    Evaluar Ejercicio
                </button>
            </div>

            <CodeEditor 
                code={code} 
                setCode={setCode} 
                logOutput={logOutput}
                onSave={saveCode}
                onReset={resetCode}
            />

            {(testStatusMessage && !showFinalScreen) && (
                <div className="test-results">
                    <h4>→ Estado de la Evaluación:</h4>
                    <p className={`test-summary evaluating`}>
                        {testStatusMessage}
                    </p>
                </div>
            )}

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
        </div>
    );
};