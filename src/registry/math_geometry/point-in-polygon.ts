import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'point-in-polygon',
    name: 'Point in Polygon (Ray Casting)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Medium' as const,
    description: 'Checks if a 2D point lies inside a polygon by casting a horizontal ray from the point to infinity and counting how many times the ray intersects the polygon edges.',
    pseudocode: [
        'function PointInPolygon(point, polygon):',
        '  intersections = 0',
        '  for edge in polygon.edges:',
        '    if RayIntersectsEdge(point, edge):',
        '      intersections++',
        '  return (intersections is odd)'
    ],
    inputs: [
        {
            id: 'xCoord',
            label: 'Test Point X',
            type: 'float' as const,
            defaultValue: 3.0,
            constraints: { min: 1.0, max: 6.0 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const px = inputs['xCoord'] as number;
    const testPoint = { x: px, y: 2.5 };

    // Polygon coordinates: Triangle
    const poly = [
        { x: 2, y: 1 },
        { x: 4, y: 4 },
        { x: 6, y: 1 }
    ];

    const lines: { p1: { x: number; y: number }; p2: { x: number; y: number }; color?: string; dashed?: boolean }[] = [
        { p1: poly[0], p2: poly[1], color: '#6366f1' },
        { p1: poly[1], p2: poly[2], color: '#6366f1' },
        { p1: poly[2], p2: poly[0], color: '#6366f1' }
    ];

    const makeState = (rayEnd: number | null, intersections: number, msg: string, line: number): AlgoState => {
        const points = [
            { id: 'test', x: testPoint.x, y: testPoint.y, label: `Test Point (${testPoint.x.toFixed(1)}, ${testPoint.y.toFixed(1)})`, state: 'active' as const }
        ];

        const plotLines = [...lines];
        if (rayEnd !== null) {
            // Draw horizontal ray line
            plotLines.push({
                p1: testPoint,
                p2: { x: rayEnd, y: testPoint.y },
                color: '#f59e0b',
                dashed: true
            });
        }

        return {
            structures: {
                'polygon_plot': {
                    type: 'plot',
                    id: 'polygon_plot',
                    points,
                    lines: plotLines
                }
            },
            context: {
                variables: {
                    testPointCoords: `(${testPoint.x}, ${testPoint.y})`,
                    intersectionCount: intersections,
                    isInside: intersections % 2 !== 0 ? 'Inside (Odd)' : 'Outside (Even)'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, 0, "Starting Ray Casting Point-in-Polygon check.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    const writes = 0;
    let intersections = 0;

    // Simulate casting a ray from testPoint to X = 8 (infinity bounds)
    const raySteps = [testPoint.x + 1, testPoint.x + 2, 7.0];
    for (let idx = 0; idx < raySteps.length; idx++) {
        comparisons++;
        const currentRayX = raySteps[idx];

        // Triangle boundaries: left slope x ranges 2 to 4, right slope x ranges 4 to 6
        // At y = 2.5:
        // Left edge: y - 1 = 1.5 * (x - 2) => 1.5 = 1.5 * (x - 2) => x = 3.0
        // Right edge: y - 1 = -1.5 * (x - 6) => 1.5 = -1.5 * (x - 6) => -1 = x - 6 => x = 5.0
        
        let count = 0;
        if (testPoint.x < 3.0 && currentRayX >= 3.0) count++;
        if (testPoint.x < 5.0 && currentRayX >= 5.0) count++;
        intersections = count;

        yield {
            snapshot: makeState(currentRayX, intersections, `Casting horizontal ray from test point to X = ${currentRayX.toFixed(1)}. Counting intersections.`, 4),
            events: [{ type: 'compare', targetIds: ['polygon_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    const isInside = intersections % 2 !== 0;
    yield {
        snapshot: makeState(7.0, intersections, `Ray Casting complete. Total intersections: ${intersections}. Point is ${isInside ? 'INSIDE' : 'OUTSIDE'} the polygon.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
