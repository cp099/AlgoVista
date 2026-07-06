import React from 'react';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

interface Array1DProps {
  data: (number | string)[]; 
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  baseColor?: string;
  orientation?: 'horizontal' | 'vertical';
  visualMode?: 'bar' | 'box';
  variables?: Record<string, unknown>;
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
      default: // Any active highlight
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
    // neon (glows)
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
  if (type === 'swap') return 'url(#glow-accent)'; // soft warm glow
  if (type === 'visit' || type === 'write' || type === 'lock') return 'url(#glow-success)';
  return 'url(#glow-primary)';
};

export const Array1D: React.FC<Array1DProps> = ({ 
    data, activeEvents, width, height, baseColor, 
    orientation = 'horizontal',
    visualMode,
    variables
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const safeLen = Math.max(len, 1);
  const isCompact = height < 150;
  
  const isStringData = visualMode === 'box' || typeof data[0] === 'string';
  const isLongString = isStringData && data.some(val => typeof val === 'string' && val.length > 1);
  
  const isVertical = orientation === 'vertical';

  // --- Collect pointer variables mapping to index for floating arrows ---
  const pointerTagsByIndex: Record<number, string[]> = {};
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      if (typeof v === 'number' && v >= 0 && v < len) {
        const lowerKey = k.toLowerCase();
        if (['low', 'high', 'mid', 'left', 'right', 'i', 'j', 'pivot', 'p', 'q', 'k', 'front', 'rear', 'head', 'tail'].includes(lowerKey)) {
          if (!pointerTagsByIndex[v]) pointerTagsByIndex[v] = [];
          pointerTagsByIndex[v].push(k);
        }
      }
    });
  }

  // --- VERTICAL STACK MODE ---
  if (isVertical) {
      const boxHeight = 50;
      const gap = 4;
      
      const totalHeight = len * (boxHeight + gap) - gap;
      const startY = (height - totalHeight) / 2;

      return (
        <g className="transition-all duration-300">
            {/* Draw a rounded rect container */}
            <rect 
                x={width/2 - 40} 
                y={startY - 10} 
                width={80} 
                height={totalHeight + 20}
                rx={8}
                fill="none" 
                stroke="currentColor" 
                strokeWidth={nodeStyle === 'contrast' ? '3' : '1.5'} 
                className="text-algo-border opacity-50"
            />

            {data.map((val, i) => {
                const y = startY + (totalHeight - (i + 1) * (boxHeight + gap) + gap);
                const x = width / 2 - 30;
                const eventType = getEventTypeOfIndex(i, activeEvents);
                const style = getNodeStyleClasses(eventType, nodeStyle);

                return (
                    <g key={i} transform={`translate(${x}, ${y})`}>
                        <rect 
                            width={60} 
                            height={boxHeight} 
                            rx={6} 
                            className={cn("transition-all duration-150", style.rect)} 
                            filter={getGlowFilter(eventType, nodeStyle)}
                        />
                        <text x={30} y={30} textAnchor="middle" className={cn("font-mono font-bold text-lg select-none", style.text)}>{val}</text>
                        {i === len - 1 && <text x={90} y={30} className="fill-algo-accent text-xs font-mono font-bold">TOP</text>}
                    </g>
                );
            })}
        </g>
      );
  }

  // --- VERTICAL LIST MODE ---
  if (isLongString) {
      const rowHeight = Math.min(50, height / len);
      const fontSize = Math.min(20, rowHeight * 0.5);
      
      return (
        <g className="transition-all duration-300">
            {data.map((val, i) => {
                const y = i * rowHeight;
                const eventType = getEventTypeOfIndex(i, activeEvents);
                const style = getNodeStyleClasses(eventType, nodeStyle);

                return (
                    <g key={i} transform={`translate(0, ${y})`}>
                        <rect 
                            x={0} 
                            y={0} 
                            width={width} 
                            height={rowHeight - 4} 
                            rx={4} 
                            className={cn("transition-all duration-150", style.rect)} 
                            filter={getGlowFilter(eventType, nodeStyle)}
                        />
                        <text x={20} y={rowHeight / 2 + 5} className={cn("font-mono text-xs opacity-50", style.text)}>{i}</text>
                        <text x={width / 2} y={rowHeight / 2 + 5} textAnchor="middle" className={cn("font-mono font-bold select-none", style.text)} style={{ fontSize: `${fontSize}px` }}>{val}</text>
                    </g>
                );
            })}
        </g>
      );
  }

  // --- HORIZONTAL MODE ---
  const gap = isCompact ? 2 : 4;
  const barWidth = (width - (gap * (safeLen - 1))) / safeLen;
  const maxVal = isStringData ? 1 : Math.max(...(data as number[]), 1);
  const labelHeight = isCompact ? 20 : 40; 
  const drawingHeight = height - labelHeight; 

  const getBarColor = (index: number) => {
    const type = getEventTypeOfIndex(index, activeEvents);
    if (type !== 'default') {
      if (type === 'compare') return nodeStyle === 'contrast' ? 'fill-slate-900 stroke-slate-900' : 'fill-algo-accent'; 
      if (type === 'swap') return 'fill-red-500';      
      if (type === 'write') return 'fill-purple-500';  
      if (type === 'lock') return 'fill-[#34c759]'; // Soft emerald green
      if (type === 'visit') return 'fill-purple-500'; 
    }
    
    if (baseColor) return baseColor;
    if (isStringData) {
      if (nodeStyle === 'contrast') return 'fill-white stroke-slate-900';
      if (nodeStyle === 'slate') return 'fill-slate-50 stroke-slate-200';
      return 'fill-algo-surface stroke-algo-border';
    } else {
      if (nodeStyle === 'contrast') return 'fill-slate-900';
      if (nodeStyle === 'slate') return 'fill-slate-200'; // light gray
      return 'fill-[#0071e3]'; // premium soft blue instead of neon primary
    }
  };

  return (
    <g className="transition-all duration-300 ease-in-out">
      {data.map((val, i) => {
        const x = i * (barWidth + gap);
        let barHeight, y;

        if (isStringData) {
            // --- BOX MODE ---
            const preferredSize = 40;
            const spacing = 4;
            const neededWidth = len * (preferredSize + spacing);
            
            if (neededWidth <= width) {
                const startX = (width - neededWidth) / 2;
                const finalX = startX + i * (preferredSize + spacing);
                const finalY = (drawingHeight - preferredSize) / 2;
                const barCol = getBarColor(i);
                const eventType = getEventTypeOfIndex(i, activeEvents);
                const style = getNodeStyleClasses(eventType, nodeStyle);
                const tags = pointerTagsByIndex[i];

                return (
                    <g key={i} transform={`translate(${finalX}, 0)`}>
                        <rect 
                            y={finalY} 
                            width={preferredSize} 
                            height={preferredSize} 
                            rx={6} 
                            className={cn(
                                "transition-all duration-150", 
                                barCol,
                                nodeStyle === 'contrast' ? "stroke-slate-900 stroke-[3px]" : "stroke-[1.5px]"
                            )} 
                            filter={getGlowFilter(eventType, nodeStyle)}
                        />
                        <text x={preferredSize/2} y={finalY + preferredSize/2 + 5} textAnchor="middle" className={cn("font-mono font-bold select-none text-base", style.text)}>{val}</text>
                        
                        {/* Render Floating Variable Pointers below box */}
                        {tags && tags.length > 0 ? (
                            <text x={preferredSize/2} y={finalY + preferredSize + 22} textAnchor="middle" className="fill-indigo-500 font-semibold text-[9px] uppercase tracking-wider animate-pulse">
                              ↑ {tags.join(', ')}
                            </text>
                        ) : (
                            <text x={preferredSize/2} y={height - 5} textAnchor="middle" className="fill-slate-400 text-[10px] font-mono">{i}</text>
                        )}
                    </g>
                );
            } else {
                const dynamicGap = 2;
                const dynamicWidth = (width - (dynamicGap * (len - 1))) / len;
                const dynamicSize = Math.min(dynamicWidth, 40);
                const finalX = i * (dynamicWidth + dynamicGap);
                const finalY = (drawingHeight - dynamicSize) / 2;
                const barCol = getBarColor(i);
                const eventType = getEventTypeOfIndex(i, activeEvents);
                const style = getNodeStyleClasses(eventType, nodeStyle);
                const tags = pointerTagsByIndex[i];

                return (
                    <g key={i} transform={`translate(${finalX}, 0)`}>
                        <rect 
                            y={finalY} 
                            width={dynamicSize} 
                            height={dynamicSize} 
                            rx={4} 
                            className={cn(
                                "transition-all duration-150", 
                                barCol,
                                nodeStyle === 'contrast' ? "stroke-slate-900 stroke-[3px]" : "stroke-[1.5px]"
                            )} 
                            filter={getGlowFilter(eventType, nodeStyle)}
                        />
                        {dynamicSize > 12 && (
                            <text x={dynamicSize/2} y={finalY + dynamicSize/2 + 4} textAnchor="middle" className={cn("font-mono font-bold select-none", style.text)} style={{ fontSize: `${dynamicSize * 0.5}px` }}>{val}</text>
                        )}
                        
                        {/* Render Floating Variable Pointers below box */}
                        {tags && tags.length > 0 ? (
                            <text x={dynamicSize/2} y={finalY + dynamicSize + 18} textAnchor="middle" className="fill-indigo-500 font-semibold text-[8px] uppercase tracking-wider animate-pulse">
                              ↑ {tags.join(', ')}
                            </text>
                        ) : (
                            dynamicSize > 20 && (
                                <text x={dynamicSize/2} y={height - 5} textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">{i}</text>
                            )
                        )}
                    </g>
                );
            }
        } else {
            // --- BAR MODE ---
            const pct = (val as number) / maxVal;
            barHeight = pct * drawingHeight;
            barHeight = Math.max(barHeight, isCompact ? 2 : 5);
            y = drawingHeight - barHeight;
            const barCol = getBarColor(i);
            const eventType = getEventTypeOfIndex(i, activeEvents);
            const tags = pointerTagsByIndex[i];

            return (
                <g key={i} transform={`translate(${x}, 0)`}>
                    <rect 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        rx={isCompact ? 1 : 4} 
                        className={cn(
                            "transition-all duration-150", 
                            barCol,
                            nodeStyle === 'contrast' ? "stroke-slate-900 stroke-[2px]" : "stroke-transparent stroke-0"
                        )} 
                        filter={getGlowFilter(eventType, nodeStyle)}
                    />
                    {barWidth > 12 && (
                        tags && tags.length > 0 ? (
                          <text x={barWidth / 2} y={height - 5} textAnchor="middle" className="fill-indigo-500 font-bold select-none text-[8px] uppercase tracking-tight">
                            ↑ {tags.join(', ')}
                          </text>
                        ) : (
                          <text x={barWidth / 2} y={height - 10} textAnchor="middle" className="fill-slate-500 font-mono font-bold select-none" style={{ fontSize: isCompact ? '10px' : '12px' }}>{val}</text>
                        )
                    )}
                </g>
            );
        }
      })}
    </g>
  );
};