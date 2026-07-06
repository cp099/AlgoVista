import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'optimal-bst-dp',
    name: 'Optimal Binary Search Tree',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Constructs a Binary Search Tree with the minimum expected search cost for a given sequence of keys and search frequency distributions.',
    pseudocode: [
        'function OptimalBST(Keys, Freq):',
        '  cost = 2D array of size n x n',
        '  for L from 1 to n:',
        '    for i from 0 to n - L:',
        '      j = i + L - 1',
        '      cost[i][j] = Infinity',
        '      for r from i to j:',
        '        val = sum(Freq[i...j]) + (cost[i][r-1] + cost[r+1][j])',
        '        cost[i][j] = min(cost[i][j], val)'
    ],
    inputs: [
        {
            id: 'keysCount',
            label: 'Keys Count',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const kCount = inputs['keysCount'] as number;
    const freq = [34, 8, 50, 10].slice(0, kCount);
    const n = freq.length;

    const dp: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill(0));

    const rowHeaders = Array.from({ length: n }, (_, idx) => `i:${idx}`);
    const colHeaders = Array.from({ length: n }, (_, idx) => `j:${idx}`);

    const makeState = (activeCell: { r: number; c: number } | null, rVal: number | null, qVal: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && rVal !== null && qVal !== null) {
            const i = activeCell.r;
            const j = activeCell.c;
            formulaEquation = `cost[${i}][${j}] = min(cost[${i}][${j}], sum(Freq) + cost[${i}][${rVal}-1] + cost[${rVal}+1][${j}]) => min(inf, ${qVal})`;
            formulaResult = String(qVal);
        }

        return {
            structures: {
                'bst_cost_matrix': {
                    type: 'matrix',
                    id: 'bst_cost_matrix',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    keysCount: n,
                    freqList: freq.join(', '),
                    activeI: activeCell?.r ?? 'None',
                    activeJ: activeCell?.c ?? 'None',
                    rootNode: rVal !== null ? rVal : 'None',
                    formulaTemplate: 'cost[i][j] = min_r(sum_freq + cost[i][r-1] + cost[r+1][j])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, null, "Initializing Optimal BST search cost table.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Single keys base cases
    for (let i = 0; i < n; i++) {
        dp[i][i] = freq[i];
        writes++;
    }

    for (let L = 2; L <= n; L++) {
        for (let i = 0; i <= n - L; i++) {
            const j = i + L - 1;
            dp[i][j] = Infinity;

            const sumFreq = freq.slice(i, j + 1).reduce((a, b) => a + b, 0);

            for (let r = i; r <= j; r++) {
                comparisons++;
                const leftCost = r > i ? (dp[i][r - 1] as number) : 0;
                const rightCost = r < j ? (dp[r + 1][j] as number) : 0;
                const val = sumFreq + leftCost + rightCost;

                if (val < (dp[i][j] as number)) {
                    dp[i][j] = val;
                    writes++;
                }

                yield {
                    snapshot: makeState({ r: i, c: j }, r, val, `Evaluating splitting optimal BST subtree on key index ${r} as root.`, 8),
                    events: [{ type: 'compare', targetIds: ['bst_cost_matrix'], indices: [i * n + j] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, null, null, `Optimal BST cost computation complete. Minimum expected search cost: ${dp[0][n-1]}`, 9),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
