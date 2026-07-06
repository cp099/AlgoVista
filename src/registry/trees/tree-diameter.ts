import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'tree-diameter',
    name: 'Tree Diameter',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Finds the diameter of a tree (the longest path between any two leaf nodes) by computing heights recursively.',
    pseudocode: [
        'function GetDiameter(root):',
        '  if root is null: return 0',
        '  leftHeight = Height(root.left)',
        '  rightHeight = Height(root.right)',
        '  option1 = leftHeight + rightHeight',
        '  return max(option1, GetDiameter(left), GetDiameter(right))'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Height Multiplier scale',
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

    const makeState = (visitedIds: string[], activeId: string | null, diameterVal: number, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'diameter_tree': {
                    type: 'graph',
                    id: 'diameter_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    activeNode: activeId || 'None',
                    currentMaxDiameter: diameterVal
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, 0, "Starting Tree Diameter calculation.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    // Calculate left height (B branch) => heights 2
    comparisons++;
    visited.push('B');
    yield {
        snapshot: makeState([...visited], 'B', 0, "Checking height of left child branch B.", 3),
        events: [{ type: 'compare', targetIds: ['diameter_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Calculate right height (C branch) => height 1
    comparisons++;
    visited.push('C');
    yield {
        snapshot: makeState([...visited], 'C', 0, "Checking height of right child branch C.", 4),
        events: [{ type: 'compare', targetIds: ['diameter_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Longest path crosses root node A: height(B) + height(C) = 2 + 1 = 3 edges (or 3 nodes path)
    const diameter = (2 + 1) * scale;
    writes++;
    yield {
        snapshot: makeState([...visited], 'A', diameter, `Diameter across root node A: height(left) + height(right) = ${2*scale} + ${1*scale} = ${diameter}.`, 5),
        events: [{ type: 'lock', targetIds: ['diameter_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState([...visited], null, diameter, `Tree Diameter evaluation finished. Longest path size: ${diameter} edges.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
