import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'binary-tree-traversals',
    name: 'Binary Tree Traversals',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Easy' as const,
    description: 'Demonstrates DFS Depth-First-Search traversals (In-order, Pre-order, and Post-order) recursively on a binary tree structure.',
    pseudocode: [
        'function PreOrder(node):',
        '  if node is null: return',
        '  Visit(node)',
        '  PreOrder(node.left)',
        '  PreOrder(node.right)'
    ],
    inputs: [
        {
            id: 'mode',
            label: 'Traversal Mode',
            type: 'string' as const,
            defaultValue: 'PRE',
            constraints: { maxLength: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const mode = (inputs['mode'] as string).toUpperCase();

    const initialNodes = [
        { id: 'A', val: 1, label: 'A' },
        { id: 'B', val: 2, label: 'B' },
        { id: 'C', val: 3, label: 'C' },
        { id: 'D', val: 4, label: 'D' },
        { id: 'E', val: 5, label: 'E' }
    ];

    const initialEdges = [
        { source: 'A', target: 'B' },
        { source: 'A', target: 'C' },
        { source: 'B', target: 'D' },
        { source: 'B', target: 'E' }
    ];

    // Determine visitation sequence based on mode
    let visitOrder = ['A', 'B', 'D', 'E', 'C']; // default PRE
    if (mode === 'IN') {
        visitOrder = ['D', 'B', 'E', 'A', 'C'];
    } else if (mode === 'POST') {
        visitOrder = ['D', 'E', 'B', 'C', 'A'];
    }

    const makeState = (visitedIds: string[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'visit_list': { type: 'array', id: 'Visited Order Sequence', data: [...visitedIds] },
                'binary_tree': {
                    type: 'graph',
                    id: 'binary_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    traversalType: mode,
                    visitCount: visitedIds.length,
                    activeNode: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, `Starting ${mode}-order binary tree traversal.`, 1),
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
            snapshot: makeState([...visited], node, `Visited Node ${node}. Appending to order list.`, 3),
            events: [{ type: 'write', targetIds: ['visit_list'], indices: [visited.length - 1] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState([...visited], null, `${mode}-order traversal complete. Visited path: ${visited.join(' -> ')}.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
