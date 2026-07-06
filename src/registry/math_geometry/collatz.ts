import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'collatz-sequence',
    name: 'Collatz Conjecture (3n+1)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Easy' as const,
    description: 'Tracks the mathematical orbit path values of the Collatz 3n+1 sequence starting from a given integer until it reaches the 4-2-1 loop.',
    pseudocode: [
        'function Collatz(n):',
        '  while n > 1:',
        '    if n is even: n = n / 2',
        '    else: n = 3*n + 1',
        '    Orbit.push(n)'
    ],
    inputs: [
        {
            id: 'n',
            label: 'Starting Value (n)',
            type: 'integer' as const,
            defaultValue: 6,
            constraints: { min: 2, max: 15 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    let n = inputs['n'] as number;

    const data: number[] = [n];

    const makeState = (activeNum: number, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'orbit_array': { type: 'array', id: 'Collatz Orbit Steps', data: [...data] }
            },
            context: {
                variables: {
                    startingVal: inputs['n'] as number,
                    currentVal: activeNum,
                    stepsCount: data.length - 1
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(n, `Starting Collatz sequence orbit at n = ${n}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    while (n > 1) {
        comparisons++;
        if (n % 2 === 0) {
            n = n / 2;
            data.push(n);
            writes++;

            yield {
                snapshot: makeState(n, `${data[data.length-2]} is Even. Set n = n / 2 => ${n}.`, 3),
                events: [{ type: 'write', targetIds: ['orbit_array'], indices: [data.length - 1] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            n = 3 * n + 1;
            data.push(n);
            writes++;

            yield {
                snapshot: makeState(n, `${data[data.length-2]} is Odd. Set n = 3*n + 1 => ${n}.`, 4),
                events: [{ type: 'write', targetIds: ['orbit_array'], indices: [data.length - 1] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(1, `Reached loop base value 1. Collatz trajectory resolved in ${data.length-1} steps.`, 2),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
