import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'kmp-search',
    name: 'KMP Algorithm',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Uses a pre-computed LPS (Longest Prefix Suffix) array to skip comparisons. When a mismatch occurs, the LPS array tells us the next character to compare without backtracking the text pointer.',
    pseudocode: [
        'lps = computeLPS(pattern)',
        'i = 0, j = 0',
        'while i < n:',
        '  if text[i] == pattern[j]:',
        '    i++, j++',
        '    if j == m: return i - j',
        '  else:',
        '    if j != 0: j = lps[j-1]',
        '    else: i++'
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

    // We start with empty LPS array visually
    const lps = new Array(m).fill(0);

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'text': { type: 'array', id: 'Text', data: textArr },
            'pat': { type: 'array', id: 'Pattern', data: patArr },
            'lps': { type: 'array', id: 'LPS Table', data: [...lps] }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting KMP: Computing LPS Array...", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. COMPUTE LPS
    let len = 0;
    let i = 1;
    lps[0] = 0;

    while (i < m) {
        comparisons++;
        yield { 
            snapshot: makeState(`LPS: Comparing P[${i}](${patArr[i]}) vs P[${len}](${patArr[len]})`, { i, len }, 1), 
            events: [{ type: 'compare', targetIds: ['Pattern'], indices: [i, len] }],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (patArr[i] === patArr[len]) {
            len++;
            lps[i] = len;
            yield { 
                snapshot: makeState(`Match! LPS[${i}] = ${len}`, { i, len }, 1), 
                events: [{ type: 'write', targetIds: ['LPS Table'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
                yield { 
                    snapshot: makeState(`Mismatch! Fallback len to ${len}`, { i, len }, 1), 
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
            } else {
                lps[i] = 0;
                yield { 
                    snapshot: makeState(`LPS[${i}] = 0`, { i }, 1), 
                    events: [{ type: 'write', targetIds: ['LPS Table'], indices: [i] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                i++;
            }
        }
    }

    yield { snapshot: makeState("LPS Computed. Starting Search.", {}, 2), events: [], metrics: { comparisons, swaps: 0, writes: 0 } };

    // 2. KMP SEARCH
    let j = 0; // index for pat[]
    i = 0; // index for text[]

    while (i < n) {
        comparisons++;
        yield { 
            snapshot: makeState(`Comparing T[${i}] vs P[${j}]`, { i, j }, 4), 
            events: [
                { type: 'compare', targetIds: ['Text'], indices: [i] },
                { type: 'compare', targetIds: ['Pattern'], indices: [j] }
            ],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (patArr[j] === textArr[i]) {
            j++;
            i++;
        }

        if (j === m) {
            yield { 
                snapshot: makeState(`Pattern Found at index ${i - j}!`, { result: i - j }, 6), 
                events: [{ type: 'lock', targetIds: ['Text'], indices: Array.from({length: m}, (_, k) => i - j + k) }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            j = lps[j - 1];
        } else if (i < n && patArr[j] !== textArr[i]) {
            if (j !== 0) {
                yield { 
                    snapshot: makeState(`Mismatch! Jumps j to ${lps[j-1]} using LPS`, { i, j }, 8), 
                    events: [{ type: 'visit', targetIds: ['LPS Table'], indices: [j-1] }],
                    metrics: { comparisons, swaps: 0, writes: 0 } 
                };
                j = lps[j - 1];
            } else {
                i++;
            }
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