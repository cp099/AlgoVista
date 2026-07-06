import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'bezier-spline-interpolation',
    name: 'Bezier Spline Interpolation',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Generates a continuous, smooth Bezier spline connecting a series of coordinate points by calculating optimal matching control points at junctions.',
    pseudocode: [
        'function SplineInterpolation(Points):',
        '  for i from 0 to length(Points) - 2:',
        '    CalculateControlPoints(Points[i], Points[i+1])',
        '    DrawBezierSegment(Points[i], C1, C2, Points[i+1])'
    ],
    inputs: [
        {
            id: 'pointsCount',
            label: 'Interpolation Joints',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['pointsCount'] as number;

    const joints = [
        { x: 0, y: 1 },
        { x: 2, y: 4 },
        { x: 5, y: 2 },
        { x: 7, y: 5 }
    ].slice(0, size);

    const curvePoints: { x: number; y: number }[] = [];

    const makeState = (activeIdx: number | null, msg: string, line: number): AlgoState => {
        const plotPoints = joints.map((j, idx) => ({
            id: `J${idx}`,
            x: j.x,
            y: j.y,
            label: `Joint ${idx}`,
            state: idx === activeIdx ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'spline_plot': {
                    type: 'plot',
                    id: 'spline_plot',
                    points: plotPoints,
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    jointsCount: size,
                    activeJointIndex: activeIdx !== null ? activeIdx : 'None',
                    splinePointsCount: curvePoints.length
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing spline interpolation joint points.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let i = 0; i < joints.length - 1; i++) {
        comparisons++;
        const p0 = joints[i];
        const p3 = joints[i + 1];

        // Smooth heuristics control points:
        // Set control points offset based on delta X
        const dx = (p3.x - p0.x) / 3;
        const c1 = { x: p0.x + dx, y: p0.y };
        const c2 = { x: p3.x - dx, y: p3.y };

        // Animate segment interpolation points evaluation
        for (let step = 0; step <= 5; step++) {
            const t = step / 5;
            const w0 = Math.pow(1 - t, 3);
            const w1 = 3 * Math.pow(1 - t, 2) * t;
            const w2 = 3 * (1 - t) * Math.pow(t, 2);
            const w3 = Math.pow(t, 3);

            const x = w0 * p0.x + w1 * c1.x + w2 * c2.x + w3 * p3.x;
            const y = w0 * p0.y + w1 * c1.y + w2 * c2.y + w3 * p3.y;

            curvePoints.push({ x, y });
            writes++;
        }

        yield {
            snapshot: makeState(i + 1, `Interpolated segment curve between Joint ${i} and Joint ${i+1}.`, 3),
            events: [{ type: 'write', targetIds: ['spline_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, "Bezier Spline interpolation complete. Continuous smooth path derived.", 4),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
