import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'manachers-algorithm',
    name: "Manacher's Algorithm",
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Finds the longest palindromic substring in O(n) time. It transforms the string to handle even/odd lengths uniformly and computes a radius array P.',
    pseudocode: [
        'T = transform(S)',
        'C = 0, R = 0',
        'for i = 1 to length(T)-1:',
        '  mirror = 2*C - i',
        '  if i < R: P[i] = min(R-i, P[mirror])',
        '  while T[i + 1 + P[i]] == T[i - 1 - P[i]]: P[i]++',
        '  if i + P[i] > R: C = i, R = i + P[i]'
    ],
    inputs: [
        {
            id: 'str',
            label: 'String',
            type: 'string' as const,
            defaultValue: "BANANA",
            constraints: { maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const s = String(inputs['str']);
    // Transform: # B # A # N # A # N # A #
    const T = ['#', ...s.split('').flatMap(c => [c, '#'])];
    const n = T.length;
    const P = new Array(n).fill(0);
    
    let C = 0; // Center
    let R = 0; // Right Boundary
    let comparisons = 0;

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'T': { type: 'array', id: 'Transformed String', data: T },
            'P': { type: 'array', id: 'P-Array (Radius)', data: [...P] }
        },
        context: { variables: { ...vars, C, R }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Manacher's", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n; i++) {
        const mirror = 2 * C - i;
        
        yield { 
            snapshot: makeState(`Processing index ${i} (Mirror: ${mirror})`, { i, mirror }, 3), 
            events: [{ type: 'visit', targetIds: ['Transformed String'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        if (i < R) {
            P[i] = Math.min(R - i, P[mirror]);
            yield { 
                snapshot: makeState(`Using mirror property: P[${i}] = ${P[i]}`, { i, mirror }, 5), 
                events: [{ type: 'write', targetIds: ['P-Array (Radius)'], indices: [i] }],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
        }

        // Expansion
        while (
            i - (P[i] + 1) >= 0 && 
            i + (P[i] + 1) < n && 
            T[i - (P[i] + 1)] === T[i + (P[i] + 1)]
        ) {
            comparisons++;
            yield { 
                snapshot: makeState(`Expanding: Match at dist ${P[i]+1}`, { i }, 6), 
                events: [
                    { type: 'compare', targetIds: ['Transformed String'], indices: [i - (P[i] + 1)] },
                    { type: 'compare', targetIds: ['Transformed String'], indices: [i + (P[i] + 1)] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            P[i]++;
            
            yield { 
                snapshot: makeState(`Radius updated: P[${i}] = ${P[i]}`, { i }, 6), 
                events: [{ type: 'write', targetIds: ['P-Array (Radius)'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }

        // Update Center
        if (i + P[i] > R) {
            C = i;
            R = i + P[i];
            yield { 
                snapshot: makeState(`Boundary Updated: Center=${C}, Right=${R}`, { i, C, R }), 
                events: [{ type: 'lock', targetIds: ['Transformed String'], indices: [C] }],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState("Manacher's Complete", {}, 7), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;