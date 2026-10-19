import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Clock, Copy, Check, Trash2, BookOpen } from 'lucide-react';

export default function OutputTerminal({
  liveOutput,
  liveError,
  referenceOutput,
  executionTimeMs = 0,
  isRunning = false,
  onClear,
}) {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'reference'
  const [copied, setCopied] = useState(false);

  const currentText = activeTab === 'live'
    ? (liveError ? `${liveOutput ? liveOutput + '\n\n' : ''}[ERROR]:\n${liveError}` : (liveOutput || ''))
    : (referenceOutput || '(No reference output recorded in notebook)');

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-black shadow-2xl text-xs font-mono">
      {/* Terminal Header with Tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Live Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Output</span>
            {liveError ? (
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 border border-white" title="Execution Error" />
            ) : liveOutput ? (
              <span className="w-1.5 h-1.5 rounded-full bg-black border border-white" title="Execution Succeeded" />
            ) : null}
          </button>

          {/* Reference Output Tab */}
          {referenceOutput && (
            <button
              type="button"
              onClick={() => setActiveTab('reference')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                activeTab === 'reference'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Saved Sample Output</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-700">
                Notebook
              </span>
            </button>
          )}
        </div>

        {/* Status and Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'live' && executionTimeMs > 0 && !isRunning && (
            <div className="hidden sm:flex items-center gap-1 text-zinc-400 font-sans">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{executionTimeMs} ms</span>
            </div>
          )}

          {activeTab === 'live' && liveError && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-sans">
              <AlertTriangle className="w-3 h-3 text-white" />
              <span>Execution Error</span>
            </div>
          )}

          {activeTab === 'live' && !liveError && liveOutput && !isRunning && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-sans">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>Completed</span>
            </div>
          )}

          <button
            type="button"
            onClick={copyText}
            disabled={!currentText}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 transition-colors border border-zinc-700 font-sans"
            title="Copy terminal output"
          >
            {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {activeTab === 'live' && onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={!liveOutput && !liveError}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 transition-colors border border-zinc-700 font-sans"
              title="Clear terminal output"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Distinction Header Banner */}
      {activeTab === 'reference' ? (
        <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-850 text-[11px] font-sans text-zinc-400 flex items-center justify-between">
          <span>
            <strong className="text-white">Reference Output:</strong> Official output recorded in the original Jupyter Notebook.
          </span>
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 tracking-wider">Static Baseline</span>
        </div>
      ) : (
        <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-850 text-[11px] font-sans text-zinc-400 flex items-center justify-between">
          <span>
            <strong className="text-white">Live Output:</strong> Executed client-side in browser Web Worker via Pyodide.
          </span>
          <span className="text-[10px] uppercase font-mono text-white tracking-wider">Live WASM</span>
        </div>
      )}

      {/* Terminal Body */}
      <div className="p-4 min-h-[180px] max-h-[360px] overflow-y-auto selection:bg-white selection:text-black leading-relaxed bg-black">
        {isRunning ? (
          <div className="flex items-center gap-2 text-white animate-pulse font-sans">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>Running Python code in Pyodide Web Worker...</span>
          </div>
        ) : activeTab === 'live' ? (
          liveError ? (
            <div className="space-y-2">
              {liveOutput && <pre className="text-zinc-300 whitespace-pre-wrap">{liveOutput}</pre>}
              <pre className="text-white whitespace-pre-wrap font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-700">
                {liveError}
              </pre>
            </div>
          ) : liveOutput ? (
            <pre className="text-zinc-100 whitespace-pre-wrap">{liveOutput}</pre>
          ) : (
            <div className="text-zinc-500 font-sans italic flex flex-col items-center justify-center py-8">
              <Terminal className="w-8 h-8 text-zinc-700 mb-2 stroke-1" />
              <span>Press "Run" (or Ctrl + Enter) to execute Python code.</span>
            </div>
          )
        ) : (
          <pre className="text-zinc-200 whitespace-pre-wrap">{referenceOutput || '(No reference output found)'}</pre>
        )}
      </div>
    </div>
  );
}
