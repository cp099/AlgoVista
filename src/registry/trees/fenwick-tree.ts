import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fenwick-tree',
    name: 'Fenwick Tree (Binary Indexed)',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Computes prefix sums and updates elements in logarithmic time using binary-indexed structures based on least significant bits (LSB).',
    pseudocode: [
        'function PrefixSum(BIT, index):',
        '  sum = 0',
        '  while index > 0:',
        '    sum += BIT[index]',
        '    index = index - (index & -index) // Clear LSB',
        '  return sum'
    ],
    inputs: [
        {
            id: 'queryIndex',
            label: 'Prefix Sum Index (1-indexed)',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 1, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const idxInput = inputs['queryIndex'] as number;

    const bitData = [0, 5, 11, 3, 20]; // 1-indexed helper

    const makeState = (currIdx: number, totalSum: number, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'bit_array': { type: 'array', id: 'Fenwick Tree Array (BIT)', data: [...bitData] }
            },
            context: {
                variables: {
                    queryLimit: idxInput,
                    currentIndex: currIdx,
                    lsbCleared: currIdx - (currIdx & -currIdx),
                    accumulatedPrefixSum: totalSum
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(idxInput, 0, `Initializing prefix sum query at index ${idxInput}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let sum = 0;
    let index = idxInput;

    while (index > 0) {
        comparisons++;
        const val = bitData[index];
        sum += val;
        writes++;

        const nextIndex = index - (index & -index);

        yield {
            snapshot: makeState(index, sum, `Adding BIT[${index}] = ${val} to sum. Next index: ${index} - (${index} & -${index}) = ${nextIndex}.`, 4),
            events: [{ type: 'compare', targetIds: ['bit_array'], indices: [index] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        index = nextIndex;
    }

    yield {
        snapshot: makeState(0, sum, `Prefix sum calculation finished. Total sum: ${sum}.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
