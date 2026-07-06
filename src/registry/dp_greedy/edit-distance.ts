import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'edit-distance-dp',
    name: 'Levenshtein Edit Distance',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Computes the minimum number of insertions, deletions, or substitutions required to transform one string into another using a 2D distance matrix.',
    pseudocode: [
        'function EditDistance(X, Y):',
        '  for i from 0 to m:',
        '    for j from 0 to n:',
        '      if X[i-1] == Y[j-1]:',
        '        dp[i][j] = dp[i-1][j-1]',
        '      else:',
        '        dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])'
    ],
    inputs: [
        {
            id: 'word1',
            label: 'Source Word',
            type: 'string' as const,
            defaultValue: 'CAT',
            constraints: { minLength: 2, maxLength: 4 }
        },
        {
            id: 'word2',
            label: 'Target Word',
            type: 'string' as const,
            defaultValue: 'CAR',
            constraints: { minLength: 2, maxLength: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const x = (inputs['word1'] as string).toUpperCase();
    const y = (inputs['word2'] as string).toUpperCase();
    const m = x.length;
    const n = y.length;

    const dp: (number | string)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Headers
    const rowHeaders = ['-', ...x.split('')];
    const colHeaders = ['-', ...y.split('')];

    // Initialize borders
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && activeCell.r > 0 && activeCell.c > 0) {
            const r = activeCell.r;
            const c = activeCell.c;
            if (x[r-1] === y[c-1]) {
                formulaEquation = `dp[${r}][${c}] = dp[${r-1}][${c-1}] => ${dp[r-1][c-1]}`;
                formulaResult = String(dp[r-1][c-1]);
            } else {
                const ins = dp[r][c-1] as number;
                const del = dp[r-1][c] as number;
                const rep = dp[r-1][c-1] as number;
                formulaEquation = `dp[${r}][${c}] = 1 + min(dp[${r}][${c-1}], dp[${r-1}][${c}], dp[${r-1}][${c-1}]) => 1 + min(${ins}, ${del}, ${rep})`;
                formulaResult = String(1 + Math.min(ins, del, rep));
            }
        }

        return {
            structures: {
                'distance_matrix': {
                    type: 'matrix',
                    id: 'distance_matrix',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    source: x,
                    target: y,
                    formulaTemplate: 'dp[i][j] = dp[i-1][j-1] if match else 1 + min(ins, del, rep)',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing distance table grid bounds...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: m + n + 1 }
    };

    let comparisons = 0;
    let writes = m + n + 1;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            comparisons++;
            if (x[i-1] === y[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i][j-1] as number,   // Insert
                    dp[i-1][j] as number,   // Delete
                    dp[i-1][j-1] as number  // Replace
                );
            }
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, `Evaluating Edit Distance subproblem cell at (${i}, ${j}). Characters: "${x[i-1]}" and "${y[j-1]}".`, 6),
                events: [{ type: 'compare', targetIds: ['distance_matrix'], indices: [i * (n + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, `Levenshtein Edit Distance search complete. Minimal edit cost: ${dp[m][n]} steps.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
