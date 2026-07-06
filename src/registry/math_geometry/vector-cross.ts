import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'vector-cross-product',
    name: 'Vector Cross Product',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Easy' as const,
    description: 'Computes the 3D cross product vector of two input vectors, which is perpendicular to both in coordinate space.',
    pseudocode: [
        'function CrossProduct(A, B):',
        '  C.x = A.y * B.z - A.z * B.y',
        '  C.y = A.z * B.x - A.x * B.z',
        '  C.z = A.x * B.y - A.y * B.x',
        '  return C'
    ],
    inputs: [
        {
            id: 'xCoord',
            label: 'Vector A - X Component',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: -5, max: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const ax = inputs['xCoord'] as number;

    const a = { x: ax, y: 4, z: 0 };
    const b = { x: 0, y: 0, z: 5 };

    const c = { x: 0, y: 0, z: 0 };

    const makeState = (activeComponent: 'X' | 'Y' | 'Z' | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'vector_a': { type: 'array', id: 'Vector A [x, y, z]', data: [a.x, a.y, a.z] },
                'vector_b': { type: 'array', id: 'Vector B [x, y, z]', data: [b.x, b.y, b.z] },
                'vector_c': { type: 'array', id: 'Cross Product C [x, y, z]', data: [c.x, c.y, c.z] }
            },
            context: {
                variables: {
                    activeAxis: activeComponent ?? 'None',
                    aComponent: `(${a.x}, ${a.y}, ${a.z})`,
                    bComponent: `(${b.x}, ${b.y}, ${b.z})`,
                    cComponent: `(${c.x}, ${c.y}, ${c.z})`
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing 3D vectors A and B.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Component X
    comparisons++;
    c.x = a.y * b.z - a.z * b.y;
    writes++;
    yield {
        snapshot: makeState('X', `Calculated C.x = A.y*B.z - A.z*B.y => ${a.y}*${b.z} - ${a.z}*${b.y} = ${c.x}.`, 2),
        events: [{ type: 'write', targetIds: ['vector_c'], indices: [0] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Component Y
    comparisons++;
    c.y = a.z * b.x - a.x * b.z;
    writes++;
    yield {
        snapshot: makeState('Y', `Calculated C.y = A.z*B.x - A.x*B.z => ${a.z}*${b.x} - ${a.x}*${b.z} = ${c.y}.`, 3),
        events: [{ type: 'write', targetIds: ['vector_c'], indices: [1] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Component Z
    comparisons++;
    c.z = a.x * b.y - a.y * b.x;
    writes++;
    yield {
        snapshot: makeState('Z', `Calculated C.z = A.x*B.y - A.y*B.x => ${a.x}*${b.y} - ${a.y}*${b.x} = ${c.z}.`, 4),
        events: [{ type: 'write', targetIds: ['vector_c'], indices: [2] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(null, `Vector Cross Product complete. Perpendicular vector C: (${c.x}, ${c.y}, ${c.z}).`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
