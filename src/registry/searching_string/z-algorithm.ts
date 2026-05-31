import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'z-algorithm',
    name: 'Z-Algorithm',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Constructs a Z-array where Z[i] is the length of the longest common prefix between the string and the suffix starting at i. Used for pattern matching in linear time.',
    pseudocode: [
        'concat = P + "$" + T',
        'L = 0, R = 0',
        'for i = 1 to n:',
        '  if i > R:',
        '    L = R = i',
        '    while R < n and str[R] == str[R-L]: R++',
        '    Z[i] = R - L, R--',
        '  else:',
        '    k = i - L',
        '    if Z[k] < R - i + 1: Z[i] = Z[k]',
        '    else: L = i, while... match...'
    ],
    inputs: [
        {
            id: 'text',
            label: 'Text',
            type: 'string' as const,
            defaultValue: "BAABAAB",
            constraints: { maxLength: 20 }
        },
        {
            id: 'pattern',
            label: 'Pattern',
            type: 'string' as const,
            defaultValue: "AAB"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const textStr = String(inputs['text']);
    const patternStr = String(inputs['pattern']);
    
    // Concatenate P + $ + T
    const concatStr = patternStr + "$" + textStr;
    const S = concatStr.split('');
    const n = S.length;
    const m = patternStr.length;
    
    const Z = new Array(n).fill(0);
    let comparisons = 0;

    const makeState = (msg: string, vars: any = {}): AlgoState => ({
        structures: { 
            'str': { type: 'array', id: 'Combined String', data: S },
            'z': { type: 'array', id: 'Z-Values', data: [...Z] }
        },
        context: { variables: { ...vars, L: vars.L, R: vars.R }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Z-Algorithm"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    let L = 0, R = 0;
    
    for (let i = 1; i < n; i++) {
        yield { 
            snapshot: makeState(`Processing index ${i}`, { i, L, R }), 
            events: [{ type: 'visit', targetIds: ['Combined String'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (i > R) {
            L = R = i;
            while (R < n && S[R] === S[R - L]) {
                comparisons++;
                yield { 
                    snapshot: makeState(`Naive Matching: S[${R}] vs S[${R-L}]`, { i, L, R, matchLen: R-L }), 
                    events: [{ type: 'compare', targetIds: ['Combined String'], indices: [R, R-L] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                R++;
            }
            Z[i] = R - L;
            R--;
            yield { 
                snapshot: makeState(`Z[${i}] = ${Z[i]}`, { i, L, R }), 
                events: [{ type: 'write', targetIds: ['Z-Values'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        } else {
            const k = i - L;
            if (Z[k] < R - i + 1) {
                Z[i] = Z[k];
                yield { 
                    snapshot: makeState(`Inside Z-Box: Copying Z[${k}] to Z[${i}]`, { i, k, Zk: Z[k] }), 
                    events: [{ type: 'write', targetIds: ['Z-Values'], indices: [i] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
            } else {
                L = i;
                while (R < n && S[R] === S[R - L]) {
                    comparisons++;
                    yield { 
                        snapshot: makeState(`Extending Z-Box: S[${R}] vs S[${R-L}]`, { i, L, R }), 
                        events: [{ type: 'compare', targetIds: ['Combined String'], indices: [R, R-L] }],
                        metrics: { comparisons, swaps: 0, writes: 0 } 
                    };
                    R++;
                }
                Z[i] = R - L;
                R--;
                yield { 
                    snapshot: makeState(`Updated Z[${i}] = ${Z[i]}`, { i, L, R }), 
                    events: [{ type: 'write', targetIds: ['Z-Values'], indices: [i] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
            }
        }

        // Check if pattern found
        if (Z[i] === m) {
            yield { 
                snapshot: makeState(`Pattern Found at index ${i - m - 1} (in original text)!`, { i, result: i - m - 1 }), 
                events: [{ type: 'lock', targetIds: ['Combined String'], indices: Array.from({length: m}, (_, k) => i + k) }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState("Z-Algorithm Complete"), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;