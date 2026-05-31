import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'tree-sort',
    name: 'Tree Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'Builds a Binary Search Tree from the elements, then performs an In-Order Traversal to create a sorted array.',
    pseudocode: [
        'root = null',
        'for x in arr: root = insert(root, x)',
        'inOrder(root, arr)',
        'function insert(node, val):',
        '  if node is null: return newNode(val)',
        '  if val < node.val: node.left = insert(node.left, val)',
        '  else: node.right = insert(node.right, val)',
        'function inOrder(node):',
        '  if node:',
        '    inOrder(node.left)',
        '    arr[k++] = node.val',
        '    inOrder(node.right)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [5, 3, 7, 2, 4, 6, 8],
            constraints: { min: 1, max: 99, maxLength: 15 }
        }
    ]
};

class TreeNode {
    val: number;
    id: string;
    left: TreeNode | null = null;
    right: TreeNode | null = null;
    x: number;
    y: number;

    constructor(val: number, id: string, x: number, y: number) {
        this.val = val;
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let root: TreeNode | null = null;
    
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];
    let comparisons = 0; // <--- ADDED THIS DECLARATION
    let swaps = 0;
    let writes = 0;

    const makeState = (msg: string, vars: any = {}): AlgoState => ({
        structures: { 
            'main': { type: 'array', id: 'Input Array', data: [...arr] },
            'tree': { type: 'graph', id: 'BST', nodes: [...nodes], edges: [...edges], isDirected: true }
        },
        context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Tree Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. BUILD BST
    for (let i = 0; i < n; i++) {
        const val = arr[i];
        
        yield { 
            snapshot: makeState(`Inserting ${val} into BST`, { i, val }), 
            events: [{ type: 'visit', targetIds: ['Input Array'], indices: [i] }],
            metrics: { comparisons, swaps, writes } 
        };

        if (!root) {
            root = new TreeNode(val, `n${i}`, 400, 50);
            nodes.push({ id: root.id, val: root.val, x: root.x, y: root.y });
        } else {
            let curr = root;
            let depth = 0;
            
            while (true) {
                depth++;
                comparisons++; // <--- Increment comparison
                yield { 
                    snapshot: makeState(`Traversing: ${val} vs ${curr.val}`, { i, val, curr: curr.val }), 
                    events: [{ type: 'compare', targetIds: ['BST'], indices: [parseInt(curr.id.slice(1))] }], 
                    metrics: { comparisons, swaps, writes } 
                };

                const offset = 250 / Math.pow(2, depth);

                if (val < curr.val) {
                    if (!curr.left) {
                        curr.left = new TreeNode(val, `n${i}`, curr.x - offset, curr.y + 80);
                        nodes.push({ id: curr.left.id, val: curr.left.val, x: curr.left.x, y: curr.left.y });
                        edges.push({ source: curr.id, target: curr.left.id });
                        break;
                    }
                    curr = curr.left;
                } else {
                    if (!curr.right) {
                        curr.right = new TreeNode(val, `n${i}`, curr.x + offset, curr.y + 80);
                        nodes.push({ id: curr.right.id, val: curr.right.val, x: curr.right.x, y: curr.right.y });
                        edges.push({ source: curr.id, target: curr.right.id });
                        break;
                    }
                    curr = curr.right;
                }
            }
        }
        
        yield { 
            snapshot: makeState(`Inserted ${val}`, { i, val }), 
            events: [],
            metrics: { comparisons, swaps, writes } 
        };
    }

    // 2. IN-ORDER TRAVERSAL
    let k = 0;
    for(let i=0; i<n; i++) arr[i] = 0;

    function* inOrder(node: TreeNode | null): Generator<any> {
        if (!node) return;
        
        yield* inOrder(node.left);
        
        arr[k] = node.val;
        writes++;
        yield { 
            snapshot: makeState(`Visiting ${node.val} (In-Order)`, { k, val: node.val }), 
            events: [
                { type: 'visit', targetIds: ['BST'], indices: [parseInt(node.id.slice(1))] }, 
                { type: 'write', targetIds: ['Input Array'], indices: [k] } 
            ],
            metrics: { comparisons, swaps, writes } 
        };
        k++;

        yield* inOrder(node.right);
    }

    yield { snapshot: makeState("Tree Built. Starting In-Order Traversal."), events: [], metrics: { comparisons, swaps, writes } };
    yield* inOrder(root);

    yield { 
        snapshot: makeState("Tree Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['Input Array'], indices: Array.from({length:n},(_,j)=>j) }],
        metrics: { comparisons, swaps, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;