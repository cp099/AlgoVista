import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'upgma',
    name: 'UPGMA Phylogenetic Clustering',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Constructs rooted dendrogram trees using the Unweighted Pair Group Method with Arithmetic Mean. Iteratively joins the closest species clusters in the distance matrix and computes node heights based on evolutionary rates.',
    pseudocode: [
        'function UPGMA(D):',
        '  Initialize each species as a single cluster',
        '  while clusters count > 1:',
        '    Find closest pair of clusters (C_i, C_j) in D',
        '    Create new root cluster C_u connecting C_i and C_j',
        '    height(C_u) = d(C_i, C_j) / 2',
        '    Compute distances from C_u to all other clusters',
        '    Remove C_i and C_j clusters from D'
    ],
    inputs: [
        {
            id: 'speciesCount',
            label: 'Taxa Density',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 3, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const taxa = inputs['speciesCount'] as number;

    // Define taxa nodes on root dendrogram scale:
    // Roots at bottom (x coordinates), merging to height top y coordinates
    const initialNodes: GraphNode[] = [
        { id: 'A', val: 0, label: 'Taxon A', x: 200, y: 220, state: 'default' as const },
        { id: 'B', val: 0, label: 'Taxon B', x: 300, y: 220, state: 'default' as const },
        { id: 'C', val: 0, label: 'Taxon C', x: 500, y: 220, state: 'default' as const },
        { id: 'D', val: 0, label: 'Taxon D', x: 600, y: 220, state: 'default' as const }
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
                'dendrogram': {
                    type: 'graph',
                    id: 'dendrogram',
                    nodes: plotNodes,
                    edges,
                    isDirected: false
                }
            },
            context: {
                variables: { activeTaxa: taxa, activeCluster: activeId || 'None' },
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
        snapshot: makeState(currentNodes, currentEdges, null, "Starting UPGMA hierarchical clustering...", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    // First merge: join A and B at height d(A,B)/2 = 1.5
    comparisons++;
    const nodeAB = { id: 'AB', val: 1.5, label: 'Node (A,B) [h=1.5]', x: 250, y: 150, state: 'active' as const };
    currentNodes.push(nodeAB);
    currentEdges.push({ source: 'A', target: 'AB', weight: 1.5 });
    currentEdges.push({ source: 'B', target: 'AB', weight: 1.5 });
    writes += 3;

    yield {
        snapshot: makeState(currentNodes, currentEdges, 'AB', "Found closest pair (A, B) at distance 3. Joined at parent node height 1.5.", 4),
        events: [{ type: 'write', targetIds: ['dendrogram'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    if (taxa === 3) {
        // Merge AB cluster with C
        comparisons++;
        const nodeABC = { id: 'ABC', val: 3.0, label: 'Node (AB,C) [h=3.0]', x: 375, y: 80, state: 'active' as const };
        currentNodes.push(nodeABC);
        currentEdges.push({ source: 'AB', target: 'ABC', weight: 1.5 });
        currentEdges.push({ source: 'C', target: 'ABC', weight: 3.0 });
        writes += 3;

        yield {
            snapshot: makeState(currentNodes, currentEdges, 'ABC', "Joined cluster (AB) with species C at root height 3.0.", 5),
            events: [{ type: 'write', targetIds: ['dendrogram'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    } else {
        // For 4 taxa: join C and D first, then join AB and CD
        comparisons++;
        const nodeCD = { id: 'CD', val: 2.0, label: 'Node (C,D) [h=2.0]', x: 550, y: 130, state: 'active' as const };
        currentNodes.push(nodeCD);
        currentEdges.push({ source: 'C', target: 'CD', weight: 2.0 });
        currentEdges.push({ source: 'D', target: 'CD', weight: 2.0 });
        writes += 3;

        yield {
            snapshot: makeState(currentNodes, currentEdges, 'CD', "Found next closest pair (C, D) at distance 4. Joined at height 2.0.", 4),
            events: [{ type: 'write', targetIds: ['dendrogram'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        comparisons++;
        const nodeABCD = { id: 'ABCD', val: 4.5, label: 'Root (AB,CD) [h=4.5]', x: 400, y: 60, state: 'active' as const };
        currentNodes.push(nodeABCD);
        currentEdges.push({ source: 'AB', target: 'ABCD', weight: 3.0 });
        currentEdges.push({ source: 'CD', target: 'ABCD', weight: 2.5 });
        writes += 3;

        yield {
            snapshot: makeState(currentNodes, currentEdges, 'ABCD', "Joined clusters (AB) and (CD) at root height 4.5.", 5),
            events: [{ type: 'write', targetIds: ['dendrogram'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(currentNodes, currentEdges, null, "UPGMA Rooted Dendrogram complete.", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
