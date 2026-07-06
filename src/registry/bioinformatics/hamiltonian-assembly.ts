import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'hamiltonian-assembly',
    name: 'Overlap-Layout-Consensus Assembler',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Assembles DNA reads by building an overlap graph where vertices represent reads, edges represent overlap weights, and traces a Hamiltonian path visiting every read vertex exactly once.',
    pseudocode: [
        'function OLCAssembly(Reads, MinOverlap):',
        '  Graph = ConstructOverlapGraph(Reads, MinOverlap)',
        '  Path = FindHamiltonianPath(Graph) // visit every node once',
        '  Consensus = MergeOverlappingPathSequence(Path)',
        '  return Consensus'
    ],
    inputs: [
        {
            id: 'overlapThreshold',
            label: 'Min Overlap (bases)',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const minOverlap = inputs['overlapThreshold'] as number;

    // Fictional reads:
    // Read 0: GCTAG
    // Read 1: CTAGC
    // Read 2: TAGCA
    // Path: Read 0 -> Read 1 -> Read 2 (Consensus: GCTAGCA)
    const initialNodes = [
        { id: 'Read0', val: 0, label: 'Read 0: GCTAG', x: 200, y: 150, state: 'default' as const },
        { id: 'Read1', val: 0, label: 'Read 1: CTAGC', x: 380, y: 150, state: 'default' as const },
        { id: 'Read2', val: 0, label: 'Read 2: TAGCA', x: 560, y: 150, state: 'default' as const }
    ];

    const edges = [
        { source: 'Read0', target: 'Read1', weight: 4, label: 'Overlap: 4' },
        { source: 'Read1', target: 'Read2', weight: 4, label: 'Overlap: 4' }
    ];

    const makeState = (visitedNodes: string[], activeNode: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeNode) state = 'active';
            else if (visitedNodes.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'overlap_graph': {
                    type: 'graph',
                    id: 'overlap_graph',
                    nodes: plotNodes,
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: { minOverlap, activeRead: activeNode || 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, `Constructing overlap graph with minimum overlap threshold: ${minOverlap}`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    // Traverse Hamiltonian path visiting every node once: Read0 -> Read1 -> Read2
    const pathOrder = ['Read0', 'Read1', 'Read2'];
    for (let i = 0; i < pathOrder.length; i++) {
        comparisons++;
        const curr = pathOrder[i];

        yield {
            snapshot: makeState([...visited], curr, `Evaluating overlaps from read "${curr}".`, 3),
            events: [{ type: 'compare', targetIds: ['overlap_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        visited.push(curr);
        writes++;

        yield {
            snapshot: makeState([...visited], curr, `Visiting read "${curr}" and adding to Hamiltonian layout path.`, 3),
            events: [{ type: 'lock', targetIds: ['overlap_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(visited, null, "Hamiltonian traversal complete. Consensus sequence generated: \"GCTAGCA\"", 4),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
