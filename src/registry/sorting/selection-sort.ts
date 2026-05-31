import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'Divides the list into a sorted and unsorted region. It repeatedly finds the minimum element from the unsorted region and swaps it with the first unsorted element.',
    pseudocode: [
        'function selectionSort(arr):',
        '  n = length(arr)',
        '  for i from 0 to n - 1:',
        '    minIndex = i',
        '    for j from i + 1 to n:',
        '      if arr[j] < arr[minIndex]:',
        '        minIndex = j',
        '    if minIndex != i:',
        '      swap(arr[i], arr[minIndex])'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [64, 25, 12, 22, 11, 8, 33, 2, 17],
            constraints: { min: 1, max: 99, maxLength: 10 }
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

    yield { snapshot: makeState({}, 1, "Starting Selection Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        yield { 
            snapshot: makeState({ i, minIndex }, 3, `Current minimum assumed at index ${i} (${arr[i]})`),
            events: [{ type: 'visit', targetIds: ['main'], indices: [i] }], // Mark current start
            metrics: { comparisons, swaps, writes: 0 }
        };

        for (let j = i + 1; j < n; j++) {
            comparisons++;
            yield { 
                snapshot: makeState({ i, j, minIndex }, 5, `Comparing ${arr[j]} < ${arr[minIndex]}?`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [j, minIndex] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[j] < arr[minIndex]) {
                minIndex = j;
                yield { 
                    snapshot: makeState({ i, j, minIndex }, 6, `New minimum found: ${arr[j]}`),
                    events: [{ type: 'visit', targetIds: ['main'], indices: [j] }], // Highlight new min
                    metrics: { comparisons, swaps, writes: 0 }
                };
            }
        }

        if (minIndex !== i) {
            let temp = arr[i]; arr[i] = arr[minIndex]; arr[minIndex] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ i, minIndex }, 8, `Swapping ${arr[i]} with minimum ${arr[minIndex]}`),
                events: [{ type: 'swap', targetIds: ['main'], indices: [i, minIndex] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
        } else {
            yield { 
                snapshot: makeState({ i }, 8, `${arr[i]} is already the minimum, no swap needed.`),
                events: [],
                metrics: { comparisons, swaps, writes: 0 }
            };
        }
        
        // Mark as sorted
        yield { 
            snapshot: makeState({ i }, 2, `${arr[i]} is now sorted.`),
            events: [{ type: 'lock', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons, swaps, writes: 0 }
        };
    }

    yield { 
        snapshot: makeState({ i: n }, 9, "Sorting Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;