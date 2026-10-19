import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderHeart,
  Download,
  Upload,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sliders,
  FileCode2
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [importNotice, setImportNotice] = useState(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setDrafts(storageService.getAllDrafts());
    setPreferences(storageService.getPreferences());
  };

  const handleDeleteDraft = (id, title) => {
    if (window.confirm(`Delete local draft "${title}"? This cannot be undone.`)) {
      storageService.deleteDraft(id);
      refreshData();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Delete ALL local drafts and resets? This will not affect the official published experiments.')) {
      storageService.clearAllDrafts();
      refreshData();
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_lab_drafts_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = storageService.importData(event.target.result);
      if (result.success) {
        setImportNotice({
          type: 'success',
          text: `Successfully imported ${result.count} local draft(s).`
        });
        refreshData();
      } else {
        setImportNotice({
          type: 'error',
          text: result.error || 'Failed to import backup file.'
        });
      }
      setTimeout(() => setImportNotice(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save preference change
  const handlePreferenceChange = (key, value) => {
    const updated = storageService.savePreferences({ [key]: value });
    setPreferences(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FolderHeart className="w-8 h-8 text-white" />
            <span>Local Drafts & Workspace</span>
          </h1>
          <p className="text-sm text-zinc-400">
            Manage your personal experiment forks, test inputs, custom notebooks, and execution settings.
          </p>
        </div>

        {/* Backup Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold transition-colors"
            title="Download JSON backup file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </div>

      {/* Persistence Notice */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-white shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-white">Browser-Local Storage Policy</h4>
          <p className="text-zinc-400 leading-relaxed">
            All code drafts, notebooks, and execution configurations saved here are stored exclusively in your browser's local storage.
            They are strictly private to this computer and browser profile, and are <strong>never</strong> published to other website visitors.
            Use the "Export JSON" button above to preserve backups across devices.
          </p>
        </div>
      </div>

      {importNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            importNotice.type === 'success'
              ? 'bg-zinc-900 border-zinc-700 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300'
          }`}
        >
          {importNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
          <span>{importNotice.text}</span>
        </div>
      )}

      {/* Drafts List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-white">Your Saved Drafts ({drafts.length})</span>
          {drafts.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All Local Drafts</span>
            </button>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
            <FileCode2 className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-300">No local drafts saved yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Open any experiment from the catalog and click "Clone to Local Draft", or upload a notebook to begin customizing.
            </p>
            <Link
              to="/"
              className="inline-block px-4 py-2 text-xs rounded-xl bg-white text-black font-semibold"
            >
              Browse Experiments
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-zinc-950 border border-zinc-850 hover:border-white transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black text-white border border-zinc-700">
                      {d.labNumber || 'Custom'}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {d.lastModified ? new Date(d.lastModified).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{d.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{d.objective || 'Custom draft'}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-850 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(d.id, d.title)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                    title="Delete draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/experiment/${d.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-all"
                  >
                    <span>Open in Workbench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Execution Preferences */}
      <section className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">Execution & Editor Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Pyodide Worker Execution Timeout</label>
            <select
              value={preferences.timeoutSeconds || 15}
              onChange={(e) => handlePreferenceChange('timeoutSeconds', Number(e.target.value))}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-white"
            >
              <option value={5}>5 seconds (Fast fail)</option>
              <option value={15}>15 seconds (Standard)</option>
              <option value={30}>30 seconds (Long-running searches)</option>
              <option value={60}>60 seconds (Heavy puzzle searches)</option>
            </select>
            <p className="text-[10px] text-zinc-500">Safely kills worker if code loops indefinitely.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Monaco Editor Font Size</label>
            <select
              value={preferences.fontSize || 13}
              onChange={(e) => handlePreferenceChange('fontSize', Number(e.target.value))}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-white"
            >
              <option value={12}>12 px (Compact)</option>
              <option value={13}>13 px (Default)</option>
              <option value={14}>14 px (Standard)</option>
              <option value={16}>16 px (Large)</option>
            </select>
            <p className="text-[10px] text-zinc-500">Changes take effect on newly opened experiments.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
