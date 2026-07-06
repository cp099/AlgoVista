import React, { useMemo } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { cn } from '@utils/cn';
import { AlgoEvent, GraphNode, GraphEdge } from '@core/types';
import { useSettings } from '@core/SettingsContext';

// Extend D3 Node to include our specific properties
interface Node extends SimulationNodeDatum {
  id: string;
  val: number;
  label?: string;
  x?: number; 
  y?: number;
}

interface Link extends SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface GraphNetworkProps {
  id?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
  layout?: 'tree' | 'graph';
}

const getEventTypeOfNode = (nodeId: string, activeEvents: AlgoEvent[]): 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write' => {
  for (const event of activeEvents) {
    if (event.indices) {
      const numericId = parseInt(nodeId.replace(/\D/g, '')) ?? -1;
      const targetIdParsed = parseInt(nodeId);
      if (
        event.indices.includes(numericId) || 
        event.indices.includes(targetIdParsed) || 
        event.indices.some(idx => String(idx) === nodeId)
      ) {
        if (event.type === 'compare') return 'compare';
        if (event.type === 'swap') return 'swap';
        if (event.type === 'visit') return 'visit';
        if (event.type === 'lock') return 'lock';
        if (event.type === 'write') return 'write';
      }
    }
  }
  return 'default';
};

