import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Save,
  Download,
  AlertCircle,
  GitFork,
  Check
} from 'lucide-react';
import { experimentService } from '../services/experimentService';
import { storageService } from '../services/storageService';
import { usePyodide } from '../context/PyodideContext';
import PythonEditor from '../components/PythonEditor';
import OutputTerminal from '../components/OutputTerminal';
import StdinPanel from '../components/StdinPanel';

export default function ExperimentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { executePython, stopExecution, isRunning } = usePyodide();

  const [experiment, setExperiment] = useState(null);
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  const [liveError, setLiveError] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'saving' | null
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'algorithm' | 'complexity'

  // Load experiment or draft
  useEffect(() => {
    const data = experimentService.getExperimentById(id);
    if (!data) return;
    setExperiment(data);
    setCode(data.code || '');
    setStdin(data.stdin ?? data.defaultStdin ?? '');
    setLiveOutput('');
    setLiveError(null);
    setExecutionTimeMs(0);
  }, [id]);

  // Execute Code
  const handleRunCode = useCallback(async () => {
    if (!code) return;

    setLiveOutput('');
    setLiveError(null);

    const result = await executePython({
      code,
      stdin,
      timeoutMs: 20000,
    });

    setLiveOutput(result.stdout || '');
    setLiveError(result.error);
    setExecutionTimeMs(result.executionTimeMs || 0);
  }, [code, stdin, executePython]);

  // Save changes to local browser draft
  const handleSaveDraft = () => {
    if (!experiment) return;
    setSaveStatus('saving');

    try {
      const updated = {
        ...experiment,
        code,
        stdin,
        isLocalDraft: true,
      };

      const savedDraft = storageService.saveDraft(updated);
      setExperiment(savedDraft);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);

      // If this was a fork of a published lab and had a new id, replace URL
      if (savedDraft.id !== id && !id.startsWith('draft_')) {
        navigate(`/experiment/${savedDraft.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Clone published experiment to local draft
  const handleCloneDraft = () => {
    if (!experiment) return;
    const newDraft = experimentService.createDraftFromPublished(experiment.id);
    navigate(`/experiment/${newDraft.id}`);
  };

  // Reset to official published version
  const handleReset = () => {
    if (!experiment) return;
    if (window.confirm('Reset this experiment to the official published version? Any local edits will be discarded.')) {
      if (experiment.originalExperimentId) {
        experimentService.resetToPublished(experiment.originalExperimentId);
        navigate(`/experiment/${experiment.originalExperimentId}`);
      } else {
        const published = experimentService.getExperimentById(experiment.id);
        if (published) {
          setCode(published.code || '');
          setStdin(published.defaultStdin || '');
          setLiveOutput('');
          setLiveError(null);
        }
      }
    }
  };

  // Export current Python code as a .py file
  const handleDownloadPy = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experiment?.slug || 'experiment'}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!experiment) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Experiment Not Found</h2>
        <p className="text-xs text-zinc-400">The requested lab experiment ID does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isLocalDraft = !!experiment.isLocalDraft;

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link to="/" className="hover:text-white transition-colors">Experiments</Link>
            <span>/</span>
            <span className="text-white font-medium">{experiment.labNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {experiment.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isLocalDraft ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-200 border border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>Local Browser Draft</span>
              </span>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 shadow-sm transition-colors"
                title="Save changes to local browser storage"
              >
                {saveStatus === 'saved' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveStatus === 'saved' ? 'Saved Locally' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
                title="Revert draft back to original published lab"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCloneDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors"
              title="Create a local copy in this browser to edit and customize"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Clone to Local Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
            title="Download Python script"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .py</span>
          </button>

          {experiment.notebookFile && (
            <a
              href={experiment.notebookFile}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors"
              title="Download original notebook file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Original .ipynb</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Workspace Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Theory, Objectives, Algorithm (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Metadata Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-black text-white border border-zinc-700">
                {experiment.labNumber}
              </span>
              <span className="text-zinc-400 font-medium">{experiment.category}</span>
            </div>

            {/* Objective */}
            <div className="space-y-1.5">
              <h4 className="text-xs uppercase tracking-wider font-bold text-zinc-400">Objective</h4>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                {experiment.objective}
              </p>
            </div>

            {/* Local Storage Clarification Badge */}
            <div className="p-3 rounded-xl bg-black border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-white">
                {isLocalDraft ? '📝 Local Draft Active' : '🔒 Published Experiment'}
              </p>
              <p className="leading-normal">
                {isLocalDraft
                  ? 'Edits and test inputs are stored exclusively inside your browser localStorage. They are private to your device and never uploaded to any remote server.'
                  : 'You are viewing the official published lab template. Click "Clone to Local Draft" to save your personal modifications.'}
              </p>
            </div>

            {/* Tabbed Theory / Algorithm Details */}
            <div className="pt-2 border-t border-zinc-850 space-y-3">
              <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('theory')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
                    activeTab === 'theory' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Theory
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('algorithm')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
                    activeTab === 'algorithm' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Algorithm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('complexity')}
                  className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors ${
                    activeTab === 'complexity' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Complexity
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-zinc-300 leading-relaxed min-h-[140px]">
                {activeTab === 'theory' && (
                  <div className="space-y-2">
                    <p>{experiment.theory || 'No theory documentation provided.'}</p>
                  </div>
                )}

                {activeTab === 'algorithm' && (
                  <ol className="space-y-2 list-decimal list-inside text-zinc-300">
                    {(experiment.algorithm || []).map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="font-medium text-white">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {activeTab === 'complexity' && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-black border border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Time Complexity</span>
                      <code className="text-white font-mono text-xs">{experiment.timeComplexity}</code>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black border border-zinc-800">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">Space Complexity</span>
                      <code className="text-zinc-300 font-mono text-xs">{experiment.spaceComplexity}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-850">
              {(experiment.tags || []).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-black text-zinc-400 border border-zinc-800"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editor, Stdin Panel, Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Python Monaco Editor */}
          <PythonEditor
            code={code}
            onChange={(val) => setCode(val)}
            onRun={handleRunCode}
            onReset={handleReset}
            isRunning={isRunning}
            isDraft={isLocalDraft}
            height="440px"
          />

          {/* Interactive Stdin Panel */}
          <StdinPanel
            stdin={stdin}
            onChange={setStdin}
            defaultStdin={experiment.defaultStdin || ''}
            inputDescription={experiment.inputDescription || ''}
          />

          {/* Execution Controls Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Running in Worker...' : 'Run Experiment'}</span>
              </button>

              {isRunning && (
                <button
                  type="button"
                  onClick={stopExecution}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-white font-semibold transition-colors shadow-sm"
                  title="Force stop execution"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-zinc-400 hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-black border border-zinc-700 text-white font-mono">Ctrl+Enter</kbd> to run
            </div>
          </div>

          {/* Output Terminal */}
          <OutputTerminal
            liveOutput={liveOutput}
            liveError={liveError}
            referenceOutput={experiment.sampleOutput}
            executionTimeMs={executionTimeMs}
            isRunning={isRunning}
            onClear={() => {
              setLiveOutput('');
              setLiveError(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
