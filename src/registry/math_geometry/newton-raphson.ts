import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'newton-raphson',
    name: 'Newton-Raphson Root Finding',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Finds the root of a mathematical function (e.g. f(x) = x^2 - 2) by iteratively constructing tangent lines and finding their intersections with the X-axis.',
    pseudocode: [
        'function NewtonRaphson(x0, tolerance):',
        '  x = x0',
        '  while |f(x)| > tolerance:',
        '    x = x - f(x) / f\'(x)',
        '  return x'
    ],
    inputs: [
        {
            id: 'x0',
            label: 'Initial Guess (x0)',
            type: 'float' as const,
            defaultValue: 3.0,
            constraints: { min: 1.5, max: 4.0 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    let x = inputs['x0'] as number;

    const f = (val: number) => val * val - 2;
    const df = (val: number) => 2 * val;

    // Generate static curve for plotting
    const curvePoints: { x: number; y: number }[] = [];
    for (let t = 0.5; t <= 4.0; t += 0.1) {
        curvePoints.push({ x: t, y: f(t) });
    }

    const makeState = (currX: number, tangentLine: { p1: { x: number; y: number }; p2: { x: number; y: number } } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'function_plot': {
                    type: 'plot',
                    id: 'function_plot',
                    points: [
                        { id: 'curr', x: currX, y: f(currX), label: `x: ${currX.toFixed(3)}`, state: 'active' as const },
                        { id: 'root', x: Math.sqrt(2), y: 0, label: 'True Root (√2)', state: 'visited' as const }
                    ],
                    lines: tangentLine ? [
                        { p1: tangentLine.p1, p2: tangentLine.p2, color: '#f59e0b' },
                        // Draw line down to X axis
                        { p1: { x: currX, y: 0 }, p2: { x: currX, y: f(currX) }, color: '#94a3b8', dashed: true }
                    ] : [],
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    initialGuess: x.toFixed(3),
                    currentX: currX.toFixed(6),
                    fx: f(currX).toFixed(6),
                    dfx: df(currX).toFixed(6)
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(x, null, `Starting Newton-Raphson approximation. Initial guess x = ${x}`, 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const tolerance = 0.001;

    for (let iter = 1; iter <= 4; iter++) {
        comparisons++;
        const currY = f(x);
        const slope = df(x);
        
        if (Math.abs(currY) <= tolerance) break;

        // Tangent line equation: y - f(x) = f'(x) * (t - x)
        // At y = 0: t = x - f(x)/f'(x) (the next X)
        const nextX = x - currY / slope;

        const tangent = {
            p1: { x: x, y: currY },
            p2: { x: nextX, y: 0 }
        };

        yield {
            snapshot: makeState(x, tangent, `Constructed tangent line at x = ${x.toFixed(3)}. Intersects X-axis at x = ${nextX.toFixed(3)}.`, 3),
            events: [{ type: 'compare', targetIds: ['function_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        x = nextX;
        writes++;

        yield {
            snapshot: makeState(x, null, `Iteration ${iter} complete. Updated estimate to x = ${x.toFixed(5)}.`, 4),
            events: [{ type: 'write', targetIds: ['function_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(x, null, `Newton-Raphson complete. Approximated root: ${x.toFixed(5)} (True root: 1.41421).`, 4),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
