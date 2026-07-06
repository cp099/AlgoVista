import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'disjoint-set',
    name: 'Disjoint Set (Union-Find)',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Manages partition sets using parent pointer trees, optimizing root checks via Path Compression and unions via rank rules.',
    pseudocode: [
        'function Find(node):',
        '  if node.parent == node: return node',
        '  node.parent = Find(node.parent) // Path Compression',
        '  return node.parent',
        'function Union(x, y):',
        '  rootX = Find(x), rootY = Find(y)',
        '  if rootX != rootY: rootX.parent = rootY // Join'
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
        { id: '1', val: 1, label: '1 (Rank 0)' },
        { id: '2', val: 2, label: '2 (Rank 1)' },
        { id: '3', val: 3, label: '3 (Rank 0)' },
        { id: '4', val: 4, label: '4 (Rank 0)' }
    ];

    const initialEdges = [
        { source: '2', target: '1' },
        { source: '3', target: '4' }
    ];

    const makeState = (nodes: typeof initialNodes, edges: typeof initialEdges, activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => ({
            ...n,
            state: n.id === activeId ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'disjoint_tree': {
                    type: 'graph',
                    id: 'disjoint_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    unionTask: `Union(1, 3) * scale: ${scale}`,
                    activeRootChecked: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, initialEdges, null, "Starting Union-Find disjoint sets operation. Call Union(1, 3).", 5),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Find(1) => traverses to root 2
    comparisons++;
    yield {
        snapshot: makeState(initialNodes, initialEdges, '1', "Finding representative of set containing Node 1. Moving to parent 2.", 2),
        events: [{ type: 'compare', targetIds: ['disjoint_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    comparisons++;
    yield {
        snapshot: makeState(initialNodes, initialEdges, '2', "Representative of Node 1 is Node 2 (root).", 3),
        events: [{ type: 'compare', targetIds: ['disjoint_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Find(3) => traverses to root 3 (it is root itself)
    comparisons++;
    yield {
        snapshot: makeState(initialNodes, initialEdges, '3', "Finding representative of set containing Node 3. It is its own root.", 2),
        events: [{ type: 'compare', targetIds: ['disjoint_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Union roots: set 3's parent to 2
    const finalEdges = [
        ...initialEdges,
        { source: '2', target: '3' }
    ];
    writes++;

    yield {
        snapshot: makeState(initialNodes, finalEdges, '2', "Union roots: set parent pointer of root 3 to root 2.", 7),
        events: [{ type: 'write', targetIds: ['disjoint_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(initialNodes, finalEdges, null, "Union complete. Node 1 and Node 3 are now in the same tree set partition.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
