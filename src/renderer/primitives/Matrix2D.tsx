import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface Matrix2DProps {
  data: (number | string)[][];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
  rowHeaders?: string[];
  colHeaders?: string[];
  tracebackPaths?: { r: number; c: number }[];
}

const getEventTypeOfCell = (r: number, c: number, colsCount: number, activeEvents: AlgoEvent[]): 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write' => {
  const flatIndex = r * colsCount + c;
  for (const event of activeEvents) {
    if (event.indices?.includes(flatIndex)) {
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
        return { rect: 'fill-white stroke-slate-200 stroke-[1.5px]', text: 'fill-slate-700 font-medium' };
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
        return { rect: 'fill-white stroke-indigo-500 stroke-[1.5px]', text: 'fill-slate-800 font-semibold' };
      case 'compare':
        return { rect: 'fill-amber-50 stroke-amber-500 stroke-[1.5px]', text: 'fill-amber-800 font-bold' };
      case 'swap':
        return { rect: 'fill-red-50 stroke-red-500 stroke-[1.5px]', text: 'fill-red-800 font-bold' };
      case 'visit':
      case 'write':
        return { rect: 'fill-purple-50 stroke-purple-500 stroke-[1.5px]', text: 'fill-purple-800 font-bold' };
      case 'lock':
        return { rect: 'fill-emerald-50 stroke-emerald-500 stroke-[1.5px]', text: 'fill-emerald-800 font-bold' };
    }
  }
};

const getGlowFilter = (type: string, nodeStyle: string) => {
  if (nodeStyle !== 'neon') return undefined;
  if (type === 'compare') return 'url(#glow-accent)';
  if (type === 'swap') return 'url(#glow-accent)';
  if (type === 'visit' || type === 'write' || type === 'lock') return 'url(#glow-success)';
  return 'url(#glow-primary)';
};

export const Matrix2D: React.FC<Matrix2DProps> = ({
  data,
  activeEvents,
  width,
  height,
  rowHeaders,
  colHeaders,
  tracebackPaths,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const rows = data.length;
  const cols = data[0]?.length || 0;
  if (rows === 0 || cols === 0) return null;

  const headerSize = 28; 
  const gap = 4;

  const maxCellWidth = (width - headerSize - gap * (cols - 1)) / cols;
  const maxCellHeight = (height - headerSize - gap * (rows - 1)) / rows;
  const cellSize = Math.min(Math.min(maxCellWidth, maxCellHeight), 60);

  const totalGridWidth = cols * cellSize + (cols - 1) * gap;
  const totalGridHeight = rows * cellSize + (rows - 1) * gap;

  const startX = headerSize + (width - headerSize - totalGridWidth) / 2;
  const startY = headerSize + (height - headerSize - totalGridHeight) / 2;

  return (
    <g className="transition-all duration-300">
      <defs>
        <marker 
          id="matrix-path-arrow" 
          viewBox="0 0 10 10" 
          refX="6" 
          refY="5" 
          markerWidth="5" 
          markerHeight="5" 
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
        </marker>
      </defs>

      {/* Column Headers */}
      {Array.from({ length: cols }).map((_, c) => (
        <text
          key={`col-${c}`}
          x={startX + c * (cellSize + gap) + cellSize / 2}
          y={startY - 10}
          textAnchor="middle"
          className="fill-algo-muted font-mono text-[10px] font-bold select-none"
        >
          {colHeaders?.[c] ?? c}
        </text>
      ))}

      {/* Row Headers & Grid Cells */}
      {data.map((row, r) => (
        <g key={`row-${r}`}>
          {/* Row Header */}
          <text
            x={startX - 12}
            y={startY + r * (cellSize + gap) + cellSize / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-algo-muted font-mono text-[10px] font-bold select-none"
          >
            {rowHeaders?.[r] ?? r}
          </text>

          {row.map((val, c) => {
            const eventType = getEventTypeOfCell(r, c, cols, activeEvents);
            const style = getNodeStyleClasses(eventType, nodeStyle);
            const x = startX + c * (cellSize + gap);
            const y = startY + r * (cellSize + gap);

            return (
              <g key={`cell-${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={6}
                  className={cn("transition-all duration-150", style.rect)}
                  filter={getGlowFilter(eventType, nodeStyle)}
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn("font-mono font-bold select-none", style.text)}
                  style={{ fontSize: `${cellSize * 0.35}px` }}
                >
                  {val === Infinity || val === 'Infinity' ? '∞' : val}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      {/* Traceback path overlay lines */}
      {tracebackPaths && tracebackPaths.length > 1 && (
        <g className="traceback-paths">
          {tracebackPaths.slice(0, -1).map((p1, idx) => {
            const p2 = tracebackPaths[idx + 1];
            
            // Calculate cell center points
            const cx1 = startX + p1.c * (cellSize + gap) + cellSize / 2;
            const cy1 = startY + p1.r * (cellSize + gap) + cellSize / 2;
            const cx2 = startX + p2.c * (cellSize + gap) + cellSize / 2;
            const cy2 = startY + p2.r * (cellSize + gap) + cellSize / 2;

            // Draw line from cell center 1 to cell center 2
            return (
              <line
                key={`path-line-${idx}`}
                x1={cx1}
                y1={cy1}
                x2={cx2}
                y2={cy2}
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                markerEnd="url(#matrix-path-arrow)"
                className="opacity-80 animate-pulse"
              />
            );
          })}
        </g>
      )}
    </g>
  );
};
