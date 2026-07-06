import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'floyd-warshall-dp',
    name: 'Floyd-Warshall Shortest Path',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Finds the shortest paths between all pairs of vertices in a weighted graph using dynamic programming matrix relaxations.',
    pseudocode: [
        'function FloydWarshall(W):',
        '  D = W // initialize distance matrix',
        '  for k from 0 to V-1:',
        '    for i from 0 to V-1:',
        '      for j from 0 to V-1:',
        '        D[i][j] = min(D[i][j], D[i][k] + D[k][j])'
    ],
    inputs: [
        {
            id: 'vertexCount',
            label: 'Vertices Density',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const vCount = inputs['vertexCount'] as number;

    // Standard adjacency cost matrix:
    // Vertices: A, B, C, D
    const vertices = ['A', 'B', 'C', 'D'].slice(0, vCount);
    const n = vertices.length;

    const dp: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) dp[i][i] = 0;

    // Set initial custom edge weights
    if (n > 1) {
        dp[0][1] = 4;
        dp[1][0] = 4;
    }
    if (n > 2) {
        dp[1][2] = 3;
        dp[2][1] = 3;
        dp[0][2] = 8;
        dp[2][0] = 8;
    }
    if (n > 3) {
        dp[2][3] = 2;
        dp[3][2] = 2;
        dp[1][3] = 10;
        dp[3][1] = 10;
    }

    const rowHeaders = [...vertices];
    const colHeaders = [...vertices];

    const makeState = (activeCell: { r: number; c: number } | null, kVal: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && kVal !== null) {
            const i = activeCell.r;
            const j = activeCell.c;
            const ik = dp[i][kVal] === Infinity ? 'inf' : String(dp[i][kVal]);
            const kj = dp[kVal][j] === Infinity ? 'inf' : String(dp[kVal][j]);
            const ij = dp[i][j] === Infinity ? 'inf' : String(dp[i][j]);
            const sumStr = (dp[i][kVal] === Infinity || dp[kVal][j] === Infinity) ? 'inf' : String((dp[i][kVal] as number) + (dp[kVal][j] as number));
            formulaEquation = `D[${vertices[i]}][${vertices[j]}] = min(D[${vertices[i]}][${vertices[j]}], D[${vertices[i]}][${vertices[kVal]}] + D[${vertices[kVal]}][${vertices[j]}]) => min(${ij}, ${ik} + ${kj}) => min(${ij}, ${sumStr})`;
            
            let val = dp[i][j];
            if (dp[i][kVal] !== Infinity && dp[kVal][j] !== Infinity) {
                val = Math.min(Number(val), (dp[i][kVal] as number) + (dp[kVal][j] as number));
            }
            formulaResult = val === Infinity ? 'inf' : String(val);
        }

        return {
            structures: {
                'shortest_matrix': {
                    type: 'matrix',
                    id: 'shortest_matrix',
                    data: dp.map(row => row.map(v => (v === Infinity ? 'inf' : v))),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    verticesCount: n,
                    intermediateK: kVal !== null ? vertices[kVal] : 'None',
                    activeRow: activeCell ? vertices[activeCell.r] : 'None',
                    activeCol: activeCell ? vertices[activeCell.c] : 'None',
                    formulaTemplate: 'D[i][j] = min(D[i][j], D[i][k] + D[k][j])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Initializing Floyd-Warshall distance adjacency matrix.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                comparisons++;
                const throughK = (dp[i][k] as number) + (dp[k][j] as number);
                
                if (dp[i][k] !== Infinity && dp[k][j] !== Infinity && throughK < (dp[i][j] as number)) {
                    dp[i][j] = throughK;
                    writes++;
                }

                yield {
                    snapshot: makeState({ r: i, c: j }, k, `Relaxing path between ${vertices[i]} and ${vertices[j]} via intermediate vertex ${vertices[k]}`, 6),
                    events: [{ type: 'compare', targetIds: ['shortest_matrix'], indices: [i * n + j] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, null, "Floyd-Warshall all-pairs shortest paths solved.", 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
