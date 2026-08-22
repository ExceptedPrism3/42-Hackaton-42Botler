import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ChatWindow from './components/ChatWindow.jsx';
import About from './pages/About.jsx';
import Team from './pages/Team.jsx';
import './index.css';

export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [ragStats, setRagStats] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('42botler_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('42botler_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('42botler_theme', 'light');
    }
  }, [darkMode]);

  // Polling server health and RAG stats
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const apiBase = (typeof window !== 'undefined' && window.location.pathname.startsWith('/42botler'))
          ? '/42botler/api'
          : '/api';
        const response = await fetch(`${apiBase}/health`);
        if (response.ok) {
          const data = await response.json();
          setIsOnline(true);
          if (data.rag) {
            setRagStats(data.rag);
          }
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  // Header blur on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/70 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-gray-100 relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-500/15 to-pink-500/15 dark:from-cyan-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-md border-b border-gray-200/50 dark:border-gray-800' 
          : 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <span className="text-white font-black text-base tracking-tighter">42</span>
                </div>
                <span
                  className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                    42Botler
                  </h1>
                  {ragStats?.chunksIndexed && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/70 text-blue-700 dark:bg-blue-950/60 dark:text-cyan-300 border border-blue-200/50 dark:border-blue-800/50">
                      ⚡ RAG: {ragStats.chunksIndexed} chunks
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  AI Companion for 42 Heilbronn
                </p>
              </div>
            </div>

            {/* Navigation & Theme Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <nav className="hidden md:flex items-center space-x-1">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `text-sm font-semibold px-3.5 py-2 rounded-xl transition ${
                    isActive 
                      ? 'text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-gray-800' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/50'
                  }`}
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => `text-sm font-semibold px-3.5 py-2 rounded-xl transition ${
                    isActive 
                      ? 'text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-gray-800' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/50'
                  }`}
                >
                  About
                </NavLink>
                <NavLink 
                  to="/team" 
                  className={({ isActive }) => `text-sm font-semibold px-3.5 py-2 rounded-xl transition ${
                    isActive 
                      ? 'text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-gray-800' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/50'
                  }`}
                >
                  Team
                </NavLink>
              </nav>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm transition-all"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="md:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="md:hidden mt-3 bg-white/95 dark:bg-gray-900/95 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-2 space-y-1 animate-fadeIn">
              <NavLink 
                onClick={() => setMenuOpen(false)} 
                to="/" 
                className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Home
              </NavLink>
              <NavLink 
                onClick={() => setMenuOpen(false)} 
                to="/about" 
                className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                About
              </NavLink>
              <NavLink 
                onClick={() => setMenuOpen(false)} 
                to="/team" 
                className={({ isActive }) => `block px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Team
              </NavLink>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="relative flex-1 p-3 sm:p-5 max-w-7xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<ChatWindow isOnline={isOnline} />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800/80 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
            <p>
              Built with ❤️ for 42 Heilbronn students
            </p>
            <div className="flex items-center gap-3">
              <NavLink to="/" className="hover:text-gray-800 dark:hover:text-white transition">Home</NavLink>
              <span>•</span>
              <NavLink to="/about" className="hover:text-gray-800 dark:hover:text-white transition">About</NavLink>
              <span>•</span>
              <NavLink to="/team" className="hover:text-gray-800 dark:hover:text-white transition">Team</NavLink>
              <span>•</span>
              <a
                href="https://github.com/ExceptedPrism3/42-Hackaton/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 dark:hover:text-white underline transition"
              >
                🐛 Report Bug
              </a>
              <span>•</span>
              <span>© 2025 - 2026 42Botler</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
