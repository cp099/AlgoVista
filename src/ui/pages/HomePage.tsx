import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getAllAlgorithms } from '@registry/index';
import { ArrowDownUp, ArrowRight, Search, Play, Star, Dna, Layers, Compass, GitBranch, Network, ListOrdered } from 'lucide-react';
import { cn } from '@utils/cn';

export const HomePage: React.FC = () => {
  const categories = getCategories();
  const allAlgos = getAllAlgorithms();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get specific styles based on category (Apple/Google style soft colors)
  const getCategoryStyles = (cat: string) => {
    const lower = cat.toLowerCase();
    
    // 1. SORTING -> Orange / UpDown Arrows
    if (lower.includes('sort')) return { 
        icon: <ArrowDownUp size={20} />, 
        colorClass: "text-[#ff9500]", 
        bgClass: "bg-[#ff9500]/8",
        borderClass: "hover:border-[#ff9500]/30" 
    };
    
    // 2. GRAPH -> Purple / Network Icon
    if (lower.includes('graph')) return { 
        icon: <Network size={20} />, 
        colorClass: "text-[#af52de]", 
        bgClass: "bg-[#af52de]/8",
        borderClass: "hover:border-[#af52de]/30" 
    };
    
    // 3. SEARCHING -> Blue / Search Icon
    if (lower.includes('search')) return { 
        icon: <Search size={20} />, 
        colorClass: "text-[#0071e3]", 
        bgClass: "bg-[#0071e3]/8",
        borderClass: "hover:border-[#0071e3]/30" 
    };

    // 4. LINEAR DATA STRUCTURES -> Indigo / ListOrdered Icon
    if (lower.includes('linear')) return { 
        icon: <ListOrdered size={20} />, 
        colorClass: "text-[#5856d6]", 
        bgClass: "bg-[#5856d6]/8",
        borderClass: "hover:border-[#5856d6]/30" 
    };

    // 5. BIOINFORMATICS -> Teal / Dna Icon
    if (lower.includes('bioinformatics') || lower.includes('alignment')) return { 
        icon: <Dna size={20} />, 
        colorClass: "text-[#00a2c7]", 
        bgClass: "bg-[#00a2c7]/8",
        borderClass: "hover:border-[#00a2c7]/30" 
    };

    // 6. DP & GREEDY -> Red / Layers Icon
    if (lower.includes('programming') || lower.includes('greedy')) return { 
        icon: <Layers size={20} />, 
        colorClass: "text-[#ff3b30]", 
        bgClass: "bg-[#ff3b30]/8",
        borderClass: "hover:border-[#ff3b30]/30" 
    };

    // 7. MATH & GEOMETRY -> Green / Compass Icon
    if (lower.includes('math') || lower.includes('geometry') || lower.includes('computational')) return { 
        icon: <Compass size={20} />, 
        colorClass: "text-[#34c759]", 
        bgClass: "bg-[#34c759]/8",
        borderClass: "hover:border-[#34c759]/30" 
    };

    // 8. TREES & HIERARCHICAL -> Pink/Rose / GitBranch Icon
    if (lower.includes('tree') || lower.includes('hierarchical')) return { 
        icon: <GitBranch size={20} />, 
        colorClass: "text-[#ff2d55]", 
        bgClass: "bg-[#ff2d55]/8",
        borderClass: "hover:border-[#ff2d55]/30" 
    };

    // Fallback
    return { 
        icon: <ListOrdered size={20} />, 
        colorClass: "text-slate-600", 
        bgClass: "bg-slate-100",
        borderClass: "hover:border-slate-300" 
    };
  };

  const getCategoryDescription = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('sort')) {
      return "Data ordering and rank optimization. Crucial for array sorting, statistics, and prioritized execution queues.";
    }
    if (lower.includes('graph')) {
      return "Pathfinding, tree structures, and spanning connections. Used in network routing, pipeline networks, and logistics.";
    }
    if (lower.includes('search')) {
      return "Pattern identification, interval halving, and matching. Powering file search, compiler parsers, and genomic indexing.";
    }
    if (lower.includes('linear') || lower.includes('structure')) {
      return "Sequential lists, registers, memory tracks, and queue pipelines. Critical for compilers, history stacks, and processors.";
    }
    if (lower.includes('bioinformatics') || lower.includes('alignment')) {
      return "DNA sequencing, global/local comparisons, and RNA secondary structure models. Key to genomics and biological informatics.";
    }
    if (lower.includes('programming') || lower.includes('greedy')) {
      return "Subproblem memoization, optimal substructure, and greedy selections. Solves knapsacks, coin change, and scheduling.";
    }
    if (lower.includes('math') || lower.includes('geometry') || lower.includes('computational')) {
      return "Prime number screening, gcd arithmetic, coordinate scatter plots, and boundary convex hull hulls.";
    }
    if (lower.includes('tree') || lower.includes('hierarchical')) {
      return "Parent-child node tree structures, BST indexes, AVL rotations, and prefix key matching tries.";
    }
    if (lower.includes('geographic') || lower.includes('route') || lower.includes('map')) {
      return "Real world maps, GPS coordinate tracks, spatial index Quadtrees, Dijkstra city routes, and geofencing borders.";
    }
    return `Interactive visual playgrounds for trace step-by-step executions of ${cat} algorithms.`;
  };

  // Shuffled algorithms for featured scroll (computed once on mount)
  const [shuffledAlgos] = useState<ReturnType<typeof getAllAlgorithms>>(() => 
    [...allAlgos].sort(() => Math.random() - 0.5).slice(0, 12)
  );

  const searchResults = allAlgos.filter(algo => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return (
      algo.name.toLowerCase().includes(query) ||
      algo.id.toLowerCase().includes(query)
    );
  });

  const getDifficultyBadge = (diff: string) => {
    const lower = diff.toLowerCase();
    if (lower === 'easy') {
      return "bg-[#34c759]/8 text-[#34c759] border-[#34c759]/20";
    }
    if (lower === 'hard') {
      return "bg-[#ff3b30]/8 text-[#ff3b30] border-[#ff3b30]/20";
    }
    return "bg-[#0071e3]/8 text-[#0071e3] border-[#0071e3]/20";
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-16 relative">
      
      {/* Centered Typography Hero Section */}
      <div className="text-center space-y-5 max-w-2xl mx-auto py-4">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 select-none">
          AlgoVista
        </h1>
        <p className="text-base md:text-lg text-slate-500 leading-relaxed font-normal max-w-xl mx-auto">
          An interactive visual index of algorithm dynamics. Witness how computer systems process data structures, optimize networks, and run operations in real time.
        </p>
      </div>

      {/* STATS COUNT OVERLAYS */}
      <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
        <div className="bg-white border border-slate-200/50 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all">
          <span className="text-3xl font-semibold text-slate-800 font-mono mb-0.5">{allAlgos.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algorithms</span>
        </div>

        <div className="bg-white border border-slate-200/50 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all">
          <span className="text-3xl font-semibold text-slate-800 font-mono mb-0.5">{categories.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Suites</span>
        </div>
      </div>



      {/* Clean Search Directory Panel */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search all algorithms (e.g. Merge Sort, Dijkstra, Queue)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200/80 focus:border-slate-400 rounded-xl text-sm transition-all outline-none text-slate-900 placeholder-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:shadow-md"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Search results */}
        {searchQuery.trim() !== '' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-2 shadow-lg animate-fade-in scrollbar-thin">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((algo) => (
                  <Link
                    key={algo.id}
                    to={`/algo/${algo.category.toLowerCase()}/${algo.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-lg transition group"
                  >
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {algo.category}
                      </span>
                      <h4 className="font-semibold text-xs text-slate-800 group-hover:text-[#0071e3] transition-colors">
                        {algo.name}
                      </h4>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center transition group-hover:bg-slate-900 group-hover:text-white group-hover:border-transparent">
                      <Play size={8} fill="currentColor" className="ml-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 italic">
                No algorithms found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Explorer Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Explore Categories</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map(cat => {
            const styles = getCategoryStyles(cat);
            return (
              <Link 
                key={cat} 
                to={`/category/${cat.toLowerCase()}`}
                className={cn(
                  "group bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:-translate-y-[1px] flex flex-col relative overflow-hidden w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 grow-0",
                  styles.borderClass
                )}
              >
                <div className={cn(
                  "mb-4 w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  styles.bgClass,
                  styles.colorClass
                )}>
                  {styles.icon}
                </div>
                
                <h3 className="text-base font-semibold text-slate-800 mb-1.5 transition-colors">{cat}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-1">
                  {getCategoryDescription(cat)}
                </p>
                
                <div className={cn("flex items-center font-semibold text-xs transition-transform duration-200 mt-auto", styles.colorClass)}>
                  Launch suite <ArrowRight size={11} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Reworked Featured Playgrounds: Infinite scrolling end-to-end with viewport breakout */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight flex items-center gap-2">
          <Star size={16} className="text-[#ff9500] fill-[#ff9500]" />
          Featured Playgrounds
        </h2>
        
        {/* Full Viewport Breakout */}
        <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden">
          {/* Left Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f5f5f7] via-[#f5f5f7]/70 to-transparent pointer-events-none z-10" />
          
          {/* Right Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f5f5f7] via-[#f5f5f7]/70 to-transparent pointer-events-none z-10" />

          {/* Marquee scrolling track */}
          <div className="overflow-hidden w-full py-4">
            <div className="flex animate-marquee hover:[animation-play-state:paused] w-max gap-0">
              
              {/* Half 1 */}
              <div className="flex gap-6 pr-6 flex-nowrap shrink-0">
                {shuffledAlgos.map((item, idx) => (
                  <Link 
                    key={`m1-${item.id}-${idx}`}
                    to={`/algo/${item.category.toLowerCase()}/${item.id}`}
                    className="group flex-none w-80 bg-white/70 backdrop-blur-md border border-slate-200/50 hover:border-slate-350 rounded-xl p-6 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] hover:shadow-md hover:-translate-y-[1px]"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 transition-colors truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-normal h-12 overflow-hidden text-wrap line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border",
                        getDifficultyBadge(item.difficulty)
                      )}>
                        {item.difficulty}
                      </span>
                      
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition group-hover:bg-slate-950 group-hover:text-white group-hover:border-transparent group-hover:scale-105 shrink-0">
                        <Play size={10} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Half 2 */}
              <div className="flex gap-6 pr-6 flex-nowrap shrink-0">
                {shuffledAlgos.map((item, idx) => (
                  <Link 
                    key={`m2-${item.id}-${idx}`}
                    to={`/algo/${item.category.toLowerCase()}/${item.id}`}
                    className="group flex-none w-80 bg-white/70 backdrop-blur-md border border-slate-200/50 hover:border-slate-350 rounded-xl p-6 transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] hover:shadow-md hover:-translate-y-[1px]"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900 transition-colors truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-normal h-12 overflow-hidden text-wrap line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border",
                        getDifficultyBadge(item.difficulty)
                      )}>
                        {item.difficulty}
                      </span>
                      
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center transition group-hover:bg-slate-950 group-hover:text-white group-hover:border-transparent group-hover:scale-105 shrink-0">
                        <Play size={10} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};