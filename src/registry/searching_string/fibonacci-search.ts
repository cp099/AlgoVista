import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'fibonacci-search',
    name: 'Fibonacci Search',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'Similar to Binary Search but divides the array into unequal parts using Fibonacci numbers. Useful because it uses only addition/subtraction, which can be cheaper than division.',
    pseudocode: [
        'fibM2 = 0, fibM1 = 1',
        'fibM = fibM2 + fibM1',
        'while fibM < n:',
        '  fibM2 = fibM1, fibM1 = fibM, fibM = fibM2 + fibM1',
        'offset = -1',
        'while fibM > 1:',
        '  i = min(offset + fibM2, n-1)',
        '  if arr[i] < x:',
        '    fibM = fibM1, fibM1 = fibM2, fibM2 = fibM - fibM1',
        '    offset = i',
        '  else if arr[i] > x:',
        '    fibM = fibM2, fibM1 = fibM1 - fibM2, fibM2 = fibM - fibM1',
        '  else: return i',
        'return -1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Sorted Array',
            type: 'array' as const,
            defaultValue: [10, 22, 35, 40, 45, 50, 80, 82, 85, 90, 100, 235],
            constraints: { min: 1, max: 999, maxLength: 15 }
        },
        {
            id: 'target',
            label: 'Target',
            type: 'integer' as const,
            defaultValue: 85
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

    // Initialize Fibonacci numbers
    let fibM2 = 0; // (m-2)'th
    let fibM1 = 1; // (m-1)'th
    let fibM = fibM2 + fibM1; // m'th

    // fibM is going to store the smallest Fibonacci Number greater than or equal to n
    while (fibM < n) {
        fibM2 = fibM1;
        fibM1 = fibM;
        fibM = fibM2 + fibM1;
    }

    yield { snapshot: makeState({ fibM, fibM1, fibM2 }, "Initialized Fibonacci Numbers"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    let offset = -1;

    while (fibM > 1) {
        // Check if fibMm2 is a valid location
        let i = Math.min(offset + fibM2, n - 1);
        
        comparisons++;
        yield { 
            snapshot: makeState({ i, val: arr[i], fibM2, offset }, `Checking index ${i} (Offset + FibM2)`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr[i] < target) {
            yield { 
                snapshot: makeState({ i, result: 'Small' }, `${arr[i]} < ${target}. Moving offset to ${i}. Reducing Fib.`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            fibM = fibM1;
            fibM1 = fibM2;
            fibM2 = fibM - fibM1;
            offset = i;
        } 
        else if (arr[i] > target) {
            yield { 
                snapshot: makeState({ i, result: 'Large' }, `${arr[i]} > ${target}. Cutting Fib by 2 steps.`), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            fibM = fibM2;
            fibM1 = fibM1 - fibM2;
            fibM2 = fibM - fibM1;
        } 
        else {
            yield { 
                snapshot: makeState({ i, result: i }, `Found target at ${i}!`), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }
    }

    // Check last element
    if (fibM1 && arr[offset + 1] === target) {
        yield { 
            snapshot: makeState({ i: offset+1, result: offset+1 }, `Found at ${offset+1}`), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [offset+1] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };
        return;
    }

    yield { 
        snapshot: makeState({ result: -1 }, "Target not found"), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;