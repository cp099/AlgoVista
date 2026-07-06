import React from 'react';
import { AlgorithmManifest } from '@core/types';
import { Clock, Lightbulb, Bookmark } from 'lucide-react';
import { getComplexityData } from '@utils/complexities';
import { getDetailedGuide } from '@utils/detailedGuides';

interface TheoryViewProps {
  manifest: AlgorithmManifest;
}

export const TheoryView: React.FC<TheoryViewProps> = ({ manifest }) => {
  const localComplexity = getComplexityData(manifest.id);
  const guide = getDetailedGuide(manifest.id);
  
  // Resolve manifest values first, fall back to our utility database
  const bestTime = manifest.timeComplexity?.best || localComplexity.time.best;
  const avgTime = manifest.timeComplexity?.average || localComplexity.time.average;
  const worstTime = manifest.timeComplexity?.worst || localComplexity.time.worst;
  const spaceComp = manifest.spaceComplexity || localComplexity.space;
  const concepts = localComplexity.keyConcepts;

  const getComplexityGrade = (complexity: string, type: 'best' | 'average' | 'worst' | 'space') => {
    const clean = complexity.replace(/\s+/g, '').toLowerCase();
    
    if (type === 'space') {
      if (clean.includes('o(1)')) return { color: 'bg-[#34c759]', text: 'Optimal (O(1))' };
      return { color: 'bg-[#0071e3]', text: 'Linear Space' };
    }

    if (clean.includes('o(1)') || clean.includes('o(logn)')) {
      return { color: 'bg-[#34c759]', text: 'Optimal Speed' };
    }
    if (clean.includes('o(n)') || clean.includes('o(nlogn)')) {
      return { color: 'bg-[#0071e3]', text: 'Standard Speed' };
    }
    return { color: 'bg-[#ff3b30]', text: 'Slow Bounds' };
  };

  const bestGrade = getComplexityGrade(bestTime, 'best');
  const avgGrade = getComplexityGrade(avgTime, 'average');
  const worstGrade = getComplexityGrade(worstTime, 'worst');
  const spaceGrade = getComplexityGrade(spaceComp, 'space');

  return (
    <div className="space-y-10 animate-fade-in pb-12 font-sans max-w-5xl mx-auto text-slate-700">
      
      {/* Core Mechanics Summary */}
      <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Lightbulb size={18} className="text-slate-500" />
          Core Mechanics & Behavior
        </h2>
        <p className="text-slate-500 leading-relaxed text-sm font-normal">
          {manifest.description}
        </p>
      </section>

      {/* Complexity Dashboard - Unified single card grid with vertical dividing borders */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Clock size={18} className="text-slate-500" />
          Performance Complexity Matrix
        </h2>
        
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] divide-y md:divide-y-0 md:divide-x divide-slate-100 grid grid-cols-2 md:grid-cols-4 overflow-hidden">
          
          {/* Best Case */}
          <div className="p-5 flex flex-col justify-between min-h-[100px]">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Best Case
              </span>
              <p className="text-2xl font-bold text-slate-800 font-mono">{bestTime}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`w-2 h-2 rounded-full ${bestGrade.color} shrink-0`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{bestGrade.text}</span>
            </div>
          </div>

          {/* Average Case */}
          <div className="p-5 flex flex-col justify-between min-h-[100px]">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Average Case
              </span>
              <p className="text-2xl font-bold text-slate-800 font-mono">{avgTime}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`w-2 h-2 rounded-full ${avgGrade.color} shrink-0`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{avgGrade.text}</span>
            </div>
          </div>

          {/* Worst Case */}
          <div className="p-5 flex flex-col justify-between min-h-[100px]">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Worst Case
              </span>
              <p className="text-2xl font-bold text-slate-800 font-mono">{worstTime}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`w-2 h-2 rounded-full ${worstGrade.color} shrink-0`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{worstGrade.text}</span>
            </div>
          </div>

          {/* Auxiliary Space */}
          <div className="p-5 flex flex-col justify-between min-h-[100px]">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Space Complexity
              </span>
              <p className="text-2xl font-bold text-slate-800 font-mono">{spaceComp}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`w-2 h-2 rounded-full ${spaceGrade.color} shrink-0`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{spaceGrade.text}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Guide (Displayed openly) */}
      <section className="bg-white border border-slate-200/60 rounded-xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] space-y-6">
        <h2 className="text-base font-semibold text-slate-900 pb-3.5 border-b border-slate-100">
          Algorithmic Analysis & Reference
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
          {/* Real World Applications */}
          <div className="space-y-2 border-l-2 border-indigo-400 pl-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Real-World Applications
            </h3>
            <p className="text-slate-600 font-medium text-[11px]">
              {guide.realWorldApp}
            </p>
          </div>

          {/* Invariants */}
          <div className="space-y-2 border-l-2 border-indigo-400 pl-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Logical Loop Invariant
            </h3>
            <p className="text-slate-600 font-medium text-[11px]">
              {guide.invariant}
            </p>
          </div>
        </div>

        {/* Key Execution Walkthrough */}
        <div className="space-y-3.5 pt-6 border-t border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Execution Walkthrough Pillars
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guide.walkthrough.map((step, idx) => (
              <div key={idx} className="bg-slate-50/60 border border-slate-100 p-4.5 rounded-lg flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      {concepts && concepts.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Bookmark size={18} className="text-slate-500" />
            Key Concepts & Constraints
          </h2>
          <div className="flex flex-wrap gap-2">
            {concepts.map((concept, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500 rounded-lg"
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