import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileCode2,
  Play,
  Save,
  FileText,
  Code,
  Trash2,
  Sparkles
} from 'lucide-react';
import { parseNotebookContent } from '../services/notebookParser';
import { experimentService } from '../services/experimentService';
import { usePyodide } from '../context/PyodideContext';
import OutputTerminal from '../components/OutputTerminal';

export default function NotebookUploadPage() {
  const navigate = useNavigate();
  const { executePython, isRunning } = usePyodide();

  const [dragActive, setDragActive] = useState(false);
  const [parsedNotebook, setParsedNotebook] = useState(null);
  const [activeCellOutputs, setActiveCellOutputs] = useState({});
  const [activeCellErrors, setActiveCellErrors] = useState({});
  const [runningCellId, setRunningCellId] = useState(null);
  const [saveToast, setSaveToast] = useState(false);

  // Handle file reading
  const processNotebookFile = (file) => {
    if (!file.name.endsWith('.ipynb') && !file.name.endsWith('.json')) {
      alert('Please upload a valid Jupyter Notebook file (.ipynb)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseNotebookContent(e.target.result, file.name);
        setParsedNotebook(parsed);
        setActiveCellOutputs({});
        setActiveCellErrors({});
      } catch (err) {
        alert('Error parsing notebook: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processNotebookFile(e.dataTransfer.files[0]);
    }
  };

  // Run a single code cell
  const handleRunCell = async (cell) => {
    if (cell.cellType !== 'code') return;
    setRunningCellId(cell.id);

    const result = await executePython({
      code: cell.source,
      stdin: '',
      timeoutMs: 15000,
    });

    setActiveCellOutputs((prev) => ({
      ...prev,
      [cell.id]: result.stdout,
    }));
    setActiveCellErrors((prev) => ({
      ...prev,
      [cell.id]: result.error,
    }));
    setRunningCellId(null);
  };

  // Run all code cells sequentially
  const handleRunAll = async () => {
    if (!parsedNotebook) return;
    setRunningCellId('all');

    const result = await executePython({
      code: parsedNotebook.combinedCode,
      stdin: '',
      timeoutMs: 30000,
    });

    setActiveCellOutputs((prev) => ({
      ...prev,
      all: result.stdout,
    }));
    setActiveCellErrors((prev) => ({
      ...prev,
      all: result.error,
    }));
    setRunningCellId(null);
  };

  // Save as local draft
  const handleSaveToDrafts = () => {
    if (!parsedNotebook) return;
    const newDraft = experimentService.createDraftFromUploadedNotebook(parsedNotebook);
    setSaveToast(true);
    setTimeout(() => {
      navigate(`/experiment/${newDraft.id}`);
    }, 1000);
  };

  // Quick load one of the bundled lab notebooks from /notebooks/
  const handleLoadSample = async (labFileName) => {
    try {
      const response = await fetch(`/notebooks/${labFileName}`);
      if (!response.ok) throw new Error('Could not fetch sample notebook');
      const text = await response.text();
      const parsed = parseNotebookContent(text, labFileName);
      setParsedNotebook(parsed);
      setActiveCellOutputs({});
      setActiveCellErrors({});
    } catch (e) {
      alert('Failed to load sample: ' + e.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Jupyter Notebook (.ipynb) Inspector
        </h1>
        <p className="text-sm text-zinc-400">
          Upload any <code className="text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">.ipynb</code> notebook from your computer.
          The file is parsed 100% locally in your browser. Extract Markdown, review cells, run code with Pyodide WebAssembly, and save to your local drafts.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 ${
          dragActive
            ? 'border-white bg-zinc-950 scale-[1.01]'
            : 'border-zinc-800 hover:border-zinc-700 bg-black'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center mx-auto shadow-lg">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              Drag & Drop your <span className="font-mono text-zinc-300">.ipynb</span> file here
            </h3>
            <p className="text-xs text-zinc-400">
              Files remain private to your local browser session and are never transmitted to any server.
            </p>
          </div>

          <label className="inline-block cursor-pointer px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".ipynb,application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processNotebookFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Sparkles className="w-4 h-4 text-white" />
          <span>Or inspect one of the bundled course notebooks:</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: 'Lab 1 (BFS)', file: 'lab1.ipynb' },
            { label: 'Lab 2 (Best-First)', file: 'lab2.ipynb' },
            { label: 'Lab 3 (DFS)', file: 'lab3.ipynb' },
            { label: 'Lab 4 (Greedy)', file: 'lab4.ipynb' },
            { label: 'Lab 5(a) (A*)', file: 'lab5(a).ipynb' },
            { label: 'Lab 5(b) (AO*)', file: 'lab5(b).ipynb' },
            { label: 'Lab 7 (Alpha-Beta)', file: 'lab7.ipynb' },
            { label: 'Lab 8(1) (8-Queens)', file: 'lab8(1).ipynb' },
            { label: 'Lab 8 (8-Puzzle & Tic-Tac-Toe)', file: 'lab8.ipynb' },
          ].map((sample) => (
            <button
              key={sample.file}
              type="button"
              onClick={() => handleLoadSample(sample.file)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parsed Notebook Preview */}
      {parsedNotebook && (
        <div className="space-y-6 pt-4 border-t border-zinc-800">
          {/* Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-950 rounded-2xl border border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">{parsedNotebook.title}</h2>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {parsedNotebook.filename} • {parsedNotebook.codeCellCount} Code Cells • {parsedNotebook.markdownCellCount} Markdown Cells
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunAll}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-semibold shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runningCellId === 'all' ? 'Running All...' : 'Run All Cells'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToDrafts}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveToast ? 'Opening Draft...' : 'Open in Workbench'}</span>
              </button>

              <button
                type="button"
                onClick={() => setParsedNotebook(null)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-700"
                title="Clear notebook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* All Run Result if run all was clicked */}
          {activeCellOutputs.all || activeCellErrors.all ? (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white">Combined Notebook Output</h4>
              <OutputTerminal
                liveOutput={activeCellOutputs.all}
                liveError={activeCellErrors.all}
                referenceOutput={parsedNotebook.combinedSampleOutput}
              />
            </div>
          ) : null}

          {/* Cells List */}
          <div className="space-y-4">
            {parsedNotebook.cells.map((cell, idx) => (
              <div
                key={cell.id}
                className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950"
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-black border-b border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    {cell.cellType === 'markdown' ? (
                      <span className="flex items-center gap-1 text-zinc-300 font-medium">
                        <FileText className="w-3.5 h-3.5 text-white" />
                        <span>Markdown Cell [{idx + 1}]</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-white font-medium">
                        <Code className="w-3.5 h-3.5 text-white" />
                        <span>Code Cell [{idx + 1}]</span>
                      </span>
                    )}
                  </div>

                  {cell.cellType === 'code' && (
                    <button
                      type="button"
                      onClick={() => handleRunCell(cell)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{runningCellId === cell.id ? 'Running...' : 'Run Cell'}</span>
                    </button>
                  )}
                </div>

                {/* Cell Body */}
                <div className="p-4 text-xs font-mono">
                  {cell.cellType === 'markdown' ? (
                    <div className="prose prose-invert max-w-none text-zinc-300 font-sans text-xs whitespace-pre-wrap">
                      {cell.source}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <pre className="bg-black p-3 rounded-xl border border-zinc-800 overflow-x-auto text-zinc-200">
                        <code>{cell.source}</code>
                      </pre>

                      {/* Cell Output (Live or Saved) */}
                      {(activeCellOutputs[cell.id] || activeCellErrors[cell.id] || cell.outputsText) && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">
                            {activeCellOutputs[cell.id] || activeCellErrors[cell.id] ? 'Live Cell Output' : 'Saved Notebook Output'}
                          </span>
                          <pre className="bg-black p-3 rounded-xl border border-zinc-800 overflow-x-auto text-zinc-100 text-[11px]">
                            {activeCellErrors[cell.id] ? (
                              <span className="text-white font-bold">{activeCellErrors[cell.id]}</span>
                            ) : (
                              activeCellOutputs[cell.id] || cell.outputsText
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
