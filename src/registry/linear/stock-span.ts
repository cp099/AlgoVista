import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'stock-span',
    name: 'Stock Span Problem',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Finds the "span" of a stock\'s price for each day. The span is the number of consecutive days prior where the price was less than or equal to the current day\'s price. Solved with a Monotonic Stack.',
    pseudocode: [
        'stack = []',
        'spans = new Array(n)',
        'for i from 0 to n-1:',
        '  while !stack.empty and price[stack.top] <= price[i]:',
        '    stack.pop()',
        '  spans[i] = stack.empty ? (i + 1) : (i - stack.top)',
        '  stack.push(i)'
    ],
    inputs: [
        {
            id: 'prices',
            label: 'Stock Prices',
            type: 'array' as const,
            defaultValue: [100, 80, 60, 70, 60, 75, 85],
            constraints: { min: 1, max: 150, maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const prices = [...(inputs['prices'] as number[])];
    const n = prices.length;
    
    // Internal state
    const spans: (number | string)[] = new Array(n).fill('-');
    const stack: number[] = []; // Stack of indices

    let comparisons = 0, writes = 0;

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'prices': { type: 'array', id: 'Prices', data: [...prices], visualMode: 'bar' },
            'spans': { type: 'array', id: 'Spans', data: [...spans], visualMode: 'box' },
            'stack': { type: 'array', id: 'Index Stack', data: [...stack], orientation: 'vertical', visualMode: 'box' }
        },
        context: { variables: {}, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Initialized", 1), events: [], metrics: { comparisons, swaps: 0, writes } };

    for (let i = 0; i < n; i++) {
        yield { 
            snapshot: makeState(`Scanning day ${i}, Price: ${prices[i]}`), 
            events: [{ type: 'visit', targetIds: ['Prices'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        // Pop from stack while stack is not empty and top is smaller than prices[i]
        while (stack.length > 0 && prices[stack[stack.length - 1]] <= prices[i]) {
            comparisons++;
            const topIndex = stack[stack.length - 1];
            yield { 
                snapshot: makeState(`Price[${topIndex}]=${prices[topIndex]} <= Price[${i}]=${prices[i]}. Popping stack.`, 5), 
                events: [
                    { type: 'compare', targetIds: ['Prices'], indices: [topIndex, i] },
                    { type: 'visit', targetIds: ['Index Stack'], indices: [stack.length-1] }
                ],
                metrics: { comparisons, swaps: 0, writes } 
            };
            stack.pop();
        }
        
        // Final comparison if while loop condition fails
        if (stack.length > 0) {
            comparisons++;
            const topIndex = stack[stack.length - 1];
            yield { 
                snapshot: makeState(`Price[${topIndex}]=${prices[topIndex]} > Price[${i}]=${prices[i]}.`, 5), 
                events: [{ type: 'compare', targetIds: ['Prices'], indices: [topIndex, i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // If stack becomes empty, then price[i] is greater than all elements on left of it
        // Else price[i] is greater than elements after top of stack
        spans[i] = (stack.length === 0) ? (i + 1) : (i - stack[stack.length - 1]);
        writes++;
        
        yield { 
            snapshot: makeState(`Span for day ${i} is ${spans[i]}`, 6), 
            events: [{ type: 'write', targetIds: ['Spans'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        // Push this element to stack
        stack.push(i);
        yield { 
            snapshot: makeState(`Pushing index ${i} to stack`, 7), 
            events: [{ type: 'write', targetIds: ['Index Stack'], indices: [stack.length-1] }],
            metrics: { comparisons, swaps: 0, writes } 
        };
    }

    yield { 
        snapshot: makeState("Complete", 1), 
        events: [{ type: 'lock', targetIds: ['Spans'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;