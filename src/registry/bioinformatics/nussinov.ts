import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'nussinov',
    name: 'Nussinov RNA Folding',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Predicts the secondary structure folding of an RNA sequence by maximizing the count of complementary base pairs (A-U, G-C, G-U) using dynamic programming on subsequence intervals.',
    pseudocode: [
        'function Nussinov(RNA):',
        '  for length from 1 to n:',
        '    for i from 0 to n - length:',
        '      j = i + length',
        '      choice1 = dp[i+1][j]',
        '      choice2 = dp[i][j-1]',
        '      choice3 = dp[i+1][j-1] + (isPair(RNA[i], RNA[j]) ? 1 : 0)',
        '      choice4 = max_{i <= k < j}(dp[i][k] + dp[k+1][j])',
        '      dp[i][j] = max(choice1, choice2, choice3, choice4)'
    ],
    inputs: [
        {
            id: 'rna',
            label: 'RNA Sequence (e.g. GGCAGG)',
            type: 'string' as const,
            defaultValue: 'GGCAGG',
            constraints: { minLength: 4, maxLength: 8 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const rna = (inputs['rna'] as string).toUpperCase();
    const n = rna.length;

    // dp[i][j] stores max base pairs on interval i...j
    const dp: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill(0));

    // Headers
    const rowHeaders = rna.split('');
    const colHeaders = rna.split('');

    const isComplement = (a: string, b: string): boolean => {
        return (
            (a === 'A' && b === 'U') || (a === 'U' && b === 'A') ||
            (a === 'G' && b === 'C') || (b === 'G' && a === 'C') ||
            (a === 'G' && b === 'U') || (a === 'U' && b === 'G')
        );
    };

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'folding_table': {
                    type: 'matrix',
                    id: 'folding_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: { rna, lengthN: n, activeRow: activeCell?.r ?? 'None', activeCol: activeCell?.c ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing Nussinov RNA base-pair dynamic programming grid...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // DP over loop lengths
    for (let len = 1; len < n; len++) {
        for (let i = 0; i < n - len; i++) {
            const j = i + len;
            comparisons++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Evaluating interval ${i} to ${j} (bases: '${rna[i]}' & '${rna[j]}')`, 4),
                events: [{ type: 'compare', targetIds: ['folding_table'], indices: [i * n + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            // Option 1 & 2: Unpaired bases
            let best = Math.max(dp[i+1][j] as number, dp[i][j-1] as number);

            // Option 3: Pair bases i and j
            const pairVal = isComplement(rna[i], rna[j]) ? 1 : 0;
            const pairChoice = (i + 1 < j) ? (dp[i+1][j-1] as number) + pairVal : pairVal;
            best = Math.max(best, pairChoice);

            // Option 4: Bifurcation (split interval into two)
            for (let k = i; k < j; k++) {
                const bifurcation = (dp[i][k] as number) + (dp[k+1][j] as number);
                if (bifurcation > best) {
                    best = bifurcation;
                }
            }

            dp[i][j] = best;
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `dp[${i}][${j}] filled. Max paired structures: ${best}`, 9),
                events: [{ type: 'write', targetIds: ['folding_table'], indices: [i * n + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [], "DP Interval matrix populated. Running recursive structure traceback...", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback helper to find matched base indices
    const traceback: { r: number; c: number }[] = [];
    const pairs: [number, number][] = [];

    const trace = (start: number, end: number) => {
        if (start >= end) return;
        traceback.push({ r: start, c: end });

        if (dp[start][end] === dp[start+1][end]) {
            trace(start + 1, end);
        } else if (dp[start][end] === dp[start][end-1]) {
            trace(start, end - 1);
        } else if (isComplement(rna[start], rna[end]) && (dp[start][end] === (start + 1 < end ? dp[start+1][end-1] as number : 0) + 1)) {
            pairs.push([start, end]);
            trace(start + 1, end - 1);
        } else {
            for (let k = start; k < end; k++) {
                if (dp[start][end] === (dp[start][k] as number) + (dp[k+1][end] as number)) {
                    trace(start, k);
                    trace(k + 1, end);
                    break;
                }
            }
        }
    };

    trace(0, n - 1);

    const formattedPairs = pairs.map(([a, b]) => `'${rna[a]}'(${a})-'${rna[b]}'(${b})`).join(', ');

    yield {
        snapshot: makeState(null, [...traceback], `RNA secondary structure traceback complete. Maximum base pairs: ${dp[0][n-1]}. Pairs identified: ${formattedPairs || 'None'}`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
