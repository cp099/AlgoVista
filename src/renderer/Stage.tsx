import React from 'react';
import { AlgoState, AlgoEvent, DataStructure } from '@core/types';
import { Array1D } from './primitives/Array1D';
import { GraphNetwork } from './primitives/GraphNetwork';
import { Matrix2D } from './primitives/Matrix2D';
import { StackVisualizer, QueueVisualizer } from './primitives/StackQueue';

interface StageProps {
  state: AlgoState | null;
  lastEvents: AlgoEvent[];
  width?: number;
  height?: number;
}

export const Stage: React.FC<StageProps> = ({ state, lastEvents, width = 800, height = 400 }) => {
  if (!state) return <div className="text-algo-muted">No State Loaded</div>;

  const structures = Object.values(state.structures);
  
  // --- RENDER HELPER ---
  const renderStructure = (struct: DataStructure, w: number, h: number, colorOverride?: string) => {
    if (struct.type === 'array') {
        return <Array1D 
            data={struct.data} 
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
            orientation={struct.orientation}
            visualMode={struct.visualMode}
        />;
    }
    if (struct.type === 'graph') {
        return <GraphNetwork
            id={struct.id}
            nodes={struct.nodes}
            edges={struct.edges}
            activeEvents={lastEvents}
            width={w}
            height={h}
        />;
    }
    if (struct.type === 'matrix') {
        return <Matrix2D
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
        />;
    }
    if (struct.type === 'stack') {
        return <StackVisualizer
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
        />;
    }
    if (struct.type === 'queue') {
        return <QueueVisualizer
            data={struct.data}
            activeEvents={lastEvents.filter(e => e.targetIds.includes(struct.id))}
            width={w}
            height={h}
            baseColor={struct.baseColor || colorOverride}
        />;
    }
    return null;
  };

  // --- LAYOUT DETECTION ---
  const mainGraph = structures.find(s => s.type === 'graph');
  const mainArray = structures.length > 0 && structures[0].type === 'array' ? structures[0] : null;
  const auxStructs = mainGraph ? structures.filter(s => s.id !== mainGraph.id) : structures.slice(1);
  
  const isVerticalSplit = !!mainGraph && auxStructs.length > 0 && auxStructs.every(s => s.type === 'array');
  const isDualStack = auxStructs.length === 1 && 
                      mainArray?.orientation === 'vertical' &&
                      auxStructs[0].type === 'array' && auxStructs[0].orientation === 'vertical';
  const isDashboard = auxStructs.length > 0 && !isDualStack && !isVerticalSplit;

  // --- RENDER LOGIC ---

  // RENDER: VERTICAL SPLIT (Graph on Left, Aux on Right)
  if (isVerticalSplit) {
      return (
        <div className="w-full h-full flex gap-4 p-4">
            <div className="flex-[4] bg-algo-bg/50 rounded-xl border border-algo-border relative shadow-sm overflow-hidden">
                 <span className="absolute top-3 left-3 text-xs font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface border border-algo-border px-3 py-1 rounded-full shadow-sm z-10">
                    {mainGraph.id}
                </span>
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
                    {renderStructure(mainGraph, width, height)}
                </svg>
            </div>
            
            {auxStructs.length > 0 && (
                <div className="flex-1 bg-algo-bg/30 rounded-lg border border-algo-border p-4 space-y-4 overflow-y-auto">
                    {auxStructs.map(aux => (
                        <div key={aux.id}>
                            <h3 className="text-xs font-mono font-bold text-algo-muted uppercase tracking-wider mb-2">{aux.id}</h3>
                            {aux.type === 'array' && (
                                <div className="space-y-1">
                                    {aux.data.map((item, i) => (
                                        <div key={i} className="bg-algo-surface border border-algo-border rounded px-3 py-2 text-sm font-mono text-algo-text">
                                            {String(item)}
                                        </div>
                                    ))}
                                    {aux.data.length === 0 && (
                                        <div className="text-xs text-algo-muted italic p-2">Empty</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      );
  }

  // RENDER: DUAL STACK (Min Stack)
  if (isDualStack) {
      return (
        <div className="w-full h-full flex items-center justify-around gap-8 p-4">
            <div className="w-1/2 h-full relative overflow-hidden">
                 <span className="absolute top-0 left-0 text-xs font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface px-2 py-1 rounded">
                    {mainArray!.id}
                </span>
                <svg viewBox={`0 0 ${width / 2} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
                    {renderStructure(mainArray!, width / 2, height)}
                </svg>
            </div>
            <div className="w-1/2 h-full relative overflow-hidden">
                 <span className="absolute top-0 left-0 text-xs font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface px-2 py-1 rounded">
                    {auxStructs[0].id}
                </span>
                <svg viewBox={`0 0 ${width / 2} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
                    {renderStructure(auxStructs[0], width / 2, height)}
                </svg>
            </div>
        </div>
      );
  }

  // RENDER: TOP/BOTTOM DASHBOARD (Bucket Sort, Tree Sort, String Search)
  if (isDashboard) {
      const graphStruct = auxStructs.find(s => s.type === 'graph');
      let graphViewBoxHeight = 400; 
      
      if (graphStruct && graphStruct.type === 'graph') {
          const maxY = Math.max(...graphStruct.nodes.map(n => n.y || 0), 0);
          graphViewBoxHeight = Math.max(400, maxY + 100);
      }

      return (
        <div className="w-full h-full flex flex-col gap-4 p-4">
            <div className="flex-none h-[160px] bg-algo-bg/50 rounded-xl border border-algo-border relative shadow-sm overflow-hidden">
                <span className="absolute top-3 left-3 text-xs font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface border border-algo-border px-3 py-1 rounded-full shadow-sm z-10">
                    {structures[0].id}
                </span>
                <div className="w-full h-full p-4 pt-10"> 
                    <svg viewBox="0 0 800 120" preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible">
                        {renderStructure(structures[0], 800, 120)}
                    </svg>
                </div>
            </div>

            {graphStruct ? (
                <div className="flex-1 bg-algo-bg/30 rounded-lg border border-algo-border relative min-h-[350px] shadow-inner">
                     <span className="absolute top-3 left-3 text-xs font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface border border-algo-border px-3 py-1 rounded-full shadow-sm z-10">
                        {graphStruct.id}
                    </span>
                    <svg width="100%" height={graphViewBoxHeight} viewBox={`0 0 800 ${graphViewBoxHeight}`} preserveAspectRatio="xMidYMin meet" className="overflow-visible block">
                        {renderStructure(graphStruct, 800, graphViewBoxHeight)}
                    </svg>
                </div>
            ) : (
                <div className={`flex-1 grid ${auxStructs.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-4 min-h-[180px]`}>
                    {auxStructs.map((struct, i) => {
                        const isNumberArray = struct.type === 'array' && typeof struct.data[0] === 'number';
                        const colors = ['fill-blue-500', 'fill-indigo-500', 'fill-violet-500', 'fill-purple-500', 'fill-fuchsia-500'];
                        const bucketColor = isNumberArray ? colors[i % colors.length] : undefined;

                        return (
                            <div key={struct.id} className="bg-algo-bg/30 rounded-lg border border-algo-border relative flex flex-col p-2">
                                <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-algo-muted uppercase tracking-wider bg-algo-surface px-1.5 py-0.5 rounded z-10 border border-algo-border shadow-sm">
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