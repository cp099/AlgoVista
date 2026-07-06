import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface StringMatchVisualizerProps {
  textData: (number | string)[];
  patternData: (number | string)[];
  activeEvents: AlgoEvent[];
  variables: Record<string, unknown>;
  width: number;
  height: number;
}

const getEventTypeOfIndex = (structId: string, index: number, activeEvents: AlgoEvent[]): 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write' => {
  for (const event of activeEvents) {
    if (event.targetIds.includes(structId) && event.indices?.includes(index)) {
      if (event.type === 'compare') return 'compare';
      if (event.type === 'swap') return 'swap';
      if (event.type === 'visit') return 'visit';
      if (event.type === 'lock') return 'lock';
      if (event.type === 'write') return 'write';
    }
  }
  return 'default';
};

const getNodeStyleClasses = (type: 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write', nodeStyle: string) => {
  if (nodeStyle === 'contrast') {
    switch (type) {
      case 'default':
        return { rect: 'fill-white stroke-slate-900 stroke-[3px]', text: 'fill-slate-900 font-extrabold' };
      default:
        return { rect: 'fill-slate-900 stroke-slate-900 stroke-[3px]', text: 'fill-white font-extrabold' };
    }
  } else if (nodeStyle === 'slate') {
    switch (type) {
      case 'default':
        return { rect: 'fill-slate-50 stroke-slate-200 stroke-[1.5px]', text: 'fill-slate-700 font-medium' };
      case 'compare':
        return { rect: 'fill-amber-50 stroke-amber-500 stroke-[1.5px]', text: 'fill-amber-800 font-semibold' };
      case 'swap':
        return { rect: 'fill-red-50 stroke-red-500 stroke-[1.5px]', text: 'fill-red-800 font-semibold' };
      case 'visit':
      case 'write':
        return { rect: 'fill-purple-50 stroke-purple-500 stroke-[1.5px]', text: 'fill-purple-800 font-semibold' };
      case 'lock':
        return { rect: 'fill-emerald-50 stroke-emerald-500 stroke-[1.5px]', text: 'fill-emerald-800 font-semibold' };
    }
  } else {
    // neon
    switch (type) {
      case 'default':
        return { rect: 'fill-algo-surface stroke-algo-primary stroke-[1.5px]', text: 'fill-algo-text font-semibold' };
      case 'compare':
        return { rect: 'fill-algo-accent/15 stroke-algo-accent stroke-[1.5px]', text: 'fill-algo-accent font-bold' };
      case 'swap':
        return { rect: 'fill-red-500/15 stroke-red-500 stroke-[1.5px]', text: 'fill-red-500 font-bold' };
      case 'visit':
      case 'write':
        return { rect: 'fill-purple-500/15 stroke-purple-500 stroke-[1.5px]', text: 'fill-purple-400 font-bold' };
      case 'lock':
        return { rect: 'fill-algo-success/15 stroke-algo-success stroke-[1.5px]', text: 'fill-algo-success font-bold' };
    }
  }
};

export const StringMatchVisualizer: React.FC<StringMatchVisualizerProps> = ({
  textData,
  patternData,
  activeEvents,
  variables,
  width,
  height,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const n = textData.length;

  const cellSize = 36;
  const gap = 3;
  
  // Align Text row in the center of the canvas widthwise
  const textWidth = n * (cellSize + gap) - gap;
  const startX = Math.max(30, (width - textWidth) / 2);
  const startY = (height - (cellSize * 2 + 50)) / 2;

  // Retrieve current shift index from variables (defaults to 0)
  const shiftIndex = (typeof variables['i'] === 'number') ? variables['i'] : 0;

  return (
    <g className="transition-all duration-300">
      
      {/* 1. Render Text Row */}
      <g transform={`translate(${startX}, ${startY})`}>
        <text
          x={-15}
          y={cellSize / 2 + 1}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-slate-400 font-bold text-[10px] uppercase tracking-wider"
        >
          TEXT:
        </text>

        {textData.map((char, idx) => {
          const eventType = getEventTypeOfIndex('Text', idx, activeEvents);
          const style = getNodeStyleClasses(eventType, nodeStyle);
          const x = idx * (cellSize + gap);

          return (
            <g key={`text-${idx}`} transform={`translate(${x}, 0)`}>
              <rect
                width={cellSize}
                height={cellSize}
                rx={6}
                className={cn("transition-all duration-150", style.rect)}
              />
              <text
                x={cellSize / 2}
                y={cellSize / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn("font-mono font-bold select-none text-sm", style.text)}
              >
                {String(char)}
              </text>
              <text
                x={cellSize / 2}
                y={-8}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[9px]"
              >
                {idx}
              </text>
            </g>
          );
        })}
      </g>

      {/* 2. Render Sliding Pattern Row */}
      {/* Shift is based on variables.i */}
      <g transform={`translate(${startX + shiftIndex * (cellSize + gap)}, ${startY + cellSize + 40})`}>
        
        {/* Fixed label pointing to pattern */}
        <text
          x={-15}
          y={cellSize / 2 + 1}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-indigo-500 font-bold text-[10px] uppercase tracking-wider"
        >
          PATTERN:
        </text>

        {patternData.map((char, idx) => {
          const eventType = getEventTypeOfIndex('Pattern', idx, activeEvents);
          const style = getNodeStyleClasses(eventType, nodeStyle);
          const x = idx * (cellSize + gap);

          return (
            <g key={`pat-${idx}`} transform={`translate(${x}, 0)`}>
              <rect
                width={cellSize}
                height={cellSize}
                rx={6}
                className={cn("transition-all duration-150", style.rect)}
              />
              <text
                x={cellSize / 2}
                y={cellSize / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn("font-mono font-bold select-none text-sm", style.text)}
              >
                {String(char)}
              </text>
              <text
                x={cellSize / 2}
                y={cellSize + 12}
                textAnchor="middle"
                className="fill-slate-450 font-mono text-[9px]"
              >
                {idx}
              </text>
            </g>
          );
        })}
      </g>

      {/* Dynamic Slide alignment markers / comparison guides */}
      {(() => {
        const jVal = variables['j'];
        if (typeof jVal === 'number') {
          return (
            <g transform={`translate(${startX + (shiftIndex + jVal) * (cellSize + gap) + cellSize / 2}, ${startY + cellSize})`}>
              <line
                x1={0}
                y1={2}
                x2={0}
                y2={38}
                stroke="#ff9500"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <circle cx={0} cy={20} r={3} fill="#ff9500" />
            </g>
          );
        }
        return null;
      })()}

    </g>
  );
};
