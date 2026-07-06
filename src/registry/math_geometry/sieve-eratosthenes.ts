import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'sieve-eratosthenes',
    name: 'Sieve of Eratosthenes',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Finds all prime numbers up to a specified limit n by iteratively marking the multiples of each prime as composite.',
    pseudocode: [
        'function Sieve(n):',
        '  Prime = Array of size n+1 filled with true',
        '  Prime[0] = Prime[1] = false',
        '  for p from 2 to sqrt(n):',
        '    if Prime[p] is true:',
        '      for i from p^2 to n with step p:',
        '        Prime[i] = false'
    ],
    inputs: [
        {
            id: 'limit',
            label: 'Prime Limit (n)',
            type: 'integer' as const,
            defaultValue: 15,
            constraints: { min: 10, max: 20 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const limit = inputs['limit'] as number;

    const data: string[] = Array(limit + 1).fill('P'); // 'P' for Prime, 'C' for Composite
    data[0] = 'C';
    data[1] = 'C';

    const makeState = (activeP: number | null, activeMultiple: number | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'sieve_array': { type: 'array', id: `Numbers 0 to ${limit}`, data: [...data] }
            },
            context: {
                variables: {
                    limitValue: limit,
                    activePrime: activeP !== null ? activeP : 'None',
                    activeComposite: activeMultiple !== null ? activeMultiple : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Initializing Sieve table array. Mark 0 and 1 as composite.", 3),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 2 }
    };

    let comparisons = 0;
    let writes = 2;

    for (let p = 2; p * p <= limit; p++) {
        comparisons++;
        if (data[p] === 'P') {
            yield {
                snapshot: makeState(p, null, `Found prime ${p}. Iterating through its multiples to mark as composite.`, 5),
                events: [{ type: 'compare', targetIds: ['sieve_array'], indices: [p] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            for (let i = p * p; i <= limit; i += p) {
                if (data[i] === 'P') {
                    data[i] = 'C';
                    writes++;

                    yield {
                        snapshot: makeState(p, i, `Marking multiple ${i} as composite ('C').`, 7),
                        events: [{ type: 'write', targetIds: ['sieve_array'], indices: [i] }],
                        metrics: { comparisons, swaps: 0, writes }
                    };
                }
            }
        }
    }

    yield {
        snapshot: makeState(null, null, "Sieve of Eratosthenes prime search complete.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
