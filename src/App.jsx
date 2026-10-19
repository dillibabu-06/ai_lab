import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CatalogPage from './pages/CatalogPage';
import ExperimentPage from './pages/ExperimentPage';
import NotebookUploadPage from './pages/NotebookUploadPage';
import DraftsPage from './pages/DraftsPage';
import CompatibilityPage from './pages/CompatibilityPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/experiment/:id" element={<ExperimentPage />} />
          <Route path="/upload" element={<NotebookUploadPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/compatibility" element={<CompatibilityPage />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
