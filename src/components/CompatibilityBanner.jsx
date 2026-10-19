import React, { useState } from 'react';
import { Info, Check, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompatibilityBanner({ compact = false }) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-4 text-xs text-zinc-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-white">
          <Info className="w-4 h-4 text-white" />
          <span>Pyodide WebAssembly Execution Scope</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/compatibility"
            className="text-[11px] text-zinc-300 hover:text-white underline flex items-center gap-1"
          >
            Full Compatibility Guide <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-zinc-400 hover:text-white"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-850">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-white font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>Fully Supported in Browser</span>
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
              <li>Python 3.12 Standard Library (<code className="text-zinc-200">math</code>, <code className="text-zinc-200">heapq</code>, <code className="text-zinc-200">queue</code>, <code className="text-zinc-200">collections</code>)</li>
              <li>Graph & AI Search Algorithms (BFS, DFS, A*, AO*, Minimax, Alpha-Beta)</li>
              <li>Constraint Satisfaction (N-Queens, 8-Puzzle, Games)</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[11px]">
              <X className="w-3.5 h-3.5" />
              <span>Unsupported (Colab / GPU Required)</span>
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
              <li>GPU/CUDA-dependent deep learning models</li>
              <li>Jupyter / Colab shell magics (<code className="text-zinc-200">!pip</code>, <code className="text-zinc-200">!apt</code>, <code className="text-zinc-200">%cd</code>)</li>
              <li>Native desktop GUIs (<code className="text-zinc-200">tkinter</code>) and raw OS socket servers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
