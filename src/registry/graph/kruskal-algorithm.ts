import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'kruskal-algorithm',
    name: "Kruskal's Algorithm (MST)",
    category: 'Graph',
    difficulty: 'Hard' as const,
    description: 'Finds the MST by sorting all edges by weight and adding them to the growing tree, as long as they do not form a cycle. Uses the Union-Find data structure.',
    pseudocode: [
        'MST = {}',
        'sort edges by weight',
        'for each edge (u,v):',
        '  if find(u) != find(v):',
        '    MST.add(u,v)',
        '    union(u,v)'
    ],
    inputs: []
};

const run: AlgorithmBundle['run'] = function* (_inputs) {
    // Hardcoded Weighted Undirected Graph
    const nodes: GraphNode[] = [
        { id: '0', val: 0, label: 'A', x: 200, y: 100 }, { id: '1', val: 1, label: 'B', x: 400, y: 100 },
        { id: '2', val: 2, label: 'C', x: 600, y: 100 }, { id: '3', val: 3, label: 'D', x: 300, y: 300 },
        { id: '4', val: 4, label: 'E', x: 500, y: 300 }
    ];
    const edges: GraphEdge[] = [
        { source: '0', target: '1', weight: 2 }, { source: '0', target: '3', weight: 6 },
        { source: '1', target: '2', weight: 3 }, { source: '1', target: '3', weight: 8 }, { source: '1', target: '4', weight: 5 },
        { source: '2', target: '4', weight: 7 }, { source: '3', target: '4', weight: 9 }
    ];

    // Metrics
    let comparisons = 0, swaps = 0, writes = 0;

    // Kruskal's State
    const parent = Array.from({ length: nodes.length }, (_, i) => i);
    let mstEdges: GraphEdge[] = [];

    // Union-Find Helpers
    const find = (i: number): number => {
        if (parent[i] === i) return i;
        return find(parent[i]);
    };
    const union = (i: number, j: number) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootJ] = rootI;
    };

    const makeState = (msg: string): AlgoState => {
        const displayEdges = edges.map(e => ({
            ...e,
            // Check if this edge (or its reverse) is in the MST
            isMST: mstEdges.some(me => 
                (me.source === e.source && me.target === e.target) || 
                (me.source === e.target && me.target === e.source)
            )
        }));
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Graph', nodes, edges: displayEdges as any, isDirected: false },
                'parent': { type: 'array', id: 'Disjoint Set (Parent Array)', data: [...parent], visualMode: 'box' }
            },
            context: { variables: {}, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized"), events: [], metrics: { comparisons, swaps, writes } };

    // 1. Sort Edges
    const sortedEdges = [...edges].sort((a, b) => a.weight! - b.weight!);
    yield { snapshot: makeState("Edges sorted by weight"), events: [], metrics: { comparisons, swaps, writes } };

    // 2. Iterate and build MST
    for (const edge of sortedEdges) {
        const u = parseInt(edge.source);
        const v = parseInt(edge.target);

        comparisons++; // The find() check is a comparison
        yield {
            snapshot: makeState(`Considering edge (${nodes[u].label}, ${nodes[v].label}) with weight ${edge.weight}`),
            events: [{ type: 'compare', targetIds: ['main'], indices: [u,v] }],
            metrics: { comparisons, swaps, writes }
        };

        if (find(u) !== find(v)) {
            mstEdges.push(edge);
            union(u, v);
            writes++; // Union is a write to the parent array
            yield {
                snapshot: makeState(`Adding edge. Union(${u}, ${v})`),
                events: [{ type: 'write', targetIds: ['main'], indices: [u,v] }],
                metrics: { comparisons, swaps, writes }
            };
        } else {
             yield {
                snapshot: makeState(`Skipping edge. Forms a cycle.`),
                events: [{ type: 'visit', targetIds: ['main'], indices: [u,v] }],
                metrics: { comparisons, swaps, writes }
            };
        }
    }

    yield { snapshot: makeState("Kruskal's Complete. MST Found."), events: [], metrics: { comparisons, swaps, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;