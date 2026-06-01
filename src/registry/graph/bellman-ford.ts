import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'Graph',
    difficulty: 'Hard' as const,
    description: 'Finds the shortest paths from a single source vertex to all other vertices in a weighted graph. It is slower than Dijkstra but can handle negative edge weights.',
    pseudocode: [
        'dist[start] = 0',
        'for i from 1 to |V|-1:',
        '  for each edge (u, v) with weight w:',
        '    if dist[u] + w < dist[v]:',
        '      dist[v] = dist[u] + w',
        '// Check for negative cycles',
        'for each edge (u, v):',
        '  if dist[u] + w < dist[v]: report cycle'
    ],
    inputs: [
        {
            id: 'startNode',
            label: 'Start Node ID (0-4)',
            type: 'integer' as const,
            defaultValue: 0
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const startNode = inputs['startNode'] as number;
    
    // Graph with a negative edge
    const nodes: GraphNode[] = [
        { id: '0', val: 0, label: 'A', x: 100, y: 200 },
        { id: '1', val: 1, label: 'B', x: 300, y: 100 },
        { id: '2', val: 2, label: 'C', x: 300, y: 300 },
        { id: '3', val: 3, label: 'D', x: 500, y: 200 },
        { id: '4', val: 4, label: 'E', x: 700, y: 200 },
    ];
    const edges: GraphEdge[] = [
        { source: '0', target: '1', weight: 6 },
        { source: '0', target: '2', weight: 7 },
        { source: '1', target: '3', weight: 5 },
        { source: '1', target: '2', weight: 8 },
        { source: '2', target: '3', weight: -4 }, // Negative edge
        { source: '2', target: '4', weight: 9 },
        { source: '3', target: '1', weight: -2 }, 
        { source: '4', target: '3', weight: 7 },
        { source: '4', target: '0', weight: 2 },
    ];

    const numVertices = nodes.length;
    let dist = new Array(numVertices).fill(Infinity);
    let comparisons = 0, writes = 0; // Initialize metrics
    dist[startNode] = 0;

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => {
        const labeledNodes = nodes.map(n => ({
            ...n,
            label: `${n.label}\n(${dist[parseInt(n.id)] === Infinity ? '∞' : dist[parseInt(n.id)]})`
        }));
        return {
            structures: { 
                'main': { type: 'graph', id: 'Graph', nodes: labeledNodes, edges, isDirected: true }
            },
            context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized distances", {}, 1), events: [], metrics: { comparisons, swaps: 0, writes } };

    // 1. Relax Edges V-1 times
    for (let i = 1; i < numVertices; i++) {
        yield { 
            snapshot: makeState(`Iteration ${i} of ${numVertices - 1}`), 
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };
        for (const edge of edges) {
            const u = parseInt(edge.source);
            const v = parseInt(edge.target);
            const w = edge.weight!;
            
            yield { 
                snapshot: makeState(`Relaxing edge (${nodes[u].label}, ${nodes[v].label})`, {}, 3),
                events: [{ type: 'compare', targetIds: ['main'], indices: [u, v] }],
                metrics: { comparisons: comparisons++, swaps: 0, writes }
            };

            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                writes++;
                yield { 
                    snapshot: makeState(`Updated dist(${nodes[v].label}) to ${dist[v]}`, {}, 4),
                    events: [{ type: 'write', targetIds: ['main'], indices: [v] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    // 2. Check for negative cycles
    yield { snapshot: makeState("Checking for negative-weight cycles...", {}, 7), events: [], metrics: { comparisons, swaps: 0, writes } };
    
    for (const edge of edges) {
        const u = parseInt(edge.source);
        const v = parseInt(edge.target);
        const w = edge.weight!;
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            yield { 
                snapshot: makeState(`Negative cycle detected at edge (${nodes[u].label}, ${nodes[v].label})!`, {}, 8),
                events: [{ type: 'visit', targetIds: ['main'], indices: [u, v] }], // Red highlight
                metrics: { comparisons: comparisons + 1, swaps: 0, writes }
            };
            return;
        }
    }

    yield { snapshot: makeState("Bellman-Ford Complete. No negative cycles.", {}, 1), events: [], metrics: { comparisons, swaps: 0, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;