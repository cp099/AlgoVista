import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlgorithmsByCategory } from '@registry/index';
import { ArrowLeft, Play, Search } from 'lucide-react';
import { cn } from '@utils/cn';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const algos = getAlgorithmsByCategory(categoryId || '');

  if (algos.length === 0) {
      return <div className="p-10 text-center text-slate-400 font-sans text-xs">Category not found</div>;
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

  // Soft Apple category colors
  const getCategoryTheme = () => {
      const lower = categoryId?.toLowerCase() || '';
      
      if (lower.includes('sort')) {
          return {
              accentColor: "text-[#ff9500]",
              hoverBorder: "hover:border-[#ff9500]/30",
              hoverBg: "hover:bg-[#ff9500]/5",
              badge: "group-hover:text-[#ff9500] group-hover:bg-[#ff9500]/5"
          };
      }
      if (lower.includes('graph')) {
          return {
              accentColor: "text-[#af52de]",
              hoverBorder: "hover:border-[#af52de]/30",
              hoverBg: "hover:bg-[#af52de]/5",
              badge: "group-hover:text-[#af52de] group-hover:bg-[#af52de]/5"
          };
      }
      if (lower.includes('search')) {
          return {
              accentColor: "text-[#0071e3]",
              hoverBorder: "hover:border-[#0071e3]/30",
              hoverBg: "hover:bg-[#0071e3]/5",
              badge: "group-hover:text-[#0071e3] group-hover:bg-[#0071e3]/5"
          };
      }
      if (lower.includes('linear')) {
          return {
              accentColor: "text-[#5856d6]",
              hoverBorder: "hover:border-[#5856d6]/30",
              hoverBg: "hover:bg-[#5856d6]/5",
              badge: "group-hover:text-[#5856d6] group-hover:bg-[#5856d6]/5"
          };
      }
      if (lower.includes('bioinformatics') || lower.includes('alignment')) {
          return {
              accentColor: "text-[#00a2c7]",
              hoverBorder: "hover:border-[#00a2c7]/30",
              hoverBg: "hover:bg-[#00a2c7]/5",
              badge: "group-hover:text-[#00a2c7] group-hover:bg-[#00a2c7]/5"
          };
      }
      if (lower.includes('programming') || lower.includes('greedy')) {
          return {
              accentColor: "text-[#ff3b30]",
              hoverBorder: "hover:border-[#ff3b30]/30",
              hoverBg: "hover:bg-[#ff3b30]/5",
              badge: "group-hover:text-[#ff3b30] group-hover:bg-[#ff3b30]/5"
          };
      }
      if (lower.includes('math') || lower.includes('geometry') || lower.includes('computational')) {
          return {
              accentColor: "text-[#34c759]",
              hoverBorder: "hover:border-[#34c759]/30",
              hoverBg: "hover:bg-[#34c759]/5",
              badge: "group-hover:text-[#34c759] group-hover:bg-[#34c759]/5"
          };
      }
      if (lower.includes('tree') || lower.includes('hierarchical')) {
          return {
              accentColor: "text-[#ff2d55]",
              hoverBorder: "hover:border-[#ff2d55]/30",
              hoverBg: "hover:bg-[#ff2d55]/5",
              badge: "group-hover:text-[#ff2d55] group-hover:bg-[#ff2d55]/5"
          };
      }
      
      return {
          accentColor: "text-slate-600",
          hoverBorder: "hover:border-slate-350",
          hoverBg: "hover:bg-slate-50",
          badge: "group-hover:text-slate-800 group-hover:bg-slate-50"
      };
  };
  
  const theme = getCategoryTheme();

  const getDifficultyBadge = (diff: string) => {
    const lower = diff.toLowerCase();
    if (lower === 'easy') {
      return "bg-[#34c759]/8 text-[#34c759] border-[#34c759]/15";
    }
    if (lower === 'hard') {
      return "bg-[#ff3b30]/8 text-[#ff3b30] border-[#ff3b30]/15";
    }
    return "bg-[#0071e3]/8 text-[#0071e3] border-[#0071e3]/15";
  };
 
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <Link 
          to="/" 
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          title="Back"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
          {title} Suite
        </h1>
      </div>

      {/* Category Search Input */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={15} />
        </div>
        <input
          type="text"
          placeholder={`Search ${title} algorithms...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs transition outline-none text-slate-900 placeholder-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Reworked Algorithm Grid: 2 Columns, No stretched full-width boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlgos.map(algo => (
          <Link 
            key={algo.id}
            to={`/algo/${algo.category.toLowerCase()}/${algo.id}`}
            className={cn(
              "group bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 transition flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] hover:shadow-md hover:-translate-y-[1px]",
              theme.hoverBorder,
              theme.hoverBg
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn("text-[9px] font-mono font-bold uppercase tracking-wider", theme.accentColor)}>
                  {algo.category}
                </span>
                <span className="text-[9px] font-mono font-medium text-slate-400 uppercase">
                  REF: {algo.id}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-slate-900 transition-colors">
                {algo.name}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                {algo.description}
              </p>
            </div>
            
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border",
                getDifficultyBadge(algo.difficulty)
              )}>
                {algo.difficulty}
              </span>
              
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition group-hover:bg-slate-950 group-hover:text-white group-hover:border-transparent group-hover:scale-105 shrink-0">
                <Play size={10} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
          </Link>
        ))}

        {filteredAlgos.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl italic">
            No algorithms matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};