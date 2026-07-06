import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'smith-waterman',
    name: 'Local Sequence Alignment (Smith-Waterman)',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Finds the optimal local alignment between two sequences. Fills a 2D scoring matrix with values clamped to a minimum of 0, then traces back from the highest-scoring cell in the matrix.',
    pseudocode: [
        'function SmithWaterman(Seq1, Seq2):',
        '  for i from 0 to length(Seq1): dp[i][0] = 0',
        '  for j from 0 to length(Seq2): dp[0][j] = 0',
        '  for i from 1 to length(Seq1):',
        '    for j from 1 to length(Seq2):',
        '      match = dp[i-1][j-1] + Score(Seq1[i-1], Seq2[j-1])',
        '      delete = dp[i-1][j] + GapPenalty',
        '      insert = dp[i][j-1] + GapPenalty',
        '      dp[i][j] = max(0, match, delete, insert)'
    ],
    inputs: [
        {
            id: 'seq1',
            label: 'DNA Sequence 1 (Rows)',
            type: 'string' as const,
            defaultValue: 'TGCT',
            constraints: { minLength: 2, maxLength: 5 }
        },
        {
            id: 'seq2',
            label: 'DNA Sequence 2 (Cols)',
            type: 'string' as const,
            defaultValue: 'GCT',
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
    const matchScore = 2;
    const mismatchScore = -1;

    // Initialize DP matrix size (rowsCount+1) x (colsCount+1) filled with 0s
    const dp: (number | string)[][] = Array.from({ length: rowsCount + 1 }, () => Array(colsCount + 1).fill(0));

    // Headers
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
        snapshot: makeState(null, [], "Initializing Local Sequence Alignment Scoring Matrix (Smith-Waterman)...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let maxVal = 0;
    let maxCell = { r: 0, c: 0 };

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

            // Smith-Waterman clamps value to >= 0
            const score = Math.max(0, diagonal, topCell, leftCell);
            dp[i][j] = score;
            writes++;

            if (score > maxVal) {
                maxVal = score;
                maxCell = { r: i, c: j };
            }

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Scored: max(0, match: ${diagonal}, del: ${topCell}, ins: ${leftCell}) = ${score}`, 9),
                events: [{ type: 'write', targetIds: ['alignment_table'], indices: [i * (colsCount + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [], `Scoring complete. Maximum score found: ${maxVal} at cell (${maxCell.r}, ${maxCell.c}). Starting local traceback...`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback alignment path starting from the maximum cell, stop when we hit 0
    const traceback: { r: number; c: number }[] = [];
    let r = maxCell.r;
    let c = maxCell.c;
    
    if (maxVal > 0) {
        traceback.push({ r, c });
    }

    let aligned1 = "";
    let aligned2 = "";

    while (r > 0 && c > 0 && (dp[r][c] as number) > 0) {
        yield {
            snapshot: makeState({ r, c }, [...traceback], `Traceback cell (${r}, ${c}). Value: ${dp[r][c]}. Aligned: ${aligned1 || 'None'} / ${aligned2 || 'None'}`, 1),
            events: [{ type: 'compare', targetIds: ['alignment_table'], indices: [r * (colsCount + 1) + c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        const char1 = seq1[r-1];
        const char2 = seq2[c-1];
        const isMatch = char1 === char2;
        
        const matchChoice = (dp[r-1][c-1] as number) + (isMatch ? matchScore : mismatchScore);
        const gapCol = (dp[r-1][c] as number) + gapPenalty;
        
        if (dp[r][c] === matchChoice) {
            aligned1 = char1 + aligned1;
            aligned2 = char2 + aligned2;
            r--;
            c--;
        } else if (dp[r][c] === gapCol) {
            aligned1 = char1 + aligned1;
            aligned2 = "-" + aligned2;
            r--;
        } else {
            aligned1 = "-" + aligned1;
            aligned2 = char2 + aligned2;
            c--;
        }
        traceback.push({ r, c });
    }

    yield {
        snapshot: makeState(null, [...traceback], `Local Alignment Complete! High scoring matching alignment: [Seq1: ${aligned1 || '-'}] matched with [Seq2: ${aligned2 || '-'}]. Score: ${maxVal}`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
