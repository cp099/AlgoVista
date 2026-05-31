import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'A Divide and Conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
    pseudocode: [
        'function mergeSort(arr, l, r):',
        '  if l >= r: return',
        '  m = floor((l + r) / 2)',
        '  mergeSort(arr, l, m)',
        '  mergeSort(arr, m + 1, r)',
        '  merge(arr, l, m, r)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [38, 27, 43, 3, 9, 82, 10],
            constraints: { min: 1, max: 99, maxLength: 20 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, writes = 0;

    const makeState = (vars: any = {}, line: number = 0, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, 1, "Starting Merge Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Recursive Generator Helper
    function* mergeSort(l: number, r: number): Generator<any> {
        if (l >= r) return;

        const m = Math.floor((l + r) / 2);
        
        // Visualize the split
        yield { 
            snapshot: makeState({ l, m, r }, 3, `Dividing range [${l}, ${r}] at index ${m}`),
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };

        yield* mergeSort(l, m);
        yield* mergeSort(m + 1, r);
        yield* merge(l, m, r);
    }

    function* merge(l: number, m: number, r: number): Generator<any> {
        // Create temp arrays for the merge
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = new Array(n1);
        const R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        let i = 0, j = 0, k = l;

        yield { 
            snapshot: makeState({ l, m, r }, 6, `Merging ranges [${l}..${m}] and [${m+1}..${r}]`),
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };

        while (i < n1 && j < n2) {
            comparisons++;
            yield { 
                snapshot: makeState({ i, j, k, leftVal: L[i], rightVal: R[j] }, 6, `Comparing ${L[i]} vs ${R[j]}`),
                // Highlight the two elements being compared in the main array
                events: [{ type: 'compare', targetIds: ['main'], indices: [l + i, m + 1 + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                writes++;
                yield { 
                    snapshot: makeState({ k, val: L[i] }, 6, `Taking ${L[i]} from Left subarray`),
                    events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                i++;
            } else {
                arr[k] = R[j];
                writes++;
                yield { 
                    snapshot: makeState({ k, val: R[j] }, 6, `Taking ${R[j]} from Right subarray`),
                    events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                j++;
            }
            k++;
        }

        // Copy remaining elements
        while (i < n1) {
            arr[k] = L[i];
            writes++;
            yield { 
                snapshot: makeState({ k, val: L[i] }, 6, `Copying remaining ${L[i]} from Left`),
                events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            i++; k++;
        }

        while (j < n2) {
            arr[k] = R[j];
            writes++;
            yield { 
                snapshot: makeState({ k, val: R[j] }, 6, `Copying remaining ${R[j]} from Right`),
                events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            j++; k++;
        }
    }

    // Start Recursion
    yield* mergeSort(0, n - 1);

    yield { 
        snapshot: makeState({}, 6, "Merge Sort Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }], 
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;