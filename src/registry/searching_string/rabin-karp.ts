import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'rabin-karp',
    name: 'Rabin-Karp',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Uses a Rolling Hash to find patterns. Instead of checking every character, it compares the hash of the pattern with the hash of the current text window.',
    pseudocode: [
        'p = hash(pattern)',
        't = hash(text[0..m-1])',
        'for i from 0 to n - m:',
        '  if p == t:',
        '    check characters one by one',
        '  if i < n - m:',
        '    t = rehash(t, text[i], text[i+m])'
    ],
    inputs: [
        {
            id: 'text',
            label: 'Text',
            type: 'string' as const,
            defaultValue: "ABABDABACDABABCABAB",
            constraints: { maxLength: 20 }
        },
        {
            id: 'pattern',
            label: 'Pattern',
            type: 'string' as const,
            defaultValue: "ABABC"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const textStr = String(inputs['text']);
    const patternStr = String(inputs['pattern']);
    const textArr = textStr.split('');
    const patArr = patternStr.split('');
    
    const n = textArr.length;
    const m = patArr.length;
    let comparisons = 0;

    // Simple Hash Function (Sum of char codes for visualization simplicity)
    // Real Rabin-Karp uses modulo arithmetic, but simple sum is easier to teach visually.
    const getHash = (str: string[]) => str.reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const patHash = getHash(patArr);
    let textHash = getHash(textArr.slice(0, m));

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'text': { type: 'array', id: 'Text', data: textArr },
            'pat': { type: 'array', id: 'Pattern', data: patArr }
        },
        context: { 
            variables: { ...vars, patHash, textHash }, 
            pseudocodeLine: line, 
            message: msg 
        }
    });

    yield { snapshot: makeState(`Initial Hashes: P=${patHash}, T=${textHash}`, 2), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i <= n - m; i++) {
        comparisons++; // Hash compare
        yield { 
            snapshot: makeState(`Comparing Hash: ${textHash} vs ${patHash}`, { i, textHash }, 3), 
            events: [{ type: 'visit', targetIds: ['Text'], indices: Array.from({length:m},(_,k)=>i+k) }], // Highlight window
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (textHash === patHash) {
            yield { 
                snapshot: makeState(`Hash Match! Checking characters...`, { i }, 4), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };

            let j;
            for (j = 0; j < m; j++) {
                comparisons++;
                yield { 
                    snapshot: makeState(`Verifying T[${i+j}] vs P[${j}]`, { i, j }, 5), 
                    events: [
                        { type: 'compare', targetIds: ['Text'], indices: [i+j] },
                        { type: 'compare', targetIds: ['Pattern'], indices: [j] }
                    ],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };

                if (textArr[i + j] !== patArr[j]) {
                    break;
                }
            }

            if (j === m) {
                yield { 
                    snapshot: makeState(`Pattern Found at index ${i}!`, { i, result: i }, 5), 
                    events: [{ type: 'lock', targetIds: ['Text'], indices: Array.from({length: m}, (_, k) => i + k) }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                return;
            }
        }

        // Rolling Hash Calculation
        if (i < n - m) {
            const oldChar = textArr[i].charCodeAt(0);
            const newChar = textArr[i + m].charCodeAt(0);
            textHash = textHash - oldChar + newChar;
            
            yield { 
                snapshot: makeState(`Rolling Hash: -${textArr[i]} +${textArr[i+m]} = ${textHash}`, { i, textHash }, 7), 
                events: [], // Could highlight the entering/leaving chars if we want
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState("Search Complete. Pattern not found.", {}, 3), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;