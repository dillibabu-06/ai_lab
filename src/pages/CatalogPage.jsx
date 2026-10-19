import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Cpu, ArrowRight, BookOpen, CheckCircle2, FolderHeart } from 'lucide-react';
import { experimentService } from '../services/experimentService';
import CompatibilityBanner from '../components/CompatibilityBanner';

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const published = useMemo(() => experimentService.getPublishedExperiments(), []);
  const categories = useMemo(() => experimentService.getCategories(), []);

  const filteredExperiments = useMemo(() => {
    return published.filter((exp) => {
      const matchesCat = selectedCategory === 'All Categories' || exp.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        exp.title.toLowerCase().includes(q) ||
        exp.labNumber.toLowerCase().includes(q) ||
        exp.objective.toLowerCase().includes(q) ||
        exp.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [published, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-black text-white border border-zinc-700 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-white" />
            <span>Netlify-Ready Static Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Artificial Intelligence <br />
            <span className="text-zinc-400">
              Laboratory Workbench
            </span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Run, modify, and inspect official AI Lab coursework entirely in your browser using Pyodide WebAssembly.
            No localhost servers, no backend runtime, and zero external API dependencies.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>10 Interactive Published Labs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Monaco Editor + Pyodide Worker</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Offline-Friendly Local Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pyodide Scope Notice */}
      <CompatibilityBanner compact={true} />

      {/* Filter and Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments by algorithm (BFS, A*, Alpha-Beta), lab number, or tags..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors shadow-sm"
            />
          </div>

          {/* Upload and Drafts Quick Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors"
            >
              <span>Upload Custom .ipynb</span>
            </Link>
            <Link
              to="/drafts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors"
            >
              <FolderHeart className="w-3.5 h-3.5 text-white" />
              <span>My Drafts</span>
            </Link>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {filteredExperiments.length} of {published.length} Published Experiments</span>
          <span className="hidden sm:inline font-mono">Publish Directory: dist/</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((exp) => (
            <div
              key={exp.id}
              className="group flex flex-col justify-between bg-zinc-950 border border-zinc-850 rounded-2xl p-6 hover:border-white transition-all duration-300 shadow-xl"
            >
              <div className="space-y-3">
                {/* Card Top: Lab Badge & Category */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-black text-white border border-zinc-700">
                    {exp.labNumber}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {exp.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  {exp.title}
                </h3>

                {/* Objective */}
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                  {exp.objective}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-black text-zinc-400 border border-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {exp.tags.length > 3 && (
                    <span className="text-[10px] text-zinc-500 self-center">
                      +{exp.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Complexity and Action Button */}
              <div className="pt-5 mt-4 border-t border-zinc-850 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px]">
                  {exp.timeComplexity.split(' ')[0]}
                </span>
                <Link
                  to={`/experiment/${exp.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-all group-hover:translate-x-0.5"
                >
                  <span>Open Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiments.length === 0 && (
          <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-300">No matching experiments found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your search keywords or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Categories');
              }}
              className="px-3.5 py-1.5 text-xs rounded-lg bg-white text-black font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
