import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fm-index',
    name: 'FM-Index Exact Pattern Search',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Finds occurrence count and matches of a query sequence in a genome index using LF-mapping (Last-to-First column transitions) on the Burrows-Wheeler Transform space.',
    pseudocode: [
        'function FMIndexSearch(Pattern, BWT):',
        '  top = 0, bottom = length(BWT) - 1',
        '  while top <= bottom and Pattern is not empty:',
        '    char = pop last character of Pattern',
        '    top = C[char] + Occ(char, top - 1)',
        '    bottom = C[char] + Occ(char, bottom) - 1',
        '  return count = bottom - top + 1'
    ],
    inputs: [
        {
            id: 'pattern',
            label: 'DNA Query Pattern (e.g. TG)',
            type: 'string' as const,
            defaultValue: 'TG',
            constraints: { minLength: 1, maxLength: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const pattern = (inputs['pattern'] as string).toUpperCase();
    
    // Genome text = "ATTGC$" -> BWT = "C$GATT"
    // Sorted rotations mapping:
    // F-column (First):  $, A, T, T, G, C
    // L-column (LastBWT): C, $, G, A, T, T
    const F = ['$', 'A', 'C', 'G', 'T', 'T'];
    const L = ['C', '$', 'G', 'A', 'T', 'T'];
    const n = F.length;

    // Counts matrix: row index is index in BWT, cell value is [F_char, L_char, Rank]
    const data: (number | string)[][] = [
        ['$', 'C', 0], // C:0
        ['A', '$', 0], // $:0
        ['C', 'G', 0], // G:0
        ['G', 'A', 0], // A:0
        ['T', 'T', 0], // T:0
        ['T', 'T', 1]  // T:1
    ];

    // Count arrays: C[char] is count of characters lexicographically smaller than char in F
    const C: Record<string, number> = { '$': 0, 'A': 1, 'C': 2, 'G': 3, 'T': 4 };

    // Occ(char, idx) counts occurrences of char in BWT prefix L[0...idx]
    const getOcc = (char: string, idx: number): number => {
        let count = 0;
        for (let i = 0; i <= idx; i++) {
            if (L[i] === char) count++;
        }
        return count;
    };

    const makeState = (top: number, bottom: number, activeIdx: number | null, msg: string, line: number): AlgoState => {
        // Highlight active first/last range in matrix structure
        const matrixData = data.map((row, idx) => {
            const rangeMarker = (idx >= top && idx <= bottom) ? `${row[0]} [R]` : String(row[0]);
            return [rangeMarker, row[1], getOcc(String(row[1]), idx) - 1];
        });

        return {
            structures: {
                'fm_table': {
                    type: 'matrix',
                    id: 'fm_table',
                    data: matrixData,
                    rowHeaders: Array.from({ length: n }, (_, i) => `Idx ${i}`),
                    colHeaders: ['F (First)', 'L (BWT Last)', 'Occ Rank']
                }
            },
            context: {
                variables: { pattern, activeRange: `[${top}, ${bottom}]`, searchChar: activeIdx !== null ? pattern[activeIdx] : 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    let top = 0;
    let bottom = n - 1;
    let comparisons = 0;

    yield {
        snapshot: makeState(top, bottom, null, `Starting FM-Index exact search for pattern "${pattern}". Range top=0, bottom=${bottom}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    for (let i = pattern.length - 1; i >= 0; i--) {
        const char = pattern[i];
        comparisons++;

        yield {
            snapshot: makeState(top, bottom, i, `Processing pattern character '${char}' from right-to-left.`, 3),
            events: [],
            metrics: { comparisons, swaps: 0, writes: 0 }
        };

        if (C[char] === undefined) {
            top = 1;
            bottom = 0; // Not found
            break;
        }

        const prevTopOcc = getOcc(char, top - 1);
        const bottomOcc = getOcc(char, bottom);

        top = C[char] + prevTopOcc;
        bottom = C[char] + bottomOcc - 1;

        yield {
            snapshot: makeState(top, bottom, i, `Updated range to C['${char}'](${C[char]}) + Occ: top=${top}, bottom=${bottom}.`, 5),
            events: [{ type: 'compare', targetIds: ['fm_table'], indices: [top * 3, bottom * 3] }],
            metrics: { comparisons, swaps: 0, writes: 2 }
        };

        if (top > bottom) {
            yield {
                snapshot: makeState(top, bottom, null, `Range collapsed. Character '${char}' mismatch. Pattern does not occur in text.`, 3),
                events: [],
                metrics: { comparisons, swaps: 0, writes: 2 }
            };
            return;
        }
    }

    const occurrencesCount = bottom - top + 1;
    yield {
        snapshot: makeState(top, bottom, null, `Search Successful! Found ${occurrencesCount} exact match occurrences of pattern "${pattern}" in the text.`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 2 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
