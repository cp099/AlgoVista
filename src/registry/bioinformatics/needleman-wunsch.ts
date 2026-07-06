import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'needleman-wunsch',
    name: 'Global Sequence Alignment (Needleman-Wunsch)',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Computes the optimal global alignment between two DNA sequences using dynamic programming. Fills a 2D scoring matrix with match/mismatch/gap scores, and then backtracks to construct the aligned strings.',
    pseudocode: [
        'function NeedlemanWunsch(Seq1, Seq2):',
        '  for i from 0 to length(Seq1): dp[i][0] = i * GapPenalty',
        '  for j from 0 to length(Seq2): dp[0][j] = j * GapPenalty',
        '  for i from 1 to length(Seq1):',
        '    for j from 1 to length(Seq2):',
        '      match = dp[i-1][j-1] + Score(Seq1[i-1], Seq2[j-1])',
        '      delete = dp[i-1][j] + GapPenalty',
        '      insert = dp[i][j-1] + GapPenalty',
        '      dp[i][w] = max(match, delete, insert)'
    ],
    inputs: [
        {
            id: 'seq1',
            label: 'DNA Sequence 1 (Rows)',
            type: 'string' as const,
            defaultValue: 'AGT',
            constraints: { minLength: 2, maxLength: 5 }
        },
        {
            id: 'seq2',
            label: 'DNA Sequence 2 (Cols)',
            type: 'string' as const,
            defaultValue: 'AAG',
            constraints: { minLength: 2, maxLength: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const seq1 = (inputs['seq1'] as string).toUpperCase();
    const seq2 = (inputs['seq2'] as string).toUpperCase();
    const rowsCount = seq1.length;
    const colsCount = seq2.length;

    const gapPenalty = -1;
    const matchScore = 1;
    const mismatchScore = -1;

    // Initialize DP matrix size (rowsCount+1) x (colsCount+1)
    const dp: (number | string)[][] = Array.from({ length: rowsCount + 1 }, () => Array(colsCount + 1).fill(0));

    // Fill boundaries
    for (let i = 0; i <= rowsCount; i++) dp[i][0] = i * gapPenalty;
    for (let j = 0; j <= colsCount; j++) dp[0][j] = j * gapPenalty;

    // Row and Col Headers
    const rowHeaders = ['-', ...seq1.split('')];
    const colHeaders = ['-', ...seq2.split('')];

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'alignment_table': {
                    type: 'matrix',
                    id: 'alignment_table',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: {
                    seq1,
                    seq2,
                    activeRow: activeCell ? activeCell.r : 'None',
                    activeCol: activeCell ? activeCell.c : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing Global Sequence Alignment Scoring Matrix...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Fill scoring table
    for (let i = 1; i <= rowsCount; i++) {
        for (let j = 1; j <= colsCount; j++) {
            comparisons++;
            const char1 = seq1[i-1];
            const char2 = seq2[j-1];
            const isMatch = char1 === char2;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Evaluating alignment of '${char1}' (Seq 1) and '${char2}' (Seq 2)`, 5),
                events: [{ type: 'compare', targetIds: ['alignment_table'], indices: [i * (colsCount + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            const diagonal = (dp[i-1][j-1] as number) + (isMatch ? matchScore : mismatchScore);
            const topCell = (dp[i-1][j] as number) + gapPenalty;
            const leftCell = (dp[i][j-1] as number) + gapPenalty;

            dp[i][j] = Math.max(diagonal, topCell, leftCell);
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Match/Mismatch: ${diagonal}, Delete (Gap top): ${topCell}, Insert (Gap left): ${leftCell} -> Max: ${dp[i][j]}`, 8),
                events: [{ type: 'write', targetIds: ['alignment_table'], indices: [i * (colsCount + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [], "Scoring matrix completed. Initiating alignment traceback... ", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback alignment path
    const traceback: { r: number; c: number }[] = [];
    let r = rowsCount;
    let c = colsCount;
    traceback.push({ r, c });

    let aligned1 = "";
    let aligned2 = "";

    while (r > 0 || c > 0) {
        yield {
            snapshot: makeState({ r, c }, [...traceback], `Traceback cell (${r}, ${c}). Aligned: ${aligned1 || 'None'} / ${aligned2 || 'None'}`, 1),
            events: [{ type: 'compare', targetIds: ['alignment_table'], indices: [r * (colsCount + 1) + c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (r > 0 && c > 0) {
            const char1 = seq1[r-1];
            const char2 = seq2[c-1];
            const isMatch = char1 === char2;
            const matchChoice = (dp[r-1][c-1] as number) + (isMatch ? matchScore : mismatchScore);

            if (dp[r][c] === matchChoice) {
                aligned1 = char1 + aligned1;
                aligned2 = char2 + aligned2;
                r--;
                c--;
                traceback.push({ r, c });
                continue;
            }
        }

        if (r > 0 && (c === 0 || (dp[r][c] === (dp[r-1][c] as number) + gapPenalty))) {
            // Gap in Seq 2 (Deletion from Seq 1 perspective)
            aligned1 = seq1[r-1] + aligned1;
            aligned2 = "-" + aligned2;
            r--;
            traceback.push({ r, c });
        } else if (c > 0) {
            // Gap in Seq 1 (Insertion)
            aligned1 = "-" + aligned1;
            aligned2 = seq2[c-1] + aligned2;
            c--;
            traceback.push({ r, c });
        }
    }

    yield {
        snapshot: makeState(null, [...traceback], `Alignment Complete! Result: [Seq1: ${aligned1}] aligned with [Seq2: ${aligned2}]`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
