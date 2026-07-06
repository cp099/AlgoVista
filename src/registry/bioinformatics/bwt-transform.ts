import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'bwt-transform',
    name: 'Burrows-Wheeler Transform (BWT)',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Generates all cyclic rotations of an input sequence ending in $, sorts them lexicographically, and takes the last character of each rotation to yield the BWT string used in mapping indexes.',
    pseudocode: [
        'function BWT(Text):',
        '  Text = Text + "$"',
        '  Rotations = array of all cyclic shifts of Text',
        '  Sort Rotations lexicographically',
        '  BWTString = last column characters of sorted Rotations',
        '  return BWTString'
    ],
    inputs: [
        {
            id: 'text',
            label: 'DNA Sequence (e.g. AGTC)',
            type: 'string' as const,
            defaultValue: 'AGTC',
            constraints: { minLength: 2, maxLength: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const rawText = inputs['text'] as string;
    const text = rawText + '$';
    const n = text.length;

    // Generate cyclic rotations
    const rotations: string[] = [];
    for (let i = 0; i < n; i++) {
        rotations.push(text.slice(i) + text.slice(0, i));
    }

    // Convert rotations to character matrix data
    const makeMatrixData = (rotArray: string[]): string[][] => {
        return rotArray.map(rot => rot.split(''));
    };

    const makeState = (matrix: string[][], highlightRow: number | null, sorted: boolean, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'rotations_table': {
                    type: 'matrix',
                    id: 'rotations_table',
                    data: matrix,
                    rowHeaders: Array.from({ length: n }, (_, i) => `Rot ${i}`),
                    colHeaders: Array.from({ length: n }, (_, j) => `Col ${j}`)
                }
            },
            context: {
                variables: { text, length: n, isSorted: sorted ? 'Yes' : 'No', activeIndex: highlightRow ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(makeMatrixData(rotations), null, false, `Appended "$" end-marker to sequence. Created ${n} cyclic rotations.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // Sort rotations
    const sortedRotations = [...rotations];
    let comparisons = 0;
    const swaps = 0;

    sortedRotations.sort((a, b) => {
        comparisons++;
        return a.localeCompare(b);
    });

    yield {
        snapshot: makeState(makeMatrixData(sortedRotations), null, true, "Lexicographically sorted all cyclic rotations.", 4),
        events: [],
        metrics: { comparisons, swaps, writes: 0 }
    };

    // Construct final BWT string
    const bwt = sortedRotations.map(rot => rot[n - 1]).join('');

    // Highlight the final column
    for (let i = 0; i < n; i++) {
        yield {
            snapshot: makeState(makeMatrixData(sortedRotations), i, true, `Extracting last column index character: '${sortedRotations[i][n-1]}'`, 5),
            events: [{ type: 'compare', targetIds: ['rotations_table'], indices: [i * n + (n - 1)] }],
            metrics: { comparisons, swaps, writes: i + 1 }
        };
    }

    yield {
        snapshot: makeState(makeMatrixData(sortedRotations), null, true, `BWT Transform Complete. Compressed output BWT: "${bwt}"`, 6),
        events: [],
        metrics: { comparisons, swaps, writes: n }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
