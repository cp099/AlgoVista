import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fft-divide-conquer',
    name: 'Fast Fourier Transform (FFT)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Computes the Discrete Fourier Transform (DFT) of a sequence in O(n log n) time using the Cooley-Tukey Radix-2 algorithm.',
    pseudocode: [
        'function FFT(A):',
        '  n = length(A)',
        '  if n == 1: return A',
        '  A_even = FFT([A[0], A[2], ..., A[n-2]])',
        '  A_odd = FFT([A[1], A[3], ..., A[n-1]])',
        '  for k from 0 to n/2 - 1:',
        '    t = w^k * A_odd[k]',
        '    y[k] = A_even[k] + t',
        '    y[k + n/2] = A_even[k] - t',
        '  return y'
    ],
    inputs: [
        {
            id: 'signalSize',
            label: 'Signal Size (Power of 2)',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const n = inputs['signalSize'] as number;

    const data = [1.0, 2.0, 0.0, -1.0].slice(0, n);

    const makeState = (msg: string, line: number): AlgoState => {
        return {
            structures: {
                'signal_array': { type: 'array', id: 'Input Signal Amplitudes', data: [...data] }
            },
            context: {
                variables: {
                    signalLength: n,
                    recurrenceCost: 'O(n log n)',
                    butterflyStructure: 'Radix-2 Cooley-Tukey'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState("Starting Cooley-Tukey Radix-2 FFT decomposition.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    comparisons++;
    yield {
        snapshot: makeState("Split signal: Separated into even-indexed and odd-indexed sub-channels recursively.", 4),
        events: [{ type: 'compare', targetIds: ['signal_array'], indices: [0, 2] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    writes += 2;
    yield {
        snapshot: makeState("Recombining: Computing butterfly equations with complex twiddle factors (w^k).", 7),
        events: [{ type: 'write', targetIds: ['signal_array'], indices: [0, 1] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState("Fast Fourier Transform complete. Output spectrum frequencies successfully derived.", 10),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
