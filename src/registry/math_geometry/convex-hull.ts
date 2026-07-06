import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'convex-hull',
    name: "Convex Hull (Graham Scan)",
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: "Computes the Convex Hull of a set of 2D points using Graham's Scan algorithm. Finds the lowest pivot point, sorts remaining points by polar angle, and uses a stack to build the hull boundary by making counter-clockwise turns.",
    pseudocode: [
        'function GrahamScan(points):',
        '  pivot = point with lowest Y coord',
        '  sort remaining points by polar angle from pivot',
        '  stack = [pivot, sorted[0], sorted[1]]',
        '  for i from 2 to length(sorted)-1:',
        '    while CCW(stack[top-1], stack[top], sorted[i]) <= 0:',
        '      pop stack',
        '    push sorted[i] onto stack'
    ],
    inputs: [
        {
            id: 'pointCount',
            label: 'Generate Point Density',
            type: 'integer' as const,
            defaultValue: 7,
            constraints: { min: 4, max: 9 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const density = inputs['pointCount'] as number;
    let comparisons = 0;

    // Define coordinates for static set of points for high-fidelity visualization
    // We filter down based on the density constraint
    const allPoints = [
        { x: 2, y: 1.5, id: 'A', label: 'A (2,1.5)', state: 'default' as const },
        { x: 3.5, y: 5, id: 'B', label: 'B (3.5,5)', state: 'default' as const },
        { x: 5.5, y: 3.5, id: 'C', label: 'C (5.5,3.5)', state: 'default' as const },
        { x: 6, y: 1.2, id: 'D', label: 'D (6,1.2) [Pivot]', state: 'default' as const },
        { x: 3, y: 3, id: 'E', label: 'E (3,3)', state: 'default' as const },
        { x: 4.5, y: 2, id: 'F', label: 'F (4.5,2)', state: 'default' as const },
        { x: 1.5, y: 4, id: 'G', label: 'G (1.5,4)', state: 'default' as const },
        { x: 1, y: 2, id: 'H', label: 'H (1,2)', state: 'default' as const },
        { x: 4, y: 4, id: 'I', label: 'I (4,4)', state: 'default' as const }
    ];

    // Filter points based on user selected density
    const points = allPoints.slice(0, Math.min(density, allPoints.length));

    // Sort order after polar sorting from pivot D(6, 1.2):
    // 1. D (Pivot)
    // 2. C (5.5, 3.5)
    // 3. I (4, 4)
    // 4. B (3.5, 5)
    // 5. E (3, 3) (Internal)
    // 6. G (1.5, 4)
    // 7. H (1, 2)
    // 8. A (2, 1.5)
    // 9. F (4.5, 2) (Internal)
    // For simplicity, we define the sorted array path indices for the simulation:
    const polarSorted = points.filter(p => p.id !== 'D');
    // Force a predictable sort for clean step-by-step visualizations
    polarSorted.sort((a, b) => {
        const angleA = Math.atan2(a.y - 1.2, a.x - 6);
        const angleB = Math.atan2(b.y - 1.2, b.x - 6);
        return angleB - angleA; // Sorting counterclockwise from right
    });

    const sortedOrder = [allPoints.find(p => p.id === 'D')!, ...polarSorted];

    const makeState = (activeId: string | null, hullStack: typeof points, lines: { p1: { x: number; y: number }; p2: { x: number; y: number }; color?: string; dashed?: boolean; }[] = [], msg: string, line: number): AlgoState => {
        const plotPoints = points.map(pt => {
            let state: 'default' | 'active' | 'hull' | 'visited' = 'default';
            if (pt.id === activeId) state = 'active';
            else if (hullStack.some(h => h.id === pt.id)) state = 'hull';
            else if (pt.id === 'D') state = 'hull'; // Pivot always part of hull
            return { ...pt, state };
        });

        return {
            structures: {
                'geometry_plane': {
                    type: 'plot',
                    id: 'geometry_plane',
                    points: plotPoints,
                    lines,
                    hullPath: hullStack
                }
            },
            context: {
                variables: {
                    totalPoints: points.length,
                    hullSize: hullStack.length,
                    activeNode: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], [], `Graham Scan initialized with ${points.length} points. Finding pivot...`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // Pivot is D (6, 1.2)
    const pivot = sortedOrder[0];
    yield {
        snapshot: makeState('D', [pivot], [], `Pivot node found at D(6, 1.2) - lowest Y coordinate. Sorting other points.`, 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // Initialize stack with first three points (D, first sorted, second sorted)
    const stack = [pivot];
    if (sortedOrder[1]) stack.push(sortedOrder[1]);
    if (sortedOrder[2]) stack.push(sortedOrder[2]);

    yield {
        snapshot: makeState(sortedOrder[2]?.id || null, [...stack], [], `Sorted points by polar angle. Initializing stack with first 3 boundary candidates.`, 4),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    for (let i = 3; i < sortedOrder.length; i++) {
        const nextPt = sortedOrder[i];
        
        while (stack.length >= 2) {
            comparisons++;
            const pTop = stack[stack.length - 1];
            const pPrev = stack[stack.length - 2];

            // Calculate cross product of vector (pPrev -> pTop) and (pTop -> nextPt)
            // Cross product: (x2 - x1)*(y3 - y1) - (y2 - y1)*(x3 - x1)
            const ccw = (pTop.x - pPrev.x) * (nextPt.y - pPrev.y) - (pTop.y - pPrev.y) * (nextPt.x - pPrev.x);

            // Animate check line segment
            const checkLines = [
                { p1: pPrev, p2: pTop, color: '#6366f1' },
                { p1: pTop, p2: nextPt, color: '#f59e0b', dashed: true }
            ];

            yield {
                snapshot: makeState(nextPt.id, [...stack], checkLines, `Checking turn direction for angle: ${pPrev.id} -> ${pTop.id} -> ${nextPt.id}.`, 6),
                events: [{ type: 'compare', targetIds: ['geometry_plane'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };

            if (ccw > 0) {
                // Counter-clockwise turn, valid boundary
                yield {
                    snapshot: makeState(nextPt.id, [...stack], checkLines, `Counter-clockwise turn detected (ccw > 0). Curve is valid.`, 8),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
                break;
            } else {
                // Clockwise turn or collinear, pop stack
                const popped = stack.pop()!;
                yield {
                    snapshot: makeState(popped.id, [...stack], checkLines, `Clockwise turn detected (ccw <= 0). Node ${popped.id} is an internal point. Popping.`, 7),
                    events: [{ type: 'swap', targetIds: ['geometry_plane'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
            }
        }
        
        stack.push(nextPt);
    }

    // Connect final line back to pivot to close polygon
    const finalHull = [...stack, pivot];

    yield {
        snapshot: makeState(null, finalHull, [], `Convex Hull completed! Closed polygon containing ${stack.length} outer perimeter vertices.`, 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
