import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'naive-string-search',
    name: 'Naive String Search',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Checks for the pattern at every possible position in the text. Simple but inefficient O(n*m).',
    pseudocode: [
        'n = length(text), m = length(pattern)',
        'for i from 0 to n - m:',
        '  for j from 0 to m - 1:',
        '    if text[i+j] != pattern[j]: break',
        '    if j == m - 1: return i'
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

    const makeState = (msg: string, vars: any = {}): AlgoState => ({
        structures: { 
            'text': { type: 'array', id: 'Text', data: textArr },
            'pat': { type: 'array', id: 'Pattern', data: patArr } 
        },
        context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Naive Search"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i <= n - m; i++) {
        yield { 
            snapshot: makeState(`Aligning Pattern at index ${i}`, { i }), 
            events: [{ type: 'visit', targetIds: ['Text'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        let j;
        for (j = 0; j < m; j++) {
            comparisons++;
            yield { 
                snapshot: makeState(`Comparing Text[${i+j}] vs Pattern[${j}]`, { i, j }), 
                events: [
                    { type: 'compare', targetIds: ['Text'], indices: [i+j] },
                    { type: 'compare', targetIds: ['Pattern'], indices: [j] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };

            if (textArr[i + j] !== patArr[j]) {
                yield { 
                    snapshot: makeState(`Mismatch! Break.`, { i, j }), 
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                break;
            }
        }

        if (j === m) {
            yield { 
                snapshot: makeState(`Pattern Found at index ${i}!`, { i, result: i }), 
                events: [{ type: 'lock', targetIds: ['Text'], indices: Array.from({length: m}, (_, k) => i + k) }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }
    }

    yield { 
        snapshot: makeState("Pattern not found."), 
        events: [], 
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;