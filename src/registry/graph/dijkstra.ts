import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Graph',
    difficulty: 'Hard' as const,
    description: 'Finds the shortest paths from a starting node to all other nodes in a weighted graph with non-negative edge weights. It uses a Priority Queue to greedily select the closest unvisited node.',
    pseudocode: [
        'dist[start] = 0',
        'pq = {all nodes}',
        'while pq is not empty:',
        '  u = pq.extractMin()',
        '  for each neighbor v of u:',
        '    alt = dist[u] + weight(u, v)',
        '    if alt < dist[v]:',
        '      dist[v] = alt'
    ],
    inputs: [
        {
            id: 'startNode',
            label: 'Start Node ID (0-5)',
            type: 'integer' as const,
            defaultValue: 0
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const startNode = inputs['startNode'] as number;
    
    // Hardcoded Weighted Graph
    const nodes: GraphNode[] = [
        { id: '0', val: 0, label: 'A', x: 100, y: 200 }, { id: '1', val: 1, label: 'B', x: 250, y: 100 },
        { id: '2', val: 2, label: 'C', x: 250, y: 300 }, { id: '3', val: 3, label: 'D', x: 450, y: 100 },
        { id: '4', val: 4, label: 'E', x: 450, y: 300 }, { id: '5', val: 5, label: 'F', x: 600, y: 200 }
    ];
    const edges: GraphEdge[] = [
        { source: '0', target: '1', weight: 4 }, { source: '0', target: '2', weight: 2 },
        { source: '1', target: '3', weight: 5 }, { source: '2', target: '1', weight: 1 },
        { source: '2', target: '4', weight: 8 }, { source: '3', target: '5', weight: 6 },
        { source: '4', target: '3', weight: 2 }, { source: '4', target: '5', weight: 3 }
    ];
    const adj: any = {
        0: [{node: 1, weight: 4}, {node: 2, weight: 2}],
        1: [{node: 3, weight: 5}],
        2: [{node: 1, weight: 1}, {node: 4, weight: 8}],
        3: [{node: 5, weight: 6}],
        4: [{node: 3, weight: 2}, {node: 5, weight: 3}],
        5: []
    };

    // Dijkstra state
    const dist: number[] = new Array(nodes.length).fill(Infinity);
    const visited = new Set<number>();
    
    // Priority Queue (simple array for visualization)
    let pq = nodes.map(n => parseInt(n.id));

    const makeState = (msg: string): AlgoState => {
        const labeledNodes = nodes.map(n => ({
            ...n,
            label: `${n.label}\n(${dist[parseInt(n.id)] === Infinity ? '∞' : dist[parseInt(n.id)]})`
        }));
        
        return {
            structures: { 
                'graph': { type: 'graph', id: 'Graph', nodes: labeledNodes, edges, isDirected: true },
                'pq': { 
                    type: 'array', 
                    id: 'Priority Queue (by dist)', 
                    data: [...pq.map(id => `${nodes[id].label}: ${dist[id] === Infinity ? '∞' : dist[id]}`)], // More info
                    visualMode: 'box' 
                }
            },
            context: { variables: {}, message: msg }
        };
    };

    // Initialization
    dist[startNode] = 0;
    yield { snapshot: makeState(`Initialized. Start node ${nodes[startNode].label} distance = 0`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (pq.length > 0) {
        // Sort PQ to find min dist (real PQ is a heap, this is a visual sim)
        pq.sort((a, b) => dist[a] - dist[b]);
        const u = pq.shift()!; // Extract min

        yield { 
            snapshot: makeState(`Visiting closest node: ${nodes[u].label}`),
            events: [{ type: 'visit', targetIds: ['main'], indices: [u] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 }
        };
        
        visited.add(u);

        const neighbors = adj[u] || [];
        for (const edge of neighbors) {
            const v = edge.node;
            if (visited.has(v)) continue;
            
            yield {
                snapshot: makeState(`Checking neighbor ${nodes[v].label}`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [v] }],
                metrics: { comparisons: 0, swaps: 0, writes: 0 }
            };

            const alt = dist[u] + edge.weight;
            if (alt < dist[v]) {
                dist[v] = alt;
                 yield {
                    snapshot: makeState(`Relaxing edge: New shorter path to ${nodes[v].label} found (${alt})`),
                    events: [{ type: 'write', targetIds: ['main'], indices: [v] }],
                    metrics: { comparisons: 1, swaps: 0, writes: 1 }
                };
            }
        }
    }

    yield { snapshot: makeState("Dijkstra's Complete. All shortest paths found."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;