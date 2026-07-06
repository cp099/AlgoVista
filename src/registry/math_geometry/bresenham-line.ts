import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'bresenham-line',
    name: 'Bresenham\'s Line Algorithm',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Selects the exact pixel coordinates on a 2D grid that form a close approximation to a straight line between two specified endpoints.',
    pseudocode: [
        'function Bresenham(x0, y0, x1, y1):',
        '  dx = x1 - x0, dy = y1 - y0',
        '  D = 2*dy - dx',
        '  y = y0',
        '  for x from x0 to x1:',
        '    Plot(x, y)',
        '    if D > 0:',
        '      y = y + 1, D = D - 2*dx',
        '    D = D + 2*dy'
    ],
    inputs: [
        {
            id: 'y1',
            label: 'Endpoint Y1 Coordinate',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const y1 = inputs['y1'] as number;

    const x0 = 0, y0 = 0;
    const x1 = 5;

    // Grid size: 6x6
    const dp: (string | number)[][] = Array.from({ length: 6 }, () => Array(6).fill('.'));

    const rowHeaders = Array.from({ length: 6 }, (_, idx) => `Y:${idx}`);
    const colHeaders = Array.from({ length: 6 }, (_, idx) => `X:${idx}`);

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'pixel_grid': {
                    type: 'matrix',
                    id: 'pixel_grid',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    startPoint: `(${x0}, ${y0})`,
                    endPoint: `(${x1}, ${y1})`,
                    activePixel: activeCell ? `(${activeCell.c}, ${activeCell.r})` : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing pixel grid for Bresenham line rendering.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    const dx = x1 - x0;
    const dy = y1 - y0;
    let D = 2 * dy - dx;
    let y = y0;

    for (let x = x0; x <= x1; x++) {
        comparisons++;
        dp[5 - y][x] = '#'; // Invert Y row index for standard coordinate system display
        writes++;

        yield {
            snapshot: makeState({ r: 5 - y, c: x }, `Plotting pixel at (${x}, ${y}). Decision Parameter D = ${D}.`, 6),
            events: [{ type: 'write', targetIds: ['pixel_grid'], indices: [(5 - y) * 6 + x] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (D > 0) {
            y = y + 1;
            D = D - 2 * dx;
        }
        D = D + 2 * dy;
    }

    yield {
        snapshot: makeState(null, "Bresenham pixel grid line approximation complete.", 9),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
