import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, Code2 } from 'lucide-react';

export default function PythonEditor({
  code,
  onChange,
  onRun,
  onReset,
  isRunning = false,
  isReadOnly = false,
  isDraft = false,
  height = '420px',
}) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !isRunning) {
        onRun();
      }
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-black shadow-2xl">
      {/* Editor Toolbar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-white" />
          <span className="font-semibold text-white">Python 3 Source</span>
          {isDraft ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-900 text-zinc-200 border border-zinc-700">
              Local Browser Draft
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              Published Template
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 text-xs"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 text-xs"
              title="Reset code to original published version"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {onRun && (
            <button
              type="button"
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold shadow-sm transition-all active:scale-[0.98]"
              title="Run code (Ctrl + Enter)"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Run (Ctrl+Enter)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="relative w-full bg-black" style={{ height }}>
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(newVal) => onChange && onChange(newVal || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            renderWhitespace: 'selection',
            folding: true,
            glyphMargin: false,
            padding: { top: 12, bottom: 12 },
          }}
          loading={
            <div className="h-full flex items-center justify-center bg-black text-zinc-500 text-xs font-mono">
              <span className="animate-pulse">Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
