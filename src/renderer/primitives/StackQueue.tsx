import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface StackProps {
  data: any[];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
}

export const StackVisualizer: React.FC<StackProps> = ({
  data,
  activeEvents,
  width,
  height,
  baseColor,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const boxHeight = Math.min(45, (height - 60) / Math.max(len, 5));
  const boxWidth = Math.min(140, width * 0.6);
  const gap = 3;
  const startX = (width - boxWidth) / 2;
  const startY = height - 20; // Start drawing from the bottom

  const getElementColorClass = (idx: number) => {
    for (const event of activeEvents) {
      if (event.indices?.includes(idx)) {
        if (event.type === 'compare') return 'fill-algo-accent stroke-algo-accent text-white';
        if (event.type === 'write') return 'fill-purple-500 stroke-purple-500 text-white';
        if (event.type === 'visit') return 'fill-blue-500 stroke-blue-500 text-white';
      }
    }
    return baseColor || 'fill-algo-surface stroke-algo-primary text-algo-text';
  };

  return (
    <g className="transition-all duration-300">
      {/* Draw Stack Container Glass Cup */}
      <path
        d={`M ${startX - 10} 20 L ${startX - 10} ${startY + 5} L ${startX + boxWidth + 10} ${startY + 5} L ${startX + boxWidth + 10} 20`}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '4' : '3'}
        className="opacity-70 stroke-algo-border"
      />

      {data.map((val, i) => {
        const y = startY - (i + 1) * (boxHeight + gap);
        const colorClass = getElementColorClass(i);
        const isDefault = colorClass.includes('fill-algo-surface');
        const isActive = !isDefault;

        return (
          <g key={`stack-${i}`} transform={`translate(${startX}, ${y})`}>
            <rect
              width={boxWidth}
              height={boxHeight}
              rx={6}
              className={cn(
                "transition-all duration-150", 
                nodeStyle === 'contrast' ? "stroke-[3px]" : "stroke-2",
                nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_4px_rgba(99,102,241,0.25)]",
                colorClass
              )}
            />
            <text
              x={boxWidth / 2}
              y={boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono font-bold select-none", isDefault ? "fill-algo-text" : "fill-white")}
              style={{ fontSize: `${boxHeight * 0.4}px` }}
            >
              {String(val)}
            </text>
            {i === len - 1 && (
              <text
                x={boxWidth + 20}
                y={boxHeight / 2}
                dominantBaseline="middle"
                className="fill-algo-accent text-xs font-mono font-bold"
              >
                TOP
              </text>
            )}
          </g>
        );
      })}

      {len === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          className="fill-algo-muted font-mono italic text-sm"
        >
          Stack Empty
        </text>
      )}
    </g>
  );
};

interface QueueProps {
  data: any[];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
}

export const QueueVisualizer: React.FC<QueueProps> = ({
  data,
  activeEvents,
  width,
  height,
  baseColor,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const boxWidth = Math.min(50, (width - 60) / Math.max(len, 6));
  const boxHeight = Math.min(60, height * 0.4);
  const gap = 4;
  const startY = (height - boxHeight) / 2;

  // Center the queue horizontally
  const totalWidth = len * (boxWidth + gap) - gap;
  const startX = Math.max(30, (width - totalWidth) / 2);

  const getElementColorClass = (idx: number) => {
    for (const event of activeEvents) {
      if (event.indices?.includes(idx)) {
        if (event.type === 'compare') return 'fill-algo-accent stroke-algo-accent text-white';
        if (event.type === 'write') return 'fill-purple-500 stroke-purple-500 text-white';
        if (event.type === 'visit') return 'fill-blue-500 stroke-blue-500 text-white';
      }
    }
    return baseColor || 'fill-algo-surface stroke-algo-primary text-algo-text';
  };

  return (
    <g className="transition-all duration-300">
      {/* Draw Queue Track Borders (top and bottom horizontal lines) */}
      <line
        x1={10}
        y1={startY - 10}
        x2={width - 10}
        y2={startY - 10}
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '4' : '3'}
        className="opacity-70 stroke-algo-border"
      />
      <line
        x1={10}
        y1={startY + boxHeight + 10}
        x2={width - 10}
        y2={startY + boxHeight + 10}
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '4' : '3'}
        className="opacity-70 stroke-algo-border"
      />

      {data.map((val, i) => {
        // Queue visual flows left-to-right (0 is front of queue, on the left)
        const x = startX + i * (boxWidth + gap);
        const colorClass = getElementColorClass(i);
        const isDefault = colorClass.includes('fill-algo-surface');
        const isActive = !isDefault;

        return (
          <g key={`queue-${i}`} transform={`translate(${x}, ${startY})`}>
            <rect
              width={boxWidth}
              height={boxHeight}
              rx={6}
              className={cn(
                "transition-all duration-150", 
                nodeStyle === 'contrast' ? "stroke-[3px]" : "stroke-2",
                nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_4px_rgba(99,102,241,0.25)]",
                colorClass
              )}
            />
            <text
              x={boxWidth / 2}
              y={boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono font-bold select-none", isDefault ? "fill-algo-text" : "fill-white")}
              style={{ fontSize: `${boxHeight * 0.35}px` }}
            >
              {String(val)}
            </text>
            
            {/* Front & Rear Labels */}
            {i === 0 && (
              <text
                x={boxWidth / 2}
                y={boxHeight + 25}
                textAnchor="middle"
                className="fill-algo-accent text-xs font-mono font-bold"
              >
                FRONT
              </text>
            )}
            {i === len - 1 && (
              <text
                x={boxWidth / 2}
                y={-20}
                textAnchor="middle"
                className="fill-algo-primary text-xs font-mono font-bold"
              >
                REAR
              </text>
            )}
          </g>
        );
      })}

      {len === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          className="fill-algo-muted font-mono italic text-sm"
        >
          Queue Empty
        </text>
      )}
    </g>
  );
};
