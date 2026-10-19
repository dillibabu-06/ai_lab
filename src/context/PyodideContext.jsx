import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const PyodideContext = createContext(null);

export function PyodideProvider({ children }) {
  const [status, setStatus] = useState('uninitialized'); // 'uninitialized' | 'loading' | 'ready' | 'running' | 'error'
  const [statusMessage, setStatusMessage] = useState('Pyodide runtime is idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeRunId, setActiveRunId] = useState(null);

  const workerRef = useRef(null);
  const pendingRequestsRef = useRef(new Map());
  const runTimeoutRef = useRef(null);

  // Initialize or recreate worker
  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setStatus('loading');
    setStatusMessage('Initializing Pyodide WebAssembly in background worker...');
    setErrorMessage(null);

    try {
      // Production-safe Vite Web Worker syntax
      const worker = new Worker(
        new URL('../workers/pyodideWorker.js', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event) => {
        const { type, status: newStatus, message, error, id, stdout, executionTimeMs, success } = event.data || {};

        if (type === 'STATUS') {
          if (newStatus === 'loading') {
            setStatus('loading');
            setStatusMessage(message || 'Loading Pyodide runtime...');
          } else if (newStatus === 'ready') {
            setStatus('ready');
            setStatusMessage('Pyodide Python 3.12 WebAssembly is ready.');
            setErrorMessage(null);
          } else if (newStatus === 'error') {
            setStatus('error');
            setStatusMessage('Failed to initialize runtime');
            setErrorMessage(error || 'Failed to load Pyodide runtime.');
          }
        }

        if (type === 'RUN_START') {
          setStatus('running');
          setStatusMessage('Executing Python code...');
        }

        if (type === 'RUN_COMPLETE') {
          setStatus('ready');
          setStatusMessage('Execution finished');
          setActiveRunId(null);
          if (runTimeoutRef.current) {
            clearTimeout(runTimeoutRef.current);
            runTimeoutRef.current = null;
          }

          if (id && pendingRequestsRef.current.has(id)) {
            const { resolve } = pendingRequestsRef.current.get(id);
            pendingRequestsRef.current.delete(id);
            resolve({
              success,
              stdout: stdout || '',
              error: error || null,
              executionTimeMs: executionTimeMs || 0
            });
          }
        }
      };

      worker.onerror = (err) => {
        console.error('Worker error:', err);
        setStatus('error');
        setErrorMessage('Worker error: ' + (err.message || 'Script execution error'));
      };

      workerRef.current = worker;
      worker.postMessage({ type: 'INIT' });
    } catch (e) {
      console.error('Failed to create worker:', e);
      setStatus('error');
      setErrorMessage('Could not spawn execution worker: ' + e.message);
    }
  }, []);

  useEffect(() => {
    initWorker();
    return () => {
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [initWorker]);

  // Execute Python code in worker with timeout
  const executePython = useCallback(
    ({ code, stdin = '', timeoutMs = 15000 }) => {
      return new Promise((resolve) => {
        if (!workerRef.current || status === 'error') {
          resolve({
            success: false,
            stdout: '',
            error: errorMessage || 'Pyodide execution worker is not available. Please retry loading.',
            executionTimeMs: 0
          });
          return;
        }

        const runId = 'run_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        setActiveRunId(runId);
        pendingRequestsRef.current.set(runId, { resolve });

        // Timeout safety
        if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = setTimeout(() => {
          if (pendingRequestsRef.current.has(runId)) {
            console.warn(`Execution timed out after ${timeoutMs}ms. Terminating worker.`);
            
            // Terminate stalled worker to cancel infinite loops
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }

            const { resolve: timedOutResolve } = pendingRequestsRef.current.get(runId);
            pendingRequestsRef.current.delete(runId);
            setActiveRunId(null);

            timedOutResolve({
              success: false,
              stdout: '',
              error: `Execution timed out after ${Math.round(timeoutMs / 1000)}s limit. The background worker was safely terminated to avoid freezing your browser tab. (Tip: check for infinite loops or increase the timeout setting).`,
              executionTimeMs: timeoutMs
            });

            // Re-spawn worker
            initWorker();
          }
        }, timeoutMs);

        workerRef.current.postMessage({
          type: 'RUN',
          id: runId,
          code,
          stdin
        });
      });
    },
    [status, errorMessage, initWorker]
  );

  // User manually stops execution
  const stopExecution = useCallback(() => {
    if (activeRunId && pendingRequestsRef.current.has(activeRunId)) {
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      const { resolve } = pendingRequestsRef.current.get(activeRunId);
      pendingRequestsRef.current.delete(activeRunId);
      setActiveRunId(null);

      resolve({
        success: false,
        stdout: '',
        error: 'Execution cancelled by user.',
        executionTimeMs: 0
      });

      // Respawn worker
      initWorker();
    }
  }, [activeRunId, initWorker]);

  return (
    <PyodideContext.Provider
      value={{
        status,
        statusMessage,
        errorMessage,
        isRunning: status === 'running' || !!activeRunId,
        executePython,
        stopExecution,
        reloadRuntime: initWorker
      }}
    >
      {children}
    </PyodideContext.Provider>
  );
}

export function usePyodide() {
  const context = useContext(PyodideContext);
  if (!context) {
    throw new Error('usePyodide must be used within a PyodideProvider');
  }
  return context;
}

