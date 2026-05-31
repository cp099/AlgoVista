import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'Graph',
    difficulty: 'Medium' as const,
    description: 'Explores as far as possible along each branch before backtracking. It uses a Stack (either implicitly via recursion or explicitly).',
    pseudocode: [
        'function DFS(v, visited):',
        '  visited.add(v)',
        '  process(v)',
        '  for each neighbor u of v:',
        '    if u not in visited:',
        '      DFS(u, visited)'
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
    
    // Hardcoded Graph (same as BFS for comparison)
    const nodes: GraphNode[] = [
        { id: '0', val: 0, x: 600, y: 200 }, { id: '1', val: 1, x: 400, y: 300 },
        { id: '2', val: 2, x: 600, y: 100 }, { id: '3', val: 3, x: 200, y: 300 },
        { id: '4', val: 4, x: 400, y: 200 }, { id: '5', val: 5, x: 200, y: 200 }
    ];
    const edges: GraphEdge[] = [
        { source: '0', target: '1' }, { source: '0', target: '2' },
        { source: '1', target: '3' }, { source: '1', target: '4' },
        { source: '2', target: '4' }, { source: '4', target: '5' }
    ];
    const adj: any = {
        0: [1, 2], 1: [0, 3, 4], 2: [0, 4], 3: [1], 4: [1, 2, 5], 5: [4]
    };

    const visited = new Set<number>();
    const recursionStack: number[] = [];

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'main': { type: 'graph', id: 'Graph', nodes, edges, isDirected: false } 
        },
        context: { 
            variables: { 'Recursion Stack': `[${recursionStack.join(',')}]` }, 
            message: msg 
        }
    });

    yield { snapshot: makeState("Starting DFS..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Recursive Helper
    function* dfsRecursive(v: number): Generator<any> {
        visited.add(v);
        recursionStack.push(v);
        
        yield { 
            snapshot: makeState(`Visiting Node ${v}`), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [v] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        const neighbors = adj[v] || [];
        for (const u of neighbors) {
            yield { 
                snapshot: makeState(`Checking neighbor ${u} of ${v}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [u] }],
                metrics: { comparisons: 1, swaps: 0, writes: 0 } 
            };
            
            if (!visited.has(u)) {
                yield* dfsRecursive(u);
            }
        }
        
        recursionStack.pop();
        yield { 
            snapshot: makeState(`Finished with Node ${v}. Backtracking.`), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [v] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    yield* dfsRecursive(startNode);
    
    yield { 
        snapshot: makeState("DFS Complete"), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;