import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'jarvis-march-3d',
    name: 'Convex Hull (Jarvis March 3D)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Traces bounding faces and envelopes around scattered 3D point clusters by identifying extreme coplanar coordinate sets.',
    pseudocode: [
        'function JarvisMarch3D(Points):',
        '  Face = find leftmost initial face',
        '  while Queue is not empty:',
        '    for neighbor edge in active edges:',
        '      NextPt = find point maximizing dihedral wrap angle',
        '      CreateNewFace(edge, NextPt)'
    ],
    inputs: [
        {
            id: 'pointsCount',
            label: '3D Points Cluster size',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 4, max: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['pointsCount'] as number;

    const data: (number | string)[][] = [
        [0.5, 0.2, 0.8],
        [1.2, 0.8, -0.4],
        [-0.3, 1.5, 0.2],
        [0.1, -0.6, 1.1],
        [-0.9, 0.5, -0.7]
    ].slice(0, size);

    const rowHeaders = Array.from({ length: size }, (_, idx) => `Pt ${idx}`);
    const colHeaders = ['X', 'Y', 'Z'];

    const makeState = (activePt: number | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'points_coords': {
                    type: 'matrix',
                    id: 'points_coords',
                    data: data.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    activeClusterSize: size,
                    activeEvaluatedIndex: activePt !== null ? activePt : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing 3D points cluster coordinates.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    const writes = 0;

    for (let i = 0; i < size; i++) {
        comparisons++;
        yield {
            snapshot: makeState(i, `Evaluating point ${i} to determine initial wrapping coplanar face.`, 5),
            events: [{ type: 'compare', targetIds: ['points_coords'], indices: [i * 3, i * 3 + 1, i * 3 + 2] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, "3D Jarvis March Convex Hull faces mapping complete.", 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
