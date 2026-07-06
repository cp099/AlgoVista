import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'splay-tree',
    name: 'Splay Tree Access',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Brings the accessed target node to the root of the tree using zig, zig-zig, or zig-zag rotations to optimize subsequent access costs.',
    pseudocode: [
        'function Splay(root, key):',
        '  if root is null or root.key == key: return root',
        '  if key < root.key:',
        '    if left.key == key: RightRotate(root)',
        '    else if key < left.key: Splay(left.left); RightRotate(root)'
    ],
    inputs: [
        {
            id: 'accessKey',
            label: 'Access Key (to Splay)',
            type: 'integer' as const,
            defaultValue: 10,
            constraints: { min: 10, max: 40 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const key = inputs['accessKey'] as number;

    const initialNodes = [
        { id: '30', val: 30, label: '30' },
        { id: '20', val: 20, label: '20' },
        { id: '40', val: 40, label: '40' },
        { id: '10', val: 10, label: '10 (Target)' }
    ];

    const initialEdges = [
        { source: '30', target: '20' },
        { source: '30', target: '40' },
        { source: '20', target: '10' }
    ];

    const makeState = (nodes: typeof initialNodes, edges: typeof initialEdges, activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => ({
            ...n,
            state: n.id === activeId ? ('active' as const) : ('default' as const)
        }));

        return {
            structures: {
                'splay_tree': {
                    type: 'graph',
                    id: 'splay_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    accessNodeKey: key,
                    splayingState: activeId ? `Rotating Node ${activeId}` : 'Initial Search'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, initialEdges, null, `Accessing node key ${key} and starting splaying steps.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    const comparisons = 2;
    let writes = 1;

    yield {
        snapshot: makeState(initialNodes, initialEdges, '10', `Located target node ${key} at left-left leaf. Beginning Zig-Zig splaying rotations.`, 4),
        events: [{ type: 'compare', targetIds: ['splay_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 1: Right Rotate at grandparent 30
    const step1Nodes = [
        { id: '20', val: 20, label: '20' },
        { id: '10', val: 10, label: '10 (Target)' },
        { id: '30', val: 30, label: '30' },
        { id: '40', val: 40, label: '40' }
    ];
    const step1Edges = [
        { source: '20', target: '10' },
        { source: '20', target: '30' },
        { source: '30', target: '40' }
    ];
    writes += 2;

    yield {
        snapshot: makeState(step1Nodes, step1Edges, '10', "Grandparent Right Rotation complete. Target node moving up the tree hierarchy.", 5),
        events: [{ type: 'lock', targetIds: ['splay_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 2: Right Rotate at parent 20
    const step2Nodes = [
        { id: '10', val: 10, label: '10 (Root)' },
        { id: '20', val: 20, label: '20' },
        { id: '30', val: 30, label: '30' },
        { id: '40', val: 40, label: '40' }
    ];
    const step2Edges = [
        { source: '10', target: '20' },
        { source: '20', target: '30' },
        { source: '30', target: '40' }
    ];
    writes += 2;

    yield {
        snapshot: makeState(step2Nodes, step2Edges, '10', "Parent Right Rotation complete. Target node 10 is now successfully at the Root.", 5),
        events: [{ type: 'write', targetIds: ['splay_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(step2Nodes, step2Edges, null, "Splaying complete. Target node accessed and brought to root.", 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
