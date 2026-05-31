import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Iterates through the array one by one until the target element is found.',
    pseudocode: [
        'function linearSearch(arr, target):',
        '  for i from 0 to length(arr) - 1:',
        '    if arr[i] == target:',
        '      return i',
        '  return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'List of Numbers',
            type: 'array' as const,
            defaultValue: [10, 50, 30, 70, 80, 20],
            constraints: { min: 1, max: 99, maxLength: 10 }
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
    const arr = [...(inputs['arr'] as number[])];
    const target = inputs['target'] as number;
    const n = arr.length;

    const makeState = (vars: any = {}, line: number = 0, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, target, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, 1, `Searching for ${target}...`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n; i++) {
        // Compare
        yield { 
            snapshot: makeState({ i }, 3, `Checking index ${i}: Is ${arr[i]} == ${target}?`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons: i + 1, swaps: 0, writes: 0 }
        };

        if (arr[i] === target) {
            // Found
            yield { 
                snapshot: makeState({ i, result: i }, 4, `Found target ${target} at index ${i}!`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons: i + 1, swaps: 0, writes: 0 }
            };
            return;
        }
    }

    // Not Found
    yield { 
        snapshot: makeState({ result: -1 }, 5, `Target ${target} not found in array.`), 
        events: [], 
        metrics: { comparisons: n, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;