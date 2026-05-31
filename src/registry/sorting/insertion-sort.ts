import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'Builds the sorted array one item at a time. It picks the next element and inserts it into its correct position within the already sorted part of the array, shifting larger elements to the right.',
    pseudocode: [
        'function insertionSort(arr):',
        '  for i from 1 to length(arr) - 1:',
        '    key = arr[i]',
        '    j = i - 1',
        '    while j >= 0 and arr[j] > key:',
        '      arr[j + 1] = arr[j]',
        '      j = j - 1',
        '    arr[j + 1] = key'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [12, 11, 13, 5, 6, 7],
            constraints: { min: 1, max: 99, maxLength: 10 }
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

    yield { snapshot: makeState({}, 1, "Starting Insertion Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // The first element (index 0) is trivially sorted. Start from 1.
    yield { 
        snapshot: makeState({ i: 0 }, 1, `${arr[0]} is initially considered sorted.`),
        events: [{ type: 'lock', targetIds: ['main'], indices: [0] }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;

        // Visual: Select the key
        yield { 
            snapshot: makeState({ i, key, j }, 2, `Selected key: ${key}. Finding its position...`),
            events: [{ type: 'visit', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        while (j >= 0) {
            comparisons++;
            // Compare key with arr[j]
            yield { 
                snapshot: makeState({ i, key, j }, 4, `Comparing ${arr[j]} > ${key}?`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (arr[j] > key) {
                // SHIFT LOGIC
                arr[j + 1] = arr[j];
                writes++;
                
                yield { 
                    snapshot: makeState({ i, key, j }, 5, `Shift ${arr[j]} to the right`),
                    // We use 'write' to show overwriting/shifting
                    events: [{ type: 'write', targetIds: ['main'], indices: [j + 1] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                
                j = j - 1;
            } else {
                // Found the spot
                break;
            }
        }
        
        // Insert Key
        arr[j + 1] = key;
        writes++;
        yield { 
            snapshot: makeState({ i, key }, 7, `Inserted ${key} at index ${j + 1}`),
            events: [{ type: 'write', targetIds: ['main'], indices: [j + 1] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        // Mark sorted up to i
        yield {
            snapshot: makeState({ i }, 1, `Array is sorted up to index ${i}`),
            events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: i + 1}, (_, k) => k) }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield { 
        snapshot: makeState({ i: n }, 8, "Sorting Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }], 
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;