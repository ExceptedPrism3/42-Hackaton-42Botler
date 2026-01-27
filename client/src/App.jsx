import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ChatWindow from './components/ChatWindow.jsx';
import About from './pages/About.jsx';
import Team from './pages/Team.jsx';
import './index.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check server status
    const checkStatus = async () => {
      try {
        // Use relative path for subdirectory deployment
        const response = await fetch(import.meta.env.PROD ? '/42botler/api/health' : '/api/health');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <header className={`sticky top-0 z-40 transition ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-white/20' : 'bg-white/60 backdrop-blur-lg'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">42</span>
                </div>
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse cursor-pointer`}
                  title={isOnline ? 'Online' : 'Drowned'}
                ></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  42Botler
                </h1>
                <p className="text-gray-600 text-sm">Your intelligent companion for campus life</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-3">
                <NavLink to="/" className={({ isActive }) => `relative text-base font-semibold px-4 py-3 rounded-xl transition ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Home
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => `relative text-base font-semibold px-4 py-3 rounded-xl transition ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
                  About
                </NavLink>
                <NavLink to="/team" className={({ isActive }) => `relative text-base font-semibold px-4 py-3 rounded-xl transition ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Team
                </NavLink>
              </nav>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg border border-gray-200 bg-white/70 hover:bg-white">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden mt-4 bg-white/80 rounded-2xl border border-white/50 shadow p-2">
              <NavLink onClick={() => setMenuOpen(false)} to="/" className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold ${isActive ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-100'}`}>Home</NavLink>
              <NavLink onClick={() => setMenuOpen(false)} to="/about" className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold ${isActive ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-100'}`}>About</NavLink>
              <NavLink onClick={() => setMenuOpen(false)} to="/team" className={({ isActive }) => `block px-4 py-3 rounded-lg text-base font-semibold ${isActive ? 'bg-blue-600 text-white' : 'text-gray-800 hover:bg-gray-100'}`}>Team</NavLink>
            </div>
          )}
        </div>
      </header>

      <main className="relative flex-1 p-5">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<ChatWindow messages={messages} setMessages={setMessages} isOnline={isOnline} />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </div>
      </main>

      <footer className="relative bg-white/50 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-gray-600 text-xs">
              Built with ❤️ for 42 Heilbronn students
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <a href="/" className="hover:text-gray-700">Home</a>
              <span>•</span>
              <a href="/about" className="hover:text-gray-700">About</a>
              <span>•</span>
              <a href="/team" className="hover:text-gray-700">Team</a>
              <span>•</span>
              <button
                onClick={() => window.open('https://github.com/ExceptedPrism3/42-Hackaton/issues/new?title=Bug Report: False Information&body=Please describe the incorrect information you found and what the correct information should be.', '_blank')}
                className="hover:text-gray-700 underline"
              >
                🐛 Report Bug
              </button>
              <span>•</span>
              <span>© 2025 - 2026 42Botler</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



