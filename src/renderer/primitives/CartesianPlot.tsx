import React from 'react';
import { cn } from '@utils/cn';

export interface Point2D {
  x: number;
  y: number;
  label?: string;
  id?: string;
  state?: 'default' | 'active' | 'hull' | 'visited';
}

export interface LineSegment2D {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  color?: string;
  dashed?: boolean;
}

interface CartesianPlotProps {
  points: Point2D[];
  lines?: LineSegment2D[];
  hullPath?: { x: number; y: number }[];
  curves?: { x: number; y: number }[][];
  shadedAreas?: { x: number; y: number }[][];
  width: number;
  height: number;
}

export const CartesianPlot: React.FC<CartesianPlotProps> = ({
  points,
  lines = [],
  hullPath = [],
  curves = [],
  shadedAreas = [],
  width = 800,
  height = 400,
}) => {
  // Determine bounds of coordinate space including all components
  const allX: number[] = [...points.map((p) => p.x)];
  const allY: number[] = [...points.map((p) => p.y)];

  for (const l of lines) {
    allX.push(l.p1.x, l.p2.x);
    allY.push(l.p1.y, l.p2.y);
  }

  for (const c of curves) {
    for (const p of c) {
      allX.push(p.x);
      allY.push(p.y);
    }
  }

  for (const area of shadedAreas) {
    for (const p of area) {
      allX.push(p.x);
      allY.push(p.y);
    }
  }

  const minX = allX.length > 0 ? Math.min(...allX) - 1.5 : -5;
  const maxX = allX.length > 0 ? Math.max(...allX) + 1.5 : 5;
  const minY = allY.length > 0 ? Math.min(...allY) - 1.5 : -5;
  const maxY = allY.length > 0 ? Math.max(...allY) + 1.5 : 5;

  // Layout scale helpers
  const padding = 50;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const scaleX = (x: number) => {
    const range = maxX - minX || 1;
    return padding + ((x - minX) / range) * plotWidth;
  };

  const scaleY = (y: number) => {
    const range = maxY - minY || 1;
    // Invert SVG Y axis so higher Y plots higher
    return height - padding - ((y - minY) / range) * plotHeight;
  };

  // Axis lines
  const axisColor = 'rgba(148, 163, 184, 0.25)';
  const zeroX = scaleX(0);
  const zeroY = scaleY(0);

  // Point colors based on state
  const getPointColorClasses = (state: string | undefined) => {
    switch (state) {
      case 'active':
        return { circle: 'fill-amber-500 stroke-amber-200 stroke-[3px]', text: 'fill-amber-800 font-bold' };
      case 'hull':
        return { circle: 'fill-indigo-600 stroke-indigo-200 stroke-[3px]', text: 'fill-indigo-800 font-bold' };
      case 'visited':
        return { circle: 'fill-emerald-500 stroke-emerald-200 stroke-[3px]', text: 'fill-emerald-800 font-bold' };
      default:
        return { circle: 'fill-slate-400 stroke-white stroke-[2px]', text: 'fill-slate-600 font-medium' };
    }
  };

  return (
    <g className="transition-all duration-300 font-sans">
      {/* 1. Grid Axes */}
      {zeroX >= padding && zeroX <= width - padding && (
        <line
          x1={zeroX}
          y1={padding}
          x2={zeroX}
          y2={height - padding}
          stroke={axisColor}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      )}
      {zeroY >= padding && zeroY <= height - padding && (
        <line
          x1={padding}
          y1={zeroY}
          x2={width - padding}
          y2={zeroY}
          stroke={axisColor}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      )}

      {/* 2. Shaded Integration Areas */}
      {shadedAreas.map((areaPoints, idx) => {
        if (areaPoints.length < 3) return null;
        const pointsStr = areaPoints.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ');
        return (
          <polygon
            key={`area-${idx}`}
            points={pointsStr}
            className="fill-indigo-500/10 stroke-none"
          />
        );
      })}

      {/* 3. Convex Hull Polygon/Path */}
      {hullPath.length > 2 && (
        <polygon
          points={hullPath.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
          className="fill-indigo-500/10 stroke-indigo-500 stroke-[2px] stroke-linejoin-round"
          style={{ strokeDasharray: '4 2' }}
        />
      )}

      {/* 4. Helper Line Segments */}
      {lines.map((line, idx) => {
        const x1 = scaleX(line.p1.x);
        const y1 = scaleY(line.p1.y);
        const x2 = scaleX(line.p2.x);
        const y2 = scaleY(line.p2.y);
        return (
          <line
            key={`line-${idx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={line.color || '#f59e0b'}
            strokeWidth={2}
            strokeDasharray={line.dashed ? '4 3' : undefined}
            className="transition-all duration-300"
          />
        );
      })}

      {/* 5. Continuous Curves (Mathematical functions) */}
      {curves.map((cPoints, idx) => {
        if (cPoints.length < 2) return null;
        const dAttr = cPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ');
        return (
          <path
            key={`curve-${idx}`}
            d={dAttr}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 opacity-90"
          />
        );
      })}

      {/* 6. Scatter Points */}
      {points.map((p, idx) => {
        const cx = scaleX(p.x);
        const cy = scaleY(p.y);
        const style = getPointColorClasses(p.state);

        return (
          <g key={`point-${p.id || idx}`} className="cursor-pointer group">
            {/* Soft backdrop glow on hover */}
            <circle
              cx={cx}
              cy={cy}
              r={12}
              className="fill-transparent group-hover:fill-slate-100/40 transition-colors"
            />
            {/* Physical Point */}
            <circle
              cx={cx}
              cy={cy}
              r={6}
              className={cn("transition-all duration-200", style.circle)}
            />
            {/* Label */}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              className={cn("text-[10px] select-none pointer-events-none", style.text)}
            >
              {p.label || p.id || `(${p.x},${p.y})`}
            </text>
          </g>
        );
      })}
    </g>
  );
};
export default CartesianPlot;
