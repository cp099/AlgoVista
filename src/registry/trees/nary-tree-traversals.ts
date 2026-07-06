import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'nary-tree-traversals',
    name: 'N-ary Tree Traversals',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Easy' as const,
    description: 'Traverses a multi-way (N-ary) tree structure where nodes can contain more than two children.',
    pseudocode: [
        'function PreOrderNary(node):',
        '  if node is null: return',
        '  Visit(node)',
        '  for child in node.children:',
        '    PreOrderNary(child)'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Visits Loop Count multiplier',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 2 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const scale = inputs['multiplier'] as number;

    const initialNodes = [
        { id: 'R', val: 0, label: 'Root' },
        { id: 'A', val: 1, label: 'Child A' },
        { id: 'B', val: 2, label: 'Child B' },
        { id: 'C', val: 3, label: 'Child C' },
        { id: 'A1', val: 4, label: 'Leaf A1' },
        { id: 'A2', val: 5, label: 'Leaf A2' }
    ];

    const initialEdges = [
        { source: 'R', target: 'A' },
        { source: 'R', target: 'B' },
        { source: 'R', target: 'C' },
        { source: 'A', target: 'A1' },
        { source: 'A', target: 'A2' }
    ];

    const visitOrder = ['R', 'A', 'A1', 'A2', 'B', 'C'].slice(0, 3 + 3 * scale);

    const makeState = (visitedIds: string[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'visit_list': { type: 'array', id: 'N-ary Traverse List', data: [...visitedIds] },
                'nary_tree': {
                    type: 'graph',
                    id: 'nary_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    activeVisitsCount: visitedIds.length,
                    activeNode: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, "Starting N-ary tree pre-order traversal.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    for (const node of visitOrder) {
        comparisons++;
        visited.push(node);
        writes++;

        yield {
            snapshot: makeState([...visited], node, `Visited Node ${node}. Appending to traversal sequence.`, 3),
            events: [{ type: 'write', targetIds: ['visit_list'], indices: [visited.length - 1] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState([...visited], null, "N-ary tree traversal complete.", 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
