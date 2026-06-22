import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPreference ? 'dark' : 'light';
    }
    return 'dark'; // Cool default for digital agency
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      id="theme-toggler"
      onClick={toggleTheme}
      className="p-2 mr-1 rounded-full transition-all duration-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      aria-label="Toggle layout color theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 animate-pulse" />
      ) : (
        <Sun className="w-5 h-5 text-emerald-400" />
      )}
    </button>
  );
}
