import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'monte-carlo-pi',
    name: 'Monte Carlo Pi Estimation',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Easy' as const,
    description: 'Estimates the value of Pi by scattering random coordinates inside a square containing a quadrant circle, and computing the ratio of points that fall inside the circle.',
    pseudocode: [
        'function EstimatePi(pointsCount):',
        '  insideCircle = 0',
        '  for i from 1 to pointsCount:',
        '    x = random(0, 1), y = random(0, 1)',
        '    if x^2 + y^2 <= 1:',
        '      insideCircle++',
        '  return 4 * (insideCircle / pointsCount)'
    ],
    inputs: [
        {
            id: 'pointCount',
            label: 'Scattered Points (n)',
            type: 'integer' as const,
            defaultValue: 10,
            constraints: { min: 5, max: 20 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const totalPoints = inputs['pointCount'] as number;

    // Generate static quadrant curve for reference
    const curvePoints: { x: number; y: number }[] = [];
    for (let t = 0; t <= 1.0; t += 0.05) {
        curvePoints.push({ x: t, y: Math.sqrt(1 - t * t) });
    }

    // Fixed mock random points for deterministic visualizer steps
    const samplePoints = [
        { x: 0.2, y: 0.3 },
        { x: 0.8, y: 0.7 },
        { x: 0.5, y: 0.5 },
        { x: 0.9, y: 0.1 },
        { x: 0.3, y: 0.8 },
        { x: 0.7, y: 0.8 },
        { x: 0.1, y: 0.9 },
        { x: 0.4, y: 0.2 },
        { x: 0.6, y: 0.6 },
        { x: 0.95, y: 0.95 },
        { x: 0.1, y: 0.2 },
        { x: 0.88, y: 0.12 },
        { x: 0.75, y: 0.65 },
        { x: 0.34, y: 0.77 },
        { x: 0.22, y: 0.55 },
        { x: 0.61, y: 0.81 },
        { x: 0.45, y: 0.45 },
        { x: 0.99, y: 0.01 },
        { x: 0.05, y: 0.05 },
        { x: 0.85, y: 0.85 }
    ].slice(0, totalPoints);

    const activePoints: { id: string; x: number; y: number; state: 'visited' | 'active' | 'default' }[] = [];

    const makeState = (inside: number, total: number, msg: string, line: number): AlgoState => {
        const approxPi = total > 0 ? 4 * (inside / total) : 0.0;

        return {
            structures: {
                'estimation_plot': {
                    type: 'plot',
                    id: 'estimation_plot',
                    points: [...activePoints],
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    totalPointsScattered: total,
                    pointsInsideCircle: inside,
                    approximatedPi: approxPi.toFixed(4)
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(0, 0, "Initializing Monte Carlo Pi estimation coordinate space.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let insideCount = 0;

    for (let i = 0; i < samplePoints.length; i++) {
        comparisons++;
        const p = samplePoints[i];
        const inside = (p.x * p.x + p.y * p.y) <= 1.0;

        if (inside) {
            insideCount++;
            writes++;
        }

        activePoints.push({
            id: `p${i}`,
            x: p.x,
            y: p.y,
            state: inside ? ('visited' as const) : ('active' as const) // Green for inside, Amber for outside
        });

        yield {
            snapshot: makeState(insideCount, i + 1, `Scattered point (${p.x.toFixed(2)}, ${p.y.toFixed(2)}). Position: ${inside ? 'INSIDE' : 'OUTSIDE'} quadrant circle.`, 5),
            events: [{ type: 'write', targetIds: ['estimation_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    const finalPi = 4 * (insideCount / totalPoints);
    yield {
        snapshot: makeState(insideCount, totalPoints, `Monte Carlo simulation finished. Final Pi estimate: ${finalPi.toFixed(4)}`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
