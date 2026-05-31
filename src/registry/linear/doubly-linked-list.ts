import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'doubly-linked-list',
    name: 'Doubly Linked List',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Each node in a Doubly Linked List has a `next` and a `prev` pointer, allowing traversal in both directions.',
    pseudocode: [
        '// Insert After Node P',
        'newNode.next = P.next',
        'newNode.prev = P',
        'P.next.prev = newNode',
        'P.next = newNode',
        '',
        '// Delete Node X',
        'X.prev.next = X.next',
        'X.next.prev = X.prev'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [10, 20, 30],
            constraints: { min: 1, max: 99, maxLength: 5 }
        }
    ]
};

// Internal class
class DLLNode {
    val: number;
    next: DLLNode | null = null;
    prev: DLLNode | null = null;
    constructor(val: number) { this.val = val; }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    let head: DLLNode | null = null;
    let tail: DLLNode | null = null;

    const makeState = (msg: string): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        // Add Head/Tail Pointers
        nodes.push({ id: 'head_ptr', val: 0, label: 'HEAD', x: 50, y: 150 });
        nodes.push({ id: 'tail_ptr', val: 0, label: 'TAIL', x: 50, y: 250 });

        if (head) {
            let curr: DLLNode | null = head;
            let i = 0;
            while(curr) {
                nodes.push({ id: String(curr.val), val: curr.val, x: 150 + i * 120, y: 200 });
                if (curr.next) {
                    // Forward edge
                    edges.push({ source: String(curr.val), target: String(curr.next.val) });
                }
                if (curr.prev) {
                    // Backward edge - offset to be visible
                    // Note: Our renderer draws a single straight line, so this won't be a perfect arc.
                    // For now, it will look like one thick line. We'd need a custom edge renderer for arcs.
                    edges.push({ source: String(curr.val), target: String(curr.prev.val) });
                }
                curr = curr.next;
                i++;
            }
            edges.push({ source: 'head_ptr', target: String(head.val) });
        }
        if (tail) {
             edges.push({ source: 'tail_ptr', target: String(tail.val) });
        }
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Doubly Linked List', nodes, edges, isDirected: true }
            },
            context: { variables: { head: head?.val ?? 'null', tail: tail?.val ?? 'null' }, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized Empty List"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. Build Initial List
    for(const val of sequence) {
        const newNode = new DLLNode(val);
        if (!head) {
            head = tail = newNode;
        } else {
            tail!.next = newNode;
            newNode.prev = tail;
            tail = newNode;
        }
        yield { snapshot: makeState(`Appended ${val}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    }
    
    // 2. Insert 25 in Middle
    let valToInsert = 25;
    yield { snapshot: makeState(`Inserting ${valToInsert} after 20`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    
    let p = head;
    while(p && p.val !== 20) p = p.next;
    
    if (p) {
        const newNode = new DLLNode(valToInsert);
        newNode.next = p.next;
        if (p.next) p.next.prev = newNode;
        newNode.prev = p;
        p.next = newNode;
        if (newNode.next === null) tail = newNode;
    }
    yield { snapshot: makeState(`Inserted ${valToInsert}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 3. Delete Node (25)
    yield { snapshot: makeState(`Deleting 25`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    let nodeToDelete = p ? p.next : null;
    if (nodeToDelete) {
        if(nodeToDelete.prev) nodeToDelete.prev.next = nodeToDelete.next;
        else head = nodeToDelete.next;
        
        if(nodeToDelete.next) nodeToDelete.next.prev = nodeToDelete.prev;
        else tail = nodeToDelete.prev;
    }
    yield { snapshot: makeState(`Deleted 25`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };


    yield { snapshot: makeState("Operations Complete"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;