const getNodeStyleClasses = (type: 'default' | 'compare' | 'swap' | 'visit' | 'lock' | 'write', nodeStyle: string) => {
  if (nodeStyle === 'contrast') {
    switch (type) {
      case 'default':
        return { circle: 'fill-white stroke-slate-900 stroke-[3px]', text: 'fill-slate-900 font-extrabold' };
      default: // Highlights
        return { circle: 'fill-slate-900 stroke-slate-900 stroke-[3px]', text: 'fill-white font-extrabold' };
    }
  } else if (nodeStyle === 'slate') {
    switch (type) {
      case 'default':
        return { circle: 'fill-slate-50 stroke-slate-200 stroke-[1.5px]', text: 'fill-slate-700 font-medium' };
      case 'compare':
        return { circle: 'fill-amber-50 stroke-amber-500 stroke-[1.5px]', text: 'fill-amber-800 font-semibold' };
      case 'swap':
        return { circle: 'fill-red-50 stroke-red-500 stroke-[1.5px]', text: 'fill-red-800 font-semibold' };
      case 'visit':
      case 'write':
        return { circle: 'fill-purple-50 stroke-purple-500 stroke-[1.5px]', text: 'fill-purple-800 font-semibold' };
      case 'lock':
        return { circle: 'fill-emerald-50 stroke-emerald-500 stroke-[1.5px]', text: 'fill-emerald-800 font-semibold' };
    }
  } else {
    // neon (glows)
    switch (type) {
      case 'default':
        return { circle: 'fill-algo-surface stroke-algo-primary stroke-[1.5px]', text: 'fill-algo-text font-semibold' };
      case 'compare':
        return { circle: 'fill-algo-accent/15 stroke-algo-accent stroke-[1.5px]', text: 'fill-algo-accent font-bold' };
      case 'swap':
        return { circle: 'fill-red-500/15 stroke-red-500 stroke-[1.5px]', text: 'fill-red-500 font-bold' };
      case 'visit':
      case 'write':
        return { circle: 'fill-purple-500/15 stroke-purple-500 stroke-[1.5px]', text: 'fill-purple-400 font-bold' };
      case 'lock':
        return { circle: 'fill-algo-success/15 stroke-algo-success stroke-[1.5px]', text: 'fill-algo-success font-bold' };
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

export const GraphNetwork: React.FC<GraphNetworkProps> = ({ id: _id, nodes, edges, activeEvents, width, height, layout: layoutType = 'graph' }) => {
  const { settings } = useSettings();

  const layout = useMemo(() => {
    let processedNodes = [...nodes];

    if (layoutType === 'tree') {
      const adj: Record<string, string[]> = {};
      const inDegree: Record<string, number> = {};
      for (const n of nodes) {
        adj[n.id] = [];
        inDegree[n.id] = 0;
      }
      for (const e of edges) {
        if (adj[e.source]) adj[e.source].push(e.target);
        if (inDegree[e.target] !== undefined) inDegree[e.target]++;
      }

      let root = nodes.find(n => inDegree[n.id] === 0)?.id;
      if (!root && nodes.length > 0) root = nodes[0].id;

      if (root) {
        const depths: Record<string, number> = {};
        const levels: Record<number, string[]> = {};
        let maxDepth = 0;

        const traverse = (nodeId: string, d: number) => {
          depths[nodeId] = d;
          if (!levels[d]) levels[d] = [];
          levels[d].push(nodeId);
          maxDepth = Math.max(maxDepth, d);

          for (const child of adj[nodeId] || []) {
            traverse(child, d + 1);
          }
        };

        traverse(root, 0);

        processedNodes = nodes.map(n => {
          const d = depths[n.id] ?? 0;
          const nodesAtLevel = levels[d] || [];
          const idx = nodesAtLevel.indexOf(n.id);
          const levelCount = nodesAtLevel.length;

          const x = levelCount > 1 
            ? ((idx / (levelCount - 1)) * 0.75 + 0.125) * width 
            : width / 2;

          const y = maxDepth > 0 
            ? ((d / maxDepth) * 0.65 + 0.175) * height 
            : height / 2;

          return { ...n, x, y };
        });
      }
    }

    const hasFixedLayout = processedNodes.length > 0 && processedNodes[0].x !== undefined;

    let d3Nodes: Node[] = processedNodes.map(n => ({ ...n }));
    const d3Links: Link[] = edges.map(e => ({ ...e }));

    if (hasFixedLayout) {
        const minX = Math.min(...d3Nodes.map(n => n.x!));
        const maxX = Math.max(...d3Nodes.map(n => n.x!));
        const minY = Math.min(...d3Nodes.map(n => n.y!));
        const maxY = Math.max(...d3Nodes.map(n => n.y!));
        
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;

        const padding = 65;
        const scaleX = (width - 2 * padding) / Math.max(graphWidth, 1);
        const scaleY = (height - 2 * padding) / Math.max(graphHeight, 1);
        const scale = Math.min(scaleX, scaleY);

        d3Nodes = d3Nodes.map(n => ({
            ...n,
            x: (n.x! - minX) * scale + padding,
            y: (n.y! - minY) * scale + padding,
            fx: (n.x! - minX) * scale + padding,
            fy: (n.y! - minY) * scale + padding
        }));
    }
    
    const sim = forceSimulation<Node, Link>(d3Nodes)
      .force("link", forceLink<Node, Link>(d3Links).id((d) => d.id).distance(80))
      .force("charge", forceManyBody().strength(-400))
      .force("center", forceCenter(width / 2, height / 2));

    if (hasFixedLayout) {
        sim.stop(); 
    } else {
        sim.stop();
        for (let i = 0; i < 300; ++i) sim.tick(); 
    }

    return { nodes: d3Nodes, links: d3Links };
  }, [nodes, edges, width, height]);

  return (
    <g>
      {/* 1. Render Edges (Lines) */}
      {layout.links.map((link, i) => {
          const sourceNode = link.source as Node;
          const targetNode = link.target as Node;
          const originalEdge = edges.find(e => 
              (e.source === sourceNode.id && e.target === targetNode.id) ||
              (e.source === targetNode.id && e.target === sourceNode.id)
          );
          const isMSTEdge = originalEdge?.isMST;
          
          let strokeClass = "stroke-algo-border";
          if (isMSTEdge) {
            if (settings.nodeStyle === 'contrast') strokeClass = "stroke-slate-900 stroke-[3px]";
            else if (settings.nodeStyle === 'slate') strokeClass = "stroke-emerald-500 stroke-[2px]";
            else strokeClass = "stroke-algo-success stroke-[2.5px]";
          } else {
            if (settings.nodeStyle === 'contrast') strokeClass = "stroke-slate-200 stroke-[1.5px]";
            else if (settings.nodeStyle === 'slate') strokeClass = "stroke-slate-200 stroke-[1px]";
            else strokeClass = "stroke-algo-border opacity-60";
          }

          return (
            <line
              key={i}
              x1={sourceNode.x} y1={sourceNode.y}
              x2={targetNode.x} y2={targetNode.y}
              className={cn("transition-all duration-300", strokeClass)}
            />
          );
      })}

      {/* 2. Render Edge Weights (Text) */}
      {layout.links.map((link, i) => {
          const sourceNode = link.source as Node;
          const targetNode = link.target as Node;
          const originalEdge = edges.find(e => 
              (e.source === sourceNode.id && e.target === targetNode.id) ||
              (e.source === targetNode.id && e.target === sourceNode.id)
          );
          if (!originalEdge?.weight) return null;

          const midX = ((sourceNode.x ?? 0) + (targetNode.x ?? 0)) / 2;
          const midY = ((sourceNode.y ?? 0) + (targetNode.y ?? 0)) / 2;

          return (
            <g key={`w-${i}`}>
                <rect 
                    x={midX - 12} y={midY - 10} 
                    width={24} height={20} 
                    fill="var(--color-bg)"
                    rx={4}
                />
                <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dy=".35em"
                    className="fill-algo-muted font-mono text-xs font-bold"
                >
                    {originalEdge.weight}
                </text>
            </g>
          );
      })}
      
      {/* 3. Render Nodes (Circles on top of everything) */}
      {layout.nodes.map((node) => {
        let eventType = getEventTypeOfNode(node.id, activeEvents);
        const originalNode = nodes.find(n => n.id === node.id);
        if (eventType === 'default' && originalNode?.state) {
          if (originalNode.state === 'active') {
            eventType = 'compare';
          } else if (originalNode.state === 'visited') {
            eventType = 'visit';
          } else {
            eventType = originalNode.state;
          }
        }
        const style = getNodeStyleClasses(eventType, settings.nodeStyle);

        return (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}>
            <circle
              r={24}
              className={cn("transition-all duration-300", style.circle)}
              filter={getGlowFilter(eventType, settings.nodeStyle)}
            />
            {((node.label !== undefined && node.label !== null) ? node.label : String(node.val)).split('\n').map((line, idx, arr) => (
              <text
                  key={idx}
                  x={0}
                  y={idx * 12 - (arr.length > 1 ? 6 : 0)} 
                  textAnchor="middle"
                  dy=".35em"
                  className={cn("text-sm font-bold pointer-events-none select-none", style.text)}
              >
                  {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
};