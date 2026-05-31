import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'An improvement over Binary Search for uniformly distributed data. Instead of always checking the middle, it estimates the position of the target based on its value.',
    pseudocode: [
        'lo = 0, hi = n - 1',
        'while lo <= hi and x >= arr[lo] and x <= arr[hi]:',
        '  if lo == hi:',
        '    if arr[lo] == x: return lo',
        '    return -1',
        '  pos = lo + ((hi-lo) / (arr[hi]-arr[lo])) * (x - arr[lo])',
        '  if arr[pos] == x: return pos',
        '  if arr[pos] < x: lo = pos + 1',
        '  else: hi = pos - 1',
        'return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Sorted Uniform Array',
            type: 'array' as const,
            // Uniformly distributed for best effect
            defaultValue: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            constraints: { min: 1, max: 999, maxLength: 15 }
        },
        {
            id: 'target',
            label: 'Target Value',
            type: 'integer' as const,
            defaultValue: 70
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    // Sort array first as required
    const arr = [...(inputs['arr'] as number[])].sort((a, b) => a - b);
    const target = inputs['target'] as number;
    const n = arr.length;
    let comparisons = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars, target }, pseudocodeLine: 0, message: msg }
    });

    let lo = 0;
    let hi = n - 1;

    yield { snapshot: makeState({ lo, hi }, "Starting Interpolation Search"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (lo === hi) {
            comparisons++;
            if (arr[lo] === target) {
                yield { 
                    snapshot: makeState({ lo, hi, result: lo }, `Found target at index ${lo}`), 
                    events: [{ type: 'lock', targetIds: ['main'], indices: [lo] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                return;
            }
            break;
        }

        // The Formula
        const pos = lo + Math.floor(((hi - lo) / (arr[hi] - arr[lo])) * (target - arr[lo]));
        
        comparisons++;
        yield { 
            snapshot: makeState({ lo, hi, pos }, `Estimated position: ${pos} (Value: ${arr[pos]})`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [pos] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr[pos] === target) {
            yield { 
                snapshot: makeState({ lo, hi, pos, result: pos }, `Found target at index ${pos}`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [pos] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }

        if (arr[pos] < target) {
            lo = pos + 1;
            yield { 
                snapshot: makeState({ lo, hi }, `${arr[pos]} < ${target}, moving LO up`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        } else {
            hi = pos - 1;
            yield { 
                snapshot: makeState({ lo, hi }, `${arr[pos]} > ${target}, moving HI down`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState({ result: -1 }, "Target not found"), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;