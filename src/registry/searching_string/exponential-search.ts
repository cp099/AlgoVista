import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'exponential-search',
    name: 'Exponential Search',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'Finds range where element is present by jumping 2^i indices, then performs Binary Search in that range. Useful for unbounded arrays.',
    pseudocode: [
        'if arr[0] == x: return 0',
        'i = 1',
        'while i < n and arr[i] <= x:',
        '  i = i * 2',
        'return binarySearch(arr, i/2, min(i, n-1), x)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Sorted Array',
            type: 'array' as const,
            defaultValue: [2, 3, 4, 10, 40, 55, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            constraints: { min: 1, max: 999, maxLength: 20 }
        },
        {
            id: 'target',
            label: 'Target',
            type: 'integer' as const,
            defaultValue: 120
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])].sort((a, b) => a - b);
    const target = inputs['target'] as number;
    const n = arr.length;
    let comparisons = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars, target }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState({}, "Starting Exponential Search"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    if (arr[0] === target) {
        yield { 
            snapshot: makeState({ result: 0 }, "Found at index 0"), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [0] }],
            metrics: { comparisons: 1, swaps: 0, writes: 0 } 
        };
        return;
    }

    let i = 1;
    while (i < n && arr[i] <= target) {
        comparisons++;
        yield { 
            snapshot: makeState({ i, val: arr[i] }, `Checking index ${i} (${arr[i]}) <= ${target}`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
        
        if (arr[i] === target) {
             yield { 
                snapshot: makeState({ i, result: i }, `Found target at ${i}`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }

        i = i * 2;
    }

    // Binary Search Range
    let left = Math.floor(i / 2);
    let right = Math.min(i, n - 1);

    yield { 
        snapshot: makeState({ left, right }, `Target is in range [${left}, ${right}]. Switching to Binary Search.`), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };

    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        comparisons++;

        yield { 
            snapshot: makeState({ left, right, mid }, `Binary Search: Checking ${arr[mid]}`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [mid] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr[mid] === target) {
            yield { 
                snapshot: makeState({ mid, result: mid }, `Found target at index ${mid}`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [mid] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }

        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    yield { 
        snapshot: makeState({ result: -1 }, "Target not found"), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;