import React from 'react';
import { Cpu, ShieldCheck, HardDrive, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-900 bg-black text-zinc-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white" />
              <span className="font-semibold text-white text-sm">AI Lab Platform</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">Netlify Ready</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              A standalone static web platform for Artificial Intelligence and Machine Learning experiments.
              Powered by Pyodide WebAssembly running client-side inside a sandboxed Web Worker. No persistent backend server or external API required.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Architecture</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>Static Host: Netlify CDN</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-white" />
                <span>Runtime: Pyodide v0.26.4</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-white" />
                <span>Persistence: Local Browser Storage</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Execution Safety</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Web Worker Isolation</span>
              </li>
              <li>• Execution Timeout Protection</li>
              <li>• Output Truncation Limits</li>
              <li>• CPU-only execution (No GPU claims)</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500">
          <p>© {new Date().getFullYear()} AI Lab Courseware • Deployed statically on Netlify</p>
          <p className="text-[11px]">User drafts and edits are stored locally in this browser.</p>
        </div>
      </div>
    </footer>
  );
}
