import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'viterbi-hmm',
    name: 'Viterbi Exon Decoding HMM',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Decodes the most probable sequence of hidden states (e.g., Exon vs. Intron) corresponding to an observed DNA sequence based on transition and emission probabilities.',
    pseudocode: [
        'function ViterbiHMM(Observations, States):',
        '  Initialize Viterbi[state][0] = StartProb[state] * Emit[state][Obs[0]]',
        '  for t from 1 to length(Obs) - 1:',
        '    for s in States:',
        '      Viterbi[s][t] = max_{prev_s} (Viterbi[prev_s][t-1] * Transition[prev_s][s]) * Emit[s][Obs[t]]',
        '      Backpointer[s][t] = argmax_{prev_s} (Viterbi[prev_s][t-1] * Transition[prev_s][s])',
        '  return path by tracing Backpointers from max value at end'
    ],
    inputs: [
        {
            id: 'dna',
            label: 'DNA Sequence (e.g. ATGC)',
            type: 'string' as const,
            defaultValue: 'ATGC',
            constraints: { minLength: 2, maxLength: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const dna = (inputs['dna'] as string).toUpperCase();
    const tLen = dna.length;

    const states = ['Exon', 'Intron'];
    const sLen = states.length;

    // Trellis matrix: states x steps
    const trellis: (number | string)[][] = Array.from({ length: sLen }, () => Array(tLen).fill(0));

    // Emission probabilities: Exon prefers G/C, Intron prefers A/T
    const emission: Record<string, Record<string, number>> = {
        'Exon': { 'A': 0.1, 'C': 0.4, 'G': 0.4, 'T': 0.1 },
        'Intron': { 'A': 0.4, 'C': 0.1, 'G': 0.1, 'T': 0.4 }
    };

    // Transition probabilities
    const transition: Record<string, Record<string, number>> = {
        'Exon': { 'Exon': 0.7, 'Intron': 0.3 },
        'Intron': { 'Exon': 0.2, 'Intron': 0.8 }
    };

    // Initialize first column
    const firstChar = dna[0];
    trellis[0][0] = parseFloat((0.5 * (emission['Exon'][firstChar] || 0.25)).toFixed(3));
    trellis[1][0] = parseFloat((0.5 * (emission['Intron'][firstChar] || 0.25)).toFixed(3));

    const rowHeaders = states;
    const colHeaders = dna.split('');

    const makeState = (activeCell: { r: number; c: number } | null, path: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'trellis_table': {
                    type: 'matrix',
                    id: 'trellis_table',
                    data: trellis.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: path.length > 0 ? path : undefined
                }
            },
            context: {
                variables: { dna, activeStep: activeCell?.c ?? 'None', activeState: activeCell ? states[activeCell.r] : 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing trellis values for start state probabilities.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 2;

    // Fill trellis
    for (let t = 1; t < tLen; t++) {
        const char = dna[t];
        for (let s = 0; s < sLen; s++) {
            comparisons++;
            const sName = states[s];

            yield {
                snapshot: makeState({ r: s, c: t }, [], `Calculating transition probability to state '${sName}' at nucleotide '${char}' (index ${t})`, 4),
                events: [{ type: 'compare', targetIds: ['trellis_table'], indices: [s * tLen + t] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            const eProb = emission[sName][char] || 0.25;

            // Calculate max path from previous states
            const path0 = (trellis[0][t-1] as number) * transition['Exon'][sName];
            const path1 = (trellis[1][t-1] as number) * transition['Intron'][sName];

            const maxPath = Math.max(path0, path1);
            trellis[s][t] = parseFloat((maxPath * eProb).toFixed(4));
            writes++;

            yield {
                snapshot: makeState({ r: s, c: t }, [], `Updated trellis[${sName}][${t}] = max(${path0.toFixed(4)}, ${path1.toFixed(4)}) * ${eProb} = ${trellis[s][t]}`, 5),
                events: [{ type: 'write', targetIds: ['trellis_table'], indices: [s * tLen + t] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    // Traceback the optimal path
    const path: { r: number; c: number }[] = [];
    let bestStateIdx = (trellis[0][tLen-1] as number) > (trellis[1][tLen-1] as number) ? 0 : 1;
    path.push({ r: bestStateIdx, c: tLen - 1 });

    for (let t = tLen - 1; t > 0; t--) {
        const sName = states[bestStateIdx];
        const path0 = (trellis[0][t-1] as number) * transition['Exon'][sName];
        const path1 = (trellis[1][t-1] as number) * transition['Intron'][sName];
        bestStateIdx = path0 > path1 ? 0 : 1;
        path.push({ r: bestStateIdx, c: t - 1 });
    }

    const decodedPath = [...path].reverse().map(p => states[p.r]).join(' -> ');

    yield {
        snapshot: makeState(null, path, `Decoding completed! Most probable HMM state path: ${decodedPath}`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
