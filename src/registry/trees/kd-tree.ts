import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'kd-tree-search',
    name: 'K-D Tree Search',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Searches for a coordinate point in a space-partitioning 2-Dimensional K-D Tree by alternating axis divisions at successive depths.',
    pseudocode: [
        'function SearchKD(node, point, depth):',
        '  if node is null: return null',
        '  if node.point == point: return node',
        '  axis = depth % 2',
        '  if point[axis] < node.point[axis]:',
        '    return SearchKD(node.left, point, depth+1)',
        '  else:',
        '    return SearchKD(node.right, point, depth+1)'
    ],
    inputs: [
        {
            id: 'targetX',
            label: 'Search Point X',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 1, max: 9 }
        },
        {
            id: 'targetY',
            label: 'Search Point Y',
            type: 'integer' as const,
            defaultValue: 7,
            constraints: { min: 1, max: 9 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const tx = inputs['targetX'] as number;
    const ty = inputs['targetY'] as number;

    const initialNodes = [
        { id: '(5,4)', val: 5, label: '(5,4) Root [X]' },
        { id: '(2,7)', val: 2, label: '(2,7) Depth 1 [Y]' },
        { id: '(8,1)', val: 8, label: '(8,1) Depth 1 [Y]' },
        { id: '(1,5)', val: 1, label: '(1,5) Leaf [X]' },
        { id: '(4,7)', val: 4, label: '(4,7) Leaf [X]' },
        { id: '(7,2)', val: 7, label: '(7,2) Leaf [X]' },
        { id: '(9,8)', val: 9, label: '(9,8) Leaf [X]' }
    ];

    const initialEdges = [
        { source: '(5,4)', target: '(2,7)' },
        { source: '(5,4)', target: '(8,1)' },
        { source: '(2,7)', target: '(1,5)' },
        { source: '(2,7)', target: '(4,7)' },
        { source: '(8,1)', target: '(7,2)' },
        { source: '(8,1)', target: '(9,8)' }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, depth: number, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'kd_tree': {
                    type: 'graph',
                    id: 'kd_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    searchTarget: `(${tx}, ${ty})`,
                    currentDepth: depth,
                    splitAxis: depth % 2 === 0 ? 'X-Axis' : 'Y-Axis',
                    activeNodeSplit: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, 0, `Starting 2D K-D Tree search for target point (${tx}, ${ty}).`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    const writes = 0;
    const visited: string[] = [];

    // Root node (5, 4), Depth 0, split axis X
    comparisons++;
    visited.push('(5,4)');
    yield {
        snapshot: makeState([...visited], '(5,4)', 0, `Checking Root (5,4). Split Axis: X. Target ${tx} < Node 5?`, 3),
        events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    let currNode = '(5,4)';
    let depth = 0;

    if (tx < 5) {
        // Go Left to (2, 7), Depth 1, split axis Y
        comparisons++;
        depth = 1;
        currNode = '(2,7)';
        visited.push('(2,7)');

        yield {
            snapshot: makeState([...visited], '(2,7)', 1, `Target X ${tx} < 5. Descended left to (2,7). Split Axis: Y. Target ${ty} < Node 7?`, 5),
            events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (ty < 7) {
            // Go Left to (1, 5)
            comparisons++;
            depth = 2;
            currNode = '(1,5)';
            visited.push('(1,5)');
            yield {
                snapshot: makeState([...visited], '(1,5)', 2, `Target Y ${ty} < 7. Descended left to leaf (1,5). Compare (${tx}, ${ty}) with (1,5).`, 3),
                events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            // Go Right to (4, 7)
            comparisons++;
            depth = 2;
            currNode = '(4,7)';
            visited.push('(4,7)');
            yield {
                snapshot: makeState([...visited], '(4,7)', 2, `Target Y ${ty} >= 7. Descended right to leaf (4,7). Compare (${tx}, ${ty}) with (4,7).`, 3),
                events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    } else {
        // Go Right to (8, 1), Depth 1, split axis Y
        comparisons++;
        depth = 1;
        currNode = '(8,1)';
        visited.push('(8,1)');

        yield {
            snapshot: makeState([...visited], '(8,1)', 1, `Target X ${tx} >= 5. Descended right to (8,1). Split Axis: Y. Target ${ty} < Node 1?`, 7),
            events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (ty < 1) {
            // Go Left to (7, 2)
            comparisons++;
            depth = 2;
            currNode = '(7,2)';
            visited.push('(7,2)');
            yield {
                snapshot: makeState([...visited], '(7,2)', 2, `Target Y ${ty} < 1. Descended left to leaf (7,2). Compare (${tx}, ${ty}) with (7,2).`, 3),
                events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            // Go Right to (9, 8)
            comparisons++;
            depth = 2;
            currNode = '(9,8)';
            visited.push('(9,8)');
            yield {
                snapshot: makeState([...visited], '(9,8)', 2, `Target Y ${ty} >= 1. Descended right to leaf (9,8). Compare (${tx}, ${ty}) with (9,8).`, 3),
                events: [{ type: 'compare', targetIds: ['kd_tree'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    const isMatch = (tx === 4 && ty === 7 && currNode === '(4,7)') || (tx === 7 && ty === 2 && currNode === '(7,2)') || (tx === 9 && ty === 8 && currNode === '(9,8)') || (tx === 1 && ty === 5 && currNode === '(1,5)');

    yield {
        snapshot: makeState([...visited], null, depth, `K-D Tree search complete. Point ${isMatch ? 'FOUND' : 'NOT FOUND'} in coordinate space.`, 3),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
