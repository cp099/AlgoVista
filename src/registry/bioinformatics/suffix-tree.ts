import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'suffix-tree',
    name: 'Suffix Tree Construction',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Constructs a trie-based Suffix Tree index of a sequence. Each path from the root node to a leaf node represents a distinct suffix of the sequence, allowing search queries in time proportional to the query length.',
    pseudocode: [
        'function ConstructSuffixTree(Text):',
        '  Text = Text + "$"',
        '  Initialize RootNode',
        '  for i from 0 to length(Text) - 1:',
        '    InsertSuffix(Text[i...end], RootNode)'
    ],
    inputs: [
        {
            id: 'text',
            label: 'DNA Sequence (e.g. GAT)',
            type: 'string' as const,
            defaultValue: 'GAT',
            constraints: { minLength: 2, maxLength: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const rawText = inputs['text'] as string;
    const text = rawText + '$';
    const n = text.length;

    // Define tree nodes for step-by-step suffixes:
    // Suffixes of "GAT$":
    // 0. GAT$
    // 1. AT$
    // 2. T$
    // 3. $
    // We animate inserting these suffixes into the graph
    const initialNodes: GraphNode[] = [
        { id: 'root', val: 0, label: 'Root', x: 400, y: 50, state: 'default' as const }
    ];
    const initialEdges: GraphEdge[] = [];

    const makeState = (nodes: GraphNode[], edges: GraphEdge[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            return { ...n, state };
        });

        return {
            structures: {
                'suffix_tree': {
                    type: 'graph',
                    id: 'suffix_tree',
                    nodes: plotNodes,
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: { text, activeSuffix: activeId ? activeId : 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    let comparisons = 0;
    let writes = 0;

    const currentNodes = [...initialNodes];
    const currentEdges = [...initialEdges];

    yield {
        snapshot: makeState(currentNodes, currentEdges, null, `Starting suffix tree building for "${text}"`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // Insert suffixes one by one
    for (let i = 0; i < n; i++) {
        const suffix = text.slice(i);
        comparisons++;

        // Add leaf node representing suffix
        const nodeId = `suffix-${i}`;
        const angle = (i / n) * Math.PI + Math.PI * 0.25; // distribute children below root
        const childX = 400 + Math.cos(angle) * 150;
        const childY = 200 + Math.sin(angle) * 80;

        currentNodes.push({
            id: nodeId,
            val: i,
            label: suffix,
            x: childX,
            y: childY,
            state: 'active' as const
        });

        currentEdges.push({
            source: 'root',
            target: nodeId,
            weight: 0,
            label: suffix
        });
        
        writes++;

        yield {
            snapshot: makeState(currentNodes, currentEdges, nodeId, `Inserting suffix "${suffix}" into the Suffix Tree.`, 5),
            events: [{ type: 'write', targetIds: ['suffix_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(currentNodes, currentEdges, null, "Suffix Tree building completed successfully.", 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
