import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface StackProps {
  data: unknown[];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
}

const getEventTypeOfIndex = (index: number, activeEvents: AlgoEvent[]): 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write' => {
  for (const event of activeEvents) {
    if (event.indices?.includes(index)) {
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

const getGlowFilter = (type: string, nodeStyle: string) => {
  if (nodeStyle !== 'neon') return undefined;
  if (type === 'compare') return 'url(#glow-accent)';
  if (type === 'swap') return 'url(#glow-accent)';
  if (type === 'visit' || type === 'write' || type === 'lock') return 'url(#glow-success)';
  return 'url(#glow-primary)';
};

export const StackVisualizer: React.FC<StackProps> = ({
  data,
  activeEvents,
  width,
  height,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const boxHeight = Math.min(45, (height - 60) / Math.max(len, 5));
  const boxWidth = Math.min(140, width * 0.6);
  const gap = 3;
  const startX = (width - boxWidth) / 2;
  const startY = height - 20;

  return (
    <g className="transition-all duration-300">
      {/* Draw Stack Container Glass Cup */}
      <path
        d={`M ${startX - 10} 20 L ${startX - 10} ${startY + 5} L ${startX + boxWidth + 10} ${startY + 5} L ${startX + boxWidth + 10} 20`}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '3' : '1.5'}
        className="opacity-70 stroke-algo-border"
      />

      {data.map((val, i) => {
        const y = startY - (i + 1) * (boxHeight + gap);
        const eventType = getEventTypeOfIndex(i, activeEvents);
        const style = getNodeStyleClasses(eventType, nodeStyle);

        return (
          <g key={`stack-${i}`} transform={`translate(${startX}, ${y})`}>
            <rect
              width={boxWidth}
              height={boxHeight}
              rx={6}
              className={cn("transition-all duration-150", style.rect)}
              filter={getGlowFilter(eventType, nodeStyle)}
            />
            <text
              x={boxWidth / 2}
              y={boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono font-bold select-none", style.text)}
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
  data: unknown[];
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
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const boxWidth = Math.min(50, (width - 60) / Math.max(len, 6));
  const boxHeight = Math.min(60, height * 0.4);
  const gap = 4;
  const startY = (height - boxHeight) / 2;

  const totalWidth = len * (boxWidth + gap) - gap;
  const startX = Math.max(30, (width - totalWidth) / 2);

  return (
    <g className="transition-all duration-300">
      {/* Draw Queue Track Borders (top and bottom horizontal lines) */}
      <line
        x1={10}
        y1={startY - 10}
        x2={width - 10}
        y2={startY - 10}
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '3' : '1.5'}
        className="opacity-70 stroke-algo-border"
      />
      <line
        x1={10}
        y1={startY + boxHeight + 10}
        x2={width - 10}
        y2={startY + boxHeight + 10}
        stroke="var(--color-border)"
        strokeWidth={nodeStyle === 'contrast' ? '3' : '1.5'}
        className="opacity-70 stroke-algo-border"
      />

      {data.map((val, i) => {
        const x = startX + i * (boxWidth + gap);
        const eventType = getEventTypeOfIndex(i, activeEvents);
        const style = getNodeStyleClasses(eventType, nodeStyle);

        return (
          <g key={`queue-${i}`} transform={`translate(${x}, ${startY})`}>
            <rect
              width={boxWidth}
              height={boxHeight}
              rx={6}
              className={cn("transition-all duration-150", style.rect)}
              filter={getGlowFilter(eventType, nodeStyle)}
            />
            <text
              x={boxWidth / 2}
              y={boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono font-bold select-none", style.text)}
              style={{ fontSize: `${boxHeight * 0.35}px` }}
            >
              {String(val)}
            </text>
            
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
