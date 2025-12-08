export const runCode = (code, timeoutMs = 2000) => {
    return new Promise((resolve) => {
        const blob = new Blob(
            [`
            self.onmessage = (event) => {
                const { code } = event.data;
                let logs = [];
                const originalLog = console.log;
                
                // Función para formatear valores
                const formatValue = (value, inObject = false) => {
                    if (value === null) return 'null';
                    if (value === undefined) return 'undefined';
                    
                    if (typeof value === 'string') return inObject ? "'" + value + "'" : value;
                    
                    if (typeof value === 'object') {
                        if (Array.isArray(value)) {
                            return '[' + value.map(v => formatValue(v, false)).join(', ') + ']';
                        }
                        // Es un objeto
                        try {
                            const pairs = [];
                            for (const key in value) {
                                if (value.hasOwnProperty(key)) {
                                    pairs.push(key + ': ' + formatValue(value[key], true)); // strings dentro de objetos
                                }
                            }
                            return '{ ' + pairs.join(', ') + ' }';
                        } catch (e) {
                            return String(value);
                        }
                    }
                    return String(value);
                };
                
                console.log = (...args) => {
                    logs.push(args.map(a => formatValue(a)).join(' '));
                };
                
                try {
                    const userFunc = new Function(code);
                    userFunc();
                    self.postMessage({ type: 'success', output: logs.join('\\n') || 'Ejecución completada (sin salida).' });
                } catch (err) {
                    self.postMessage({ type: 'error', output: '❌ Error: ' + err.message });
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
            resolve({ type: 'timeout', output: "⚠️ Ejecución detenida: posible bucle infinito o tiempo de ejecución excesivo." });
        }, timeoutMs);

        worker.onmessage = (e) => {
            clearTimeout(timeout);
            worker.terminate();
            resolve(e.data);
        };

        worker.onerror = (err) => {
            clearTimeout(timeout);
            worker.terminate();
            resolve({ type: 'error', output: `❌ Error en el worker: ${err.message}` });
        };

        worker.postMessage({ code });
    });
};
