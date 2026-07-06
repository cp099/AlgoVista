import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'gradient-descent',
    name: 'Gradient Descent Optimization',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Finds the local minimum of a function (e.g. f(x) = x^2) by iteratively stepping in the opposite direction of the gradient (derivative).',
    pseudocode: [
        'function GradientDescent(x0, lr, tolerance):',
        '  x = x0',
        '  while |df(x)| > tolerance:',
        '    gradient = df(x)',
        '    x = x - lr * gradient',
        '  return x'
    ],
    inputs: [
        {
            id: 'lr',
            label: 'Learning Rate (lr)',
            type: 'float' as const,
            defaultValue: 0.3,
            constraints: { min: 0.1, max: 0.8 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const lr = inputs['lr'] as number;
    let x = 3.0; // Start at x = 3

    const f = (val: number) => val * val;
    const df = (val: number) => 2 * val;

    // Generate static curve
    const curvePoints: { x: number; y: number }[] = [];
    for (let t = -3.5; t <= 3.5; t += 0.1) {
        curvePoints.push({ x: t, y: f(t) });
    }

    const makeState = (currX: number, prevX: number | null, msg: string, line: number): AlgoState => {
        const lines = prevX !== null ? [
            { p1: { x: prevX, y: f(prevX) }, p2: { x: currX, y: f(currX) }, color: '#3b82f6' }
        ] : [];

        return {
            structures: {
                'descent_plot': {
                    type: 'plot',
                    id: 'descent_plot',
                    points: [
                        { id: 'curr', x: currX, y: f(currX), label: `x: ${currX.toFixed(3)}`, state: 'active' as const },
                        { id: 'min', x: 0, y: 0, label: 'Minimum (0,0)', state: 'visited' as const }
                    ],
                    lines,
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    learningRate: lr,
                    currentX: currX.toFixed(5),
                    gradientValue: df(currX).toFixed(5),
                    yVal: f(currX).toFixed(5)
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(x, null, `Starting gradient descent at x = ${x}. Learning rate lr = ${lr}`, 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const tolerance = 0.01;

    for (let step = 1; step <= 5; step++) {
        comparisons++;
        const grad = df(x);
        if (Math.abs(grad) <= tolerance) break;

        const nextX = x - lr * grad;
        writes++;

        yield {
            snapshot: makeState(nextX, x, `Step ${step}: Gradient df(x) = ${grad.toFixed(3)}. Update x = x - lr*grad to ${nextX.toFixed(3)}.`, 5),
            events: [{ type: 'write', targetIds: ['descent_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        x = nextX;
    }

    yield {
        snapshot: makeState(x, null, `Gradient descent optimizations completed. Approximated local minimum: x = ${x.toFixed(5)}.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
