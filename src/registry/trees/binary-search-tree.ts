import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'binary-search-tree',
    name: 'BST Search & Insert',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Traverses a Binary Search Tree recursively or iteratively. If the value matches the current node, the search succeeds; otherwise, it branches left if the target is smaller or right if the target is larger.',
    pseudocode: [
        'function searchBST(root, target):',
        '  if root is null:',
        '    return null // Not found',
        '  if root.val == target:',
        '    return root // Found',
        '  if target < root.val:',
        '    return searchBST(root.left, target)',
        '  else:',
        '    return searchBST(root.right, target)'
    ],
    inputs: [
        {
            id: 'target',
            label: 'Search Target',
            type: 'integer' as const,
            defaultValue: 40,
            constraints: { min: 10, max: 90 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const target = inputs['target'] as number;
    let comparisons = 0;

    // Define tree nodes with coordinates for clean layout
    // Root at (400, 60)
    // Left: 30 at (300, 140), Right: 70 at (500, 140)
    // Sub-children at depth 3: 20 at (250, 220), 40 at (350, 220)
    const initialNodes = [
        { id: '50', val: 50, label: '50 (Root)', x: 400, y: 60, state: 'default' as const },
        { id: '30', val: 30, label: '30', x: 300, y: 140, state: 'default' as const },
        { id: '70', val: 70, label: '70', x: 500, y: 140, state: 'default' as const },
        { id: '20', val: 20, label: '20', x: 250, y: 220, state: 'default' as const },
        { id: '40', val: 40, label: '40', x: 350, y: 220, state: 'default' as const }
    ];

    const edges = [
        { source: '50', target: '30', weight: 0 },
        { source: '50', target: '70', weight: 0 },
        { source: '30', target: '20', weight: 0 },
        { source: '30', target: '40', weight: 0 }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, msg: string, line: number): AlgoState => {
        const nodes = initialNodes.map(node => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (node.id === activeId) state = 'active';
            else if (visitedIds.includes(node.id)) state = 'visited';
            return { ...node, state };
        });

        return {
            structures: {
                'bst': {
                    type: 'graph',
                    id: 'bst',
                    nodes,
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: { target, activeVal: activeId ? activeId : 'None' },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, `Initializing BST search for target value ${target}...`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let currentId: string | null = '50'; // Start at root
    const visited: string[] = [];

    while (currentId !== null) {
        const currentNode = initialNodes.find(n => n.id === currentId)!;
        comparisons++;

        yield {
            snapshot: makeState([...visited], currentId, `Visiting node ${currentNode.val}. Comparing against target ${target}`, 4),
            events: [{ type: 'compare', targetIds: ['bst'], indices: [] }], // indices not used for graphs
            metrics: { comparisons, swaps: 0, writes: 0 }
        };

        if (currentNode.val === target) {
            yield {
                snapshot: makeState([...visited, currentId], currentId, `Target ${target} matches node ${currentNode.val}! Search Successful.`, 5),
                events: [{ type: 'lock', targetIds: ['bst'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };
            return;
        }

        visited.push(currentId);

        if (target < currentNode.val) {
            // Move left
            const nextId: string | null = currentId === '50' ? '30' : (currentId === '30' ? '20' : null);
            if (nextId) {
                yield {
                    snapshot: makeState([...visited], currentId, `${target} < ${currentNode.val}. Branching Left to node ${nextId}.`, 7),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
                currentId = nextId;
            } else {
                yield {
                    snapshot: makeState([...visited], currentId, `${target} < ${currentNode.val}, but left child is null. Target not in BST.`, 3),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
                currentId = null;
            }
        } else {
            // Move right
            const nextId: string | null = currentId === '50' ? '70' : (currentId === '30' ? '40' : null);
            if (nextId) {
                yield {
                    snapshot: makeState([...visited], currentId, `${target} > ${currentNode.val}. Branching Right to node ${nextId}.`, 9),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
                currentId = nextId;
            } else {
                yield {
                    snapshot: makeState([...visited], currentId, `${target} > ${currentNode.val}, but right child is null. Target not in BST.`, 3),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
                currentId = null;
            }
        }
    }

    yield {
        snapshot: makeState([...visited], null, `Search concluded. Target ${target} was not found in the BST.`, 3),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
