import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'jump-search',
    name: 'Jump Search',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Works on sorted arrays. It jumps ahead by a fixed step size (√n) until it finds an element larger than the target, then performs a linear search in the previous block.',
    pseudocode: [
        'step = floor(sqrt(n))',
        'prev = 0',
        'while arr[min(step, n)-1] < target:',
        '  prev = step',
        '  step += sqrt(n)',
        '  if prev >= n: return -1',
        'while arr[prev] < target:',
        '  prev++',
        '  if prev == min(step, n): return -1',
        'if arr[prev] == target: return prev',
        'return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Sorted Array',
            type: 'array' as const,
            defaultValue: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377],
            constraints: { min: 0, max: 999, maxLength: 20 }
        },
        {
            id: 'target',
            label: 'Target',
            type: 'integer' as const,
            defaultValue: 55
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

    const step = Math.floor(Math.sqrt(n));
    let prev = 0;

    yield { snapshot: makeState({ step }, `Jump size calculated: ${step}`, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. Jump Phase
    
    let curr = 0;
    while (arr[Math.min(curr + step, n) - 1] < target) {
        comparisons++;
        let checkIdx = Math.min(curr + step, n) - 1;
        
        yield { 
            snapshot: makeState({ prev: curr, step, checkIdx, val: arr[checkIdx] }, `Block end ${arr[checkIdx]} < ${target}. Jumping.`, 3), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [checkIdx] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
        
        curr += step;
        prev = curr;
        if (prev >= n) {
             yield { snapshot: makeState({}, "Target not found (passed end)", 6), events: [], metrics: { comparisons, swaps: 0, writes: 0 } };
             return;
        }
    }

    // 2. Linear Search Phase
    yield { 
        snapshot: makeState({ prev, target }, `Target is in block starting at ${prev}. Linear Search begins.`, 7), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };

    while (arr[prev] < target) {
        comparisons++;
        yield { 
            snapshot: makeState({ prev, val: arr[prev] }, `Checking ${arr[prev]} < ${target}`, 7), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [prev] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
        
        prev++;
        if (prev === Math.min(curr + step, n)) {
             yield { snapshot: makeState({}, "Target not found in block", 9), events: [], metrics: { comparisons, swaps: 0, writes: 0 } };
             return;
        }
    }

    // 3. Final Check
    comparisons++;
    if (arr[prev] === target) {
        yield { 
            snapshot: makeState({ prev, result: prev }, `Found target at ${prev}!`, 10), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [prev] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
    } else {
        yield { 
            snapshot: makeState({ prev, val: arr[prev] }, `Stopped at ${arr[prev]}. Target not found.`, 11), 
            events: [],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
    }
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;