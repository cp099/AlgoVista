import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'banded-alignment',
    name: 'Banded Sequence Alignment',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Implements global alignment optimized to run in a narrow diagonal band of width k. Cells outside the band are skipped, reducing the computational complexity from quadratic to linear.',
    pseudocode: [
        'function BandedNW(Seq1, Seq2, k):',
        '  for i from 0 to length(Seq1):',
        '    for j from max(0, i-k) to min(length(Seq2), i+k):',
        '      match = dp[i-1][j-1] + Score(Seq1[i-1], Seq2[j-1])',
        '      delete = dp[i-1][j] + GapPenalty',
        '      insert = dp[i][j-1] + GapPenalty',
        '      dp[i][j] = max(match, delete, insert)'
    ],
    inputs: [
        {
            id: 'seq1',
            label: 'DNA Sequence 1',
            type: 'string' as const,
            defaultValue: 'AGTG',
            constraints: { minLength: 2, maxLength: 5 }
        },
        {
            id: 'seq2',
            label: 'DNA Sequence 2',
            type: 'string' as const,
            defaultValue: 'ATGG',
            constraints: { minLength: 2, maxLength: 5 }
        },
        {
            id: 'bandWidth',
            label: 'Band Width (k)',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const seq1 = (inputs['seq1'] as string).toUpperCase();
    const seq2 = (inputs['seq2'] as string).toUpperCase();
    const k = inputs['bandWidth'] as number;
    const rowsCount = seq1.length;
    const colsCount = seq2.length;

    const gapPenalty = -1;
    const matchScore = 1;
    const mismatchScore = -1;

    // Initialize scoring matrix filled with '-' initially (showing skipped cells)
    const dp: (number | string)[][] = Array.from({ length: rowsCount + 1 }, () => Array(colsCount + 1).fill('-'));

    // Set boundaries if within band
    for (let i = 0; i <= rowsCount; i++) {
        if (Math.abs(i) <= k) dp[i][0] = i * gapPenalty;
    }
    for (let j = 0; j <= colsCount; j++) {
        if (Math.abs(j) <= k) dp[0][j] = j * gapPenalty;
    }

    const rowHeaders = ['-', ...seq1.split('')];
    const colHeaders = ['-', ...seq2.split('')];

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'banded_table': {
                    type: 'matrix',
                    id: 'banded_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: { seq1, seq2, bandK: k, activeRow: activeCell?.r ?? 'None', activeCol: activeCell?.c ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], `Initializing Banded Alignment Matrix with band width k=${k}...`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let i = 1; i <= rowsCount; i++) {
        const startJ = Math.max(1, i - k);
        const endJ = Math.min(colsCount, i + k);

        for (let j = startJ; j <= endJ; j++) {
            comparisons++;
            const char1 = seq1[i-1];
            const char2 = seq2[j-1];
            const isMatch = char1 === char2;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Evaluating cell within band constraint: |${i} - ${j}| = ${Math.abs(i - j)} <= ${k}`, 3),
                events: [{ type: 'compare', targetIds: ['banded_table'], indices: [i * (colsCount + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            const diagVal = dp[i-1][j-1];
            const topVal = dp[i-1][j];
            const leftVal = dp[i][j-1];

            const choices: number[] = [];
            if (diagVal !== '-') choices.push((diagVal as number) + (isMatch ? matchScore : mismatchScore));
            if (topVal !== '-') choices.push((topVal as number) + gapPenalty);
            if (leftVal !== '-') choices.push((leftVal as number) + gapPenalty);

            if (choices.length > 0) {
                dp[i][j] = Math.max(...choices);
                writes++;
                
                yield {
                    snapshot: makeState({ r: i, c: j }, [], `Calculated DP cell inside band: max(${choices.join(', ')}) = ${dp[i][j]}`, 7),
                    events: [{ type: 'write', targetIds: ['banded_table'], indices: [i * (colsCount + 1) + j] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, [], "Banded scoring matrix complete. Performing alignment traceback... ", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback inside band
    const traceback: { r: number; c: number }[] = [];
    let r = rowsCount;
    let c = colsCount;
    if (dp[r][c] !== '-') traceback.push({ r, c });

    while (r > 0 || c > 0) {
        yield {
            snapshot: makeState({ r, c }, [...traceback], `Traceback cell (${r}, ${c}).`, 1),
            events: [{ type: 'compare', targetIds: ['banded_table'], indices: [r * (colsCount + 1) + c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (r > 0 && c > 0 && dp[r-1][c-1] !== '-') {
            const char1 = seq1[r-1];
            const char2 = seq2[c-1];
            const isMatch = char1 === char2;
            const matchChoice = (dp[r-1][c-1] as number) + (isMatch ? matchScore : mismatchScore);

            if (dp[r][c] === matchChoice) {
                r--;
                c--;
                traceback.push({ r, c });
                continue;
            }
        }

        if (r > 0 && dp[r-1][c] !== '-' && (c === 0 || (dp[r][c] === (dp[r-1][c] as number) + gapPenalty))) {
            r--;
            traceback.push({ r, c });
        } else if (c > 0 && dp[r][c-1] !== '-') {
            c--;
            traceback.push({ r, c });
        } else {
            // Force escape in case band cuts off
            break;
        }
    }

    yield {
        snapshot: makeState(null, [...traceback], "Banded Traceback aligned. Alignment finished.", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
