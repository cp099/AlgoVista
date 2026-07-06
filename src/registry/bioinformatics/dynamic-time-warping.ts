import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'dynamic-time-warping',
    name: 'Dynamic Time Warping (DTW)',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Aligns raw ionic current signals from nanopore sequencers to a template sequence of reference levels by building a distance warp cost matrix and tracing the optimal warp path.',
    pseudocode: [
        'function DTW(Signal, Template):',
        '  Initialize DTW[n+1][m+1] = Infinity',
        '  DTW[0][0] = 0',
        '  for i from 1 to n:',
        '    for j from 1 to m:',
        '      cost = distance(Signal[i-1], Template[j-1])',
        '      DTW[i][j] = cost + min(DTW[i-1][j], DTW[i][j-1], DTW[i-1][j-1])',
        '  return path by tracing back from DTW[n][m]'
    ],
    inputs: [
        {
            id: 'signalRange',
            label: 'Signal Sample Length',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 2, max: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const sLen = inputs['signalRange'] as number;

    const signal = [1.2, 1.8, 2.5, 3.1, 4.0].slice(0, sLen);
    const template = [1.0, 2.0, 3.0, 4.0].slice(0, Math.min(sLen, 4));

    const rows = signal.length;
    const cols = template.length;

    // Initialize warp cost matrix
    const dtw: (number | string)[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Headers
    const rowHeaders = signal.map(s => `${s.toFixed(1)}pA`);
    const colHeaders = template.map(t => `${t.toFixed(1)}pA`);

    const makeState = (activeCell: { r: number; c: number } | null, traceback: { r: number; c: number }[] = [], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'warp_matrix': {
                    type: 'matrix',
                    id: 'warp_matrix',
                    data: dtw.map(row => [...row]),
                    rowHeaders,
                    colHeaders,
                    tracebackPaths: traceback.length > 0 ? traceback : undefined
                }
            },
            context: {
                variables: { signalSize: rows, templateSize: cols, activeRow: activeCell?.r ?? 'None', activeCol: activeCell?.c ?? 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], "Initializing Dynamic Time Warping warp cost matrix...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Fill DTW matrix
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            comparisons++;
            const cost = Math.abs(signal[i] - template[j]);

            // Calculate options
            let prevMin = 0;
            if (i > 0 && j > 0) {
                prevMin = Math.min(dtw[i-1][j] as number, dtw[i][j-1] as number, dtw[i-1][j-1] as number);
            } else if (i > 0) {
                prevMin = dtw[i-1][j] as number;
            } else if (j > 0) {
                prevMin = dtw[i][j-1] as number;
            }

            dtw[i][j] = parseFloat((cost + prevMin).toFixed(2));
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, [], `Evaluating signal sample ${signal[i]}pA against template level ${template[j]}pA. Cost: ${cost.toFixed(2)}.`, 7),
                events: [{ type: 'write', targetIds: ['warp_matrix'], indices: [i * cols + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [], "DTW warp matrix fully populated. Tracing back optimal alignment path...", 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traceback optimal alignment path
    const traceback: { r: number; c: number }[] = [];
    let r = rows - 1;
    let c = cols - 1;
    traceback.push({ r, c });

    while (r > 0 || c > 0) {
        yield {
            snapshot: makeState({ r, c }, [...traceback], `Optimal path traceback at cell (${r}, ${c})`, 1),
            events: [{ type: 'compare', targetIds: ['warp_matrix'], indices: [r * cols + c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (r > 0 && c > 0) {
            const diag = dtw[r-1][c-1] as number;
            const top = dtw[r-1][c] as number;
            const left = dtw[r][c-1] as number;
            const mVal = Math.min(diag, top, left);

            if (mVal === diag) {
                r--; c--;
            } else if (mVal === top) {
                r--;
            } else {
                c--;
            }
        } else if (r > 0) {
            r--;
        } else {
            c--;
        }
        traceback.push({ r, c });
    }

    yield {
        snapshot: makeState(null, [...traceback], `Dynamic Time Warping complete. Minimal distance alignment path traced successfully.`, 1),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
