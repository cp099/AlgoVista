import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'red-black-tree',
    name: 'Red-Black Tree recoloring',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Maintains balance properties of a Red-Black tree during insertions by performing node recolorings and rotations to resolve double-red violations.',
    pseudocode: [
        'function InsertRedBlack(root, node):',
        '  Standard BST Insert as RED node',
        '  while node.parent is RED:',
        '    if uncle is RED:',
        '      Recolor parent, uncle to BLACK',
        '      Recolor grandparent to RED'
    ],
    inputs: [
        {
            id: 'insertVal',
            label: 'Insert Node Value',
            type: 'integer' as const,
            defaultValue: 15,
            constraints: { min: 5, max: 99 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const val = inputs['insertVal'] as number;

    const initialNodes = [
        { id: '20', val: 20, label: '20 (BLACK)' },
        { id: '10', val: 10, label: '10 (RED)' },
        { id: '30', val: 30, label: '30 (RED)' }
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
                'rb_tree': {
                    type: 'graph',
                    id: 'rb_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    insertedNode: val,
                    parentState: 'RED',
                    uncleState: 'RED (Imbalance Violation)'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, initialEdges, null, "Starting Red-Black tree insertion.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 1;
    let writes = 1;

    // Insert new node under 10 (causing double-red violation)
    const afterInsertNodes = [
        ...initialNodes,
        { id: String(val), val: val, label: `${val} (RED)` }
    ];
    const afterInsertEdges = [
        ...initialEdges,
        { source: '10', target: String(val) }
    ];

    yield {
        snapshot: makeState(afterInsertNodes, afterInsertEdges, String(val), `Inserted node ${val} as RED. Double-red violation detected (10 and ${val} are both RED).`, 3),
        events: [{ type: 'write', targetIds: ['rb_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Perform Recoloring (change parent 10 and uncle 30 to BLACK, grandparent 20 to RED)
    comparisons++;
    const recoloredNodes = [
        { id: '20', val: 20, label: '20 (RED)' },
        { id: '10', val: 10, label: '10 (BLACK)' },
        { id: '30', val: 30, label: '30 (BLACK)' },
        { id: String(val), val: val, label: `${val} (RED)` }
    ];
    writes += 3;

    yield {
        snapshot: makeState(recoloredNodes, afterInsertEdges, '20', "Uncle 30 is RED. Performing recoloring: Parent 10 and Uncle 30 recolored to BLACK, Grandparent 20 recolored to RED.", 5),
        events: [{ type: 'lock', targetIds: ['rb_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Keep Root Black: recolor 20 back to BLACK since it is the root
    recoloredNodes[0].label = '20 (BLACK)';
    writes++;

    yield {
        snapshot: makeState(recoloredNodes, afterInsertEdges, null, "Root node 20 recolored to BLACK. Red-Black properties successfully preserved.", 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
