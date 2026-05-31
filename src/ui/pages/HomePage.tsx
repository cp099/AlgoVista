import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getAllAlgorithms } from '@registry/index';
import { ArrowDownUp, ArrowRight, Share2, Search, List, PlayCircle, Star, Sparkles, Settings } from 'lucide-react';
import { cn } from '@utils/cn';
import { AlgoVistaLogo } from '@ui/layout/AlgoVistaLogo';
import { SettingsModal } from '@ui/controls/SettingsModal';

export const HomePage: React.FC = () => {
  const categories = getCategories();
  const allAlgos = getAllAlgorithms();
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get specific styles based on category
  const getCategoryStyles = (cat: string) => {
    const lower = cat.toLowerCase();
    
    // 1. SORTING -> Orange / UpDown Arrows
    if (lower.includes('sort')) return { 
        icon: <ArrowDownUp size={28} />, 
        colorClass: "text-orange-500", 
        bgClass: "bg-orange-500/10 group-hover:bg-orange-500/20",
        borderClass: "group-hover:border-orange-500/50" 
    };
    
    // 2. GRAPH -> Pink / Nodes (Share2)
    if (lower.includes('graph')) return { 
        icon: <Share2 size={28} />, 
        colorClass: "text-pink-500", 
        bgClass: "bg-pink-500/10 group-hover:bg-pink-500/20",
        borderClass: "group-hover:border-pink-500/50" 
    };
    
    // 3. SEARCHING -> Blue / Magnifying Glass
    if (lower.includes('search')) return { 
        icon: <Search size={28} />, 
        colorClass: "text-blue-500", 
        bgClass: "bg-blue-500/10 group-hover:bg-blue-500/20",
        borderClass: "group-hover:border-blue-500/50" 
    };

    // 4. LINEAR DATA STRUCTURES -> Cyan / List Icon
    if (lower.includes('linear') || lower.includes('structure')) return { 
        icon: <List size={28} />, 
        colorClass: "text-cyan-500", 
        bgClass: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
        borderClass: "group-hover:border-cyan-500/50" 
    };

    // Fallback
    return { 
        icon: <List size={28} />, 
        colorClass: "text-algo-primary", 
        bgClass: "bg-algo-primary/10 group-hover:bg-algo-primary/20",
        borderClass: "group-hover:border-algo-primary/50" 
    };
  };

  // Category descriptions that highlight multi-disciplinary scientific/math connections
  const getCategoryDescription = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('sort')) {
      return "Data ordering and rank optimization. Crucial for statistics, sorting arrays, database indexing, and prioritizing computation steps.";
    }
    if (lower.includes('graph')) {
      return "Network pathfinding, structural loops, and spanning grids. Applied in GPS routing, pipeline networks, social analysis, and logistics.";
    }
    if (lower.includes('search')) {
      return "Pattern identification, data lookup, and string metrics. Powering text matching compilers, genomic mapping, and compression.";
    }
    if (lower.includes('linear') || lower.includes('structure')) {
      return "Sequential registers, memory queues, and sliding tracks. Essential for scheduler pipelines, compiler stack math, and history management.";
    }
    return `Interactive visualizations for ${cat} algorithms. Experiment with parameter variations and trace step-by-step executions.`;
  };

  // Featured Algorithms List for Quick Start
  const featuredAlgos = [
    { id: 'dijkstra', category: 'graph', name: "Dijkstra's Pathfinding", desc: "Finds the shortest path in a weighted graph." },
    { id: 'merge-sort', category: 'sorting', name: "Merge Sort", desc: "Divide-and-conquer stable sorting algorithm." },
    { id: 'binary-search', category: 'searching_string', name: "Binary Search", desc: "Logarithmic interval halving search." },
  ];

  // Universal directory filter
  const searchResults = allAlgos.filter(algo => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return (
      algo.name.toLowerCase().includes(query) ||
      algo.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-20 relative">
      
      {/* Floating Settings Button */}
      <div className="absolute top-0 right-4 z-20">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-algo-surface/60 hover:bg-algo-surface border border-algo-border rounded-xl text-xs font-bold transition-all duration-300 text-algo-text shadow-sm active:scale-95 hover:border-algo-primary/40"
        >
          <Settings size={14} className="text-algo-primary" />
          Preferences
        </button>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-algo-primary/15 border border-algo-border/30 rounded-full text-xs font-semibold text-algo-primary animate-fade-in shadow-inner shadow-algo-primary/5">
          <Sparkles size={12} className="animate-spin-slow" />
          Interactive Visual Library • Made by students, for students
        </div>
        
        {/* Brand Header with logo beside name */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="p-2 bg-algo-primary/10 rounded-2xl border border-algo-primary/20 shadow-inner">
            <AlgoVistaLogo size={42} className="text-algo-primary animate-pulse" />
          </div>
          <h1 className="inline-block text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-algo-text via-slate-100 to-algo-primary select-none pb-5 pr-4 pt-2 leading-normal">
            AlgoVista
          </h1>
        </div>

        <p className="text-lg md:text-xl text-algo-muted leading-relaxed font-semibold">
          Interactive, step-by-step visualizations for algorithms across mathematics, computer science, optimization, and nature. See how systems solve complex problems in real time.
        </p>
        <p className="text-xs font-bold text-algo-primary uppercase tracking-widest mt-1">
          Designed by students to make algorithm self-study intuitive and visually accessible
        </p>
      </div>

      {/* STATS TICKER ROW (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-algo-surface/30 border border-algo-border/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden group hover:border-algo-primary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-algo-primary/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-4xl font-extrabold text-algo-primary font-mono mb-1">{allAlgos.length}</span>
          <span className="text-xs font-bold text-algo-text uppercase tracking-widest">Built-in Algorithms</span>
          <span className="text-[10px] text-algo-muted mt-2 font-medium">Auto-detected dynamic modules</span>
        </div>

        <div className="bg-algo-surface/30 border border-algo-border/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden group hover:border-algo-primary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-algo-primary/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-4xl font-extrabold text-purple-400 font-mono mb-1">{categories.length}</span>
          <span className="text-xs font-bold text-algo-text uppercase tracking-widest">Interactive Suites</span>
          <span className="text-[10px] text-algo-muted mt-2 font-medium">Spanning different scientific domains</span>
        </div>

        <div className="bg-algo-surface/30 border border-algo-border/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden group hover:border-algo-primary/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-algo-primary/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-4xl font-extrabold text-emerald-400 font-mono mb-1">Interactive</span>
          <span className="text-xs font-bold text-algo-text uppercase tracking-widest">Visual States</span>
          <span className="text-[10px] text-algo-muted mt-2 font-medium">Graphs, Matrices, Cups & Tracks</span>
        </div>
      </div>

      {/* Category Grid Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-algo-text tracking-tight flex items-center gap-2">
          Explore suites
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => {
              const styles = getCategoryStyles(cat);
              
              return (
                  <Link 
                      key={cat} 
                      to={`/category/${cat.toLowerCase()}`}
                      className={cn(
                          "group bg-algo-surface/40 backdrop-blur-md border border-algo-border/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-algo-primary/5 flex flex-col hover:-translate-y-1 relative overflow-hidden",
                          styles.borderClass
                      )}
                  >
                      <div className="absolute -top-16 -right-16 w-32 h-32 bg-algo-primary/5 rounded-full blur-2xl group-hover:bg-algo-primary/10 transition-all duration-300" />
                      
                      <div className={cn(
                          "mb-5 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner group-hover:scale-105",
                          styles.bgClass,
                          styles.colorClass
                      )}>
                          {styles.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-algo-text mb-2 group-hover:text-algo-primary transition-colors duration-300">{cat}</h3>
                      <p className="text-algo-muted mb-6 flex-1 text-xs leading-relaxed group-hover:text-algo-text/80 transition-colors duration-300">
                        {getCategoryDescription(cat)}
                      </p>
                      
                      <div className={cn("flex items-center font-bold text-xs group-hover:translate-x-1.5 transition-transform duration-300 mt-auto", styles.colorClass)}>
                          Launch suite <ArrowRight size={12} className="ml-1.5" />
                      </div>
                  </Link>
              );
          })}
        </div>
      </div>

      {/* Advanced Universal Search System (Placed after the categories) */}
      <div className="bg-algo-surface/25 border border-algo-border/45 rounded-3xl p-8 relative overflow-hidden space-y-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-algo-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-algo-text tracking-tight flex items-center gap-2.5">
            <Search size={22} className="text-algo-primary" />
            Universal Algorithm Directory
          </h2>
          <p className="text-xs md:text-sm text-algo-muted max-w-xl font-semibold">
            Instantly search across all mathematical, computational, network routing, and biological sequences in the dynamic repository.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-algo-muted">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Type to search all 82 algorithms (e.g. Dijkstra, Merge Sort, Queue)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-algo-surface/50 hover:bg-algo-surface/80 focus:bg-algo-bg border border-algo-border/60 hover:border-algo-primary/45 focus:border-algo-primary rounded-2xl text-sm font-semibold transition-all duration-300 outline-none text-algo-text placeholder-algo-muted/60 shadow-md shadow-algo-primary/2"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-algo-primary hover:text-algo-primary/80"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results Dropdown/Grid */}
        {searchQuery.trim() !== '' && (
          <div className="bg-algo-bg/60 border border-algo-border/50 rounded-2xl p-5 max-h-[350px] overflow-y-auto space-y-4 animate-fade-in scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((algo) => (
                  <Link
                    key={algo.id}
                    to={`/algo/${algo.category.toLowerCase()}/${algo.id}`}
                    className="flex items-center justify-between p-3.5 bg-algo-surface/40 hover:bg-algo-primary/10 border border-algo-border/40 hover:border-algo-primary/30 rounded-xl transition-all duration-300 group hover:-translate-y-0.5"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-algo-primary font-mono uppercase tracking-widest bg-algo-primary/10 border border-algo-primary/20 px-2 py-0.5 rounded-full">
                        {algo.category}
                      </span>
                      <h4 className="font-bold text-sm text-algo-text group-hover:text-algo-primary transition-colors">
                        {algo.name}
                      </h4>
                      <p className="text-xs text-algo-muted leading-relaxed line-clamp-1">
                        {algo.description}
                      </p>
                    </div>
                    <PlayCircle size={22} className="text-algo-muted group-hover:text-algo-primary opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-algo-muted italic">
                No matching algorithms found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK START DECK (Featured algorithms) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-algo-text tracking-tight flex items-center gap-2">
          <Star size={20} className="text-algo-primary" />
          Featured Sandboxes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAlgos.map(item => (
            <Link 
              key={item.id}
              to={`/algo/${item.category}/${item.id}`}
              className="group bg-algo-surface/30 hover:bg-algo-surface/50 border border-algo-border/50 rounded-2xl p-6 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md hover:border-algo-primary/45 hover:scale-[1.01]"
            >
              <div className="space-y-1 pr-4">
                <h4 className="font-extrabold text-sm text-algo-text group-hover:text-algo-primary transition-colors duration-300">{item.name}</h4>
                <p className="text-xs text-algo-muted leading-relaxed group-hover:text-algo-text/80 transition-colors">{item.desc}</p>
              </div>
              <PlayCircle size={28} className="text-algo-muted group-hover:text-algo-primary opacity-60 group-hover:opacity-100 transition-all duration-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Render Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

    </div>
  );
};