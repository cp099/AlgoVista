import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'floyd-warshall',
    name: 'Floyd-Warshall Algorithm',
    category: 'Graph',
    difficulty: 'Hard' as const,
    description: 'Finds the shortest paths between all pairs of vertices in a weighted graph. It uses a dynamic programming approach, considering an intermediate vertex `k` in each iteration.',
    pseudocode: [
        'dist = initial adjacency matrix',
        'for k from 0 to V-1:',
        '  for i from 0 to V-1:',
        '    for j from 0 to V-1:',
        '      if dist[i][k] + dist[k][j] < dist[i][j]:',
        '        dist[i][j] = dist[i][k] + dist[k][j]'
    ],
    inputs: [
        // Hardcoded graph for this demo
        {
            id: 'note',
            label: 'Graph is hardcoded in this demo',
            type: 'string' as const,
            defaultValue: ""
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (_inputs) {
    // Hardcoded 4-node graph
    const V = 4;
    const INF = Infinity;
    const graph = [
        [0, 5, INF, 10],
        [INF, 0, 3, INF],
        [INF, INF, 0, 1],
        [INF, INF, INF, 0]
    ];
    
    // The DP Table (Distance Matrix)
    let dist = graph.map(row => [...row]);
    let comparisons = 0, writes = 0;

    const makeState = (msg: string, vars: any = {}): AlgoState => {
        const structures: Record<string, any> = {};
        for (let i = 0; i < V; i++) {
            structures[`row${i}`] = { 
                type: 'array', 
                id: `Row ${i}`, 
                data: dist[i].map(d => d === INF ? '∞' : d), 
                visualMode: 'box' 
            };
        }
        return {
            structures,
            context: { variables: { ...vars, 'k (intermediate)': vars.k ?? '-' }, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized Distance Matrix"), events: [], metrics: { comparisons, swaps: 0, writes } };

    // Main loops
    for (let k = 0; k < V; k++) {
        yield { 
            snapshot: makeState(`Considering Node ${k} as intermediate path`, { k }),
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };
        for (let i = 0; i < V; i++) {
            for (let j = 0; j < V; j++) {
                comparisons++;
                yield { 
                    snapshot: makeState(`Check path ${i}->${k}->${j}`, { k, i, j }),
                    events: [
                        { type: 'compare', targetIds: [`Row ${i}`], indices: [k] },
                        { type: 'compare', targetIds: [`Row ${k}`], indices: [j] },
                        { type: 'compare', targetIds: [`Row ${i}`], indices: [j] }
                    ],
                    metrics: { comparisons, swaps: 0, writes }
                };

                const pathViaK = dist[i][k] + dist[k][j];
                if (pathViaK < dist[i][j]) {
                    dist[i][j] = pathViaK;
                    writes++;
                    yield { 
                        snapshot: makeState(`Found shorter path from ${i} to ${j} via ${k}. New dist: ${pathViaK}`),
                        events: [{ type: 'write', targetIds: [`Row ${i}`], indices: [j] }],
                        metrics: { comparisons, swaps: 0, writes }
                    };
                }
            }
        }
    }

    yield { snapshot: makeState("Floyd-Warshall Complete"), events: [], metrics: { comparisons, swaps: 0, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;