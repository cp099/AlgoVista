import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'matrix-chain-dp',
    name: 'Matrix Chain Multiplication',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Finds the most efficient parenthesization sequence to multiply a chain of matrices by constructing an optimal subproblem cost matrix.',
    pseudocode: [
        'function MatrixChainOrder(p):',
        '  m = 2D array of size n x n',
        '  for L from 2 to n:',
        '    for i from 1 to n - L + 1:',
        '      j = i + L - 1',
        '      m[i][j] = Infinity',
        '      for k from i to j-1:',
        '        q = m[i][k] + m[k+1][j] + p[i-1]*p[k]*p[j]',
        '        m[i][j] = min(m[i][j], q)'
    ],
    inputs: [
        {
            id: 'chainSize',
            label: 'Matrices Count',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['chainSize'] as number;
    // Dimensions:
    // e.g. size=3 => 3 matrices: 10x20, 20x30, 30x40.
    // p = [10, 20, 30, 40]
    const p = [10, 20, 30, 40, 50].slice(0, size + 1);
    const n = p.length - 1; // number of matrices

    const dp: (number | string)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

    const rowHeaders = Array.from({ length: n + 1 }, (_, idx) => `i:${idx}`);
    const colHeaders = Array.from({ length: n + 1 }, (_, idx) => `j:${idx}`);

    const makeState = (activeCell: { r: number; c: number } | null, kVal: number | null, qVal: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeCell && kVal !== null && qVal !== null) {
            const i = activeCell.r;
            const j = activeCell.c;
            formulaEquation = `m[${i}][${j}] = min(m[${i}][${j}], m[${i}][${kVal}] + m[${kVal+1}][${j}] + p[${i-1}]*p[${kVal}]*p[${j}]) => min(inf, ${dp[i][kVal]} + ${dp[kVal+1][j]} + ${p[i-1]}*${p[kVal]}*${p[j]})`;
            formulaResult = String(qVal);
        }

        return {
            structures: {
                'cost_table': {
                    type: 'matrix',
                    id: 'cost_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    matricesCount: n,
                    activeI: activeCell?.r ?? 'None',
                    activeJ: activeCell?.c ?? 'None',
                    splitK: kVal ?? 'None',
                    formulaTemplate: 'm[i][j] = min_k(m[i][k] + m[k+1][j] + p[i-1]*p[k]*p[j])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, null, "Initializing Matrix Chain Multiplication Cost Table...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let L = 2; L <= n; L++) {
        for (let i = 1; i <= n - L + 1; i++) {
            const j = i + L - 1;
            dp[i][j] = Infinity;

            for (let k = i; k < j; k++) {
                comparisons++;
                const q = (dp[i][k] as number) + (dp[k + 1][j] as number) + p[i - 1] * p[k] * p[j];
                if (q < (dp[i][j] as number)) {
                    dp[i][j] = q;
                    writes++;
                }

                yield {
                    snapshot: makeState({ r: i, c: j }, k, q, `Evaluating matrix splits at partition k = ${k}. Cost calculated: ${q} operations.`, 8),
                    events: [{ type: 'compare', targetIds: ['cost_table'], indices: [i * (n + 1) + k, (k + 1) * (n + 1) + j] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, null, null, `Matrix Chain Multiplication order optimization complete. Minimum operations: ${dp[1][n]}`, 9),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
