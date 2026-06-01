import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'prims-algorithm',
    name: "Prim's Algorithm (MST)",
    category: 'Graph',
    difficulty: 'Hard' as const,
    description: 'Finds the Minimum Spanning Tree (MST) for a weighted undirected graph. It greedily grows the tree from an arbitrary starting vertex.',
    pseudocode: [
        'key[start] = 0',
        'pq = {all nodes}',
        'while pq is not empty:',
        '  u = pq.extractMin()',
        '  inMST[u] = true',
        '  for each neighbor v of u:',
        '    if !inMST[v] and weight(u,v) < key[v]:',
        '      parent[v] = u, key[v] = weight(u,v)'
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
    const adj: any = {
        0: [{node: 1, weight: 2}, {node: 3, weight: 6}],
        1: [{node: 0, weight: 2}, {node: 2, weight: 3}, {node: 3, weight: 8}, {node: 4, weight: 5}],
        2: [{node: 1, weight: 3}, {node: 4, weight: 7}],
        3: [{node: 0, weight: 6}, {node: 1, weight: 8}, {node: 4, weight: 9}],
        4: [{node: 1, weight: 5}, {node: 2, weight: 7}, {node: 3, weight: 9}]
    };

    // Metrics
    let comparisons = 0, swaps = 0, writes = 0;

    // Prim's state
    const key = new Array(nodes.length).fill(Infinity);
    const parent = new Array(nodes.length).fill(null);
    const inMST = new Array(nodes.length).fill(false);
    let mstEdges: {source: string, target: string}[] = [];

    let pq = nodes.map(n => parseInt(n.id));

    const makeState = (msg: string, line: number = 0): AlgoState => {
        const labeledNodes = nodes.map(n => ({
            ...n,
            label: `${n.label}\n(k=${key[parseInt(n.id)] === Infinity ? '∞' : key[parseInt(n.id)]})`
        }));
        
        // Add a temporary `isMST` property for the renderer to read
        const displayEdges = edges.map(e => ({
            ...e,
            isMST: mstEdges.some(me => 
                (me.source === e.source && me.target === e.target) || 
                (me.source === e.target && me.target === e.source)
            )
        }));

        return {
            structures: { 
                'main': { type: 'graph', id: 'Graph', nodes: labeledNodes, edges: displayEdges as any, isDirected: false },
                'pq': { type: 'array', id: 'PQ (by key)', data: [...pq.map(id => `${nodes[id].label}: ${key[id] === Infinity ? '∞' : key[id]}`)], visualMode: 'box' }
            },
            context: { variables: {}, pseudocodeLine: line, message: msg }
        };
    };

    // Initialization
    key[startNode] = 0;
    yield { snapshot: makeState(`Initialized. Start node ${nodes[startNode].label} key = 0`, 1), events: [], metrics: { comparisons, swaps, writes } };

    while (pq.length > 0) {
        pq.sort((a, b) => key[a] - key[b]);
        const u = pq.shift()!;

        yield { 
            snapshot: makeState(`Extract Min: ${nodes[u].label}`, 4),
            events: [{ type: 'visit', targetIds: ['main'], indices: [u] }],
            metrics: { comparisons, swaps, writes }
        };
        
        inMST[u] = true;
        if (parent[u] !== null) {
            const p = parent[u];
            mstEdges.push({source: String(p), target: String(u)});
        }

        const neighbors = adj[u] || [];
        for (const edge of neighbors) {
            const v = edge.node;
            
            if (!inMST[v]) {
                comparisons++;
                yield {
                    snapshot: makeState(`Checking neighbor ${nodes[v].label}`, 7),
                    events: [{ type: 'compare', targetIds: ['main'], indices: [v] }],
                    metrics: { comparisons, swaps, writes }
                };

                if (edge.weight < key[v]) {
                    parent[v] = u;
                    key[v] = edge.weight;
                    writes++;
                     yield {
                        snapshot: makeState(`Updating key for ${nodes[v].label} to ${key[v]}`, 8),
                        events: [{ type: 'write', targetIds: ['main'], indices: [v] }],
                        metrics: { comparisons, swaps, writes }
                    };
                }
            }
        }
    }

    yield { snapshot: makeState("Prim's Complete. MST Found.", 3), events: [], metrics: { comparisons, swaps, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;  