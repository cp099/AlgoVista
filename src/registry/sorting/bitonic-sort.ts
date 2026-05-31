import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'bitonic-sort',
    name: 'Bitonic Sort',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'A parallel algorithm for sorting. It builds a bitonic sequence (increasing then decreasing) and then merges it. Works best when n is a power of 2.',
    pseudocode: [
        'function bitonicSort(arr, low, cnt, dir):',
        '  if cnt > 1:',
        '    k = cnt / 2',
        '    bitonicSort(arr, low, k, 1)  // Sort ascending',
        '    bitonicSort(arr, low+k, k, 0) // Sort descending',
        '    bitonicMerge(arr, low, cnt, dir)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (Power of 2 size recommended)',
            type: 'array' as const,
            defaultValue: [3, 7, 4, 8, 6, 2, 1, 5],
            constraints: { min: 1, max: 99, maxLength: 16 }
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

    yield { snapshot: makeState({}, "Starting Bitonic Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Pad array to power of 2 if necessary (internal logic doesn't require visual padding, 
    // but algorithm works strictly on power of 2 lengths ideally. We'll implement arbitrary n logic or stick to power of 2 assumption).
    // For visualization simplicity, let's assume power of 2 or just run the logic (it might skip elements if not).
    
    function* bitonicMerge(low: number, cnt: number, dir: boolean): Generator<any> {
        if (cnt > 1) {
            const k = Math.floor(cnt / 2);
            for (let i = low; i < low + k; i++) {
                comparisons++;
                const dirStr = dir ? 'Ascending' : 'Descending';
                
                yield { 
                    snapshot: makeState({ low, cnt, i, j: i+k, dir: dirStr }, `Comparing ${arr[i]} vs ${arr[i+k]}`), 
                    events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+k] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };

                if (dir === (arr[i] > arr[i + k])) {
                    const temp = arr[i]; arr[i] = arr[i + k]; arr[i + k] = temp;
                    swaps++;
                    yield { 
                        snapshot: makeState({ low, cnt, i, j: i+k, dir: dirStr }, `Swapping to match direction`), 
                        events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+k] }],
                        metrics: { comparisons, swaps, writes: 0 } 
                    };
                }
            }
            yield* bitonicMerge(low, k, dir);
            yield* bitonicMerge(low + k, k, dir);
        }
    }

    function* bitonicSort(low: number, cnt: number, dir: boolean): Generator<any> {
        if (cnt > 1) {
            const k = Math.floor(cnt / 2);
            
            // Sort first half in ascending order
            yield* bitonicSort(low, k, true);
            
            // Sort second half in descending order
            yield* bitonicSort(low + k, k, false);
            
            // Merge sequence
            yield* bitonicMerge(low, cnt, dir);
        }
    }

    yield* bitonicSort(0, n, true); // Sort entire array in ascending order (1 = true)

    yield { 
        snapshot: makeState({}, "Bitonic Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;