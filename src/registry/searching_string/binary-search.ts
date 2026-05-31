import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'Efficiently finds a target in a SORTED array by repeatedly dividing the search interval in half.',
    pseudocode: [
        'low = 0, high = n - 1',
        'while low <= high:',
        '  mid = floor((low + high) / 2)',
        '  if arr[mid] == target: return mid',
        '  if arr[mid] < target: low = mid + 1',
        '  else: high = mid - 1',
        'return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'List (Will be sorted)',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 40, 50, 60, 70, 80, 90],
            constraints: { min: 1, max: 99, maxLength: 15 }
        },
        {
            id: 'target',
            label: 'Target Number',
            type: 'integer' as const,
            defaultValue: 30
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    // Binary Search REQUIRES sorted data. We force sort it here.
    let arr = [...(inputs['arr'] as number[])].sort((a, b) => a - b);
    const target = inputs['target'] as number;
    const n = arr.length;
    let comparisons = 0;

    const makeState = (vars: any = {}, line: number = 0, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { low: vars.low, high: vars.high, mid: vars.mid, target }, pseudocodeLine: line, message: msg }
    });

    let low = 0;
    let high = n - 1;

    yield { snapshot: makeState({ low, high }, 1, "Binary Search (Array Auto-Sorted)"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        comparisons++;

        // Highlight the range being considered
        yield { 
            snapshot: makeState({ low, high, mid }, 3, `Checking middle element at index ${mid} (${arr[mid]})`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [mid] }],
            metrics: { comparisons, swaps: 0, writes: 0 }
        };

        if (arr[mid] === target) {
            // Found
            yield { 
                snapshot: makeState({ low, high, mid, result: mid }, 4, `Found ${target} at index ${mid}!`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [mid] }],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };
            return;
        }

        if (arr[mid] < target) {
            low = mid + 1;
            yield { 
                snapshot: makeState({ low, high, mid }, 5, `${arr[mid]} < ${target}, look in right half`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };
        } else {
            high = mid - 1;
            yield { 
                snapshot: makeState({ low, high, mid }, 6, `${arr[mid]} > ${target}, look in left half`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };
        }
    }

    yield { 
        snapshot: makeState({ low, high, result: -1 }, 7, "Target not found."), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;