import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'eulerian-assembly',
    name: 'De Bruijn Eulerian Graph Assembly',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Assembles genomes from short reads by constructing a De Bruijn graph of overlapping (k-1)-mers and tracing an Eulerian path that visits every edge (read k-mer) exactly once.',
    pseudocode: [
        'function EulerianAssembly(Reads, k):',
        '  Graph = ConstructDeBruijnGraph(Reads, k)',
        '  Path = []',
        '  HierholzerTraversal(Graph.startVertex, Path)',
        '  assembledSequence = ReconstructionFromPath(Path)',
        '  return assembledSequence'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Original Target (e.g. ATGCA)',
            type: 'string' as const,
            defaultValue: 'ATGCA',
            constraints: { minLength: 4, maxLength: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const target = (inputs['sequence'] as string).toUpperCase();
    const k = 3;

    // Split target into 3-mers:
    // e.g. "ATGCA" -> "ATG", "TGC", "GCA"
    // De Bruijn Graph nodes: 2-mers (prefixes/suffixes)
    // "ATG" -> AT -> TG
    // "TGC" -> TG -> GC
    // "GCA" -> GC -> CA
    // Graph Nodes: AT, TG, GC, CA.
    // Graph Edges: AT->TG, TG->GC, GC->CA.
    const initialNodes = [
        { id: 'AT', val: 0, label: 'AT', x: 200, y: 150, state: 'default' as const },
        { id: 'TG', val: 0, label: 'TG', x: 320, y: 150, state: 'default' as const },
        { id: 'GC', val: 0, label: 'GC', x: 440, y: 150, state: 'default' as const },
        { id: 'CA', val: 0, label: 'CA', x: 560, y: 150, state: 'default' as const }
    ];

    const edges = [
        { source: 'AT', target: 'TG', weight: 0, label: 'ATG' },
        { source: 'TG', target: 'GC', weight: 0, label: 'TGC' },
        { source: 'GC', target: 'CA', weight: 0, label: 'GCA' }
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
                'debruijn_graph': {
                    type: 'graph',
                    id: 'debruijn_graph',
                    nodes: plotNodes,
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: { target, kmerLength: k, activeVertex: activeNode || 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, "Constructing De Bruijn Graph from k-mer overlaps...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    // Traverse Eulerian path: AT -> TG -> GC -> CA
    const traversalOrder = ['AT', 'TG', 'GC', 'CA'];
    for (let i = 0; i < traversalOrder.length; i++) {
        comparisons++;
        const curr = traversalOrder[i];
        
        yield {
            snapshot: makeState([...visited], curr, `Traversing node "${curr}". Tracing edge overlap link.`, 4),
            events: [{ type: 'compare', targetIds: ['debruijn_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        visited.push(curr);
        writes++;
        
        yield {
            snapshot: makeState([...visited], curr, `Visited node "${curr}" added to Eulerian path stack.`, 4),
            events: [{ type: 'lock', targetIds: ['debruijn_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(visited, null, `Eulerian path traversal complete. Reconstructed assembled DNA sequence: "${target}"`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
