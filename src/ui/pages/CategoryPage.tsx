import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlgorithmsByCategory } from '@registry/index';
import { ArrowLeft, PlayCircle, Search } from 'lucide-react';
import { cn } from '@utils/cn';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const algos = getAlgorithmsByCategory(categoryId || '');

  if (algos.length === 0) {
      return <div className="p-10 text-center text-algo-muted">Category not found</div>;
  }

  const title = categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/-/g, ' ') : '';

  // Filter based on search query
  const filteredAlgos = algos.filter(algo => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      algo.name.toLowerCase().includes(query) ||
      algo.id.toLowerCase().includes(query)
    );
  });

  // Helper: Return styles for "Border Highlight" mode (Subtle)
  const getCategoryTheme = () => {
      const lower = categoryId?.toLowerCase() || '';
      
      // SORTING (Orange)
      if (lower.includes('sort')) {
          return {
              textColor: "text-orange-500",
              hoverBorder: "hover:border-orange-500",
              hoverBg: "hover:bg-orange-500/5", // Very subtle tint
              badge: "group-hover:border-orange-500/30 group-hover:text-orange-500"
          };
      }
      
      // GRAPH (Pink)
      if (lower.includes('graph')) {
          return {
              textColor: "text-pink-500",
              hoverBorder: "hover:border-pink-500",
              hoverBg: "hover:bg-pink-500/5",
              badge: "group-hover:border-pink-500/30 group-hover:text-pink-500"
          };
      }
      
      // SEARCHING (Blue)
      if (lower.includes('search')) {
          return {
              textColor: "text-blue-500",
              hoverBorder: "hover:border-blue-500",
              hoverBg: "hover:bg-blue-500/5",
              badge: "group-hover:border-blue-500/30 group-hover:text-blue-500"
          };
      }
      
      // LINEAR (Cyan)
      if (lower.includes('linear') || lower.includes('structure')) {
          return {
              textColor: "text-cyan-500",
              hoverBorder: "hover:border-cyan-500",
              hoverBg: "hover:bg-cyan-500/5",
              badge: "group-hover:border-cyan-500/30 group-hover:text-cyan-500"
          };
      }
      
      // DEFAULT
      return {
          textColor: "text-algo-primary",
          hoverBorder: "hover:border-algo-primary",
          hoverBg: "hover:bg-algo-primary/5",
          badge: "group-hover:border-algo-primary/30 group-hover:text-algo-primary"
      };
  };
  
  const theme = getCategoryTheme();
 
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <Link 
            to="/" 
            className="p-3 bg-algo-surface hover:bg-algo-surface-hover border border-algo-border rounded-xl transition-all duration-300 text-algo-text shadow-sm hover:scale-105 active:scale-95"
        >
            <ArrowLeft size={18} />
        </Link>
        <h1 className="inline-block text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-algo-text to-algo-primary pb-3 pr-3 pt-1 px-1 leading-normal">
          {title} Suite
        </h1>
      </div>

      {/* Category Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-algo-muted">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder={`Search ${title} algorithms...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-algo-surface/40 hover:bg-algo-surface/60 focus:bg-algo-bg border border-algo-border/60 hover:border-algo-primary/30 focus:border-algo-primary rounded-xl text-xs font-bold transition-all duration-300 outline-none text-algo-text placeholder-algo-muted/65 shadow-inner"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold text-algo-primary hover:text-algo-primary/80 animate-fade-in"
          >
            Clear
          </button>
        )}
      </div>

      {/* Algorithm List */}
      <div className="grid gap-6">
        {filteredAlgos.map(algo => (
            <Link 
                key={algo.id}
                to={`/algo/${algo.category.toLowerCase()}/${algo.id}`}
                className={cn(
                    "block bg-algo-surface/40 backdrop-blur-md border border-algo-border/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group relative overflow-hidden",
                    theme.hoverBorder,
                    theme.hoverBg
                )}
            >
                {/* Micro Ambient Glow */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-algo-primary/5 rounded-full blur-xl group-hover:bg-algo-primary/10 transition-all duration-300" />
                
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className={cn(
                            "text-xl font-bold mb-2 transition-colors duration-300", 
                            theme.textColor
                        )}>
                            {algo.name}
                        </h3>
                        <p className="text-algo-muted max-w-2xl text-sm leading-relaxed transition-colors duration-300 group-hover:text-algo-text/90">
                            {algo.description}
                        </p>
                    </div>
                    
                    <PlayCircle 
                        size={32} 
                        className={cn(
                            "transition-all duration-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 shadow-sm rounded-full", 
                            theme.textColor
                        )} 
                    />
                </div>
                
                <div className="mt-6 flex gap-2.5 relative z-10">
                    <span className={cn(
                        "text-[10px] font-mono font-bold bg-algo-bg/60 border border-algo-border px-2.5 py-1 rounded-lg text-algo-muted transition-colors duration-300",
                        theme.badge
                    )}>
                        DIFFICULTY: {algo.difficulty.toUpperCase()}
                    </span>
                    <span className={cn(
                        "text-[10px] font-mono font-bold bg-algo-bg/60 border border-algo-border px-2.5 py-1 rounded-lg text-algo-muted transition-colors duration-300",
                        theme.badge
                    )}>
                        REF: {algo.id.toUpperCase()}
                    </span>
                </div>
            </Link>
        ))}

        {filteredAlgos.length === 0 && (
          <div className="text-center py-12 text-sm text-algo-muted border border-dashed border-algo-border/40 rounded-2xl italic bg-algo-surface/10">
            No matching algorithms found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};