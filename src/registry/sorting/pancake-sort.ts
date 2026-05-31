import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'pancake-sort',
    name: 'Pancake Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'Sorts the array using only one operation: flip(k), which reverses the first k elements. Like sorting a stack of pancakes by size using a spatula.',
    pseudocode: [
        'function flip(arr, k): reverse arr[0..k]',
        'for currSize from n to 1:',
        '  maxIdx = findMax(arr, currSize)',
        '  if maxIdx != currSize - 1:',
        '    if maxIdx != 0:',
        '      flip(arr, maxIdx)',
        '    flip(arr, currSize - 1)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [23, 10, 20, 11, 12, 6, 7],
            constraints: { min: 1, max: 99, maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: 0, message: msg }
    });

    // Helper to reverse array from 0 to k
    function* flip(k: number): Generator<any> {
        if (k < 1) return;
        
        yield { 
            snapshot: makeState({ k }, `Flipping first ${k+1} pancakes`), 
            events: [{ type: 'write', targetIds: ['main'], indices: Array.from({length: k+1}, (_, i) => i) }], // Highlight range
            metrics: { comparisons, swaps, writes: 0 } 
        };

        let start = 0;
        let end = k;
        while (start < end) {
            const temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
            swaps++;
        }

        yield { 
            snapshot: makeState({ k }, `Flipped`), 
            events: [],
            metrics: { comparisons, swaps, writes: 0 } 
        };
    }

    yield { snapshot: makeState({}, "Starting Pancake Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let currSize = n; currSize > 1; currSize--) {
        // Find max element in arr[0..currSize-1]
        let maxIdx = 0;
        for (let i = 0; i < currSize; i++) {
            comparisons++;
            yield { 
                snapshot: makeState({ currSize, i, maxIdx }, `Finding max in unsorted range`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, maxIdx] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            if (arr[i] > arr[maxIdx]) {
                maxIdx = i;
            }
        }

        if (maxIdx !== currSize - 1) {
            // 1. Move max to beginning (Flip 0..maxIdx)
            if (maxIdx > 0) {
                yield { 
                    snapshot: makeState({ currSize, maxIdx }, `Max (${arr[maxIdx]}) found at ${maxIdx}. Flipping to top.`), 
                    events: [],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
                yield* flip(maxIdx);
            }

            // 2. Move max to end (Flip 0..currSize-1)
            yield { 
                snapshot: makeState({ currSize }, `Flipping top element to position ${currSize-1}`), 
                events: [],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* flip(currSize - 1);
        }

        // Lock sorted position
        yield { 
            snapshot: makeState({ currSize }, `${arr[currSize-1]} is sorted`), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [currSize - 1] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };
    }

    yield { 
        snapshot: makeState({}, "Pancake Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;