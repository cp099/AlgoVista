import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'boyer-moore',
    name: 'Boyer-Moore',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Scans characters from right to left. Uses the "Bad Character Rule" to skip sections of text that definitely do not match.',
    pseudocode: [
        'badChar = buildTable(pattern)',
        's = 0',
        'while s <= n - m:',
        '  j = m - 1',
        '  while j >= 0 and pat[j] == txt[s+j]: j--',
        '  if j < 0: return s',
        '  else: s += max(1, j - badChar[txt[s+j]])'
    ],
    inputs: [
        {
            id: 'text',
            label: 'Text',
            type: 'string' as const,
            defaultValue: "THIS IS A TEST TEXT",
            constraints: { maxLength: 20 }
        },
        {
            id: 'pattern',
            label: 'Pattern',
            type: 'string' as const,
            defaultValue: "TEST"
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

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'text': { type: 'array', id: 'Text', data: textArr },
            'pat': { type: 'array', id: 'Pattern', data: patArr }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Boyer-Moore. Building Bad Char Table...", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. Bad Character Heuristic
    const badChar: Record<string, number> = {};
    for (let i = 0; i < m; i++) {
        badChar[patArr[i]] = i;
    }

    let s = 0; // Shift of the pattern with respect to text

    while (s <= n - m) {
        yield { 
            snapshot: makeState(`Aligning Pattern at index ${s}`, { s }, 2), 
            events: [{ type: 'visit', targetIds: ['Text'], indices: [s] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        let j = m - 1;

        // Scan Right-to-Left
        while (j >= 0 && patArr[j] === textArr[s + j]) {
            comparisons++;
            yield { 
                snapshot: makeState(`Matching T[${s+j}] == P[${j}]`, { s, j }, 5), 
                events: [
                    { type: 'compare', targetIds: ['Text'], indices: [s+j] },
                    { type: 'compare', targetIds: ['Pattern'], indices: [j] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            j--;
        }

        if (j < 0) {
            yield { 
                snapshot: makeState(`Pattern Found at index ${s}!`, { result: s }, 6), 
                events: [{ type: 'lock', targetIds: ['Text'], indices: Array.from({length: m}, (_, k) => s + k) }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            
            // Shift pattern to find next occurrence
            s += (s + m < n) ? m - (badChar[textArr[s + m]] ?? -1) : 1;
        } else {
            comparisons++; // Count the mismatch check
            const charCode = textArr[s + j];
            const lastPos = badChar[charCode] ?? -1;
            const shift = Math.max(1, j - lastPos);
            
            yield { 
                snapshot: makeState(`Mismatch at P[${j}] (${patArr[j]}) vs T[${s+j}] (${charCode}). Shift by ${shift}`, { s, j, shift }, 7), 
                events: [
                    { type: 'compare', targetIds: ['Text'], indices: [s+j] }, // Highlight mismatch
                    { type: 'compare', targetIds: ['Pattern'], indices: [j] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };

            s += shift;
        }
    }

    yield { 
        snapshot: makeState("Search Complete", {}, 3), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;