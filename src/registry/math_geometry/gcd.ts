import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'euclidean-gcd',
    name: 'Euclidean GCD Algorithm',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Easy' as const,
    description: 'Computes the Greatest Common Divisor (GCD) of two integers by repeatedly calculating the remainder of their division.',
    pseudocode: [
        'function GCD(a, b):',
        '  while b != 0:',
        '    temp = b',
        '    b = a % b',
        '    a = temp',
        '  return a'
    ],
    inputs: [
        {
            id: 'valA',
            label: 'Integer A',
            type: 'integer' as const,
            defaultValue: 48,
            constraints: { min: 10, max: 99 }
        },
        {
            id: 'valB',
            label: 'Integer B',
            type: 'integer' as const,
            defaultValue: 18,
            constraints: { min: 5, max: 99 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    let a = inputs['valA'] as number;
    let b = inputs['valB'] as number;



    const makeState = (currA: number, currB: number, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'gcd_values': { type: 'array', id: 'Active GCD variables [a, b]', data: [currA, currB] }
            },
            context: {
                variables: {
                    originalA: inputs['valA'] as number,
                    originalB: inputs['valB'] as number,
                    currentA: currA,
                    currentB: currB,
                    currentRemainder: currB !== 0 ? (currA % currB) : 0
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(a, b, `Starting Euclidean algorithm. Find GCD of ${a} and ${b}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    while (b !== 0) {
        comparisons++;
        const temp = b;
        const remainder = a % temp;
        
        yield {
            snapshot: makeState(a, b, `Calculating remainder: ${a} % ${b} = ${remainder}.`, 4),
            events: [{ type: 'compare', targetIds: ['gcd_values'], indices: [0, 1] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        a = temp;
        b = remainder;
        writes += 2;

        yield {
            snapshot: makeState(a, b, `Updated states. Shifted variables: a = ${a}, b = ${b}.`, 5),
            events: [{ type: 'write', targetIds: ['gcd_values'], indices: [0, 1] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(a, b, `Loop terminated (b is 0). Greatest Common Divisor (GCD) is ${a}.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
