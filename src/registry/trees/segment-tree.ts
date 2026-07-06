import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'segment-tree-query',
    name: 'Segment Tree Range Query',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Queries segment intervals to find the range sum of values between indices L and R in O(log n) time.',
    pseudocode: [
        'function RangeQuery(node, L, R):',
        '  if node.interval is inside [L, R]:',
        '    return node.sum',
        '  if node.interval is completely outside: return 0',
        '  return RangeQuery(left, L, R) + RangeQuery(right, L, R)'
    ],
    inputs: [
        {
            id: 'rangeL',
            label: 'Query Left Index (L)',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 0, max: 3 }
        },
        {
            id: 'rangeR',
            label: 'Query Right Index (R)',
            type: 'integer' as const,
            defaultValue: 2,
            constraints: { min: 0, max: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const l = inputs['rangeL'] as number;
    const r = inputs['rangeR'] as number;

    const initialNodes = [
        { id: '0-3', val: 10, label: '[0-3] Sum:10' },
        { id: '0-1', val: 3, label: '[0-1] Sum:3' },
        { id: '2-3', val: 7, label: '[2-3] Sum:7' },
        { id: '0-0', val: 1, label: '[0] Val:1' },
        { id: '1-1', val: 2, label: '[1] Val:2' },
        { id: '2-2', val: 3, label: '[2] Val:3' },
        { id: '3-3', val: 4, label: '[3] Val:4' }
    ];

    const initialEdges = [
        { source: '0-3', target: '0-1' },
        { source: '0-3', target: '2-3' },
        { source: '0-1', target: '0-0' },
        { source: '0-1', target: '1-1' },
        { source: '2-3', target: '2-2' },
        { source: '2-3', target: '3-3' }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, totalSum: number, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'segment_tree': {
                    type: 'graph',
                    id: 'segment_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    queryRange: `[${l}, ${r}]`,
                    activeSumAccumulated: totalSum,
                    activeNodeBlock: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, 0, `Starting Segment Tree range sum query for [${l}, ${r}].`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let accumulatedSum = 0;
    const visited: string[] = [];

    // Traverse nodes (simulation based on values l, r)
    // Root level [0-3]
    comparisons++;
    visited.push('0-3');
    yield {
        snapshot: makeState([...visited], '0-3', 0, "Checking Root [0-3]. Partially overlaps query range.", 2),
        events: [{ type: 'compare', targetIds: ['segment_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Traverse left branch if needed
    if (l <= 1) {
        comparisons++;
        visited.push('0-1');
        
        let msg = "Checking Left child [0-1]. ";
        if (l === 0 && r >= 1) {
            // [0-1] is completely inside [0, r]
            accumulatedSum += 3;
            writes++;
            msg += "Completely inside. Add value 3 to sum.";
            yield {
                snapshot: makeState([...visited], '0-1', accumulatedSum, msg, 3),
                events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            msg += "Partially inside. Descending to leaves.";
            yield {
                snapshot: makeState([...visited], '0-1', accumulatedSum, msg, 5),
                events: [{ type: 'compare', targetIds: ['segment_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            // Visit children
            if (l === 0) {
                comparisons++;
                visited.push('0-0');
                accumulatedSum += 1;
                writes++;
                yield {
                    snapshot: makeState([...visited], '0-0', accumulatedSum, "Leaf [0] is inside range. Add value 1.", 3),
                    events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
            if (r >= 1) {
                comparisons++;
                visited.push('1-1');
                accumulatedSum += 2;
                writes++;
                yield {
                    snapshot: makeState([...visited], '1-1', accumulatedSum, "Leaf [1] is inside range. Add value 2.", 3),
                    events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    // Traverse right branch if needed
    if (r >= 2) {
        comparisons++;
        visited.push('2-3');

        let msg = "Checking Right child [2-3]. ";
        if (l <= 2 && r === 3) {
            accumulatedSum += 7;
            writes++;
            msg += "Completely inside. Add value 7 to sum.";
            yield {
                snapshot: makeState([...visited], '2-3', accumulatedSum, msg, 3),
                events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            msg += "Partially inside. Descending to leaves.";
            yield {
                snapshot: makeState([...visited], '2-3', accumulatedSum, msg, 5),
                events: [{ type: 'compare', targetIds: ['segment_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (l <= 2) {
                comparisons++;
                visited.push('2-2');
                accumulatedSum += 3;
                writes++;
                yield {
                    snapshot: makeState([...visited], '2-2', accumulatedSum, "Leaf [2] is inside range. Add value 3.", 3),
                    events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
            if (r === 3) {
                comparisons++;
                visited.push('3-3');
                accumulatedSum += 4;
                writes++;
                yield {
                    snapshot: makeState([...visited], '3-3', accumulatedSum, "Leaf [3] is inside range. Add value 4.", 3),
                    events: [{ type: 'write', targetIds: ['segment_tree'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState([...visited], null, accumulatedSum, `Segment Tree query complete. Range sum: ${accumulatedSum}.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
