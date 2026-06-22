import React, { useState } from 'react';
import { ShoppingBag, Box, Shield, Menu, X, ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  onGoBack?: () => void;
  setSelectedProductId?: (id: string | null) => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ 
  currentView, 
  setView, 
  onGoBack, 
  setSelectedProductId,
  cartCount,
  onCartClick
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (view: string) => {
    if (setSelectedProductId) {
      setSelectedProductId(null);
    }
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-zinc-950/90 border-zinc-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigateTo('home')}>
            <div className="flex items-center justify-center w-8 h-8 rounded bg-zinc-100 text-black font-serif font-bold text-lg hover:scale-105 transition-transform duration-300">
              H
            </div>
            <span className="font-serif font-semibold text-lg leading-tight tracking-tight text-white group-hover:text-zinc-300 transition-colors">
              Hafiz <span className="font-sans text-xs uppercase tracking-widest text-zinc-400 font-normal ml-1">Digital</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-home"
              onClick={() => navigateTo('home')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-white bg-zinc-900 border border-zinc-800'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-shop"
              onClick={() => navigateTo('shop')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                currentView === 'shop' || currentView === 'detail'
                  ? 'text-white bg-zinc-900 border border-zinc-800'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              Shop All
            </button>
            <button
              id="nav-admin"
              onClick={() => navigateTo('admin')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'admin'
                  ? 'text-white bg-zinc-900 border border-zinc-800'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          </nav>

          {/* Utility Buttons */}
          <div className="flex items-center gap-2">
            {currentView === 'detail' && onGoBack && (
              <button
                onClick={onGoBack}
                className="hidden md:flex items-center justify-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Shop
              </button>
            )}

            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-805 hover:border-zinc-700 transition-all flex items-center justify-center cursor-pointer"
              aria-label="View Shopping Cart"
              title="View Digital Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-white text-black text-[9px] font-mono font-bold flex items-center justify-center border border-zinc-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              id="mobile-menu-burger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-805 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-zinc-950 py-3 px-4 flex flex-col space-y-2 animate-fadeIn">
          <button
            id="mobile-nav-home"
            onClick={() => navigateTo('home')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
              currentView === 'home'
                ? 'text-white bg-zinc-900 border border-zinc-800'
                : 'text-zinc-400'
            }`}
          >
            Home
          </button>
          <button
            id="mobile-nav-shop"
            onClick={() => navigateTo('shop')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
              currentView === 'shop' || currentView === 'detail'
                ? 'text-white bg-zinc-900 border border-zinc-800'
                : 'text-zinc-400'
            }`}
          >
            Shop All
          </button>
          <button
            id="mobile-nav-admin"
            onClick={() => navigateTo('admin')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
              currentView === 'admin'
                ? 'text-white bg-zinc-900 border border-zinc-800'
                : 'text-zinc-400'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </button>
        </div>
      )}
    </header>
  );
}
