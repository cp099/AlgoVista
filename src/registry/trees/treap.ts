import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'treap-insert',
    name: 'Treap Insert & Rotate',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Maintains dual properties of a Binary Search Tree (BST keys) and a Heap (random priorities) by performing rotations during node insertion.',
    pseudocode: [
        'function InsertTreap(node, key, priority):',
        '  Standard BST insert node',
        '  if priority > parent.priority:',
        '    if node is left child: RightRotate(parent)',
        '    else: LeftRotate(parent)'
    ],
    inputs: [
        {
            id: 'insertKey',
            label: 'Insert Key',
            type: 'integer' as const,
            defaultValue: 15,
            constraints: { min: 5, max: 99 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const key = inputs['insertKey'] as number;

    const initialNodes = [
        { id: '20', val: 20, label: 'K:20, P:80' },
        { id: '10', val: 10, label: 'K:10, P:50' },
        { id: '30', val: 30, label: 'K:30, P:40' }
    ];

    const initialEdges = [
        { source: '20', target: '10' },
        { source: '20', target: '30' }
    ];

    const makeState = (nodes: typeof initialNodes, edges: typeof initialEdges, activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => ({
            ...n,
            state: n.id === activeId ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'treap_tree': {
                    type: 'graph',
                    id: 'treap_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    insertedKey: key,
                    priorityAssigned: 90,
                    heapViolationDetected: 'Yes (90 > 50)'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, initialEdges, null, "Starting Treap insertion.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 1;
    let writes = 1;

    // Insert new node under 10 (key=15, priority=90)
    const afterInsertNodes = [
        ...initialNodes,
        { id: String(key), val: key, label: `K:${key}, P:90` }
    ];
    const afterInsertEdges = [
        ...initialEdges,
        { source: '10', target: String(key) }
    ];

    yield {
        snapshot: makeState(afterInsertNodes, afterInsertEdges, String(key), `Node ${key} inserted. Heap violation: priority 90 is greater than parent 10's priority 50.`, 3),
        events: [{ type: 'write', targetIds: ['treap_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Perform Left Rotation at parent 10 to bubble up 15
    comparisons++;
    const rotatedNodes = [
        { id: '20', val: 20, label: 'K:20, P:80' },
        { id: String(key), val: key, label: `K:${key}, P:90` },
        { id: '10', val: 10, label: 'K:10, P:50' },
        { id: '30', val: 30, label: 'K:30, P:40' }
    ];
    const rotatedEdges = [
        { source: '20', target: String(key) },
        { source: '20', target: '30' },
        { source: String(key), target: '10' }
    ];
    writes += 2;

    yield {
        snapshot: makeState(rotatedNodes, rotatedEdges, String(key), `Performed Left Rotation at Parent Node 10. Priority 90 is now higher.`, 5),
        events: [{ type: 'lock', targetIds: ['treap_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Rotate at root 20 to restore heap property globally (since 90 > 80)
    comparisons++;
    const finalNodes = [
        { id: String(key), val: key, label: `K:${key}, P:90 (Root)` },
        { id: '20', val: 20, label: 'K:20, P:80' },
        { id: '10', val: 10, label: 'K:10, P:50' },
        { id: '30', val: 30, label: 'K:30, P:40' }
    ];
    const finalEdges = [
        { source: String(key), target: '20' },
        { source: String(key), target: '10' },
        { source: '20', target: '30' }
    ];
    writes += 2;

    yield {
        snapshot: makeState(finalNodes, finalEdges, String(key), `Heap violation at Root 20 (90 > 80). Performed Right Rotation at Root. Heap property restored.`, 5),
        events: [{ type: 'lock', targetIds: ['treap_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(finalNodes, finalEdges, null, "Treap insertion and heap restorations complete.", 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
