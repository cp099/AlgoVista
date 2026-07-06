import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'lf-mapping',
    name: 'LF-Mapping Index Tracker',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Implements the Last-to-First column mapping property of the Burrows-Wheeler Transform. The i-th occurrence of character X in the Last column (BWT) corresponds to the identical i-th occurrence of X in the sorted First column.',
    pseudocode: [
        'function LF_Map(idx, char):',
        '  occurrenceCount = count occurrences of char in BWT[0...idx]',
        '  firstColStart = C[char] // smaller chars count',
        '  return firstColStart + occurrenceCount - 1'
    ],
    inputs: [
        {
            id: 'index',
            label: 'Start Row Index',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 0, max: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const startIdx = inputs['index'] as number;

    // F-column (First):  $, A, C, G, T, T
    // L-column (LastBWT): C, $, G, A, T, T
    const F = ['$', 'A', 'C', 'G', 'T', 'T'];
    const L = ['C', '$', 'G', 'A', 'T', 'T'];
    const n = F.length;

    // Counts matrix
    const data: (number | string)[][] = [
        ['$', 'C'],
        ['A', '$'],
        ['C', 'G'],
        ['G', 'A'],
        ['T', 'T'],
        ['T', 'T']
    ];

    const getOccRank = (arr: string[], idx: number): number => {
        const char = arr[idx];
        let rank = 0;
        for (let i = 0; i <= idx; i++) {
            if (arr[i] === char) rank++;
        }
        return rank;
    };

    const makeState = (activeL: number | null, activeF: number | null, msg: string, line: number): AlgoState => {
        // Overlay path links
        const tracebackPaths = (activeL !== null && activeF !== null) 
            ? [{ r: activeL, c: 1 }, { r: activeF, c: 0 }] 
            : undefined;

        return {
            structures: {
                'lf_table': {
                    type: 'matrix',
                    id: 'lf_table',
                    data,
                    rowHeaders: Array.from({ length: n }, (_, i) => `Row ${i}`),
                    colHeaders: ['F (First)', 'L (Last BWT)'],
                    tracebackPaths
                }
            },
            context: {
                variables: {
                    startRow: startIdx,
                    activeL: activeL !== null ? activeL : 'None',
                    activeF: activeF !== null ? activeF : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, `Initializing Last-to-First (LF) mapping from start row index: ${startIdx}`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    const targetChar = L[startIdx];
    const occurrenceCount = getOccRank(L, startIdx);

    yield {
        snapshot: makeState(startIdx, null, `Selected character '${targetChar}' at L-column row ${startIdx}. Rank is occurrence #${occurrenceCount}.`, 2),
        events: [{ type: 'compare', targetIds: ['lf_table'], indices: [startIdx * 2 + 1] }],
        metrics: { comparisons: 1, swaps: 0, writes: 0 }
    };

    // Locate matching instance in F
    let matchIdx = -1;
    let rankF = 0;
    for (let i = 0; i < n; i++) {
        if (F[i] === targetChar) {
            rankF++;
            if (rankF === occurrenceCount) {
                matchIdx = i;
                break;
            }
        }
    }

    yield {
        snapshot: makeState(startIdx, matchIdx, `Located corresponding occurrence #${occurrenceCount} of '${targetChar}' in F-column at row ${matchIdx}.`, 3),
        events: [{ type: 'lock', targetIds: ['lf_table'], indices: [matchIdx * 2] }],
        metrics: { comparisons: 2, swaps: 0, writes: 1 }
    };

    yield {
        snapshot: makeState(startIdx, matchIdx, `LF-Mapping complete. LF(${startIdx}) = ${matchIdx}.`, 4),
        events: [],
        metrics: { comparisons: 2, swaps: 0, writes: 1 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
