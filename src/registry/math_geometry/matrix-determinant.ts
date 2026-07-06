import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'matrix-determinant',
    name: 'Matrix Determinant (LU)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Computes the determinant of a 3x3 matrix using Laplace expansions along the first row.',
    pseudocode: [
        'function Determinant3x3(M):',
        '  d0 = M[0][0] * (M[1][1]*M[2][2] - M[1][2]*M[2][1])',
        '  d1 = M[0][1] * (M[1][0]*M[2][2] - M[1][2]*M[2][0])',
        '  d2 = M[0][2] * (M[1][0]*M[2][1] - M[1][1]*M[2][0])',
        '  return d0 - d1 + d2'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Scalar Factor Scale',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const scale = inputs['multiplier'] as number;

    const m = [
        [1 * scale, 2 * scale, 3 * scale],
        [0 * scale, 4 * scale, 5 * scale],
        [1 * scale, 0 * scale, 6 * scale]
    ];

    const rowHeaders = ['R0', 'R1', 'R2'];
    const colHeaders = ['C0', 'C1', 'C2'];

    const makeState = (activeCell: { r: number; c: number } | null, subDet: string, val: number, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'matrix_grid': {
                    type: 'matrix',
                    id: 'matrix_grid',
                    data: m.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    activeMultiplier: activeCell ? m[activeCell.r][activeCell.c] : 'None',
                    expansionTerm: subDet,
                    runningDet: val
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, 'None', 0, "Initializing 3x3 matrix determinant computation.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Expansion term 1: M[0][0]
    comparisons++;
    const d0 = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]);
    writes++;
    yield {
        snapshot: makeState({ r: 0, c: 0 }, `Term 0: ${m[0][0]} * (${m[1][1]}*${m[2][2]} - ${m[1][2]}*${m[2][1]}) = ${d0}`, d0, "Calculated first expansion term.", 2),
        events: [{ type: 'compare', targetIds: ['matrix_grid'], indices: [0, 4, 8, 5, 7] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Expansion term 2: M[0][1]
    comparisons++;
    const d1 = m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]);
    writes++;
    yield {
        snapshot: makeState({ r: 0, c: 1 }, `Term 1: ${m[0][1]} * (${m[1][0]}*${m[2][2]} - ${m[1][2]}*${m[2][0]}) = ${d1}`, d0 - d1, "Calculated second expansion term (subtracted).", 3),
        events: [{ type: 'compare', targetIds: ['matrix_grid'], indices: [1, 3, 8, 5, 6] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Expansion term 3: M[0][2]
    comparisons++;
    const d2 = m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    writes++;
    const finalDet = d0 - d1 + d2;

    yield {
        snapshot: makeState({ r: 0, c: 2 }, `Term 2: ${m[0][2]} * (${m[1][0]}*${m[2][1]} - ${m[1][1]}*${m[2][0]}) = ${d2}`, finalDet, "Calculated third expansion term (added).", 4),
        events: [{ type: 'compare', targetIds: ['matrix_grid'], indices: [2, 3, 7, 4, 6] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(null, 'Result', finalDet, `Matrix Determinant evaluation complete. Determinant value: ${finalDet}`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
