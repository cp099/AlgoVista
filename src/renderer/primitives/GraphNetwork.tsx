import React, { useEffect, useState, useRef } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { cn } from '@utils/cn';
import { AlgoEvent } from '@core/types';
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
  nodes: { id: string; val: number; label?: string; x?: number; y?: number }[];
  edges: { source: string; target: string; weight?: number }[]; // Add optional weight
  activeEvents: AlgoEvent[];
  width: number;
  height: number;
}

export const GraphNetwork: React.FC<GraphNetworkProps> = ({ id, nodes, edges, activeEvents, width, height }) => {
  const { settings } = useSettings();
  const [layout, setLayout] = useState<{ nodes: Node[], links: Link[] } | null>(null);
  const simulationRef = useRef<any>(null);

  useEffect(() => {
    // 1. Check for fixed layout
    const hasFixedLayout = nodes.length > 0 && nodes[0].x !== undefined;

    let d3Nodes: Node[] = nodes.map(n => ({ ...n }));
    const d3Links: Link[] = edges.map(e => ({ ...e }));

    // 2. AUTO-SCALING LOGIC (for fixed layouts)
    if (hasFixedLayout) {
        // Find the bounding box of the hardcoded coordinates
        const minX = Math.min(...d3Nodes.map(n => n.x!));
        const maxX = Math.max(...d3Nodes.map(n => n.x!));
        const minY = Math.min(...d3Nodes.map(n => n.y!));
        const maxY = Math.max(...d3Nodes.map(n => n.y!));
        
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;

        // Calculate scale factor to fit inside container (with padding)
        const padding = 65;
        const scaleX = (width - 2 * padding) / graphWidth;
        const scaleY = (height - 2 * padding) / graphHeight;
        const scale = Math.min(scaleX, scaleY); // Use smallest scale to maintain aspect ratio

        // Apply scaling and translation to each node
        d3Nodes = d3Nodes.map(n => ({
            ...n,
            // Translate to (0,0), scale, then add padding
            x: (n.x! - minX) * scale + padding,
            y: (n.y! - minY) * scale + padding,
            // Fix the position for D3
            fx: (n.x! - minX) * scale + padding,
            fy: (n.y! - minY) * scale + padding
        }));
    }
    
    // 3. Configure Simulation
    const sim = forceSimulation(d3Nodes)
      .force("link", forceLink(d3Links).id((d: any) => d.id).distance(80))
      .force("charge", forceManyBody().strength(-400))
      .force("center", forceCenter(width / 2, height / 2));

    // If fixed, no ticks. If dynamic, run physics.
    if (hasFixedLayout) {
        sim.stop(); 
    } else {
        sim.stop();
        for (let i = 0; i < 300; ++i) sim.tick(); 
    }

    setLayout({ nodes: d3Nodes, links: d3Links });
    simulationRef.current = sim;

  }, [nodes, edges, width, height]);

  if (!layout) return null;

  const getNodeColor = (nodeId: string) => {
    for (const event of activeEvents) {
       const isTarget = (id && event.targetIds?.includes(id)) || 
                        event.targetIds?.includes('main') || 
                        event.targetIds?.includes('Graph') || 
                        event.targetIds?.includes('BST') || 
                        event.targetIds?.includes('Linked List');
       if (isTarget) {
            const numericId = parseInt(nodeId.replace(/\D/g, '')) ?? -1;
            if (numericId === -1 && nodeId !== 'root') continue;
            
            if (event.indices?.includes(numericId) || event.indices?.includes(parseInt(nodeId))) {
                if (event.metadata?.color) return event.metadata.color;
                if (event.type === 'compare') return 'fill-algo-accent stroke-algo-accent'; 
                if (event.type === 'visit') return 'fill-purple-500 stroke-purple-500';    
                if (event.type === 'write') return 'fill-purple-500 stroke-purple-500';    
                if (event.type === 'lock') return 'fill-algo-success stroke-algo-success';  
            }
       }
    }
    return 'fill-algo-surface stroke-algo-primary'; 
  };

  return (
    <g>
      {/* 1. Render Edges (Lines) */}
      {layout.links.map((link: any, i) => {
          // Check if this edge is part of the MST
          const originalEdge = edges.find(e => 
              (e.source === link.source.id && e.target === link.target.id) ||
              (e.source === link.target.id && e.target === link.source.id)
          );
          const isMSTEdge = (originalEdge as any)?.isMST;
          
          return (
            <line
              key={i}
              x1={link.source.x} y1={link.source.y}
              x2={link.target.x} y2={link.target.y}
              className={cn(
                  "stroke-2 transition-all duration-300",
                  isMSTEdge ? "stroke-algo-success" : "stroke-algo-border"
              )}
            />
          );
      })}

      {/* 2. Render Edge Weights (Text) - THIS IS THE NEW SECTION */}
      {layout.links.map((link: any, i) => {
          const originalEdge = edges.find(e => 
              (e.source === link.source.id && e.target === link.target.id) ||
              (e.source === link.target.id && e.target === link.source.id)
          );
          if (!originalEdge?.weight) return null;

          const midX = (link.source.x + link.target.x) / 2;
          const midY = (link.source.y + link.target.y) / 2;

          return (
            <g key={`w-${i}`}>
                {/* Background rect to make text readable */}
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
      {layout.nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x},${node.y})`}>
          <circle
            r={24}
            className={cn(
              "transition-all duration-300",
              settings.nodeStyle === 'contrast' ? "stroke-[4px]" : "stroke-[3px]",
              settings.nodeStyle === 'neon' && "drop-shadow-[0_0_6px_rgba(99,102,241,0.25)]",
              getNodeColor(node.id)
            )}
            style={
              settings.nodeStyle === 'neon' && getNodeColor(node.id).includes('accent')
                ? { filter: 'drop-shadow(0 0 6px var(--color-accent))' }
                : settings.nodeStyle === 'neon' && getNodeColor(node.id).includes('success')
                ? { filter: 'drop-shadow(0 0 6px var(--color-success))' }
                : settings.nodeStyle === 'neon' && getNodeColor(node.id).includes('purple')
                ? { filter: 'drop-shadow(0 0 6px #a855f7)' }
                : undefined
            }
          />
          {/* Split label by newline for multi-line support */}
          {(node.label || String(node.val)).split('\n').map((line, idx, arr) => (
            <text
                key={idx}
                x={0}
                y={idx * 12 - (arr.length > 1 ? 6 : 0)} // Adjust y for multi-line
                textAnchor="middle"
                dy=".35em"
                className="fill-algo-text text-sm font-bold pointer-events-none select-none"
            >
                {line}
            </text>
          ))}
        </g>
      ))}
    </g>
  );
};