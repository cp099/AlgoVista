import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Graph',
    difficulty: 'Medium' as const,
    description: 'Explores the neighbor nodes first, before moving to the next level neighbors.',
    pseudocode: [
        'Q = [startNode]',
        'mark startNode as visited',
        'while Q is not empty:',
        '  v = Q.dequeue()',
        '  for each neighbor u of v:',
        '    if u is not visited:',
        '      mark u as visited',
        '      Q.enqueue(u)'
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
    
    // HARDCODED GRAPH
    const nodes = [
        { id: '0', val: 0 }, { id: '1', val: 1 }, { id: '2', val: 2 },
        { id: '3', val: 3 }, { id: '4', val: 4 }, { id: '5', val: 5 }
    ];
    const edges = [
        { source: '0', target: '1' }, { source: '0', target: '2' },
        { source: '1', target: '3' }, { source: '1', target: '4' },
        { source: '2', target: '4' }, { source: '4', target: '5' }
    ];
    const adj: any = {
        0: [1, 2], 1: [0, 3, 4], 2: [0, 4], 3: [1], 4: [1, 2, 5], 5: [4]
    };

    // Removed unused params to fix lint warnings
    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 
            'main': { type: 'graph', id: 'main', nodes, edges, isDirected: false } 
        },
        context: { variables: { queue: vars.queue?.join(',') || '[]', ...vars }, pseudocodeLine: line, message: msg }
    });

    // BFS LOGIC
    let queue = [startNode];
    let visited = new Set([startNode]);

    yield { 
        snapshot: makeState({ queue }, `Start BFS from Node ${startNode}`, 1), 
        events: [{ type: 'compare', targetIds: ['main'], indices: [startNode] }], 
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };

    while (queue.length > 0) {
        const v = queue.shift()!;
        
        yield { 
            snapshot: makeState({ queue, v }, `Visiting Node ${v}`, 4), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [v] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        const neighbors = adj[v] || [];
        for (const u of neighbors) {
            if (!visited.has(u)) {
                visited.add(u);
                queue.push(u);
                
                yield { 
                    snapshot: makeState({ queue, v, u }, `Discovered Neighbor ${u}`, 7), 
                    events: [{ type: 'compare', targetIds: ['main'], indices: [u] }],
                    metrics: { comparisons: 0, swaps: 0, writes: 0 } 
                };
            }
        }
        
        // Mark v as fully processed
        yield { 
            snapshot: makeState({ queue }, `Node ${v} Processed`, 3), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [v] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    yield { 
        snapshot: makeState({}, "BFS Complete", 3), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from(visited) }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;