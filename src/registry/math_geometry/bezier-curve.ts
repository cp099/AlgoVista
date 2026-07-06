import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'bezier-curve',
    name: 'Bezier Curve Generator',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Generates a smooth cubic Bezier curve from four control points by interpolating values using Bernstein polynomials.',
    pseudocode: [
        'function BezierCubic(P0, P1, P2, P3, steps):',
        '  for t from 0 to 1 with increment 1/steps:',
        '    x = (1-t)^3*P0.x + 3(1-t)^2*t*P1.x + 3(1-t)*t^2*P2.x + t^3*P3.x',
        '    y = (1-t)^3*P0.y + 3(1-t)^2*t*P1.y + 3(1-t)*t^2*P2.y + t^3*P3.y',
        '    Curve.push(Point(x, y))',
        '  return Curve'
    ],
    inputs: [
        {
            id: 'steps',
            label: 'Curve Steps (Resolution)',
            type: 'integer' as const,
            defaultValue: 10,
            constraints: { min: 5, max: 20 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const steps = inputs['steps'] as number;

    const p0 = { x: 0, y: 0 };
    const p1 = { x: 2, y: 4 };
    const p2 = { x: 5, y: 4 };
    const p3 = { x: 7, y: 1 };

    const curvePoints: { x: number; y: number }[] = [];

    const makeState = (activeT: number | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'bezier_plot': {
                    type: 'plot',
                    id: 'bezier_plot',
                    points: [
                        { id: 'P0', x: p0.x, y: p0.y, label: 'P0 (Start)', state: 'default' as const },
                        { id: 'P1', x: p1.x, y: p1.y, label: 'P1 (Control)', state: 'active' as const },
                        { id: 'P2', x: p2.x, y: p2.y, label: 'P2 (Control)', state: 'active' as const },
                        { id: 'P3', x: p3.x, y: p3.y, label: 'P3 (End)', state: 'default' as const }
                    ],
                    lines: [
                        { p1: p0, p2: p1, color: '#e2e8f0', dashed: true },
                        { p1: p1, p2: p2, color: '#e2e8f0', dashed: true },
                        { p1: p2, p2: p3, color: '#e2e8f0', dashed: true }
                    ],
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    parameterT: activeT !== null ? activeT.toFixed(2) : 'None',
                    curvePointsCount: curvePoints.length,
                    controlP0: `(${p0.x}, ${p0.y})`,
                    controlP3: `(${p3.x}, ${p3.y})`
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing Cubic Bezier curve control points.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    for (let i = 0; i <= steps; i++) {
        comparisons++;
        const t = i / steps;

        // Bernstein polynomial weights
        const w0 = Math.pow(1 - t, 3);
        const w1 = 3 * Math.pow(1 - t, 2) * t;
        const w2 = 3 * (1 - t) * Math.pow(t, 2);
        const w3 = Math.pow(t, 3);

        const x = w0 * p0.x + w1 * p1.x + w2 * p2.x + w3 * p3.x;
        const y = w0 * p0.y + w1 * p1.y + w2 * p2.y + w3 * p3.y;

        curvePoints.push({ x, y });
        writes++;

        yield {
            snapshot: makeState(t, `Evaluating curve spline coordinates at parameterized step t = ${t.toFixed(2)}. Point calculated: (${x.toFixed(2)}, ${y.toFixed(2)})`, 4),
            events: [{ type: 'write', targetIds: ['bezier_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, `Cubic Bezier curve generation complete. Smoothed curve path rendered.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
