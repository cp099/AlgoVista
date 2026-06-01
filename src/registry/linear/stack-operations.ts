import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'stack-operations',
    name: 'Stack: Push & Pop',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'A Stack is a LIFO (Last-In, First-Out) structure. Elements are added to the top (Push) and removed from the top (Pop).',
    pseudocode: [
        'function push(stack, val):',
        '  stack.top++',
        '  stack[top] = val',
        '',
        'function pop(stack):',
        '  if top < 0: return Underflow',
        '  val = stack[top]',
        '  stack.top--',
        '  return val'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Values to Push',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 40, 50],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Internal State
    const stackData: number[] = [];
    const capacity = 8; 

    // Removed unused 'hlIndices' and 'type' parameters
    const makeState = (msg: string, line: number = 0): AlgoState => {
        return {
            structures: { 
                'main': { 
                    type: 'array', 
                    id: 'Stack (LIFO)', 
                    data: [...stackData],
                    orientation: 'vertical' 
                }
            },
            context: { 
                variables: { 
                    top: stackData.length - 1, 
                    size: stackData.length,
                    capacity 
                }, 
                pseudocodeLine: line, 
                message: msg 
            }
        };
    };

    yield { snapshot: makeState("Stack Initialized (Empty)", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. PUSH PHASE
    for (const val of sequence) {
        if (stackData.length >= capacity) {
            yield { 
                snapshot: makeState("Stack Overflow! Cannot push.", 1), 
                events: [],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
            break;
        }

        // Prepare to push
        yield { 
            snapshot: makeState(`Preparing to Push ${val}...`, 1), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Push
        stackData.push(val);
        const topIdx = stackData.length - 1;

        yield { 
            snapshot: makeState(`Pushed ${val} to Top [Index ${topIdx}]`, 2), 
            events: [{ type: 'write', targetIds: ['main'], indices: [topIdx] }], 
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // 2. PEEK PHASE
    if (stackData.length > 0) {
        const topIdx = stackData.length - 1;
        yield { 
            snapshot: makeState(`Peeking Top Element: ${stackData[topIdx]}`, 6), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [topIdx] }], 
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    // 3. POP PHASE
    while (stackData.length > 0) {
        const topIdx = stackData.length - 1;
        const val = stackData[topIdx];

        yield { 
            snapshot: makeState(`Popping Top Element (${val})...`, 6), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [topIdx] }], 
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Remove
        stackData.pop();

        yield { 
            snapshot: makeState(`Popped ${val}. New Top is ${stackData.length - 1}`, 7), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // 4. UNDERFLOW CHECK
    yield { 
        snapshot: makeState("Stack is Empty. Attempting Pop...", 5), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };

    yield { 
        snapshot: makeState("Stack Underflow Error!", 5), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;