import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategories } from '@registry/index';
import { Home, ArrowDownUp, Share2, Search, List, Settings, Activity } from 'lucide-react';
import { cn } from '@utils/cn';
import { SettingsModal } from '@ui/controls/SettingsModal';
import { AlgoVistaLogo } from './AlgoVistaLogo';

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onLinkClick }) => {
  const categories = getCategories();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  // Helper to pick icons dynamically based on category name
  const getIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('sort')) return <ArrowDownUp size={18} />;
    if (lower.includes('graph')) return <Share2 size={18} />;
    if (lower.includes('search')) return <Search size={18} />;
    if (lower.includes('linear') || lower.includes('structure')) return <List size={18} />;
    return <Activity size={18} />;
  };

  return (
    <>
      <aside className={cn(
        "w-72 bg-algo-surface/60 backdrop-blur-xl border-r border-algo-border flex flex-col h-full flex-none transition-all duration-300 relative z-10",
        className
      )}>
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-algo-primary/30 to-transparent" />

        {/* Brand Header */}
        <Link 
          to="/" 
          onClick={onLinkClick}
          className="p-6 border-b border-algo-border/50 flex items-center gap-3 hover:bg-algo-primary/5 transition-all duration-300 group"
        >
          <div className="p-2 bg-algo-primary/10 rounded-xl group-hover:bg-algo-primary/20 transition-all duration-300 shadow-inner">
            <AlgoVistaLogo className="group-hover:scale-110 transition-transform duration-300" size={24} />
          </div>
          <div>
            <h1 className="inline-block text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-algo-text via-slate-100 to-algo-primary pb-2 pr-2 pt-1 px-1 leading-normal">
              AlgoVista
            </h1>
            <p className="text-[10px] font-mono text-algo-muted font-bold tracking-widest uppercase">
              EDUCATIONAL CORE
            </p>
          </div>
        </Link>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
          
          {/* Home Link */}
          <Link
            to="/"
            onClick={onLinkClick}
            className={cn(
              "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 mb-6 border relative overflow-hidden",
              location.pathname === '/' 
                ? "bg-algo-primary/10 text-algo-primary border-algo-primary/20 shadow-md shadow-algo-primary/5" 
                : "text-algo-muted border-transparent hover:bg-algo-surface-hover hover:text-algo-text"
            )}
          >
            <Home size={18} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
            Home
            {location.pathname === '/' && (
              <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-algo-primary rounded-l-full" />
            )}
          </Link>

          {/* Categories Section Header */}
          <div className="px-4 mb-3 text-[10px] font-bold text-algo-muted uppercase tracking-widest">
            Algorithm Suites
          </div>
          
          {/* Dynamic Category List */}
          <div className="space-y-1">
            {categories.map((cat) => {
              const path = `/category/${cat.toLowerCase()}`;
              const isActive = location.pathname.includes(path) || location.pathname.includes(`/algo/${cat.toLowerCase()}`);
              
              return (
                <Link
                  key={cat}
                  to={path}
                  onClick={onLinkClick}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 border relative overflow-hidden",
                    isActive 
                      ? "bg-algo-primary/10 text-algo-primary border-algo-primary/20 shadow-md shadow-algo-primary/5" 
                      : "text-algo-muted border-transparent hover:bg-algo-surface-hover hover:text-algo-text"
                  )}
                >
                  <span className={cn(
                    "mr-3 p-1 rounded-lg transition-all duration-300", 
                    isActive 
                      ? "text-algo-primary bg-algo-primary/10" 
                      : "text-algo-muted group-hover:text-algo-text group-hover:bg-algo-primary/5"
                  )}>
                    {getIcon(cat)}
                  </span>
                  {cat}
                  {isActive && (
                    <span className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-algo-primary rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Empty State Fallback */}
          {categories.length === 0 && (
            <div className="px-4 py-6 text-xs text-algo-muted italic border border-dashed border-algo-border/40 rounded-xl text-center">
              No algorithms loaded.
            </div>
          )}
        </nav>

        {/* Footer with Settings */}
        <div className="p-4 border-t border-algo-border/50 bg-algo-surface/40 space-y-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-algo-text bg-algo-surface/80 hover:bg-algo-primary hover:text-white border border-algo-border rounded-xl transition-all duration-300 shadow-sm active:scale-[0.98]"
          >
            <Settings size={16} />
            Theme & Options
          </button>
          
          <div className="text-[10px] font-mono text-algo-muted text-center pt-1 opacity-70">
            Suite v1.3.0 • Auto-Glob Loaded
          </div>
        </div>
      </aside>

      {/* Render Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};