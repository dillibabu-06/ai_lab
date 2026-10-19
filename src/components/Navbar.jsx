import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, BookOpen, Upload, FolderHeart, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { usePyodide } from '../context/PyodideContext';

export default function Navbar() {
  const location = useLocation();
  const { status, errorMessage, reloadRuntime } = usePyodide();

  const navLinks = [
    { to: '/', label: 'Experiments', icon: BookOpen },
    { to: '/upload', label: 'Upload .ipynb', icon: Upload },
    { to: '/drafts', label: 'Local Drafts', icon: FolderHeart },
    { to: '/compatibility', label: 'Pyodide & Colab', icon: ShieldCheck },
  ];

  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-100 border border-zinc-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>Pyodide 3.12 Ready</span>
          </div>
        );
      case 'loading':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-700 shadow-sm animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loading Python WASM...</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-white border border-white shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Executing...</span>
          </div>
        );
      case 'error':
        return (
          <button
            onClick={reloadRuntime}
            title={errorMessage || 'Error loading runtime. Click to retry.'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-white hover:text-white transition-colors shadow-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Runtime Offline • Retry</span>
          </button>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
            <span>Pyodide Idle</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md shadow-white/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">AI Lab</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                  Static
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-normal hidden sm:block">Interactive Python WebAssembly</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status */}
          <div className="flex items-center gap-3">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-800 bg-black/95 py-2 px-3 text-xs">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
