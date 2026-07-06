import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategories } from '@registry/index';
import { Home, ArrowDownUp, Share2, Search, List, Activity, Dna, Layers, Compass, GitBranch, Map } from 'lucide-react';
import { cn } from '@utils/cn';

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onLinkClick }) => {
  const categories = getCategories();
  const location = useLocation();

  // Helper to pick icons dynamically based on category name
  const getIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('sort')) return <ArrowDownUp size={16} />;
    if (lower.includes('graph')) return <Share2 size={16} />;
    if (lower.includes('search')) return <Search size={16} />;
    if (lower.includes('linear') || lower.includes('structure')) return <List size={16} />;
    if (lower.includes('bioinformatics') || lower.includes('alignment')) return <Dna size={16} />;
    if (lower.includes('programming') || lower.includes('greedy')) return <Layers size={16} />;
    if (lower.includes('math') || lower.includes('geometry') || lower.includes('computational')) return <Compass size={16} />;
    if (lower.includes('tree') || lower.includes('hierarchical')) return <GitBranch size={16} />;
    if (lower.includes('geographic') || lower.includes('route') || lower.includes('map')) return <Map size={16} />;
    return <Activity size={16} />;
  };

  return (
    <aside className={cn(
      "w-64 bg-white/70 backdrop-blur-md flex flex-col h-full flex-none transition-all duration-300 relative z-10 font-sans",
      className
    )}>
      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto py-8 px-5 space-y-6 scrollbar-thin">
        
        {/* Main Links */}
        <div className="space-y-1">
          <Link
            to="/"
            onClick={onLinkClick}
            className={cn(
              "group flex items-center px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors",
              location.pathname === '/' 
                ? "bg-slate-100 text-slate-900 font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Home size={16} className="mr-3" />
            Home Explorer
          </Link>
        </div>

        {/* Categories Section */}
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Algorithm Suites
          </div>
          
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const path = `/category/${cat.toLowerCase()}`;
              const isActive = location.pathname.includes(path) || location.pathname.includes(`/algo/${cat.toLowerCase()}`);
              
              return (
                <Link
                  key={cat}
                  to={path}
                  onClick={onLinkClick}
                  className={cn(
                    "group flex items-center px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-slate-100 text-slate-900 font-semibold" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className="mr-3 text-slate-400 group-hover:text-slate-800 transition-colors">
                    {getIcon(cat)}
                  </span>
                  {cat}
                </Link>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="px-3 py-4 text-xs text-slate-400 italic text-center">
              No suites loaded.
            </div>
          )}
        </div>
      </nav>

      {/* Low-profile Footer */}
      <div className="p-5 border-t border-slate-100 text-[10px] font-mono text-slate-400 tracking-normal text-center">
        Suite v1.4.0 • Built-in Core
      </div>
    </aside>
  );
};