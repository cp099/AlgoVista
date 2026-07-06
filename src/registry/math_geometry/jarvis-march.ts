import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'jarvis-march',
    name: 'Convex Hull (Jarvis March)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Computes the Convex Hull of a set of 2D points using Jarvis\'s March (Gift Wrapping) algorithm in O(n * h) time.',
    pseudocode: [
        'function JarvisMarch(points):',
        '  p = leftmost point',
        '  repeat:',
        '    Hull.push(p)',
        '    q = next point with smallest counter-clockwise turn',
        '    p = q',
        '  until p == leftmost point'
    ],
    inputs: [
        {
            id: 'pointCount',
            label: 'Generate Point Density',
            type: 'integer' as const,
            defaultValue: 5,
            constraints: { min: 4, max: 7 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['pointCount'] as number;

    const points = [
        { id: 'A', x: 1, y: 1 },
        { id: 'B', x: 2, y: 4 },
        { id: 'C', x: 4, y: 3 },
        { id: 'D', x: 5, y: 1 },
        { id: 'E', x: 3, y: 2 },
        { id: 'F', x: 1, y: 3 },
        { id: 'G', x: 4, y: 0.5 }
    ].slice(0, size);

    const hull: { x: number; y: number }[] = [];

    const makeState = (activePoint: string | null, visitedHull: { x: number; y: number }[], lines: { p1: { x: number; y: number }; p2: { x: number; y: number } }[], msg: string, line: number): AlgoState => {
        const plotPoints = points.map(pt => {
            let state: 'default' | 'active' | 'hull' | 'visited' = 'default';
            if (pt.id === activePoint) state = 'active';
            else if (visitedHull.some(hpt => hpt.x === pt.x && hpt.y === pt.y)) state = 'hull';
            return { ...pt, state };
        });

        return {
            structures: {
                'points_plot': {
                    type: 'plot',
                    id: 'points_plot',
                    points: plotPoints,
                    lines,
                    hullPath: visitedHull
                }
            },
            context: {
                variables: {
                    totalPoints: size,
                    hullSize: visitedHull.length,
                    activePoint: activePoint || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], [], "Starting Jarvis March Convex Hull (Gift Wrapping).", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Find leftmost point (minimum X)
    let leftmostIdx = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].x < points[leftmostIdx].x) {
            leftmostIdx = i;
        }
    }

    let p = leftmostIdx;
    let q = 0;

    do {
        hull.push(points[p]);
        writes++;

        yield {
            snapshot: makeState(points[p].id, [...hull], [], `Added point "${points[p].id}" to Convex Hull. Looking for next wrap vertex.`, 4),
            events: [{ type: 'lock', targetIds: ['points_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        q = (p + 1) % points.length;

        for (let i = 0; i < points.length; i++) {
            comparisons++;
            // Check orientation of triplet (p, i, q)
            // If cross product is positive, i is more counter-clockwise than q
            const val = (points[i].y - points[p].y) * (points[q].x - points[i].x) -
                        (points[i].x - points[p].x) * (points[q].y - points[i].y);

            const checkLines = [
                { p1: points[p], p2: points[i], color: '#ef4444' }, // Candidate red line
                { p1: points[p], p2: points[q], color: '#10b981' }  // Current green line
            ];

            yield {
                snapshot: makeState(points[i].id, [...hull], checkLines, `Checking if "${points[i].id}" is more counter-clockwise than "${points[q].id}" from pivot "${points[p].id}".`, 5),
                events: [{ type: 'compare', targetIds: ['points_plot'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (val < 0) {
                q = i;
            }
        }

        p = q;
    } while (p !== leftmostIdx && hull.length < size);

    // Close the loop
    hull.push(points[leftmostIdx]);

    yield {
        snapshot: makeState(null, [...hull], [], "Jarvis March complete. Convex Hull boundary successfully wrapped.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
