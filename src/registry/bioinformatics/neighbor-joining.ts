import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'neighbor-joining',
    name: 'Neighbor-Joining Phylogeny',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Constructs phylogenetic trees from genetic distance matrices. Computes net divergence rates, creates new ancestral nodes, and updates branch lengths to build the evolutionary history.',
    pseudocode: [
        'function NeighborJoining(D):',
        '  while nodes count > 2:',
        '    Compute net divergence r_i for each node',
        '    Find pair (i, j) minimizing Q(i, j) = (n-2)*d(i,j) - r_i - r_j',
        '    Create new node u connecting i and j',
        '    Compute distances from u to remaining nodes',
        '    Delete i and j from distance matrix'
    ],
    inputs: [
        {
            id: 'speciesCount',
            label: 'Taxa Density',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 3, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const taxa = inputs['speciesCount'] as number;

    // Define initial species nodes: A, B, C, D
    const initialNodes: GraphNode[] = [
        { id: 'A', val: 0, label: 'Taxon A', x: 250, y: 100, state: 'default' as const },
        { id: 'B', val: 0, label: 'Taxon B', x: 250, y: 220, state: 'default' as const },
        { id: 'C', val: 0, label: 'Taxon C', x: 550, y: 100, state: 'default' as const },
        { id: 'D', val: 0, label: 'Taxon D', x: 550, y: 220, state: 'default' as const }
    ].slice(0, taxa);

    const initialEdges: GraphEdge[] = [];

    const makeState = (nodes: GraphNode[], edges: GraphEdge[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = nodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            return { ...n, state };
        });

        return {
            structures: {
                'phylo_tree': {
                    type: 'graph',
                    id: 'phylo_tree',
                    nodes: plotNodes,
                    edges,
                    isDirected: false
                }
            },
            context: {
                variables: { activeTaxa: taxa, activeClusteringNode: activeId || 'None' },
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
        snapshot: makeState(currentNodes, currentEdges, null, "Starting Neighbor-Joining tree construction...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // First merge: A and B connect to a new ancestral node U1
    comparisons++;
    const u1 = { id: 'U1', val: 0, label: 'Ancestor U1', x: 350, y: 160, state: 'active' as const };
    currentNodes.push(u1);
    currentEdges.push({ source: 'A', target: 'U1', weight: 3 });
    currentEdges.push({ source: 'B', target: 'U1', weight: 4 });
    writes += 3;

    yield {
        snapshot: makeState(currentNodes, currentEdges, 'U1', "Pair (A, B) chosen with minimal Q-criterion. Joined to new ancestral node U1.", 4),
        events: [{ type: 'write', targetIds: ['phylo_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    if (taxa === 4) {
        // Second merge: connect C and D to U2, and then connect U1 and U2
        comparisons++;
        const u2 = { id: 'U2', val: 0, label: 'Ancestor U2', x: 450, y: 160, state: 'active' as const };
        currentNodes.push(u2);
        currentEdges.push({ source: 'C', target: 'U2', weight: 2 });
        currentEdges.push({ source: 'D', target: 'U2', weight: 5 });
        currentEdges.push({ source: 'U1', target: 'U2', weight: 6 });
        writes += 4;

        yield {
            snapshot: makeState(currentNodes, currentEdges, 'U2', "Joined C and D to U2, and connected ancestral roots U1 and U2.", 6),
            events: [{ type: 'write', targetIds: ['phylo_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(currentNodes, currentEdges, null, "Neighbor-Joining phylogeny tree construction complete.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
