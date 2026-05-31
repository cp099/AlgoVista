import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'infix-to-postfix',
    name: 'Infix to Postfix',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Converts an arithmetic expression from Infix (A+B) to Postfix (AB+) notation using a Stack. This determines operator precedence.',
    pseudocode: [
        'for char in expression:',
        '  if operand: output += char',
        '  else if "(": push "("',
        '  else if ")": pop until "(", outputting ops',
        '  else (operator):',
        '    while precedence(stack.top) >= precedence(char):',
        '      output += pop()',
        '    push char',
        'while stack not empty: output += pop()'
    ],
    inputs: [
        {
            id: 'expr',
            label: 'Infix Expression',
            type: 'string' as const,
            defaultValue: "A*(B+C)-D/E",
            constraints: { maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const expr = String(inputs['expr']);
    const arr = expr.split('');
    
    const stack: string[] = [];
    const output: string[] = [];

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'expr': { type: 'array', id: 'Input Expression', data: [...arr], visualMode: 'box' },
            'stack': { type: 'array', id: 'Operator Stack', data: [...stack], orientation: 'vertical', visualMode: 'box' },
            'out': { type: 'array', id: 'Postfix Output', data: [...output], visualMode: 'box' }
        },
        context: { variables: {}, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Conversion"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    const precedence = (op: string) => {
        if (op === '^') return 3;
        if (op === '*' || op === '/') return 2;
        if (op === '+' || op === '-') return 1;
        return 0;
    };

    const isOperand = (c: string) => /[a-zA-Z0-9]/.test(c);

    for (let i = 0; i < arr.length; i++) {
        const char = arr[i];
        
        yield { 
            snapshot: makeState(`Scanning '${char}'`), 
            events: [{ type: 'visit', targetIds: ['Input Expression'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        if (isOperand(char)) {
            output.push(char);
            yield { 
                snapshot: makeState(`'${char}' is operand -> Output`), 
                events: [{ type: 'write', targetIds: ['Postfix Output'], indices: [output.length-1] }],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
        } 
        else if (char === '(') {
            stack.push(char);
            yield { 
                snapshot: makeState(`'(' -> Push to Stack`), 
                events: [{ type: 'write', targetIds: ['Operator Stack'], indices: [stack.length-1] }],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
        } 
        else if (char === ')') {
            yield { snapshot: makeState(`')' -> Pop until '('`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
            
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                const op = stack.pop()!;
                output.push(op);
                
                yield { 
                    snapshot: makeState(`Popped '${op}' -> Output`), 
                    events: [
                        { type: 'visit', targetIds: ['Operator Stack'], indices: [stack.length] }, // Visual pop
                        { type: 'write', targetIds: ['Postfix Output'], indices: [output.length-1] }
                    ],
                    metrics: { comparisons: 0, swaps: 0, writes: 1 } 
                };
            }
            if (stack.length > 0) {
                stack.pop(); // Pop '('
                yield { 
                    snapshot: makeState(`Discarding '('`), 
                    events: [],
                    metrics: { comparisons: 0, swaps: 0, writes: 0 } 
                };
            }
        } 
        else {
            // Operator
            while (
                stack.length > 0 && 
                precedence(stack[stack.length - 1]) >= precedence(char)
            ) {
                const op = stack.pop()!;
                output.push(op);
                
                yield { 
                    snapshot: makeState(`Stack Top '${op}' >= '${char}' -> Pop & Output`), 
                    events: [
                        { type: 'visit', targetIds: ['Operator Stack'], indices: [stack.length] },
                        { type: 'write', targetIds: ['Postfix Output'], indices: [output.length-1] }
                    ],
                    metrics: { comparisons: 1, swaps: 0, writes: 1 } 
                };
            }
            stack.push(char);
            yield { 
                snapshot: makeState(`Push '${char}' to Stack`), 
                events: [{ type: 'write', targetIds: ['Operator Stack'], indices: [stack.length-1] }],
                metrics: { comparisons: 1, swaps: 0, writes: 1 } 
            };
        }
    }

    // Empty stack
    while (stack.length > 0) {
        const op = stack.pop()!;
        output.push(op);
        yield { 
            snapshot: makeState(`End of Expression. Pop '${op}'`), 
            events: [
                { type: 'visit', targetIds: ['Operator Stack'], indices: [stack.length] },
                { type: 'write', targetIds: ['Postfix Output'], indices: [output.length-1] }
            ],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    yield { 
        snapshot: makeState("Conversion Complete"), 
        events: [{ type: 'lock', targetIds: ['Postfix Output'], indices: Array.from({length:output.length},(_,k)=>k) }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;