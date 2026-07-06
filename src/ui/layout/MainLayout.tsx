import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
import { SettingsModal } from '@ui/controls/SettingsModal';
import { cn } from '@utils/cn';
import { InteractiveBackground } from '../components/InteractiveBackground';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Format breadcrumbs text
  const getBreadcrumbs = () => {
    if (isHomePage) return 'Explorer';
    const decoded = decodeURIComponent(location.pathname);
    const parts = decoded.split('/').filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent text-algo-text overflow-hidden relative">
      <InteractiveBackground />
      
      {/* Sleek, Apple-inspired Top Navigation Bar */}
      <nav className="h-14 border-b border-algo-border/60 bg-algo-surface/85 backdrop-blur-md flex items-center justify-between px-6 md:px-10 z-30 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle (only on subpages) */}
          {!isHomePage && (
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="font-semibold text-slate-900 tracking-tight text-base font-sans">
              AlgoVista
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-5 md:gap-7 text-xs md:text-sm font-medium text-algo-muted">
          <Link 
            to="/" 
            className={cn(
              "hover:text-slate-900 transition-colors py-1 border-b border-transparent",
              isHomePage && "text-slate-900 font-semibold border-slate-900"
            )}
          >
            Explorer
          </Link>
          <Link 
            to="/race" 
            className={cn(
              "hover:text-slate-900 transition-colors py-1 border-b border-transparent",
              location.pathname === '/race' && "text-slate-900 font-semibold border-slate-900"
            )}
          >
            Algo-Race Duel
          </Link>
          <Link 
            to="/about" 
            className={cn(
              "hover:text-slate-900 transition-colors py-1 border-b border-transparent",
              location.pathname === '/about' && "text-slate-900 font-semibold border-slate-900"
            )}
          >
            About
          </Link>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all active:scale-95 shrink-0"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex flex-1 h-full w-full overflow-hidden relative">
        
        {/* COLLAPSIBLE SIDEBAR CONTAINER */}
        {!isHomePage && (
          <div className={cn(
            "fixed inset-y-0 left-0 top-14 z-20 md:relative md:top-0 transform transition-transform duration-300 md:translate-x-0 flex flex-col shrink-0 border-r border-algo-border/50",
            isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-64'
          )}>
            <Sidebar 
              onLinkClick={() => setIsMobileMenuOpen(false)} 
              className="h-full bg-algo-surface" 
            />
            
            {/* Mobile backdrop overlay */}
            {isMobileMenuOpen && (
              <div 
                className="absolute inset-0 bg-black/10 backdrop-blur-xs -z-10 md:hidden"
                style={{ left: '100%', width: '100vw', height: '100vh' }}
                onClick={() => setIsMobileMenuOpen(false)} 
              />
            )}
          </div>
        )}
        
        {/* SCROLLABLE MAIN CONTENT WRAPPER */}
        <div className="flex-1 h-full overflow-y-auto scroll-smooth w-full flex flex-col relative z-10">
          {/* Breadcrumbs for subpages */}
          {!isHomePage && (
            <div className="hidden md:block px-10 pt-6 pb-2 text-[10px] font-mono text-algo-muted font-bold tracking-wider">
              <span className="opacity-60">ALGOVISTA SUITE</span>
              <span className="mx-2 opacity-30">/</span>
              <span className="text-slate-800 uppercase">{getBreadcrumbs()}</span>
            </div>
          )}

          {/* Page content */}
          <div className="p-6 md:p-10 max-w-[1400px] mx-auto pb-12 flex-1 w-full">
            <Outlet /> 
          </div>

          {/* Elegant Footer */}
          <footer className="border-t border-algo-border/40 bg-algo-surface/40 py-8 text-center text-xs text-algo-muted shrink-0 w-full mt-auto">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 tracking-tight">
                  AlgoVista
                </span>
                <span className="opacity-30">|</span>
                <span className="text-algo-muted">Visualizing algorithms across Computer Science, Math, & Biology</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 font-semibold">
                <Link to="/about" className="hover:text-slate-900 transition-colors duration-200">About Suite</Link>
                <Link to="/terms" className="hover:text-slate-900 transition-colors duration-200">Terms of Use</Link>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors duration-200">Privacy Policy</Link>
                <Link to="/license" className="hover:text-slate-900 transition-colors duration-200">License</Link>
              </div>
              
              <div className="text-[10px] font-mono opacity-60">
                © {new Date().getFullYear()} Chirag P Patil. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Settings Modal Control */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
};