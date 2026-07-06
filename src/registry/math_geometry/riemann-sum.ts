import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'riemann-sum',
    name: 'Riemann Sum Integration',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Approximates the definite integral (area under the curve) of f(x) = x^2 from a to b by summing the areas of rectangular slices.',
    pseudocode: [
        'function RiemannSum(a, b, n):',
        '  dx = (b - a) / n',
        '  totalArea = 0',
        '  for i from 0 to n-1:',
        '    x = a + i*dx',
        '    totalArea += f(x) * dx',
        '  return totalArea'
    ],
    inputs: [
        {
            id: 'slices',
            label: 'Number of Slices (n)',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 2, max: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const n = inputs['slices'] as number;
    const a = 0;
    const b = 3;
    const dx = (b - a) / n;

    const f = (val: number) => val * val;

    // Generate static curve
    const curvePoints: { x: number; y: number }[] = [];
    for (let t = a; t <= b; t += 0.1) {
        curvePoints.push({ x: t, y: f(t) });
    }

    const makeState = (activeSlice: number | null, areas: { x: number; y: number }[][], totalArea: number, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'integral_plot': {
                    type: 'plot',
                    id: 'integral_plot',
                    points: [
                        { id: 'start', x: a, y: 0, label: 'a: 0', state: 'default' as const },
                        { id: 'end', x: b, y: 0, label: 'b: 3', state: 'default' as const }
                    ],
                    curves: [curvePoints],
                    shadedAreas: areas
                }
            },
            context: {
                variables: {
                    intervalStart: a,
                    intervalEnd: b,
                    sliceWidth: dx.toFixed(3),
                    activeSlice: activeSlice !== null ? activeSlice : 'None',
                    approximateArea: totalArea.toFixed(4)
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], 0, "Initializing Riemann sum integration slice bounds.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let totalArea = 0;
    const areas: { x: number; y: number }[][] = [];

    for (let i = 0; i < n; i++) {
        comparisons++;
        const x = a + i * dx;
        const height = f(x);
        const area = height * dx;
        totalArea += area;
        writes++;

        // Rectangle vertices: (x, 0), (x, height), (x+dx, height), (x+dx, 0)
        const rect = [
            { x, y: 0 },
            { x, y: height },
            { x: x + dx, y: height },
            { x: x + dx, y: 0 }
        ];
        areas.push(rect);

        yield {
            snapshot: makeState(i, [...areas], totalArea, `Adding area of slice ${i} (x: ${x.toFixed(2)}, height: ${height.toFixed(2)}, area: ${area.toFixed(3)}).`, 5),
            events: [{ type: 'write', targetIds: ['integral_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, areas, totalArea, `Riemann Sum complete. Estimated area under x^2 is ${totalArea.toFixed(4)} (Exact: 9.00).`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
