import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'ternary-search',
    name: 'Ternary Search',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'Divides the sorted array into three parts using two midpoints. If the target is not found at the midpoints, it recursively searches in one of the three sub-arrays.',
    pseudocode: [
        'function ternarySearch(l, r, x):',
        '  if r >= l:',
        '    mid1 = l + (r - l) / 3',
        '    mid2 = r - (r - l) / 3',
        '    if arr[mid1] == x: return mid1',
        '    if arr[mid2] == x: return mid2',
        '    if x < arr[mid1]: return ternarySearch(l, mid1 - 1, x)',
        '    if x > arr[mid2]: return ternarySearch(mid2 + 1, r, x)',
        '    return ternarySearch(mid1 + 1, mid2 - 1, x)',
        '  return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Sorted Array',
            type: 'array' as const,
            defaultValue: [1, 5, 8, 12, 16, 23, 38, 56, 72, 91, 100, 120],
            constraints: { min: 1, max: 999, maxLength: 20 }
        },
        {
            id: 'target',
            label: 'Target',
            type: 'integer' as const,
            defaultValue: 38
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])].sort((a, b) => a - b);
    const target = inputs['target'] as number;
    const n = arr.length;
    let comparisons = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars, target }, pseudocodeLine: line, message: msg }
    });

    let l = 0;
    let r = n - 1;

    yield { snapshot: makeState({ l, r }, "Starting Ternary Search", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (r >= l) {
        const mid1 = l + Math.floor((r - l) / 3);
        const mid2 = r - Math.floor((r - l) / 3);

        comparisons += 2;
        yield { 
            snapshot: makeState({ l, r, mid1, mid2 }, `Checking Pivots: ${arr[mid1]} and ${arr[mid2]}`, 2), 
            events: [
                { type: 'compare', targetIds: ['main'], indices: [mid1] },
                { type: 'compare', targetIds: ['main'], indices: [mid2] }
            ],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr[mid1] === target) {
            yield { 
                snapshot: makeState({ result: mid1 }, `Found at mid1 (${mid1})`, 5), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [mid1] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }
        if (arr[mid2] === target) {
            yield { 
                snapshot: makeState({ result: mid2 }, `Found at mid2 (${mid2})`, 6), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [mid2] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }

        if (target < arr[mid1]) {
            r = mid1 - 1;
            yield { 
                snapshot: makeState({ l, r }, `Target < ${arr[mid1]}. Search Left Third.`, 7), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        } else if (target > arr[mid2]) {
            l = mid2 + 1;
            yield { 
                snapshot: makeState({ l, r }, `Target > ${arr[mid2]}. Search Right Third.`, 8), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        } else {
            l = mid1 + 1;
            r = mid2 - 1;
            yield { 
                snapshot: makeState({ l, r }, `Target is between ${arr[mid1]} and ${arr[mid2]}. Search Middle.`, 9), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState({ result: -1 }, "Target not found", 10), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;