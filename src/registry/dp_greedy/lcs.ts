import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'lcs-dp',
    name: 'Longest Common Subsequence (LCS)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the longest subsequence common to two sequences by constructing a 2D alignment matrix and tracing back to construct the matching subsequence.',
    pseudocode: [
        'function LCS(X, Y):',
        '  for i from 1 to m:',
        '    for j from 1 to n:',
        '      if X[i-1] == Y[j-1]:',
        '        L[i][j] = L[i-1][j-1] + 1',
        '      else:',
        '        L[i][j] = max(L[i-1][j], L[i][j-1])'
    ],
    inputs: [
        {
            id: 'word1',
            label: 'First Word',
            type: 'string' as const,
            defaultValue: 'BD',
            constraints: { minLength: 2, maxLength: 4 }
        },
        {
            id: 'word2',
            label: 'Second Word',
            type: 'string' as const,
            defaultValue: 'ABCD',
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

    const rowHeaders = ['-', ...x.split('')];
    const colHeaders = ['-', ...y.split('')];

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && activeCell.r > 0 && activeCell.c > 0) {
            const r = activeCell.r;
            const c = activeCell.c;
            if (x[r-1] === y[c-1]) {
                formulaEquation = `L[${r}][${c}] = L[${r-1}][${c-1}] + 1 => ${dp[r-1][c-1]} + 1`;
                formulaResult = String((dp[r-1][c-1] as number) + 1);
            } else {
                const choice1 = dp[r-1][c] as number;
                const choice2 = dp[r][c-1] as number;
                formulaEquation = `L[${r}][${c}] = max(L[${r-1}][${c}], L[${r}][${c-1}]) => max(${choice1}, ${choice2})`;
                formulaResult = String(Math.max(choice1, choice2));
            }
        }

        return {
            structures: {
                'lcs_table': {
                    type: 'matrix',
                    id: 'lcs_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: {
                    word1: x,
                    word2: y,
                    formulaTemplate: 'if X[i-1] == Y[j-1]: L[i][j] = L[i-1][j-1]+1 else: max(L[i-1][j], L[i][j-1])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing LCS DP grid...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            comparisons++;
            if (x[i-1] === y[j-1]) {
                dp[i][j] = (dp[i-1][j-1] as number) + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j] as number, dp[i][j-1] as number);
            }
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Evaluating LCS subproblem cell at (${i}, ${j}). Characters: "${x[i-1]}" and "${y[j-1]}".`, 4),
                events: [{ type: 'compare', targetIds: ['lcs_table'], indices: [i * (n + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    // Traceback
    const traceback: { r: number; c: number }[] = [];
    let r = m;
    let c = n;
    traceback.push({ r, c });

    while (r > 0 && c > 0) {
        if (x[r-1] === y[c-1]) {
            r--;
            c--;
        } else if ((dp[r-1][c] as number) >= (dp[r][c-1] as number)) {
            r--;
        } else {
            c--;
        }
        traceback.push({ r, c });
    }

    yield {
        snapshot: makeState(null, [...traceback], `LCS alignment search complete. Traceback path mapped successfully.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
