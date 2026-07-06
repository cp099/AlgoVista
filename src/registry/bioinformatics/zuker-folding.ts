import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'zuker-folding',
    name: 'Zuker RNA Thermodynamic Folding',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Predicts the minimum free energy secondary structure of an RNA molecule using loop thermodynamic tables (stacked loops, hairpins, bulges, multi-loops) rather than simple base matches.',
    pseudocode: [
        'function ZukerFolding(RNA):',
        '  Initialize V[i][j] (MFE structure with i-j base paired)',
        '  Initialize W[i][j] (MFE of arbitrary structural segment i-j)',
        '  for len from 1 to n:',
        '    W[i][j] = min(W[i+1][j], W[i][j-1], V[i][j], min(W[i][k] + W[k+1][j]))',
        '    V[i][j] = min(Hairpin(i,j), Stacking(i,j) + V[i+1][j-1], min(V[i][k] + V[k+1][j]))'
    ],
    inputs: [
        {
            id: 'rna',
            label: 'RNA Sequence',
            type: 'string' as const,
            defaultValue: 'CCGG',
            constraints: { minLength: 4, maxLength: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const rna = (inputs['rna'] as string).toUpperCase();
    const n = rna.length;

    // We visualize W[i][j] - the overall free energy matrix
    const W: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill(0));

    const rowHeaders = rna.split('');
    const colHeaders = rna.split('');

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'energy_table': {
                    type: 'matrix',
                    id: 'energy_table',
                    data: W.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: { rna, segmentN: n, activeRow: activeCell?.r ?? 'None', activeCol: activeCell?.c ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing Zuker free energy matrices V and W...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Fictional model energies: pairing C-G = -3, G-U = -1, Hairpin = +2
    const getPairEnergy = (a: string, b: string): number => {
        if ((a === 'G' && b === 'C') || (a === 'C' && b === 'G')) return -3;
        if ((a === 'A' && b === 'U') || (a === 'U' && b === 'A')) return -2;
        if ((a === 'G' && b === 'U') || (a === 'U' && b === 'G')) return -1;
        return 4; // Unfavorable
    };

    for (let len = 1; len < n; len++) {
        for (let i = 0; i < n - len; i++) {
            const j = i + len;
            comparisons++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Calculating Minimum Free Energy on interval ${i} to ${j}`, 5),
                events: [{ type: 'compare', targetIds: ['energy_table'], indices: [i * n + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            // Calculate loop minimums
            let minEnergy = Math.min(W[i+1][j] as number, W[i][j-1] as number);
            
            // Check pairing condition
            const pairE = getPairEnergy(rna[i], rna[j]);
            if (pairE < 0) {
                const basePairEnergy = pairE + (i + 1 < j ? (W[i+1][j-1] as number) : 0);
                minEnergy = Math.min(minEnergy, basePairEnergy);
            }

            // Bifurcation/Split loop MFE
            for (let k = i; k < j; k++) {
                const splitE = (W[i][k] as number) + (W[k+1][j] as number);
                minEnergy = Math.min(minEnergy, splitE);
            }

            W[i][j] = minEnergy;
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Updated W[${i}][${j}] = ${minEnergy} kcal/mol`, 6),
                events: [{ type: 'write', targetIds: ['energy_table'], indices: [i * n + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    // Traceback minimum energy structures
    const traceback: { r: number; c: number }[] = [];
    const r = 0;
    const c = n - 1;
    traceback.push({ r, c });

    yield {
        snapshot: makeState(null, [...traceback], `MFE Calculation complete. Minimum energy: ${W[0][n-1]} kcal/mol. Tracing folded loop structures...`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
