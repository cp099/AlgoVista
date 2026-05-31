import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    pseudocode: [
        'function bubbleSort(arr):',
        '  n = length(arr)',
        '  for i from 0 to n - 1:',
        '    for j from 0 to n - i - 1:',
        '      if arr[j] > arr[j+1]:',
        '        swap(arr[j], arr[j+1])'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [5, 1, 4, 2, 8],
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

    yield { snapshot: makeState({}, 1, "Starting Bubble Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            yield {
                snapshot: makeState({ i, j }, 4, `Comparing ${arr[j]} and ${arr[j+1]}`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [j, j+1] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[j] > arr[j + 1]) {
                const temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
                swaps++;
                yield {
                    snapshot: makeState({ i, j }, 5, `Swapping ${arr[j]} and ${arr[j+1]}`),
                    events: [{ type: 'swap', targetIds: ['main'], indices: [j, j+1] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            }
        }
        
        yield {
             snapshot: makeState({ i }, 2, `${arr[n-i-1]} is now sorted`),
            events: [{ type: 'lock', targetIds: ['main'], indices: [n - i - 1] }],
            metrics: { comparisons, swaps, writes: 0 }
        };
    }

    yield {
        snapshot: makeState({ i: n, j: 0 }, 6, "Sorting Complete."),
        events: [],
        metrics: { comparisons, swaps, writes: 0 }
    };
};

// --- EXPORT ---
const bundle: AlgorithmBundle = { manifest, run };
export default bundle;