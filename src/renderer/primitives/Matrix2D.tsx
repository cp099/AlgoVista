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
}

export const Matrix2D: React.FC<Matrix2DProps> = ({
  data,
  activeEvents,
  width,
  height,
  baseColor,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const rows = data.length;
  const cols = data[0]?.length || 0;
  if (rows === 0 || cols === 0) return null;

  const headerSize = 24; // size for row/col headers
  const gap = 4;

  // Calculate maximum cell size that fits in dimensions
  const maxCellWidth = (width - headerSize - gap * (cols - 1)) / cols;
  const maxCellHeight = (height - headerSize - gap * (rows - 1)) / rows;
  const cellSize = Math.min(Math.min(maxCellWidth, maxCellHeight), 60); // cap size at 60px

  const totalGridWidth = cols * cellSize + (cols - 1) * gap;
  const totalGridHeight = rows * cellSize + (rows - 1) * gap;

  // Center alignment offsets
  const startX = headerSize + (width - headerSize - totalGridWidth) / 2;
  const startY = headerSize + (height - headerSize - totalGridHeight) / 2;

  const getCellColorClass = (r: number, c: number) => {
    const flatIndex = r * cols + c;
    for (const event of activeEvents) {
      if (event.indices?.includes(flatIndex)) {
        if (event.type === 'compare') return 'fill-algo-accent stroke-algo-accent text-white';
        if (event.type === 'write') return 'fill-purple-500 stroke-purple-500 text-white';
        if (event.type === 'visit') return 'fill-blue-500 stroke-blue-500 text-white';
        if (event.type === 'lock') return 'fill-algo-success stroke-algo-success text-white';
      }
    }
    return baseColor || 'fill-algo-surface stroke-algo-border text-algo-text';
  };

  return (
    <g className="transition-all duration-300">
      {/* Column Headers */}
      {Array.from({ length: cols }).map((_, c) => (
        <text
          key={`col-${c}`}
          x={startX + c * (cellSize + gap) + cellSize / 2}
          y={startY - 8}
          textAnchor="middle"
          className="fill-algo-muted font-mono text-xs font-bold select-none"
        >
          {c}
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
            className="fill-algo-muted font-mono text-xs font-bold select-none"
          >
            {r}
          </text>

          {row.map((val, c) => {
            const colorClass = getCellColorClass(r, c);
            const x = startX + c * (cellSize + gap);
            const y = startY + r * (cellSize + gap);
            const isDefaultColor = colorClass.includes('fill-algo-surface');

            return (
              <g key={`cell-${r}-${c}`}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={6}
                  className={cn(
                    "transition-all duration-150", 
                    nodeStyle === 'contrast' ? "stroke-[3px]" : "stroke-2",
                    nodeStyle === 'neon' && !isDefaultColor && "drop-shadow-[0_0_4px_rgba(99,102,241,0.25)]",
                    colorClass
                  )}
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "font-mono font-bold select-none",
                    isDefaultColor ? "fill-algo-text" : "fill-white"
                  )}
                  style={{ fontSize: `${cellSize * 0.35}px` }}
                >
                  {val === Infinity || val === 'Infinity' ? '∞' : val}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};
