import React, { useState } from 'react';
import { AlgorithmManifest } from '@core/types';
import { Clock, Lightbulb, Bookmark } from 'lucide-react';
import { getComplexityData } from '@utils/complexities';
import { getDetailedGuide } from '@utils/detailedGuides';

interface TheoryViewProps {
  manifest: AlgorithmManifest;
}

export const TheoryView: React.FC<TheoryViewProps> = ({ manifest }) => {
  const [showGuide, setShowGuide] = useState(false);
  const localComplexity = getComplexityData(manifest.id);
  const guide = getDetailedGuide(manifest.id);
  
  // Resolve manifest values first, fall back to our utility database
  const bestTime = manifest.timeComplexity?.best || localComplexity.time.best;
  const avgTime = manifest.timeComplexity?.average || localComplexity.time.average;
  const worstTime = manifest.timeComplexity?.worst || localComplexity.time.worst;
  const spaceComp = manifest.spaceComplexity || localComplexity.space;
  const concepts = localComplexity.keyConcepts;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Dynamic Summary Panel */}
      <section className="bg-algo-surface/40 backdrop-blur-md border border-algo-border/50 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-algo-primary/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold text-algo-text mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-algo-primary" />
          Core Mechanics
        </h2>
        <p className="text-algo-muted leading-relaxed text-base md:text-lg max-w-4xl">
          {manifest.description}
        </p>

        {/* Detailed Guide Trigger Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-algo-border/40">
          <p className="text-xs text-algo-muted font-medium">
            Explore industry applications, runtime loop invariants, and execution pillars.
          </p>
          <button
            onClick={() => {
              setShowGuide(!showGuide);
              if (!showGuide) {
                // Smooth scroll to the detailed section
                setTimeout(() => {
                  document.getElementById('detailed-guide-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 120);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-algo-primary/10 hover:bg-algo-primary/20 text-algo-primary border border-algo-primary/30 rounded-xl text-xs font-bold transition-all duration-300 shadow-md shadow-algo-primary/5 hover:scale-[1.02] shrink-0 active:scale-[0.98]"
          >
            {showGuide ? "Hide Detailed Guide" : "Read Detailed Guide"}
          </button>
        </div>
      </section>

      {/* Expandable Detailed Guide Sub-Section */}
      {showGuide && (
        <section 
          id="detailed-guide-section" 
          className="bg-algo-surface/30 border border-algo-border/50 rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-xl font-extrabold text-algo-text flex items-center gap-2 pb-2 border-b border-algo-border/40">
            <span className="p-1 bg-algo-primary/10 rounded-lg text-algo-primary">
              <Lightbulb size={16} />
            </span>
            Detailed Algorithm Guide: {manifest.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Real World Applications */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest flex items-center gap-2">
                Real-World Applications
              </h3>
              <p className="text-sm text-algo-text leading-relaxed font-semibold">
                {guide.realWorldApp}
              </p>
            </div>

            {/* Invariants */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest flex items-center gap-2">
                Algorithmic & Logical Invariant
              </h3>
              <p className="text-sm text-algo-text leading-relaxed font-semibold">
                {guide.invariant}
              </p>
            </div>

          </div>

          {/* Key Execution Pillars / Walkthrough */}
          <div className="space-y-4 pt-4 border-t border-algo-border/40">
            <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest">
              Execution Walkthrough Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {guide.walkthrough.map((step, idx) => (
                <div key={idx} className="bg-algo-surface/60 border border-algo-border/40 p-4 rounded-xl flex items-start gap-3 shadow-inner hover:border-algo-primary/20 transition-all duration-300">
                  <span className="w-6 h-6 rounded-full bg-algo-primary/10 text-algo-primary text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-algo-muted leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>
      )}

      {/* Complexity Dashboard */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-algo-text flex items-center gap-2">
          <Clock size={20} className="text-algo-primary" />
          Complexity Matrix
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Best Time */}
          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-algo-primary/30 transition-all duration-300">
            <div>
              <span className="text-[10px] font-mono font-bold text-algo-muted uppercase tracking-widest block mb-1">
                Best Case Time
              </span>
              <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">{bestTime}</p>
            </div>
            <div className="text-[10px] text-algo-muted mt-3 font-semibold">Minimal Operations Needed</div>
          </div>

          {/* Average Time */}
          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-algo-primary/30 transition-all duration-300">
            <div>
              <span className="text-[10px] font-mono font-bold text-algo-muted uppercase tracking-widest block mb-1">
                Average Case Time
              </span>
              <p className="text-2xl font-mono font-extrabold text-algo-primary mt-1">{avgTime}</p>
            </div>
            <div className="text-[10px] text-algo-muted mt-3 font-semibold">Expected Normal Load</div>
          </div>

          {/* Worst Time */}
          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-algo-primary/30 transition-all duration-300">
            <div>
              <span className="text-[10px] font-mono font-bold text-algo-muted uppercase tracking-widest block mb-1">
                Worst Case Time
              </span>
              <p className="text-2xl font-mono font-extrabold text-rose-400 mt-1">{worstTime}</p>
            </div>
            <div className="text-[10px] text-algo-muted mt-3 font-semibold">Worst Performance Bound</div>
          </div>

          {/* Auxiliary Space */}
          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden hover:border-algo-primary/30 transition-all duration-300">
            <div>
              <span className="text-[10px] font-mono font-bold text-algo-muted uppercase tracking-widest block mb-1">
                Space Complexity
              </span>
              <p className="text-2xl font-mono font-extrabold text-purple-400 mt-1">{spaceComp}</p>
            </div>
            <div className="text-[10px] text-algo-muted mt-3 font-semibold">Extra Memory Footprint</div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      {concepts && concepts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-algo-text flex items-center gap-2">
            <Bookmark size={20} className="text-algo-primary" />
            Key Concepts & Constraints
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {concepts.map((concept, i) => (
              <span 
                key={i} 
                className="px-4 py-2 bg-algo-surface/50 border border-algo-border hover:border-algo-primary/30 text-xs font-semibold text-algo-text rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02]"
              >
                {concept}
              </span>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};