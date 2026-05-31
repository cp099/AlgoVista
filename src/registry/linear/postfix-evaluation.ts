import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'postfix-evaluation',
    name: 'Postfix Evaluation',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Evaluates a Postfix expression (Reverse Polish Notation) using a Stack. Operands are pushed; operators pop two elements, compute the result, and push it back.',
    pseudocode: [
        'stack = []',
        'for token in expression:',
        '  if isNumber(token):',
        '    stack.push(token)',
        '  else:',
        '    val2 = stack.pop()',
        '    val1 = stack.pop()',
        '    res = compute(val1, token, val2)',
        '    stack.push(res)',
        'return stack.pop()'
    ],
    inputs: [
        {
            id: 'expr',
            label: 'Postfix Tokens (comma separated)',
            type: 'array' as const,
            // Example: 5 3 + 2 *  => (5+3)*2 = 16
            defaultValue: ["5", "3", "+", "2", "*"],
            constraints: { maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    // Input is array of strings to support multi-digit numbers like "10"
    const tokens = (inputs['expr'] as any[]).map(String);
    
    // Internal Stack
    const stack: number[] = [];

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'expr': { 
                type: 'array', 
                id: 'Expression', 
                data: [...tokens], 
                visualMode: 'box' 
            },
            'stack': { 
                type: 'array', 
                id: 'Evaluation Stack', 
                data: [...stack], 
                orientation: 'vertical', 
                visualMode: 'box' 
            }
        },
        context: { variables: {}, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Evaluation"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    const isOperator = (t: string) => ['+', '-', '*', '/', '^'].includes(t);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        yield { 
            snapshot: makeState(`Scanning '${token}'`), 
            events: [{ type: 'visit', targetIds: ['Expression'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        if (!isOperator(token)) {
            // Is Operand
            const num = parseFloat(token);
            stack.push(num);
            
            yield { 
                snapshot: makeState(`Pushing ${num} to stack`), 
                events: [{ type: 'write', targetIds: ['Evaluation Stack'], indices: [stack.length - 1] }],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
        } else {
            // Is Operator
            if (stack.length < 2) {
                yield { snapshot: makeState("Error: Invalid Expression (Not enough operands)"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
                return;
            }

            const val2 = stack.pop()!;
            const val1 = stack.pop()!;

            yield { 
                snapshot: makeState(`Popped ${val1} and ${val2} for operation '${token}'`), 
                events: [{ type: 'visit', targetIds: ['Evaluation Stack'], indices: [stack.length, stack.length+1] }], // Show where they were
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };

            let res = 0;
            switch(token) {
                case '+': res = val1 + val2; break;
                case '-': res = val1 - val2; break;
                case '*': res = val1 * val2; break;
                case '/': res = Math.floor(val1 / val2); break;
                case '^': res = Math.pow(val1, val2); break;
            }

            stack.push(res);

            yield { 
                snapshot: makeState(`Calculated ${val1} ${token} ${val2} = ${res}. Pushed result.`), 
                events: [{ type: 'write', targetIds: ['Evaluation Stack'], indices: [stack.length - 1] }],
                metrics: { comparisons: 1, swaps: 0, writes: 1 } 
            };
        }
    }

    yield { 
        snapshot: makeState(`Evaluation Complete. Result: ${stack[0]}`), 
        events: [{ type: 'lock', targetIds: ['Evaluation Stack'], indices: [0] }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;