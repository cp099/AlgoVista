import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'knapsack-01',
    name: '0/1 Knapsack Problem',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Finds the maximum value of items that can be placed in a knapsack of capacity W. Solves it by building a 2D table grid cell-by-cell and then performs traceback vectors to identify chosen elements.',
    pseudocode: [
        'function knapsack(val, wt, W):',
        '  for i from 0 to n:',
        '    for w from 0 to W:',
        '      if wt[i-1] <= w:',
        '        dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w])',
        '      else:',
        '        dp[i][w] = dp[i-1][w]'
    ],
    inputs: [
        {
            id: 'capacity',
            label: 'Knapsack Capacity',
            type: 'integer' as const,
            defaultValue: 6,
            constraints: { min: 3, max: 8 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const W = inputs['capacity'] as number;
    const val = [10, 40, 30, 50];
    const wt = [1, 3, 2, 5];
    const n = val.length;

    // Initialize DP matrix size (n+1) x (W+1) filled with 0s initially
    const dp: (number | string)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

    // Headers
    const rowHeaders = ['0', 'Item 1 (v10, w1)', 'Item 2 (v40, w3)', 'Item 3 (v30, w2)', 'Item 4 (v50, w5)'];
    const colHeaders = Array.from({ length: W + 1 }, (_, w) => `W:${w}`);

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && activeCell.r > 0 && activeCell.c > 0) {
            const i = activeCell.r;
            const w = activeCell.c;
            if (wt[i-1] <= w) {
                const choice1 = val[i-1] + (dp[i-1][w - wt[i-1]] as number);
                const choice2 = dp[i-1][w] as number;
                formulaEquation = `dp[${i}][${w}] = max(${val[i-1]} + dp[${i-1}][${w - wt[i-1]}], dp[${i-1}][${w}]) => max(${val[i-1]} + ${dp[i-1][w - wt[i-1]]}, ${dp[i-1][w]})`;
                formulaResult = String(Math.max(choice1, choice2));
            } else {
                formulaEquation = `dp[${i}][${w}] = dp[${i-1}][${w}] => ${dp[i-1][w]}`;
                formulaResult = String(dp[i-1][w]);
            }
        }

        return {
            structures: {
                'dp_table': {
                    type: 'matrix',
                    id: 'dp_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: {
                    items: n,
                    capacity: W,
                    activeRow: activeCell ? activeCell.r : 'None',
                    activeCol: activeCell ? activeCell.c : 'None',
                    formulaTemplate: 'dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing DP Grid for 0/1 Knapsack...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Populate the DP grid
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            comparisons++;
            
            yield {
                snapshot: makeState({ r: i, c: w }, [], `Checking if Item ${i} (weight: ${wt[i-1]}) fits in current capacity ${w}`, 4),
                events: [{ type: 'compare', targetIds: ['dp_table'], indices: [i * (W + 1) + w] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (wt[i-1] <= w) {
                const choice1 = val[i-1] + (dp[i-1][w - wt[i-1]] as number);
                const choice2 = dp[i-1][w] as number;
                dp[i][w] = Math.max(choice1, choice2);
                writes++;
                
                yield {
                    snapshot: makeState({ r: i, c: w }, [], `dp[i][w] = max(val + dp[i-1][w-wt], dp[i-1][w]) -> max(${choice1}, ${choice2}) = ${dp[i][w]}`, 5),
                    events: [{ type: 'write', targetIds: ['dp_table'], indices: [i * (W + 1) + w] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            } else {
                dp[i][w] = dp[i-1][w];
                writes++;
                
                yield {
                    snapshot: makeState({ r: i, c: w }, [], `Item too heavy (wt: ${wt[i-1]} > cap: ${w}). Carrying forward value: ${dp[i][w]}`, 6),
                    events: [{ type: 'write', targetIds: ['dp_table'], indices: [i * (W + 1) + w] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, [], "DP Grid fully populated. Starting traceback path execution...", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback to find chosen elements
    const traceback: { r: number; c: number }[] = [];
    let r = n;
    let c = W;
    traceback.push({ r, c });

    while (r > 0 && c > 0) {
        yield {
            snapshot: makeState({ r, c }, [...traceback], `Traceback cell (${r}, ${c}). Value: ${dp[r][c]}. Comparing with row above: ${dp[r-1][c]}`, 1),
            events: [{ type: 'compare', targetIds: ['dp_table'], indices: [r * (W + 1) + c, (r-1) * (W + 1) + c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (dp[r][c] !== dp[r-1][c]) {
            // Item was included
            c = c - wt[r-1];
            r = r - 1;
            traceback.push({ r, c });
            
            yield {
                snapshot: makeState({ r, c }, [...traceback], `Values differ! Item ${r+1} was chosen. Moving to cell (${r}, ${c}).`, 1),
                events: [{ type: 'lock', targetIds: ['dp_table'], indices: [r * (W + 1) + c] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            // Item was not included
            r = r - 1;
            traceback.push({ r, c });
            
            yield {
                snapshot: makeState({ r, c }, [...traceback], `Values match. Item ${r+1} was not chosen. Moving up to cell (${r}, ${c}).`, 1),
                events: [],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [...traceback], "Traceback complete. Optimal selection vector identified.", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
