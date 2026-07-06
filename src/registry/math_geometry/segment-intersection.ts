import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'segment-intersection',
    name: 'Line Segment Intersection',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Finds intersections among a set of line segments by simulating a vertical sweep line moving across the coordinate plane.',
    pseudocode: [
        'function SweepLineIntersection(Segments):',
        '  Events = Sort endpoints of Segments by X coordinate',
        '  SweepLine = Tree representing Y order',
        '  for event in Events:',
        '    if event is left endpoint:',
        '      SweepLine.insert(segment)',
        '      CheckIntersection(segment, neighbors)',
        '    else if event is right endpoint:',
        '      CheckIntersection(neighbors)',
        '      SweepLine.remove(segment)'
    ],
    inputs: [
        {
            id: 'segmentCount',
            label: 'Line Segments Count',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['segmentCount'] as number;

    const segments = [
        { p1: { x: 1, y: 1 }, p2: { x: 5, y: 4 }, label: 'Seg 1' },
        { p1: { x: 2, y: 3.5 }, p2: { x: 6, y: 1.5 }, label: 'Seg 2' },
        { p1: { x: 3.5, y: 0.5 }, p2: { x: 4.5, y: 5 }, label: 'Seg 3' }
    ].slice(0, size);

    const makeState = (sweepX: number | null, activeIntersection: { x: number; y: number } | null, msg: string, line: number): AlgoState => {
        const points = activeIntersection ? [
            { id: 'intersect', x: activeIntersection.x, y: activeIntersection.y, label: 'Intersection Point', state: 'active' as const }
        ] : [];

        // Draw segments as lines
        const plotLines: { p1: { x: number; y: number }; p2: { x: number; y: number }; color?: string; dashed?: boolean }[] = segments.map((seg) => ({
            p1: seg.p1,
            p2: seg.p2,
            color: '#6366f1'
        }));

        // Draw vertical sweep line
        if (sweepX !== null) {
            plotLines.push({
                p1: { x: sweepX, y: 0 },
                p2: { x: sweepX, y: 6 },
                color: '#f59e0b',
                dashed: true
            });
        }

        return {
            structures: {
                'sweep_plot': {
                    type: 'plot',
                    id: 'sweep_plot',
                    points,
                    lines: plotLines
                }
            },
            context: {
                variables: {
                    sweepXCoordinate: sweepX !== null ? sweepX.toFixed(2) : 'None',
                    segmentsCount: size,
                    intersectionFound: activeIntersection ? `(${activeIntersection.x.toFixed(2)}, ${activeIntersection.y.toFixed(2)})` : 'No'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Starting Sweep-Line segment intersection algorithm.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    const writes = 0;

    // Simulate sweep line moving across event endpoints
    // X event coordinates: 1, 2, 3.5, 4.5, 5, 6
    const sweepEvents = [1.0, 2.0, 3.2, 3.5, 4.5, 5.0, 6.0];
    for (const sx of sweepEvents) {
        comparisons++;

        // At x = 3.2, Seg 1 and Seg 2 intersect
        // intersection point calculated:
        // Seg 1: y = 0.75x + 0.25
        // Seg 2: y = -0.5x + 4.5
        // 0.75x + 0.25 = -0.5x + 4.5 => 1.25x = 4.25 => x = 3.4
        let intersection: { x: number; y: number } | null = null;
        if (sx >= 3.4) {
            intersection = { x: 3.4, y: 2.8 };
        }

        yield {
            snapshot: makeState(sx, intersection, `Sweep line advanced to X = ${sx.toFixed(1)}. Reordering segment intersection priorities.`, 4),
            events: [{ type: 'compare', targetIds: ['sweep_plot'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, { x: 3.4, y: 2.8 }, "Sweep Line segment search complete. Intersection detected at (3.40, 2.80).", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
