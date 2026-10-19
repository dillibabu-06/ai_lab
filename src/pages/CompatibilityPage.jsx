import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Layers,
  Terminal,
} from 'lucide-react';

export default function CompatibilityPage() {
  const comparisonItems = [
    {
      feature: 'Python Standard Library (collections, heapq, queue, math, random, json)',
      pyodide: true,
      colab: true,
      notes: 'Full native speed WebAssembly compilation via Pyodide 3.12.',
    },
    {
      feature: 'Graph & AI Algorithms (BFS, DFS, Greedy Search, A*, AO*, Alpha-Beta)',
      pyodide: true,
      colab: true,
      notes: 'Executes 100% client-side in the browser Web Worker with zero network latency.',
    },
    {
      feature: 'Backtracking & Constraint Satisfaction (N-Queens, 8-Puzzle, Tic-Tac-Toe)',
      pyodide: true,
      colab: true,
      notes: 'Instant local execution with interactive Stdin queue support.',
    },
    {
      feature: 'Interactive input() prompts',
      pyodide: true,
      colab: true,
      notes: 'Handled via pre-queued Stdin lines; never freezes the browser UI thread.',
    },
    {
      feature: 'Scientific Python (NumPy, SciPy, Pandas, SymPy)',
      pyodide: true,
      colab: true,
      notes: 'Supported via Pyodide WebAssembly wheels compiled with Emscripten.',
    },
    {
      feature: 'GPU Acceleration (NVIDIA CUDA, PyTorch GPU, TensorFlow GPU)',
      pyodide: false,
      colab: true,
      notes: 'WebAssembly cannot access physical NVIDIA CUDA hardware drivers. CPU only.',
    },
    {
      feature: 'Jupyter & Colab Shell Magics (!pip install, !apt-get, %cd, !nvidia-smi)',
      pyodide: false,
      colab: true,
      notes: 'Pyodide runs inside browser sandbox without a Linux OS bash shell. Stripped automatically.',
    },
    {
      feature: 'Raw OS Sockets & Background Server Listeners (socket.bind, listening ports)',
      pyodide: false,
      colab: true,
      notes: 'Browser security sandbox forbids listening on raw TCP/UDP ports.',
    },
    {
      feature: 'Desktop GUI Toolkits (Tkinter, PyQt, Pygame display)',
      pyodide: false,
      colab: false,
      notes: 'Browser WebAssembly does not have an X11/Wayland display server.',
    },
    {
      feature: 'Zero-Cost Static Hosting (Netlify, Vercel, GitHub Pages)',
      pyodide: true,
      colab: false,
      notes: 'Runs statically on Netlify CDN with $0 server runtime or container costs.',
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-white border border-zinc-700">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Execution Boundaries & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Pyodide WebAssembly vs. Google Colab
        </h1>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
          This platform uses <strong>Pyodide v0.26.4</strong> to run Python in a sandboxed Web Worker directly within your browser.
          Understanding what runs natively in WebAssembly versus what requires cloud VMs (like Google Colab) ensures realistic expectations and safe code execution.
        </p>
      </div>

      {/* Safety Policy Box */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2 shadow-xl">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Safety & Realism Principle</span>
        </div>
        <p className="leading-relaxed text-zinc-400">
          <strong className="text-white">We never claim that arbitrary notebook code or GPU-dependent models will run in the browser.</strong> WebAssembly is an isolated CPU virtual machine running inside your browser tab. All 10 experiments in this AI Lab syllabus (Graph Search, Heuristics, Adversarial Game Trees, Constraint Satisfaction) are mathematically verified, pure-Python algorithms that run with maximum fidelity.
        </p>
      </div>

      {/* Comparison Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-white" />
          <span>Feature & Compatibility Matrix</span>
        </h2>

        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black border-b border-zinc-800 text-white uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Capability</th>
                  <th className="py-3 px-4 text-center">AI Lab (Pyodide WASM)</th>
                  <th className="py-3 px-4 text-center">Google Colab (Cloud VM)</th>
                  <th className="py-3 px-4">Technical Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      {item.feature}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.pyodide ? (
                        <span className="inline-flex items-center gap-1 text-white font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Supported</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500 font-semibold">
                          <XCircle className="w-4 h-4 text-zinc-500" />
                          <span>Unsupported</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.colab ? (
                        <span className="inline-flex items-center gap-1 text-white font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Supported</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500 font-semibold">
                          <XCircle className="w-4 h-4 text-zinc-500" />
                          <span>Limited</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px] leading-relaxed">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Migration & Adaptation Guide */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Terminal className="w-4 h-4 text-white" />
            <span>Adapting Notebooks for WebAssembly</span>
          </div>
          <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Remove bash magics:</strong> Lines like <code className="text-zinc-200">!pip install</code> or <code className="text-zinc-200">!cat</code> will cause syntax or file errors.
            </li>
            <li>
              <strong className="text-white">Feed inputs via Stdin panel:</strong> If your script uses <code className="text-zinc-200">input()</code>, write the answers line-by-line into the Stdin panel before pressing Run.
            </li>
            <li>
              <strong className="text-white">Guard loops:</strong> Infinite <code className="text-zinc-200">while True</code> loops will trigger the worker timeout (configurable in Preferences).
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-white" />
            <span>Netlify-First Static Benefits</span>
          </div>
          <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-white">Global CDN Distribution:</strong> Static files are served instantly from Netlify's worldwide edge nodes.
            </li>
            <li>
              <strong className="text-white">Zero Cold Starts:</strong> No waiting for container instances or backend servers to wake up.
            </li>
            <li>
              <strong className="text-white">Privacy Preserving:</strong> Your custom code runs exclusively in your browser memory; nothing is logged on servers.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
