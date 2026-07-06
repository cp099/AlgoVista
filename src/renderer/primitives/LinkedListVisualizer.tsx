import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface LinkedListVisualizerProps {
  data: (number | string)[];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
  isCircular?: boolean;
  isDoubly?: boolean;
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
        return { 
          rect: 'fill-white stroke-slate-900 stroke-[3px]', 
          divider: 'stroke-slate-900 stroke-[2px]', 
          text: 'fill-slate-900 font-extrabold', 
          dot: 'fill-slate-900' 
        };
      default:
        return { 
          rect: 'fill-slate-900 stroke-slate-900 stroke-[3px]', 
          divider: 'stroke-white stroke-[2px]', 
          text: 'fill-white font-extrabold', 
          dot: 'fill-white' 
        };
    }
  } else if (nodeStyle === 'slate') {
    switch (type) {
      case 'default':
        return { 
          rect: 'fill-slate-50 stroke-slate-200 stroke-[1.5px]', 
          divider: 'stroke-slate-200 stroke-[1px]', 
          text: 'fill-slate-700 font-medium', 
          dot: 'fill-slate-400' 
        };
      case 'compare':
        return { 
          rect: 'fill-amber-50 stroke-amber-500 stroke-[1.5px]', 
          divider: 'stroke-amber-300 stroke-[1px]', 
          text: 'fill-amber-800 font-semibold', 
          dot: 'fill-amber-500' 
        };
      case 'swap':
        return { 
          rect: 'fill-red-50 stroke-red-500 stroke-[1.5px]', 
          divider: 'stroke-red-300 stroke-[1px]', 
          text: 'fill-red-800 font-semibold', 
          dot: 'fill-red-500' 
        };
      case 'visit':
      case 'write':
        return { 
          rect: 'fill-purple-50 stroke-purple-500 stroke-[1.5px]', 
          divider: 'stroke-purple-300 stroke-[1px]', 
          text: 'fill-purple-800 font-semibold', 
          dot: 'fill-purple-500' 
        };
      case 'lock':
        return { 
          rect: 'fill-emerald-50 stroke-emerald-500 stroke-[1.5px]', 
          divider: 'stroke-emerald-300 stroke-[1px]', 
          text: 'fill-emerald-800 font-semibold', 
          dot: 'fill-emerald-500' 
        };
    }
  } else {
    // neon
    switch (type) {
      case 'default':
        return { 
          rect: 'fill-algo-surface stroke-algo-primary stroke-[1.5px]', 
          divider: 'stroke-algo-border stroke-[1px]', 
          text: 'fill-algo-text font-semibold', 
          dot: 'fill-algo-primary' 
        };
      case 'compare':
        return { 
          rect: 'fill-algo-accent/15 stroke-algo-accent stroke-[1.5px]', 
          divider: 'stroke-algo-accent/45 stroke-[1px]', 
          text: 'fill-algo-accent font-bold', 
          dot: 'fill-algo-accent' 
        };
      case 'swap':
        return { 
          rect: 'fill-red-500/15 stroke-red-500 stroke-[1.5px]', 
          divider: 'stroke-red-500/45 stroke-[1px]', 
          text: 'fill-red-500 font-bold', 
          dot: 'fill-red-500' 
        };
      case 'visit':
      case 'write':
        return { 
          rect: 'fill-purple-500/15 stroke-purple-500 stroke-[1.5px]', 
          divider: 'stroke-purple-500/45 stroke-[1px]', 
          text: 'fill-purple-400 font-bold', 
          dot: 'fill-purple-400' 
        };
      case 'lock':
        return { 
          rect: 'fill-algo-success/15 stroke-algo-success stroke-[1.5px]', 
          divider: 'stroke-algo-success/45 stroke-[1px]', 
          text: 'fill-algo-success font-bold', 
          dot: 'fill-algo-success' 
        };
    }
  }
};

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  data,
  activeEvents,
  width,
  height,
  isCircular = false,
  isDoubly = false,
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  
  const nodeWidth = 60;
  const nodeHeight = 36;
  const nextWidth = 20; // width of the next compartment
  const totalNodeWidth = nodeWidth + nextWidth;
  const gap = 30; // horizontal space between nodes
  
  // Center alignment logic
  const totalWidth = len * (totalNodeWidth + gap) - gap;
  const startX = Math.max(30, (width - totalWidth) / 2);
  const startY = (height - nodeHeight) / 2;

  return (
    <g className="transition-all duration-300">
      
      {/* Arrow Marker definitions */}
      <defs>
        <marker
          id="arrow-marker"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 2 L 8 5 L 0 8 z" fill={nodeStyle === 'contrast' ? '#0f172a' : '#94a3b8'} />
        </marker>
        <marker
          id="arrow-marker-active"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 2 L 8 5 L 0 8 z" fill="#4f46e5" />
        </marker>
      </defs>

      {/* Render Nodes */}
      {data.map((val, i) => {
        const x = startX + i * (totalNodeWidth + gap);
        const eventType = getEventTypeOfIndex(i, activeEvents);
        const style = getNodeStyleClasses(eventType, nodeStyle);

        return (
          <g key={`node-${i}`} transform={`translate(${x}, ${startY})`}>
            
            {/* Main Outer Box */}
            <rect
              width={totalNodeWidth}
              height={nodeHeight}
              rx={6}
              className={cn("transition-all duration-150", style.rect)}
            />
            
            {/* Compartment Divider */}
            <line
              x1={nodeWidth}
              y1={0}
              x2={nodeWidth}
              y2={nodeHeight}
              className={style.divider}
            />

            {/* Value Text */}
            <text
              x={nodeWidth / 2}
              y={nodeHeight / 2 + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn("font-mono font-bold select-none text-xs", style.text)}
            >
              {String(val)}
            </text>

            {/* Pointer Dot */}
            <circle
              cx={nodeWidth + nextWidth / 2}
              cy={nodeHeight / 2}
              r={3}
              className={style.dot}
            />

            {/* Index label below */}
            <text
              x={totalNodeWidth / 2}
              y={nodeHeight + 16}
              textAnchor="middle"
              className="fill-slate-400 font-mono text-[9px] font-semibold"
            >
              idx: {i}
            </text>
            
            {/* HEAD indicator */}
            {i === 0 && (
              <text
                x={totalNodeWidth / 2}
                y={-10}
                textAnchor="middle"
                className="fill-indigo-500 font-semibold text-[9px] uppercase tracking-wider"
              >
                HEAD
              </text>
            )}

            {/* TAIL indicator */}
            {i === len - 1 && !isCircular && (
              <text
                x={totalNodeWidth / 2}
                y={-10}
                textAnchor="middle"
                className="fill-slate-400 font-semibold text-[9px] uppercase tracking-wider"
              >
                TAIL
              </text>
            )}
          </g>
        );
      })}

      {/* Render Forward Arrows (→) */}
      {data.map((_, i) => {
        if (i === len - 1) return null;
        
        const fromX = startX + i * (totalNodeWidth + gap) + totalNodeWidth;
        const fromY = startY + nodeHeight / 2;
        const toX = startX + (i + 1) * (totalNodeWidth + gap);
        const toY = startY + nodeHeight / 2;
        
        const nextEvent = getEventTypeOfIndex(i + 1, activeEvents);
        const isActive = nextEvent !== 'default';

        if (isDoubly) {
          // Doubly linked: Draw top forward arrow, bottom return arrow
          return (
            <g key={`arrow-${i}`}>
              {/* Forward Arrow */}
              <path
                d={`M ${fromX} ${fromY - 4} L ${toX - 2} ${toY - 4}`}
                fill="none"
                stroke={isActive ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={1.5}
                markerEnd={isActive ? 'url(#arrow-marker-active)' : 'url(#arrow-marker)'}
              />
              {/* Return Arrow */}
              <path
                d={`M ${toX} ${toY + 4} L ${fromX + 2} ${fromY + 4}`}
                fill="none"
                stroke={isActive ? '#4f46e5' : '#cbd5e1'}
                strokeWidth={1.5}
                markerEnd={isActive ? 'url(#arrow-marker-active)' : 'url(#arrow-marker)'}
              />
            </g>
          );
        }

        // Singly linked arrow
        return (
          <line
            key={`arrow-${i}`}
            x1={fromX}
            y1={fromY}
            x2={toX - 2}
            y2={toY}
            stroke={isActive ? '#4f46e5' : '#cbd5e1'}
            strokeWidth={1.5}
            markerEnd={isActive ? 'url(#arrow-marker-active)' : 'url(#arrow-marker)'}
            className="transition-all duration-300"
          />
        );
      })}

      {/* Circular Return Arrow */}
      {isCircular && len > 0 && (
        <path
          d={`
            M ${startX + (len - 1) * (totalNodeWidth + gap) + totalNodeWidth} ${startY + nodeHeight / 2} 
            C ${startX + (len - 1) * (totalNodeWidth + gap) + totalNodeWidth + 40} ${startY + nodeHeight / 2}, 
              ${startX + (len - 1) * (totalNodeWidth + gap) + totalNodeWidth + 40} ${startY + nodeHeight + 25}, 
              ${startX + (len - 1) * (totalNodeWidth + gap) + totalNodeWidth / 2} ${startY + nodeHeight + 25} 
            L ${startX + totalNodeWidth / 2} ${startY + nodeHeight + 25} 
            C ${startX - 20} ${startY + nodeHeight + 25}, 
              ${startX - 20} ${startY + nodeHeight / 2}, 
              ${startX - 2} ${startY + nodeHeight / 2}
          `}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          markerEnd="url(#arrow-marker)"
          strokeDasharray="4 2"
        />
      )}

      {len === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          className="fill-slate-400 font-mono italic text-xs"
        >
          Linked List Empty
        </text>
      )}

    </g>
  );
};
