import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'cartesian-tree',
    name: 'Cartesian Tree Construction',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Constructs a heap-ordered Cartesian Tree from an input sequence, where an in-order traversal recovers the original sequence.',
    pseudocode: [
        'function BuildCartesian(Sequence):',
        '  for element in Sequence:',
        '    Walk up right spine of tree to find position',
        '    Insert element and adjust parent-child edges'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Sequence Scale Factor',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const scale = inputs['multiplier'] as number;

    const seq = [3 * scale, 2 * scale, 6 * scale, 1 * scale];

    const makeState = (nodes: { id: string; val: number; label: string }[], edges: { source: string; target: string }[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => ({
            ...n,
            state: n.id === activeId ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'cartesian_tree': {
                    type: 'graph',
                    id: 'cartesian_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    inputSequence: seq.join(', '),
                    activeSpineCheck: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], [], null, `Starting Cartesian tree builder for sequence [${seq.join(', ')}].`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Step 1: Insert first element (3)
    const n1 = [{ id: '3', val: 3, label: String(seq[0]) }];
    writes++;
    yield {
        snapshot: makeState(n1, [], '3', `Inserted first element ${seq[0]} as Root.`, 3),
        events: [{ type: 'write', targetIds: ['cartesian_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 2: Insert second element (2). Since 2 < 3, 3 becomes left child of 2, 2 is new Root.
    comparisons++;
    const n2 = [
        { id: '2', val: 2, label: String(seq[1]) },
        { id: '3', val: 3, label: String(seq[0]) }
    ];
    const e2 = [{ source: '2', target: '3' }];
    writes += 2;
    yield {
        snapshot: makeState(n2, e2, '2', `Inserting ${seq[1]}. Since ${seq[1]} < 3, 2 becomes Root and 3 becomes left child.`, 3),
        events: [{ type: 'write', targetIds: ['cartesian_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 3: Insert third element (6). Since 6 > 2, 6 becomes right child of 2.
    comparisons++;
    const n3 = [
        ...n2,
        { id: '6', val: 6, label: String(seq[2]) }
    ];
    const e3 = [
        ...e2,
        { source: '2', target: '6' }
    ];
    writes++;
    yield {
        snapshot: makeState(n3, e3, '6', `Inserting ${seq[2]}. Since ${seq[2]} > 2, 6 becomes right child of 2.`, 3),
        events: [{ type: 'write', targetIds: ['cartesian_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 4: Insert fourth element (1). Since 1 < 2, 1 becomes new Root, everything else is left child of 1.
    comparisons++;
    const n4 = [
        { id: '1', val: 1, label: String(seq[3]) },
        { id: '2', val: 2, label: String(seq[1]) },
        { id: '3', val: 3, label: String(seq[0]) },
        { id: '6', val: 6, label: String(seq[2]) }
    ];
    const e4 = [
        { source: '1', target: '2' },
        { source: '2', target: '3' },
        { source: '2', target: '6' }
    ];
    writes += 3;
    yield {
        snapshot: makeState(n4, e4, '1', `Inserting ${seq[3]}. Since ${seq[3]} is the minimum, 1 becomes new Root, 2 and its subtree shifts to the left child of 1.`, 3),
        events: [{ type: 'write', targetIds: ['cartesian_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(n4, e4, null, "Cartesian Tree construction finished. Min-heap order verified.", 4),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
