import { AlgorithmBundle, AlgoState, AlgoEvent } from '@core/types'; // Import AlgoEvent

const manifest = {
    id: 'min-stack',
    name: 'Min Stack',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'A Stack that retrieves the minimum element in O(1) time. It uses an auxiliary stack to keep track of the minimum value at every level.',
    pseudocode: [
        'function push(val):',
        '  stack.push(val)',
        '  if val <= minStack.top:',
        '    minStack.push(val)',
        '',
        'function pop():',
        '  val = stack.pop()',
        '  if val == minStack.top:',
        '    minStack.pop()',
        '  return val',
        '',
        'function getMin():',
        '  return minStack.top'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Sequence to Push',
            type: 'array' as const,
            defaultValue: [5, 2, 10, 1, 8],
            constraints: { min: 1, max: 99, maxLength: 6 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Internal State
    const mainStack: number[] = [];
    const minStack: number[] = [];

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'main': { 
                type: 'array', 
                id: 'Main Stack', 
                data: [...mainStack], 
                orientation: 'vertical', 
                visualMode: 'box' 
            },
            'min': { 
                type: 'array', 
                id: 'Auxiliary Min Stack', 
                data: [...minStack], 
                orientation: 'vertical', 
                visualMode: 'box' 
            }
        },
        context: { variables: { currentMin: minStack[minStack.length-1] ?? 'None' }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Min Stack", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. PUSH PHASE
    for (const val of sequence) {
        yield { 
            snapshot: makeState(`Pushing ${val}...`, 2), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Push to Main
        mainStack.push(val);
        
        const currentMin = minStack.length > 0 ? minStack[minStack.length - 1] : Infinity;
        let pushedToMin = false;

        if (val <= currentMin) {
            minStack.push(val);
            pushedToMin = true;
        }

        // --- Build Events Array Explicitly ---
        const events: AlgoEvent[] = [
            { type: 'write', targetIds: ['Main Stack'], indices: [mainStack.length-1] }
        ];
        if (pushedToMin) {
            events.push({ type: 'write', targetIds: ['Auxiliary Min Stack'], indices: [minStack.length-1] });
        }
        
        yield { 
            snapshot: makeState(
                pushedToMin 
                ? `Pushed ${val} to Main. ${val} <= ${currentMin}, so push to Min Stack too.` 
                : `Pushed ${val} to Main. ${val} > ${currentMin}, Min Stack unchanged.`, 3
            ), 
            events, // Use the pre-built array
            metrics: { comparisons: 1, swaps: 0, writes: pushedToMin ? 2 : 1 } 
        };
    }

    yield { snapshot: makeState("Push Phase Complete. Now Popping...", 5), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 2. POP PHASE
    while (mainStack.length > 0) {
        const top = mainStack[mainStack.length - 1];
        const currentMin = minStack[minStack.length - 1];

        yield { 
            snapshot: makeState(`Popping Top (${top}). Current Min is ${currentMin}`, 6), 
            events: [{ type: 'visit', targetIds: ['Main Stack'], indices: [mainStack.length-1] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        mainStack.pop();
        let poppedMin = false;

        if (top === currentMin) {
            minStack.pop();
            poppedMin = true;
        }

        yield { 
            snapshot: makeState(
                poppedMin 
                ? `Popped ${top}. It was the Min, so pop Min Stack too!` 
                : `Popped ${top}. Not the Min, so Min Stack stays.`, 8
            ), 
            events: poppedMin ? [{ type: 'visit', targetIds: ['Auxiliary Min Stack'], indices: [minStack.length] }] : [],
            metrics: { comparisons: 1, swaps: 0, writes: poppedMin ? 2 : 1 } 
        };
    }

    yield { 
        snapshot: makeState("Min Stack Demo Complete", 1), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;