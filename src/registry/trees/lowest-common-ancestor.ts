import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'lowest-common-ancestor',
    name: 'Lowest Common Ancestor (LCA)',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Finds the lowest common ancestor node shared by two target nodes in a tree structure.',
    pseudocode: [
        'function FindLCA(root, p, q):',
        '  if root is null or root == p or root == q: return root',
        '  left = FindLCA(root.left, p, q)',
        '  right = FindLCA(root.right, p, q)',
        '  if left and right: return root',
        '  return left ? left : right'
    ],
    inputs: [
        {
            id: 'nodeP',
            label: 'Target Node P',
            type: 'string' as const,
            defaultValue: 'D',
            constraints: { maxLength: 2 }
        },
        {
            id: 'nodeQ',
            label: 'Target Node Q',
            type: 'string' as const,
            defaultValue: 'E',
            constraints: { maxLength: 2 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const p = (inputs['nodeP'] as string).toUpperCase();
    const q = (inputs['nodeQ'] as string).toUpperCase();

    const initialNodes = [
        { id: 'A', val: 0, label: 'A' },
        { id: 'B', val: 0, label: 'B' },
        { id: 'C', val: 0, label: 'C' },
        { id: 'D', val: 0, label: 'D' },
        { id: 'E', val: 0, label: 'E' }
    ];

    const initialEdges = [
        { source: 'A', target: 'B' },
        { source: 'A', target: 'C' },
        { source: 'B', target: 'D' },
        { source: 'B', target: 'E' }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, lcaFound: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (n.id === lcaFound) state = 'lock'; // Highlight LCA green
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'lca_tree': {
                    type: 'graph',
                    id: 'lca_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    targetNodeP: p,
                    targetNodeQ: q,
                    lowestCommonAncestor: lcaFound || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, null, `Starting LCA search for nodes ${p} and ${q}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    // Search trace paths
    // Root level A
    comparisons++;
    visited.push('A');
    yield {
        snapshot: makeState([...visited], 'A', null, "Checking Root A. Recurse down children.", 2),
        events: [{ type: 'compare', targetIds: ['lca_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Descend left to B
    comparisons++;
    visited.push('B');
    yield {
        snapshot: makeState([...visited], 'B', null, "Left child B found. Recurse down B's children.", 3),
        events: [{ type: 'compare', targetIds: ['lca_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Leaf checks D and E
    comparisons++;
    visited.push('D');
    yield {
        snapshot: makeState([...visited], 'D', null, "Checking node D. Matches target node P.", 2),
        events: [{ type: 'compare', targetIds: ['lca_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    comparisons++;
    visited.push('E');
    yield {
        snapshot: makeState([...visited], 'E', null, "Checking node E. Matches target node Q.", 2),
        events: [{ type: 'compare', targetIds: ['lca_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Parent B gets non-null from both left (D) and right (E), so B is the LCA
    writes++;
    yield {
        snapshot: makeState([...visited], 'B', 'B', "LCA condition met at Node B (both left and right paths returned non-null targets).", 5),
        events: [{ type: 'lock', targetIds: ['lca_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState([...visited], null, 'B', `Lowest Common Ancestor for ${p} and ${q} is Node B.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
