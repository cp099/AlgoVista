import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'quick-sort-hoare',
    name: 'Quick Sort (Hoare)',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'The original partition scheme by Hoare. Two indices start at ends of the array and move toward each other, swapping elements that are on the "wrong" side of the pivot.',
    pseudocode: [
        'function partition(arr, low, high):',
        '  pivot = arr[low]',
        '  i = low - 1, j = high + 1',
        '  while true:',
        '    do i++ while arr[i] < pivot',
        '    do j-- while arr[j] > pivot',
        '    if i >= j: return j',
        '    swap(arr[i], arr[j])'
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

    yield { snapshot: makeState({}, 1, "Starting Hoare Quick Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    function* partition(low: number, high: number): Generator<any> {
        const pivot = arr[low]; // Hoare typically uses first element as pivot
        let i = low - 1;
        let j = high + 1;

        yield { 
            snapshot: makeState({ low, high, pivot }, 2, `Partitioning [${low}, ${high}] with Pivot: ${pivot}`),
            events: [{ type: 'visit', targetIds: ['main'], indices: [low] }], // Highlight Pivot
            metrics: { comparisons, swaps, writes: 0 }
        };

        while (true) {
            // Move i
            do {
                i++;
                comparisons++;
                yield { 
                    snapshot: makeState({ i, j, pivot }, 4, `Scanning Left: arr[${i}] (${arr[i]}) < ${pivot}?`),
                    events: [{ type: 'compare', targetIds: ['main'], indices: [i, low] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            } while (arr[i] < pivot);

            // Move j
            do {
                j--;
                comparisons++;
                yield { 
                    snapshot: makeState({ i, j, pivot }, 5, `Scanning Right: arr[${j}] (${arr[j]}) > ${pivot}?`),
                    events: [{ type: 'compare', targetIds: ['main'], indices: [j, low] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            } while (arr[j] > pivot);

            if (i >= j) {
                yield { 
                    snapshot: makeState({ i, j }, 6, `Indices crossed (i >= j). Partition point is ${j}.`),
                    events: [],
                    metrics: { comparisons, swaps, writes: 0 }
                };
                return j;
            }

            // Swap
            const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ i, j, pivot }, 7, `Swapping ${arr[i]} and ${arr[j]}`),
                events: [{ type: 'swap', targetIds: ['main'], indices: [i, j] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
        }
    }

    function* quickSort(low: number, high: number): Generator<any> {
        if (low < high) {
            const piGenerator = partition(low, high);
            let piResult = piGenerator.next();
            while (!piResult.done) {
                yield piResult.value;
                piResult = piGenerator.next();
            }
            const pi = piResult.value as number;

            // Note: Hoare partition returns index such that:
            // Left: [low..pi], Right: [pi+1..high]
            yield* quickSort(low, pi);
            yield* quickSort(pi + 1, high);
        } else {
             // Base case visualization
             yield { 
                snapshot: makeState({ low }, 1, `Element at ${low} is base case`),
                events: [{ type: 'lock', targetIds: ['main'], indices: [low] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
        }
    }

    yield* quickSort(0, n - 1);

    yield { 
        snapshot: makeState({ i: n }, 8, "Hoare Quick Sort Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }], 
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;