import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'singly-linked-list-delete',
    name: 'Singly Linked List: Delete',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Demonstrates deletion from a Singly Linked List, including deleting the head, tail, and a node in the middle.',
    pseudocode: [
        '// Delete Head',
        'head = head.next',
        '',
        '// Delete Middle/Tail (node to delete is `d`)',
        'prev = find(d.prev)',
        'prev.next = d.next'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 40, 50],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

// Internal class
class LLNode {
    val: number;
    next: LLNode | null = null;
    constructor(val: number) { this.val = val; }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    let head: LLNode | null = null;

    const makeState = (msg: string): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        nodes.push({ id: 'head_ptr', val: 0, label: 'HEAD', x: 50, y: 200 });

        if (head) {
            let curr: LLNode | null = head;
            let i = 0;
            while(curr) {
                nodes.push({ id: String(curr.val), val: curr.val, x: 150 + i * 100, y: 200 });
                if (curr.next) {
                    edges.push({ source: String(curr.val), target: String(curr.next.val) });
                }
                curr = curr.next;
                i++;
            }
            edges.push({ source: 'head_ptr', target: String(head.val) });
        }
        
        return {
            structures: { 'main': { type: 'graph', id: 'Linked List', nodes, edges, isDirected: true } },
            context: { variables: { head: head?.val ?? 'null' }, message: msg }
        };
    };

    // 1. Build Initial List
    let tail: LLNode | null = null;
    for(const val of sequence) {
        if (!head) {
            head = new LLNode(val);
            tail = head;
        } else {
            tail!.next = new LLNode(val);
            tail = tail!.next;
        }
    }
    
    yield { snapshot: makeState("Initial List Built"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 2. Delete Middle (30)
    let valToDelete = 30;
    yield { snapshot: makeState(`Deleting Middle: ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    
    if (head && head.val === valToDelete) {
        head = head.next;
    } else {
        let prev = head;
        while(prev && prev.next && prev.next.val !== valToDelete) {
            prev = prev.next;
        }
        if (prev && prev.next) {
            prev.next = prev.next.next;
        }
    }
    yield { snapshot: makeState(`Deleted ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 3. Delete Head
    valToDelete = head!.val;
    yield { snapshot: makeState(`Deleting Head: ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    if (head) head = head.next;
    yield { snapshot: makeState(`Deleted ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 4. Delete Tail
    valToDelete = 50;
    yield { snapshot: makeState(`Deleting Tail: ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    
    if (head && !head.next) {
        head = null;
    } else {
        let prev = head;
        while (prev && prev.next && prev.next.next) {
            prev = prev.next;
        }
        if (prev) {
            prev.next = null;
        }
    }
    
    yield { snapshot: makeState(`Deleted ${valToDelete}`), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    yield { snapshot: makeState("Deletions Complete"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;