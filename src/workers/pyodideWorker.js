// Pyodide Web Worker for safe, isolated, browser-based Python execution
// Pinned Pyodide distribution: v0.26.4
const PYODIDE_VERSION = 'v0.26.4';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let pyodide = null;
let isInitializing = false;
let initPromise = null;

const MAX_OUTPUT_LENGTH = 60000; // Prevent UI freeze on runaway print loops

async function initPyodideRuntime() {
  if (pyodide) return pyodide;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      self.postMessage({
        type: 'STATUS',
        status: 'loading',
        message: `Loading Pyodide runtime (${PYODIDE_VERSION})...`
      });

      // Load Pyodide ES module
      const { loadPyodide } = await import(`${PYODIDE_INDEX_URL}pyodide.mjs`);
      
      pyodide = await loadPyodide({
        indexURL: PYODIDE_INDEX_URL
      });

      // Initialize Python environment and standard capture hooks
      await pyodide.runPythonAsync(`
import sys
import io
import builtins

class LimitedStdout(io.StringIO):
    def __init__(self, max_length=60000):
        super().__init__()
        self.max_length = max_length
        self.is_truncated = False

    def write(self, s):
        if self.tell() + len(s) > self.max_length:
            remaining = self.max_length - self.tell()
            if remaining > 0:
                super().write(s[:remaining])
            if not self.is_truncated:
                super().write("\\n\\n[Output limit reached: output was truncated to prevent browser memory issues]\\n")
                self.is_truncated = True
            return len(s)
        return super().write(s)

_stdin_buffer = []

def _custom_input(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt))
        sys.stdout.flush()
    if _stdin_buffer:
        val = _stdin_buffer.pop(0)
        sys.stdout.write(str(val) + "\\n")
        sys.stdout.flush()
        return str(val)
    raise EOFError("Standard input queue is empty. Please enter required inputs in the Stdin panel before running.")

builtins.input = _custom_input
      `);

      self.postMessage({
        type: 'STATUS',
        status: 'ready',
        message: 'Pyodide runtime initialized successfully.'
      });

      return pyodide;
    } catch (err) {
      pyodide = null;
      initPromise = null;
      const errorMsg = (err && err.message) ? err.message : String(err);
      self.postMessage({
        type: 'STATUS',
        status: 'error',
        error: `Failed to load Pyodide runtime: ${errorMsg}. Please verify your internet connection or check if CDN access is allowed.`
      });
      throw err;
    }
  })();

  return initPromise;
}

// Clean and sanitize code to handle common Colab notebook magics
function sanitizeNotebookCode(rawCode) {
  const lines = rawCode.split('\n');
  const sanitizedLines = [];
  const removedMagics = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('!') || trimmed.startsWith('%')) {
      removedMagics.push(trimmed);
      sanitizedLines.push(`# [Colab Magic commented out for Pyodide]: ${line}`);
    } else {
      sanitizedLines.push(line);
    }
  }

  return {
    code: sanitizedLines.join('\n'),
    removedMagics
  };
}

// Handle incoming messages from the main thread
self.onmessage = async (event) => {
  const data = event.data;
  if (!data) return;

  const { type, id, code, stdin = '' } = data;

  if (type === 'INIT') {
    try {
      await initPyodideRuntime();
    } catch (e) {
      // Status already posted
    }
    return;
  }

  if (type === 'RUN') {
    const startTime = performance.now();
    try {
      const py = await initPyodideRuntime();

      self.postMessage({
        type: 'RUN_START',
        id,
        status: 'running'
      });

      // Prepare stdin lines in Python
      const stdinLines = stdin
        ? stdin.split('\n').map(l => l.replace(/\r$/, ''))
        : [];
      
      const jsonStdin = JSON.stringify(stdinLines);

      // Sanitize notebook magics
      const { code: safeCode, removedMagics } = sanitizeNotebookCode(code);

      // Execute Python setup: reset stdout/stderr and populate stdin buffer
      await py.runPythonAsync(`
import json
_stdin_buffer.clear()
_stdin_buffer.extend(json.loads(${JSON.stringify(jsonStdin)}))

sys.stdout = LimitedStdout(${MAX_OUTPUT_LENGTH})
sys.stderr = LimitedStdout(${MAX_OUTPUT_LENGTH})
      `);

      // Run user code asynchronously
      await py.runPythonAsync(safeCode);

      // Retrieve outputs
      const stdout = await py.runPythonAsync(`sys.stdout.getvalue()`);
      const stderr = await py.runPythonAsync(`sys.stderr.getvalue()`);

      const executionTimeMs = Math.round(performance.now() - startTime);

      let finalOutput = stdout;
      if (stderr && stderr.trim().length > 0) {
        finalOutput += (finalOutput ? '\n\n' : '') + `[STDERR]:\n${stderr}`;
      }
      if (removedMagics.length > 0) {
        finalOutput = `[Notice: ${removedMagics.length} Colab magic/shell command(s) like ${removedMagics[0]} were ignored in WebAssembly]\n\n` + finalOutput;
      }

      self.postMessage({
        type: 'RUN_COMPLETE',
        id,
        success: true,
        stdout: finalOutput || '(Program finished with no printed output)',
        executionTimeMs
      });
    } catch (err) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      let capturedStdout = '';
      try {
        if (pyodide) {
          capturedStdout = await pyodide.runPythonAsync(`sys.stdout.getvalue()`);
        }
      } catch (e) {
        // ignore
      }

      const rawError = (err && err.message) ? err.message : String(err);
      
      // Check for common package / GPU missing issues
      let friendlyHint = '';
      if (rawError.includes('torch') || rawError.includes('cuda')) {
        friendlyHint = '\n\n[Pyodide Environment Hint]: PyTorch with GPU/CUDA acceleration is not available in the browser. Browser WebAssembly runs CPU-compatible packages.';
      } else if (rawError.includes('EOFError')) {
        friendlyHint = '\n\n[Interactive Input Hint]: The script called input() but the input buffer was empty. Enter the expected inputs in the Stdin panel and run again.';
      }

      self.postMessage({
        type: 'RUN_COMPLETE',
        id,
        success: false,
        stdout: capturedStdout,
        error: rawError + friendlyHint,
        executionTimeMs
      });
    }
  }
};

