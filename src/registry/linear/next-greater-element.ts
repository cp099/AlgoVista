import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'next-greater-element',
    name: 'Next Greater Element',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'For each element in an array, find the first element to its right that is greater. This is efficiently solved in O(n) time using a Monotonic Stack.',
    pseudocode: [
        'stack = []',
        'result = new Array(n).fill(-1)',
        'for i from 0 to n-1:',
        '  while !stack.empty and arr[stack.top] < arr[i]:',
        '    idx = stack.pop()',
        '    result[idx] = arr[i]',
        '  stack.push(i)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [4, 5, 2, 25, 10, 8, 12],
            constraints: { min: 1, max: 99, maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    
    // Internal state
    const result: (number | string)[] = new Array(n).fill('-');
    const stack: number[] = []; // Stack of indices

    let comparisons = 0, writes = 0;

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'input': { 
                type: 'array', 
                id: 'Input', 
                data: [...arr],
                visualMode: 'bar'
            },
            'result': {
                type: 'array',
                id: 'Result',
                data: [...result],
                visualMode: 'box'
            },
            'stack': {
                type: 'array',
                id: 'Index Stack',
                data: [...stack],
                orientation: 'vertical',
                visualMode: 'box'
            }
        },
        context: { variables: {}, message: msg }
    });

    yield { snapshot: makeState("Initialized"), events: [], metrics: { comparisons, swaps: 0, writes } };

    for (let i = 0; i < n; i++) {
        yield { 
            snapshot: makeState(`Scanning element ${arr[i]} at index ${i}`), 
            events: [{ type: 'visit', targetIds: ['Input'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
            comparisons++;
            const topIndex = stack[stack.length - 1];
            
            yield { 
                snapshot: makeState(`Stack Top arr[${topIndex}]=${arr[topIndex]} < arr[${i}]=${arr[i]}. Pop and set result.`), 
                events: [
                    { type: 'compare', targetIds: ['Input'], indices: [topIndex, i] },
                    { type: 'visit', targetIds: ['Index Stack'], indices: [stack.length - 1] }
                ],
                metrics: { comparisons, swaps: 0, writes } 
            };
            
            const idx = stack.pop()!;
            result[idx] = arr[i];
            writes++;

            yield { 
                snapshot: makeState(`Result[${idx}] is now ${arr[i]}`), 
                events: [{ type: 'write', targetIds: ['Result'], indices: [idx] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }
        
        // Final comparison if while loop condition fails
        if (stack.length > 0) {
            comparisons++;
            const topIndex = stack[stack.length - 1];
             yield { 
                snapshot: makeState(`Stack Top arr[${topIndex}]=${arr[topIndex]} >= arr[${i}]=${arr[i]}. Pushing index ${i}.`), 
                events: [{ type: 'compare', targetIds: ['Input'], indices: [topIndex, i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        stack.push(i);
        yield { 
            snapshot: makeState(`Pushing index ${i} to stack`), 
            events: [{ type: 'write', targetIds: ['Index Stack'], indices: [stack.length-1] }],
            metrics: { comparisons, swaps: 0, writes } 
        };
    }

    // Any remaining indices in stack have no greater element
    yield { snapshot: makeState("Finished scan. Remaining indices in stack have no greater element (-1)."), events: [], metrics: { comparisons, swaps: 0, writes } };
    
    for(let i=0; i<n; i++) if (result[i] === '-') result[i] = -1;

    yield { 
        snapshot: makeState("Complete"), 
        events: [{ type: 'lock', targetIds: ['Result'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;