import React, { useState } from 'react';
import { Keyboard, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function StdinPanel({
  stdin,
  onChange,
  defaultStdin = '',
  inputDescription = '',
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-zinc-800 rounded-xl bg-black overflow-hidden text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 cursor-pointer select-none hover:bg-zinc-900 transition-colors border-b border-zinc-800"
      >
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-white" />
          <span className="font-semibold text-white">Standard Input (stdin for input())</span>
          {stdin ? (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900 text-white border border-zinc-700 font-mono">
              {stdin.split('\n').filter(Boolean).length} line(s)
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500 font-normal">Optional</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {defaultStdin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(defaultStdin);
              }}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 text-[11px]"
              title="Reset to recommended default inputs"
            >
              Use Suggested Inputs
            </button>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 space-y-2 bg-black">
          {inputDescription && (
            <div className="flex items-start gap-1.5 text-zinc-400 text-[11px] leading-relaxed">
              <HelpCircle className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
              <span>{inputDescription}</span>
            </div>
          )}

          <textarea
            value={stdin}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type input lines here. E.g.:&#10;A&#10;J"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
          />

          <p className="text-[10px] text-zinc-500">
            Each line in this box is sequentially consumed whenever Python's <code className="text-zinc-300 font-mono font-bold">input()</code> function is called.
          </p>
        </div>
      )}
    </div>
  );
}
