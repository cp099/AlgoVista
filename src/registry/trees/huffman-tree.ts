import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'huffman-tree-builder',
    name: 'Huffman Tree Construction',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Builds a binary Huffman prefix code tree bottom-up by repeatedly merging the two nodes with the lowest frequencies.',
    pseudocode: [
        'function BuildHuffman(frequencies):',
        '  Queue = sorted Priority Queue of leaf nodes',
        '  while Queue.size > 1:',
        '    left = Queue.pop()',
        '    right = Queue.pop()',
        '    parent = Node(left.freq + right.freq)',
        '    parent.left = left, parent.right = right',
        '    Queue.push(parent)',
        '  return Queue.pop()'
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
        { id: 'A', val: 5 * scale, label: 'A: 5' },
        { id: 'B', val: 9 * scale, label: 'B: 9' },
        { id: 'C', val: 12 * scale, label: 'C: 12' },
        { id: 'D', val: 13 * scale, label: 'D: 13' }
    ];

    const makeState = (nodes: typeof initialNodes, edges: { source: string; target: string }[], msg: string, line: number): AlgoState => {
        return {
            structures: {
                'huffman_tree': {
                    type: 'graph',
                    id: 'huffman_tree',
                    layout: 'tree' as const,
                    nodes: nodes.map(n => ({ ...n, state: 'default' as const })),
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    nodesRemaining: nodes.length,
                    activeMergedPair: edges.length > 0 ? `${edges[edges.length - 1].source} -> ${edges[edges.length - 1].target}` : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, [], "Initialized Huffman priority queue with character leaf frequencies.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    // Step 1: Merge lowest A(5) and B(9) to AB(14)
    comparisons++;
    const nodes1 = [
        ...initialNodes,
        { id: 'AB', val: 14 * scale, label: 'AB: 14' }
    ];
    const edges1 = [
        { source: 'AB', target: 'A' },
        { source: 'AB', target: 'B' }
    ];
    writes++;

    yield {
        snapshot: makeState(nodes1, edges1, `Merged A(${5*scale}) and B(${9*scale}) into parent AB(${14*scale}).`, 5),
        events: [{ type: 'write', targetIds: ['huffman_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 2: Merge lowest C(12) and D(13) to CD(25)
    comparisons++;
    const nodes2 = [
        ...nodes1,
        { id: 'CD', val: 25 * scale, label: 'CD: 25' }
    ];
    const edges2 = [
        ...edges1,
        { source: 'CD', target: 'C' },
        { source: 'CD', target: 'D' }
    ];
    writes++;

    yield {
        snapshot: makeState(nodes2, edges2, `Merged C(${12*scale}) and D(${13*scale}) into parent CD(${25*scale}).`, 5),
        events: [{ type: 'write', targetIds: ['huffman_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Step 3: Merge AB(14) and CD(25) to ABCD(39)
    comparisons++;
    const nodes3 = [
        ...nodes2,
        { id: 'ABCD', val: 39 * scale, label: 'ABCD: 39 (Root)' }
    ];
    const edges3 = [
        ...edges2,
        { source: 'ABCD', target: 'AB' },
        { source: 'ABCD', target: 'CD' }
    ];
    writes++;

    yield {
        snapshot: makeState(nodes3, edges3, `Merged AB(${14*scale}) and CD(${25*scale}) into final root ABCD(${39*scale}).`, 5),
        events: [{ type: 'write', targetIds: ['huffman_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState(nodes3, edges3, "Huffman Tree construction completed.", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
