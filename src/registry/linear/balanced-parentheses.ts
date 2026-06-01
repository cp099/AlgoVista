import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'balanced-parentheses',
    name: 'Balanced Parentheses',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'Checks if a string has balanced brackets using a Stack. Opening brackets are pushed; closing brackets pop the stack and check for a matching pair.',
    pseudocode: [
        'stack = []',
        'for char in str:',
        '  if char in "({[": stack.push(char)',
        '  else if char in ")}]":',
        '    if stack.empty: return false',
        '    top = stack.pop()',
        '    if !matches(top, char): return false',
        'return stack.empty'
    ],
    inputs: [
        {
            id: 'str',
            label: 'Bracket String',
            type: 'string' as const,
            defaultValue: "{[()()]}",
            constraints: { maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    const arr = str.split('');
    const stack: string[] = [];

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'expr': { type: 'array', id: 'Input String', data: [...arr], visualMode: 'box' },
            'stack': { type: 'array', id: 'Stack', data: [...stack], orientation: 'vertical', visualMode: 'box' }
        },
        context: { variables: {}, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Check", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    const opening = new Set(['(', '{', '[']);

    for (let i = 0; i < arr.length; i++) {
        const char = arr[i];
        
        yield { 
            snapshot: makeState(`Scanning '${char}'`, 2), 
            events: [{ type: 'visit', targetIds: ['Input String'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        if (opening.has(char)) {
            stack.push(char);
            yield { 
                snapshot: makeState(`Pushing '${char}'`, 3), 
                events: [{ type: 'write', targetIds: ['Stack'], indices: [stack.length-1] }],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
        } else {
            // Closing bracket
            if (stack.length === 0) {
                yield { 
                    snapshot: makeState(`Error: Stack empty, cannot match '${char}'`, 4), 
                    events: [],
                    metrics: { comparisons: 1, swaps: 0, writes: 0 } 
                };
                return;
            }

            const top = stack.pop();
            const expected = pairs[char];

            yield { 
                snapshot: makeState(`Popped '${top}'. Expecting '${expected}' to match '${char}'`, 5), 
                events: [{ type: 'visit', targetIds: ['Stack'], indices: [stack.length] }], // Visual pop
                metrics: { comparisons: 1, swaps: 0, writes: 0 } 
            };

            if (top !== expected) {
                yield { 
                    snapshot: makeState(`Mismatch! '${top}' != '${expected}'`, 6), 
                    events: [],
                    metrics: { comparisons: 0, swaps: 0, writes: 0 } 
                };
                return;
            }
            
            yield { 
                snapshot: makeState(`Match found: ${top}${char}`, 6), 
                events: [],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
        }
    }

    if (stack.length === 0) {
        yield { 
            snapshot: makeState("Success! All brackets balanced.", 8), 
            events: [{ type: 'lock', targetIds: ['Input String'], indices: Array.from({length:arr.length},(_,k)=>k) }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    } else {
        yield { 
            snapshot: makeState("Error: Stack not empty. Unbalanced.", 8), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;