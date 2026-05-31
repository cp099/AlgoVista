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
}

export const Array1D: React.FC<Array1DProps> = ({ 
    data, activeEvents, width, height, baseColor, 
    orientation = 'horizontal',
    visualMode
}) => {
  const { settings } = useSettings();
  const nodeStyle = settings.nodeStyle;
  const len = data.length;
  const safeLen = Math.max(len, 1);
  const isCompact = height < 150;
  
  const isStringData = visualMode === 'box' || typeof data[0] === 'string';
  const isLongString = isStringData && data.some(val => typeof val === 'string' && val.length > 1);
  
  const isVertical = orientation === 'vertical';

  // --- VERTICAL STACK MODE ---
  if (isVertical) {
      const boxHeight = 50;
      const gap = 4;
      
      // Calculate total height to center the block
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
                strokeWidth={nodeStyle === 'contrast' ? '3' : '2'} 
                className="text-algo-border opacity-50"
            />

            {data.map((val, i) => {
                // Stack grows UP from the bottom, but the whole group is centered
                const y = startY + (totalHeight - (i + 1) * (boxHeight + gap) + gap);
                const x = width / 2 - 30;
                let colorClass = "fill-algo-surface stroke-algo-primary stroke-2";
                
                for (const event of activeEvents) {
                    if (event.indices?.includes(i)) {
                        if (event.type === 'visit') colorClass = "fill-purple-500 stroke-purple-500";
                        if (event.type === 'write') colorClass = "fill-algo-success stroke-algo-success";
                        if (event.type === 'compare') colorClass = "fill-algo-accent stroke-algo-accent";
                    }
                }

                const isAccent = colorClass.includes('accent') || colorClass.includes('success') || colorClass.includes('purple');

                return (
                    <g key={i} transform={`translate(${x}, ${y})`}>
                        <rect 
                            width={60} 
                            height={boxHeight} 
                            rx={6} 
                            className={cn(
                                "transition-all duration-150", 
                                colorClass,
                                nodeStyle === 'contrast' && "stroke-[3px]",
                                nodeStyle === 'neon' && isAccent && "drop-shadow-[0_0_5px_rgba(99,102,241,0.35)]"
                            )} 
                        />
                        <text x={30} y={30} textAnchor="middle" className="fill-algo-text font-mono font-bold text-lg select-none">{val}</text>
                        {i === len - 1 && <text x={90} y={30} className="fill-algo-accent text-xs font-mono">TOP</text>}
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
                let colorClass = "fill-transparent"; 
                let textClass = "fill-algo-text";
                
                for (const event of activeEvents) {
                    if (event.indices?.includes(i)) {
                        if (event.type === 'compare') { colorClass = "fill-algo-accent"; textClass = "fill-white"; }
                        if (event.type === 'swap') { colorClass = "fill-red-500"; textClass = "fill-white"; }
                        if (event.type === 'visit') { colorClass = "fill-purple-500"; textClass = "fill-white"; }
                        if (event.type === 'lock') { colorClass = "fill-algo-success"; textClass = "fill-white"; }
                    }
                }

                const isActive = colorClass !== "fill-transparent";

                return (
                    <g key={i} transform={`translate(0, ${y})`}>
                        <rect 
                            x={0} 
                            y={0} 
                            width={width} 
                            height={rowHeight - 4} 
                            rx={4} 
                            className={cn(
                                "transition-all duration-150",
                                nodeStyle === 'contrast' ? "stroke-algo-text stroke-2" : "stroke-algo-border stroke-1",
                                nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_4px_rgba(99,102,241,0.25)]",
                                colorClass
                            )} 
                        />
                        <text x={20} y={rowHeight / 2 + 5} className={cn("font-mono text-xs opacity-50", textClass)}>{i}</text>
                        <text x={width / 2} y={rowHeight / 2 + 5} textAnchor="middle" className={cn("font-mono font-bold select-none", textClass)} style={{ fontSize: `${fontSize}px` }}>{val}</text>
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
    for (const event of activeEvents) {
      if (event.indices?.includes(index)) {
        if (event.type === 'compare') return 'fill-algo-accent'; 
        if (event.type === 'swap') return 'fill-red-500';      
        if (event.type === 'write') return 'fill-purple-500';  
        if (event.type === 'lock') return 'fill-algo-success'; 
        if (event.type === 'visit') return 'fill-red-500'; 
      }
    }
    return baseColor || (isStringData ? 'fill-algo-surface stroke-algo-border stroke-2' : 'fill-algo-primary'); 
  };

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible w-full h-full">
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
                    const isActive = !barCol.includes('fill-algo-surface');

                    return (
                        <g key={i} transform={`translate(${finalX}, 0)`}>
                            <rect 
                                y={finalY} 
                                width={preferredSize} 
                                height={preferredSize} 
                                rx={6} 
                                className={cn(
                                    "transition-all duration-150", 
                                    nodeStyle === 'contrast' && "stroke-[3px]",
                                    nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]",
                                    barCol
                                )} 
                            />
                            <text x={preferredSize/2} y={finalY + preferredSize/2 + 5} textAnchor="middle" className={cn("font-mono font-bold select-none text-xl", barCol.includes('fill-algo-surface') ? "fill-algo-text" : "fill-white")}>{val}</text>
                            <text x={preferredSize/2} y={height - 5} textAnchor="middle" className="fill-algo-muted text-[10px] font-mono">{i}</text>
                        </g>
                    );
                } else {
                    const dynamicGap = 2;
                    const dynamicWidth = (width - (dynamicGap * (len - 1))) / len;
                    const dynamicSize = Math.min(dynamicWidth, 40);
                    const finalX = i * (dynamicWidth + dynamicGap);
                    const finalY = (drawingHeight - dynamicSize) / 2;
                    const barCol = getBarColor(i);
                    const isActive = !barCol.includes('fill-algo-surface');

                    return (
                        <g key={i} transform={`translate(${finalX}, 0)`}>
                            <rect 
                                y={finalY} 
                                width={dynamicSize} 
                                height={dynamicSize} 
                                rx={4} 
                                className={cn(
                                    "transition-all duration-150", 
                                    nodeStyle === 'contrast' && "stroke-[2.5px]",
                                    nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_4px_rgba(99,102,241,0.3)]",
                                    barCol
                                )} 
                            />
                            {dynamicSize > 12 && (
                                <text x={dynamicSize/2} y={finalY + dynamicSize/2 + 4} textAnchor="middle" className={cn("font-mono font-bold select-none", barCol.includes('fill-algo-surface') ? "fill-algo-text" : "fill-white")} style={{ fontSize: `${dynamicSize * 0.5}px` }}>{val}</text>
                            )}
                            {dynamicSize > 20 && (
                                <text x={dynamicSize/2} y={height - 5} textAnchor="middle" className="fill-algo-muted text-[10px] font-mono">{i}</text>
                            )}
                        </g>
                    );
                }
            } else {
                // --- BAR MODE ---
                let pct = (val as number) / maxVal;
                barHeight = pct * drawingHeight;
                barHeight = Math.max(barHeight, isCompact ? 2 : 5);
                y = drawingHeight - barHeight;
                const barCol = getBarColor(i);
                const isActive = barCol !== 'fill-algo-primary';

                return (
                    <g key={i} transform={`translate(${x}, 0)`}>
                        <rect 
                            y={y} 
                            width={barWidth} 
                            height={barHeight} 
                            rx={isCompact ? 1 : 4} 
                            className={cn(
                                "transition-all duration-150", 
                                nodeStyle === 'contrast' && "stroke-[2.5px]",
                                nodeStyle === 'neon' && isActive && "drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]",
                                barCol
                            )} 
                        />
                        {barWidth > 12 && (
                            <text x={barWidth / 2} y={height - 10} textAnchor="middle" className="fill-algo-text font-mono font-bold select-none" style={{ fontSize: isCompact ? '10px' : '12px' }}>{val}</text>
                        )}
                    </g>
                );
            }
          })}
        </g>
      </svg>
    </div>
  );
};