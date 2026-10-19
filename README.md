# AI Lab • Interactive Python Experiment Platform

A modern, Netlify-first static web application for exploring, editing, and executing Artificial Intelligence and Machine Learning laboratory experiments directly in the browser using **Pyodide WebAssembly**.

---

## 🌟 Key Features

- **Netlify-Ready Static Architecture**: 100% client-side application. Deploys to Netlify CDN without requiring Node.js servers, container runtimes, or backend APIs.
- **In-Browser Python Execution**: Powered by a pinned distribution of **Pyodide v0.26.4** running inside a sandboxed **Web Worker**.
- **Monaco Code Editor**: Full-featured Python code editor with syntax highlighting, line numbers, code folding, and `Ctrl+Enter` / `Cmd+Enter` execution shortcut.
- **Interactive Stdin Queue**: Seamlessly responds to Python's `input()` prompts without locking the browser tab.
- **Published Experiment Catalog**: 10 fully implemented AI Lab experiments bundled as static JSON data:
  - **Lab 1**: Breadth-First Search (BFS) in Graph Traversal
  - **Lab 2**: Greedy Best-First Search with Heuristic Distance
  - **Lab 3**: Depth-First Search (DFS) in Graph Traversal
  - **Lab 4**: Greedy Heuristic Search on Custom Graphs
  - **Lab 5(a)**: A* Search Algorithm (Optimal Cost + Admissible Heuristic)
  - **Lab 5(b)**: AO* Search Algorithm (AND/OR Graph Heuristics)
  - **Lab 7**: Alpha-Beta Pruning in Adversarial Game Trees
  - **Lab 8(1)**: 8-Queens Problem (Backtracking & Constraint Satisfaction)
  - **Lab 8.1**: 8-Puzzle Solver with A* (Misplaced Tiles vs. Manhattan Distance)
  - **Lab 8.2**: Interactive Tic-Tac-Toe AI with Minimax and Alpha-Beta Table
- **Jupyter Notebook (`.ipynb`) Parser**: Drag and drop any `.ipynb` file to inspect Markdown, view code cells, execute them in the browser, and fork them into local drafts.
- **Distinguished Execution Output**: Clearly separates live Pyodide WebAssembly execution from the instructor's verified notebook reference output.
- **Local Browser Persistence**: User drafts and preferences are stored privately in `localStorage` with JSON export/import capabilities for cross-device backups.
- **Execution Safety & Timeouts**: Automatic termination of runaway loops with configurable timeout limits (5s - 60s) and stdout truncation safeguards.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Python Runtime** | Pyodide v0.26.4 WebAssembly |
| **Concurrency** | Web Workers (`new Worker(new URL(...), { type: 'module' })`) |
| **Routing** | React Router v7 (SPA with `/* -> /index.html` Netlify redirect) |
| **Data Layer** | Bundled JSON (`src/data/experiments.json`) + Browser `localStorage` |
| **Hosting Platform** | Netlify Static Edge CDN |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested with Node v26)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Generates the static distribution in the `dist/` directory.

### 4. Preview Production Build Locally
```bash
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) to preview the exact static output before deploying.

---

## 🌐 Netlify Deployment Guide

This project is pre-configured for seamless Netlify deployment via `netlify.toml`.

### Option A: Continuous Deployment via Git (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Netlify](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**. Every future `git push` will trigger an automated build and deployment.

### Option B: Netlify CLI
Install the Netlify CLI and deploy from your terminal:
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to production
netlify deploy --prod --dir=dist
```

### Option C: Netlify Drag & Drop (Zero Setup)
1. Run `npm run build` to create the `dist/` directory.
2. Go to [Netlify Drop](https://app.netlify.com/drop).
3. Drag and drop the `dist/` folder into the upload target.
4. Your site will be live on a global CDN in seconds!

---

## ⚙️ Netlify Configuration Details

The included `netlify.toml` contains:
```toml
[build]
  command = "npm run build"
  publish = "dist"

# Single-Page Application (SPA) fallback redirect
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security and caching headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔒 Security & Execution Boundaries

### What Runs in Pyodide WebAssembly:
- Python 3.12 Standard Library (`math`, `heapq`, `queue`, `collections`, `itertools`, `re`, `json`)
- Graph traversal and heuristic algorithms (BFS, DFS, Best-First, A*, AO*, Minimax, Alpha-Beta)
- Constraint satisfaction solvers (N-Queens backtracking, 8-Puzzle A* with Manhattan distance)
- Scientific packages via compiled wheels (NumPy, SciPy, Pandas, Matplotlib)

### Unsupported Capabilities (Google Colab / Cloud GPU Required):
- **GPU / CUDA Acceleration**: Browser WebAssembly runs on the host CPU. Neural networks requiring NVIDIA CUDA cannot execute in browser WASM.
- **Jupyter Shell Magics**: Commands beginning with `!` or `%` (such as `!pip install`, `!nvidia-smi`, `%cd`) are automatically sanitized and commented out.
- **Raw OS Sockets**: Browser security prevents binding to TCP/UDP listening ports.
- **Desktop GUIs**: Libraries requiring an X11/Wayland display server (like `tkinter` or `PyQt`) are not supported.

---

## 📂 Project Structure

```
├── .gitignore               # Git ignore rules
├── index.html               # Main HTML entry template
├── netlify.toml             # Netlify build, SPA redirect, and security headers
├── package.json             # NPM dependencies and build scripts
├── vite.config.js           # Vite bundler config with Tailwind v4 & ES worker support
├── public/
│   ├── notebooks/           # Downloadable raw .ipynb files
│   └── vite.svg             # Application favicon
└── src/
    ├── App.jsx              # Main router and layout
    ├── index.css            # Tailwind CSS v4 styling
    ├── main.jsx             # React DOM root entry
    ├── components/
    │   ├── Navbar.jsx               # Header with Pyodide live status indicator
    │   ├── Footer.jsx               # Architecture and execution notices
    │   ├── PythonEditor.jsx         # Monaco Editor with shortcuts and copy
    │   ├── OutputTerminal.jsx       # Terminal distinguishing live WASM from reference
    │   ├── StdinPanel.jsx           # Interactive stdin queue for input() prompts
    │   └── CompatibilityBanner.jsx  # Execution scope and safety notice
    ├── context/
    │   └── PyodideContext.jsx       # Pyodide lifecycle, worker pool, timeout controller
    ├── data/
    │   └── experiments.json         # Static bundled library of 10 AI Lab experiments
    ├── pages/
    │   ├── CatalogPage.jsx          # Experiment catalog with search & filtering
    │   ├── ExperimentPage.jsx       # Interactive workbench and code runner
    │   ├── NotebookUploadPage.jsx   # .ipynb parser and cell execution
    │   ├── DraftsPage.jsx           # Local drafts manager and JSON backup export/import
    │   └── CompatibilityPage.jsx    # Pyodide WASM vs Google Colab comparison
    ├── services/
    │   ├── experimentService.js     # Modular data layer for published labs and drafts
    │   ├── storageService.js        # Browser localStorage manager with backup export
    │   └── notebookParser.js        # Client-side Jupyter Notebook parser
    └── workers/
        └── pyodideWorker.js         # Dedicated Web Worker executing Pyodide Python
```

---

## 📄 License

MIT License. Designed for academic and educational artificial intelligence coursework.

