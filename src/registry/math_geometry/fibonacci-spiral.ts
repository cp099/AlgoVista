import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fibonacci-spiral',
    name: 'Fibonacci Spiral Plotter',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Plots the Fibonacci spiral (golden spiral) in Cartesian coordinate space by generating successive arc sections matching Fibonacci square dimensions.',
    pseudocode: [
        'function PlotSpiral(steps):',
        '  a = 0, b = 1',
        '  for i from 1 to steps:',
        '    DrawArcSegment(radius=b, center=offset)',
        '    temp = a + b',
        '    a = b, b = temp'
    ],
    inputs: [
        {
            id: 'spiralSteps',
            label: 'Spiral Arc Steps',
            type: 'integer' as const,
            defaultValue: 5,
            constraints: { min: 3, max: 7 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const steps = inputs['spiralSteps'] as number;

    const curvePoints: { x: number; y: number }[] = [];

    const makeState = (activeStep: number | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'spiral_plot': {
                    type: 'plot',
                    id: 'spiral_plot',
                    points: [
                        { id: 'center', x: 0, y: 0, label: 'Center (0,0)', state: 'active' as const }
                    ],
                    curves: [curvePoints]
                }
            },
            context: {
                variables: {
                    activeStepIndex: activeStep !== null ? activeStep : 'None',
                    spiralPointsCount: curvePoints.length
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing golden spiral coordinate systems.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    let a = 0;
    let b = 1;

    for (let i = 1; i <= steps; i++) {
        comparisons++;
        
        // Generate circular arc segment coordinates of radius b
        // In 4 quadrants successively
        const startAngle = ((i - 1) * Math.PI) / 2;
        const endAngle = (i * Math.PI) / 2;
        const radius = b;

        for (let j = 0; j <= 5; j++) {
            const angle = startAngle + (j / 5) * (endAngle - startAngle);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            curvePoints.push({ x, y });
            writes++;
        }

        const temp = a + b;
        a = b;
        b = temp;

        yield {
            snapshot: makeState(i, `Plotted arc segment ${i} with Fibonacci radius: ${a}.`, 4),
            events: [{ type: 'write', targetIds: ['spiral_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, "Fibonacci Golden Spiral plotted successfully.", 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
