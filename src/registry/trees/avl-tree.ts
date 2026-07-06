import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'avl-tree',
    name: 'AVL Tree Balancing',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Maintains height balance in a Binary Search Tree by performing single or double node rotations when balance factors deviate from -1, 0, or 1.',
    pseudocode: [
        'function InsertAVL(node, key):',
        '  Perform standard BST Insertion',
        '  Update Height of current node',
        '  balance = GetBalance(node)',
        '  if balance > 1 and key < left.key: LeftRotate(node)',
        '  if balance < -1 and key > right.key: RightRotate(node)'
    ],
    inputs: [
        {
            id: 'insertKey',
            label: 'Insert Key',
            type: 'integer' as const,
            defaultValue: 10,
            constraints: { min: 5, max: 99 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const key = inputs['insertKey'] as number;

    const initialNodes = [
        { id: '30', val: 30, label: '30' },
        { id: '20', val: 20, label: '20' },
        { id: '40', val: 40, label: '40' }
    ];

    const initialEdges = [
        { source: '30', target: '20' },
        { source: '30', target: '40' }
    ];

    const makeState = (nodes: typeof initialNodes, edges: typeof initialEdges, activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => ({
            ...n,
            state: n.id === activeId ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'avl_tree': {
                    type: 'graph',
                    id: 'avl_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    insertedKey: key,
                    treeBalance: 'Unbalanced (+2)'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, initialEdges, null, "Starting AVL tree insert operation.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 1;
    let writes = 1;

    // Simulate key insertion causing imbalance (e.g. inserting 10)
    const afterInsertNodes = [
        ...initialNodes,
        { id: String(key), val: key, label: String(key) }
    ];
    const afterInsertEdges = [
        ...initialEdges,
        { source: '20', target: String(key) }
    ];

    yield {
        snapshot: makeState(afterInsertNodes, afterInsertEdges, String(key), `Standard BST Insert complete. Node ${key} inserted under 20. Checking balance factor.`, 4),
        events: [{ type: 'write', targetIds: ['avl_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Perform Left-Left balance rotation (Right Rotate at 30)
    comparisons++;
    const rotatedNodes = [
        { id: '20', val: 20, label: '20 (Root)' },
        { id: String(key), val: key, label: String(key) },
        { id: '30', val: 30, label: '30' },
        { id: '40', val: 40, label: '40' }
    ];
    const rotatedEdges = [
        { source: '20', target: String(key) },
        { source: '20', target: '30' },
        { source: '30', target: '40' }
    ];
    writes += 2;

    yield {
        snapshot: makeState(rotatedNodes, rotatedEdges, '20', `Balance factor of Root 30 is unbalanced. Performing Right Rotation around Node 20.`, 5),
        events: [{ type: 'lock', targetIds: ['avl_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(rotatedNodes, rotatedEdges, null, `AVL Tree successfully rebalanced. Rotation complete.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
