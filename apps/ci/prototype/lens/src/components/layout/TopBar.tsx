'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Search } from 'lucide-react';

export default function TopBar() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950/80 backdrop-blur-md border-b border-lens-border flex items-center justify-between px-6">
      {/* Left: Project label */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lens-card border border-lens-border text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-lens-accent" />
          <span>Bank Negara Indonesia (BNI)</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lens-text-muted" />
          <input
            type="text"
            placeholder="Search mentions, topics..."
            className="input-field pl-9 w-72 h-8 text-xs"
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-lens-text-muted hidden sm:block">
          Last sync: 2 min ago
        </span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-slate-800 text-lens-text-secondary transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
          YS
        </div>
      </div>
    </header>
  );
}
