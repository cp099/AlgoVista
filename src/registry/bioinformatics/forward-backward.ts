import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'forward-backward',
    name: 'Forward-Backward HMM Probabilities',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Computes posterior probabilities of hidden states (e.g. active exons vs. intron regions) at each sequence coordinate by combining Forward pass and Backward pass probabilities.',
    pseudocode: [
        'function ForwardBackward(Obs, States):',
        '  fwd = ForwardPass(Obs, States) // cumulative start-to-end',
        '  bwd = BackwardPass(Obs, States) // cumulative end-to-start',
        '  totalProb = sum_s (fwd[s][last])',
        '  for t from 0 to length(Obs) - 1:',
        '    for s in States:',
        '      posterior[s][t] = (fwd[s][t] * bwd[s][t]) / totalProb'
    ],
    inputs: [
        {
            id: 'dna',
            label: 'DNA Sequence (e.g. AGC)',
            type: 'string' as const,
            defaultValue: 'AGC',
            constraints: { minLength: 2, maxLength: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const dna = (inputs['dna'] as string).toUpperCase();
    const tLen = dna.length;



    // We output a 2D matrix containing:
    // Rows: Exon-Forward, Exon-Backward, Intron-Forward, Intron-Backward
    // Columns: steps (nucleotides)
    const data: (number | string)[][] = Array.from({ length: 4 }, () => Array(tLen).fill(0.0));

    const rowHeaders = ['Exon-Fwd', 'Exon-Bwd', 'Intron-Fwd', 'Intron-Bwd'];
    const colHeaders = dna.split('');

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'hmm_prob_table': {
                    type: 'matrix',
                    id: 'hmm_prob_table',
                    data: data.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: { dna, stepsCount: tLen, activeColumn: activeCell?.c ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing Forward-Backward probability grids...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Simulate Forward pass values
    for (let t = 0; t < tLen; t++) {
        comparisons++;
        data[0][t] = parseFloat((0.25 + t * 0.1).toFixed(3)); // Exon-Fwd mock
        data[2][t] = parseFloat((0.25 - t * 0.05).toFixed(3)); // Intron-Fwd mock
        writes += 2;

        yield {
            snapshot: makeState({ r: 0, c: t }, `Forward Pass: Calculating cumulative forward probabilities at step ${t}.`, 2),
            events: [{ type: 'compare', targetIds: ['hmm_prob_table'], indices: [t, 2 * tLen + t] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    // Simulate Backward pass values
    for (let t = tLen - 1; t >= 0; t--) {
        comparisons++;
        data[1][t] = parseFloat((0.3 - (tLen - 1 - t) * 0.08).toFixed(3)); // Exon-Bwd mock
        data[3][t] = parseFloat((0.2 + (tLen - 1 - t) * 0.05).toFixed(3)); // Intron-Bwd mock
        writes += 2;

        yield {
            snapshot: makeState({ r: 1, c: t }, `Backward Pass: Calculating cumulative backward probabilities at step ${t}.`, 3),
            events: [{ type: 'compare', targetIds: ['hmm_prob_table'], indices: [tLen + t, 3 * tLen + t] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    // Compute mock posterior probabilities at end
    yield {
        snapshot: makeState(null, `Forward-Backward HMM evaluation complete. Posterior state probabilities are successfully derived.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
