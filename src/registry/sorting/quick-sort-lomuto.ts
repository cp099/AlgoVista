import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'quick-sort-lomuto',
    name: 'Quick Sort (Lomuto)',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'A Divide and Conquer algorithm. It picks a "pivot" element (last element) and partitions the array such that smaller elements are on left, larger on right.',
    pseudocode: [
        'function quickSort(arr, low, high):',
        '  if low < high:',
        '    pi = partition(arr, low, high)',
        '    quickSort(arr, low, pi - 1)',
        '    quickSort(arr, pi + 1, high)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [10, 80, 30, 90, 40, 50, 70],
            constraints: { min: 1, max: 99, maxLength: 15 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, line: number = 0, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, 1, "Starting Quick Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    function* partition(low: number, high: number): Generator<any> {
        const pivot = arr[high];
        let i = low - 1; // Index of smaller element

        yield { 
            snapshot: makeState({ low, high, pivot, i }, 2, `Partitioning range [${low}, ${high}] with Pivot: ${pivot}`),
            events: [{ type: 'visit', targetIds: ['main'], indices: [high] }], // Highlight Pivot
            metrics: { comparisons, swaps, writes: 0 }
        };

        for (let j = low; j < high; j++) {
            comparisons++;
            yield { 
                snapshot: makeState({ low, high, pivot, i, j }, 3, `Comparing ${arr[j]} < ${pivot}?`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [j, high] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[j] < pivot) {
                i++;
                if (i !== j) {
                    const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                    swaps++;
                    yield { 
                        snapshot: makeState({ low, high, pivot, i, j }, 4, `Swapping ${arr[i]} and ${arr[j]}`),
                        events: [{ type: 'swap', targetIds: ['main'], indices: [i, j] }],
                        metrics: { comparisons, swaps, writes: 0 }
                    };
                }
            }
        }

        // Place pivot in correct position
        const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        swaps++;
        yield { 
            snapshot: makeState({ pivot, pos: i + 1 }, 5, `Moving pivot to position ${i + 1}`),
            events: [{ type: 'swap', targetIds: ['main'], indices: [i + 1, high] }],
            metrics: { comparisons, swaps, writes: 0 }
        };

        // Pivot is now locked/sorted
        yield { 
            snapshot: makeState({ pivot }, 5, `Pivot ${pivot} is locked`),
            events: [{ type: 'lock', targetIds: ['main'], indices: [i + 1] }],
            metrics: { comparisons, swaps, writes: 0 }
        };

        return i + 1;
    }

    function* quickSort(low: number, high: number): Generator<any> {
        if (low < high) {
            const piGenerator = partition(low, high);
            let piResult = piGenerator.next();
            
            // Delegate to partition generator
            while (!piResult.done) {
                yield piResult.value;
                piResult = piGenerator.next();
            }
            // Get the return value (pivot index)
            const pi = piResult.value as number;

            yield* quickSort(low, pi - 1);
            yield* quickSort(pi + 1, high);
        } else if (low === high) {
             // Single element ranges are sorted
             yield { 
                snapshot: makeState({ low }, 1, `Element ${arr[low]} is sorted (base case)`),
                events: [{ type: 'lock', targetIds: ['main'], indices: [low] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
        }
    }

    yield* quickSort(0, n - 1);

    yield { 
        snapshot: makeState({ i: n }, 6, "Quick Sort Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }], 
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;