import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'connected-components',
    name: 'Connected Components',
    category: 'Graph',
    difficulty: 'Medium' as const,
    description: 'Finds and counts disjoint sets of vertices (islands) in an undirected graph. It iterates through all vertices, starting a new traversal (like DFS) for any unvisited vertex.',
    pseudocode: [
        'count = 0',
        'visited = new Set()',
        'for each vertex v in G:',
        '  if v not in visited:',
        '    count++',
        '    Traverse(v, visited) // e.g., using DFS or BFS'
    ],
    inputs: []
};

const run: AlgorithmBundle['run'] = function* (_inputs) {
    const nodes: GraphNode[] = [
        // Island 1
        { id: '0', val: 0, x: 150, y: 100 }, { id: '1', val: 1, x: 250, y: 100 },
        { id: '2', val: 2, x: 200, y: 200 },
        // Island 2
        { id: '3', val: 3, x: 450, y: 150 }, { id: '4', val: 4, x: 550, y: 150 },
        // Island 3
        { id: '5', val: 5, x: 300, y: 300 }, { id: '6', val: 6, x: 400, y: 300 },
        { id: '7', val: 7, x: 500, y: 300 }
    ];
    const edges: GraphEdge[] = [
        { source: '0', target: '1' }, { source: '1', target: '2' }, { source: '0', target: '2' },
        { source: '3', target: '4' },
        { source: '5', target: '6' }, { source: '6', target: '7' }
    ];
    const adj: any = {
        0: [1, 2], 1: [0, 2], 2: [0, 1],
        3: [4], 4: [3],
        5: [6], 6: [5, 7], 7: [6]
    };

    const visited = new Set<number>();
    let islandCount = 0;
    const islandColors = ['fill-purple-500', 'fill-cyan-500', 'fill-pink-500'];

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'main': { type: 'graph', id: 'Graph', nodes, edges, isDirected: false } 
        },
        context: { variables: { islandCount }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting to find connected components", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // DFS Helper
    function* dfs(v: number): Generator<any> {
        visited.add(v);
        const color = islandColors[(islandCount - 1) % islandColors.length];
        
        yield { 
            snapshot: makeState(`Exploring island ${islandCount}, visiting ${v}`, 6), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [v], metadata: { color } }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
        
        const neighbors = adj[v] || [];
        for (const u of neighbors) {
            if (!visited.has(u)) {
                yield* dfs(u);
            }
        }
    }

    // Main Loop
    for (let i = 0; i < nodes.length; i++) {
        yield { 
            snapshot: makeState(`Checking node ${i}`, 3),
            events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 }
        };

        if (!visited.has(i)) {
            islandCount++;
            yield { 
                snapshot: makeState(`Node ${i} is unvisited. Found new island #${islandCount}`, 5),
                events: [],
                metrics: { comparisons: 0, swaps: 0, writes: 0 }
            };
            
            yield* dfs(i);
        }
    }

    yield { snapshot: makeState(`Finished. Found ${islandCount} components.`, 3), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;