import React from 'react';
import { cn } from '@utils/cn';
import { AlgoState, AlgoEvent, DataStructure } from '@core/types';
import { Array1D } from './primitives/Array1D';
import { GraphNetwork } from './primitives/GraphNetwork';
import { Matrix2D } from './primitives/Matrix2D';
import { StackVisualizer, QueueVisualizer } from './primitives/StackQueue';
import { LinkedListVisualizer } from './primitives/LinkedListVisualizer';
import { StringMatchVisualizer } from './primitives/StringMatchVisualizer';
import { CartesianPlot } from './primitives/CartesianPlot';

interface StageProps {
  state: AlgoState | null;
  lastEvents: AlgoEvent[];
  width?: number;
  height?: number;
  algoId?: string;
  category?: string;
}

export const Stage: React.FC<StageProps> = ({ 
  state, 
  lastEvents, 
  width = 800, 
  height = 400,
  algoId = '',
  category = ''
}) => {
  if (!state) return <div className="text-slate-400 p-8 text-center italic font-sans text-xs">No State Loaded</div>;

  const structures = Object.values(state.structures);
  const lowerCategory = category.toLowerCase();
  const lowerAlgoId = algoId.toLowerCase();
  
  // --- RENDERING ROUTER FOR PRIMITIVES ---
  const renderStructure = (struct: DataStructure, w: number, h: number, colorOverride?: string) => {
    // 1. Check if this is a Stack structure
    const isStack = struct.type === 'stack' || 
                    struct.id.toLowerCase().includes('stack') || 
                    lowerAlgoId.includes('stack') || 
                    lowerAlgoId.includes('postfix') || 
                    lowerAlgoId.includes('infix');
                    
    // 2. Check if this is a Queue structure
    const isQueue = struct.type === 'queue' || 
                    struct.id.toLowerCase().includes('queue') || 
                    struct.id.toLowerCase().includes('deque') || 
                    lowerAlgoId.includes('queue') || 
                    lowerAlgoId.includes('deque');

    // 3. Check if this is a Linked List structure
    const isLinkedList = lowerAlgoId.includes('list') || 
                         lowerAlgoId.includes('floyd') || 
                         lowerAlgoId.includes('josephus') ||
                         struct.id.toLowerCase().includes('list');

    if (struct.type === 'array' || struct.type === 'stack' || struct.type === 'queue') {
      if (isStack) {
        return (
          <StackVisualizer
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
          />
        );
      }
      
      if (isQueue) {
        return (
          <QueueVisualizer
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
          />
        );
      }

      if (isLinkedList) {
        const isCircular = lowerAlgoId.includes('circular') || struct.id.toLowerCase().includes('circular') || lowerAlgoId.includes('josephus');
        const isDoubly = lowerAlgoId.includes('doubly') || struct.id.toLowerCase().includes('doubly');
        return (
          <LinkedListVisualizer
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            isCircular={isCircular}
            isDoubly={isDoubly}
            baseColor={struct.baseColor || colorOverride}
          />
        );
      }

      // Default array visualization (Vertical bars or cell grids)
      return (
        <Array1D 
          data={struct.data} 
          activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
          width={w}
          height={h}
          baseColor={struct.baseColor || colorOverride}
          orientation={struct.orientation}
          visualMode={struct.visualMode}
          variables={state.context.variables}
        />
      );
    }

    if (struct.type === 'graph') {
      return (
        <GraphNetwork
          id={struct.id}
          nodes={struct.nodes}
          edges={struct.edges}
          activeEvents={lastEvents}
          width={w}
          height={h}
          layout={struct.layout}
        />
      );
    }

    if (struct.type === 'matrix') {
      return (
        <Matrix2D
          data={struct.data}
          activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
          width={w}
          height={h}
          baseColor={struct.baseColor || colorOverride}
          rowHeaders={struct.rowHeaders}
          colHeaders={struct.colHeaders}
          tracebackPaths={struct.tracebackPaths}
        />
      );
    }

    if (struct.type === 'plot') {
      return (
        <CartesianPlot
          points={struct.points}
          lines={struct.lines}
          hullPath={struct.hullPath}
          curves={struct.curves}
          shadedAreas={struct.shadedAreas}
          width={w}
          height={h}
        />
      );
    }



    return null;
  };

  // --- CUSTOM CATEGORY WORKSPACE ROUTING ---

  // 1. Custom String Matching layout (Merge Text and Pattern arrays on the same shifting axis)
  const isStringSearch = lowerCategory.includes('string') || lowerCategory.includes('searching') || lowerAlgoId.includes('kmp') || lowerAlgoId.includes('rabin') || lowerAlgoId.includes('naive');
  const textStruct = structures.find(s => s.id.toLowerCase() === 'text');
  const patternStruct = structures.find(s => s.id.toLowerCase() === 'pat' || s.id.toLowerCase() === 'pattern');

  if (isStringSearch && textStruct && patternStruct && textStruct.type !== 'graph' && patternStruct.type !== 'graph') {
    return (
      <div className="w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block overflow-visible">
          <StringMatchVisualizer
            textData={(textStruct as { data: (number | string)[] }).data}
            patternData={(patternStruct as { data: (number | string)[] }).data}
            activeEvents={lastEvents}
            variables={state.context.variables}
            width={width}
            height={height}
          />
        </svg>
      </div>
    );
  }

  // --- STANDARD MULTI-STRUCTURE LAYOUT DETECTION ---
  const mainGraph = structures.find(s => s.type === 'graph');
  const mainArray = structures.length > 0 && structures[0].type === 'array' ? structures[0] : null;
  const auxStructs = mainGraph ? structures.filter(s => s.id !== mainGraph.id) : structures.slice(1);
  
  const isVerticalSplit = !!mainGraph && auxStructs.length > 0 && auxStructs.every(s => s.type === 'array');
  const isDualStack = auxStructs.length === 1 && 
                      mainArray?.orientation === 'vertical' &&
                      auxStructs[0].type === 'array' && auxStructs[0].orientation === 'vertical';
  const isDashboard = auxStructs.length > 0 && !isDualStack && !isVerticalSplit;

  // --- RENDER LAYOUT BLOCKS ---
  const renderContent = () => {
    // RENDER: VERTICAL SPLIT (Graph on Left, Aux List on Right)
    if (isVerticalSplit) {
      return (
        <div className="w-full h-full flex gap-4 p-4">
          <div className="flex-[4] bg-slate-50/20 rounded-xl border border-slate-200/50 relative shadow-sm overflow-hidden">
            <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm z-10">
              {mainGraph.id}
            </span>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
              {renderStructure(mainGraph, width, height)}
            </svg>
          </div>
          
          {auxStructs.length > 0 && (
            <div className="flex-1 bg-slate-50/10 rounded-lg border border-slate-200 p-4 space-y-4 overflow-y-auto">
              {auxStructs.map(aux => (
                <div key={aux.id}>
                  <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">{aux.id}</h3>
                  <div className="space-y-1">
                    {aux.data.map((item, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded px-3 py-2 text-xs font-mono text-slate-700">
                        {String(item)}
                      </div>
                    ))}
                    {aux.data.length === 0 && (
                      <div className="text-xs text-slate-400 italic p-2">Empty</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // RENDER: DUAL STACK (Min Stack etc.)
    if (isDualStack) {
      return (
        <div className="w-full h-full flex items-center justify-around gap-8 p-4">
          <div className="w-1/2 h-full relative overflow-hidden">
            <span className="absolute top-0 left-0 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-1 rounded">
              {mainArray!.id}
            </span>
            <svg viewBox={`0 0 ${width / 2} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
              {renderStructure(mainArray!, width / 2, height)}
            </svg>
          </div>
          <div className="w-1/2 h-full relative overflow-hidden">
            <span className="absolute top-0 left-0 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-1 rounded">
              {auxStructs[0].id}
            </span>
            <svg viewBox={`0 0 ${width / 2} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
              {renderStructure(auxStructs[0], width / 2, height)}
            </svg>
          </div>
        </div>
      );
    }

    // RENDER: TOP/BOTTOM DASHBOARD (Bucket Sort, Sliding Window, Sparse Matrix)
    if (isDashboard) {
      const graphStruct = auxStructs.find(s => s.type === 'graph');
      let graphViewBoxHeight = 400; 
      
      if (graphStruct && graphStruct.type === 'graph') {
        const maxY = Math.max(...graphStruct.nodes.map(n => n.y || 0), 0);
        graphViewBoxHeight = Math.max(400, maxY + 100);
      }

      return (
        <div className="w-full h-full flex flex-col gap-4 p-4">
          <div className="flex-none h-[140px] bg-slate-50/20 rounded-xl border border-slate-200/50 relative shadow-sm overflow-hidden">
            <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm z-10">
              {structures[0].id}
            </span>
            <div className="w-full h-full p-4 pt-10"> 
              <svg viewBox="0 0 800 120" preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
                {renderStructure(structures[0], 800, 120)}
              </svg>
            </div>
          </div>

          {graphStruct ? (
            <div className="flex-1 bg-slate-50/10 rounded-lg border border-slate-200 relative min-h-[350px] shadow-inner">
              <span className="absolute top-3 left-3 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm z-10">
                {graphStruct.id}
              </span>
              <svg width="100%" height={graphViewBoxHeight} viewBox={`0 0 800 ${graphViewBoxHeight}`} preserveAspectRatio="xMidYMin meet" className="overflow-visible block">
                {renderStructure(graphStruct, 800, graphViewBoxHeight)}
              </svg>
            </div>
          ) : (
            <div className={`flex-1 grid ${auxStructs.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-4 min-h-[160px]`}>
              {auxStructs.map((struct, i) => {
                const isNumberArray = struct.type === 'array' && typeof struct.data[0] === 'number';
                const colors = ['fill-blue-500', 'fill-indigo-500', 'fill-violet-500', 'fill-purple-500', 'fill-fuchsia-500'];
                const bucketColor = isNumberArray ? colors[i % colors.length] : undefined;

                return (
                  <div key={struct.id} className="bg-slate-50/10 rounded-lg border border-slate-200 relative flex flex-col p-2">
                    <span className="absolute top-2 left-2 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded z-10 border border-slate-250/20 shadow-xs">
                      {struct.id}
                    </span>
                    <div className="flex-1 w-full h-full pt-6">
                      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
                        {renderStructure(struct, 400, 120, bucketColor)}
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // RENDER: SINGLE STRUCTURE (Default)

    return (
      <div className="w-full h-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible w-full h-full">
          {renderStructure(structures[0], width, height)}
        </svg>
      </div>
    );
  };

  const variables = state?.context?.variables || {};
  const hasFormula = !!variables.formulaTemplate || !!variables.formulaEquation;
  const hasGreedy = !!variables.greedyCandidates;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Global SVG Glow Filter Definitions */}
      <svg width="0" height="0" className="absolute pointer-events-none" style={{ position: 'absolute' }}>
        <defs>
          <filter id="glow-primary" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-success" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-accent" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      <div className={cn("w-full transition-all duration-300", (hasFormula || hasGreedy) ? "h-[68%]" : "h-full")}>
        {renderContent()}
      </div>

      {(hasFormula || hasGreedy) && (
        <div className="h-[32%] border-t border-slate-200/50 bg-white/60 backdrop-blur-md p-4 flex flex-col justify-center gap-3 overflow-hidden shadow-inner select-none">
          {hasFormula && (
            <div className="space-y-1.5 text-center">
              <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
                Recurrence Solver
              </span>
              <div className="font-mono text-xs text-slate-400 font-medium">
                Template: <code className="bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">{String(variables.formulaTemplate)}</code>
              </div>
              <div className="font-mono text-sm md:text-base text-indigo-600 font-extrabold tracking-tight mt-1">
                Equation: {String(variables.formulaEquation)}
              </div>
              {variables.formulaResult !== undefined && (
                <div className="font-mono text-xs text-slate-500 font-bold">
                  Result: <span className="text-emerald-600 font-black">{String(variables.formulaResult)}</span>
                </div>
              )}
            </div>
          )}

          {hasGreedy && Array.isArray(variables.greedyCandidates) && (
            <div className="space-y-1.5 text-center w-full">
              <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
                Greedy Heuristic Pool
              </span>
              <div className="flex justify-center gap-3 mt-1 overflow-x-auto py-1 w-full">
                {variables.greedyCandidates.map((cand: { id: string; ratio: string | number; state?: 'default' | 'active' | 'chosen' }, idx: number) => {
                  const isActive = cand.state === 'active';
                  const isChosen = cand.state === 'chosen';
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "font-mono text-[10px] border px-3 py-1.5 rounded-lg flex flex-col items-center gap-0.5 min-w-[80px] transition-all duration-150 shadow-xs",
                        isChosen ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold scale-105" :
                        isActive ? "bg-amber-50 border-amber-500 text-amber-800 font-bold scale-105" :
                        "bg-white border-slate-200 text-slate-500"
                      )}
                    >
                      <span className="font-bold">{cand.id}</span>
                      <span className="text-[9px] opacity-70">Ratio: {cand.ratio}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};