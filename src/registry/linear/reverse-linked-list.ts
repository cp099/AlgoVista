import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'reverse-linked-list',
    name: 'Reverse Linked List',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Reverses a Singly Linked List iteratively by reversing the `next` pointers of each node.',
    pseudocode: [
        'prev = null',
        'current = head',
        'while current != null:',
        '  next = current.next',
        '  current.next = prev',
        '  prev = current',
        '  current = next',
        'head = prev'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [1, 2, 3, 4, 5],
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
    
    // Build Initial List
    let head: LLNode | null = null;
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

    const makeState = (msg: string, vars: { prev?: LLNode|null, current?: LLNode|null, next?: LLNode|null } = {}, line: number = 0): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        // Use a fixed horizontal layout
        let temp: LLNode | null = head;
        let i = 0;
        while(temp) {
            nodes.push({ id: String(temp.val), val: temp.val, label: String(temp.val), x: 150 + i * 100, y: 200 });
            if (temp.next) {
                edges.push({ source: String(temp.val), target: String(temp.next.val) });
            }
            temp = temp.next;
            i++;
        }
        
        // Add pointer visuals if they exist
        const findNodeX = (node: LLNode) => {
            const visualNode = nodes.find(n => n.id === String(node.val));
            return visualNode ? visualNode.x! : -1;
        };

        if (vars.prev) {
            nodes.push({ id: 'prev_ptr', val: 0, label: 'Prev', x: findNodeX(vars.prev), y: 260 });
        }
        if (vars.current) {
            nodes.push({ id: 'curr_ptr', val: 0, label: 'Curr', x: findNodeX(vars.current), y: 140 });
        }
        if (vars.next) {
            nodes.push({ id: 'next_ptr', val: 0, label: 'Next', x: findNodeX(vars.next), y: 140 });
        }

        return {
            structures: { 'main': { type: 'graph', id: 'Linked List', nodes, edges, isDirected: true } },
            context: { variables: {}, pseudocodeLine: line, message: msg }
        };
    };

    yield { snapshot: makeState("Initial List", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // REVERSAL LOGIC
    let prev: LLNode | null = null;
    let current = head;
    
    while (current !== null) {
        let next = current.next;
        
        yield { 
            snapshot: makeState(`Setting up pointers: prev=${prev?.val ?? 'null'}, current=${current.val}, next=${next?.val ?? 'null'}`, { prev, current, next }), 
            events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Rewire
        current.next = prev;
        
        yield { 
            snapshot: makeState(`Rewiring: current.next -> prev`, { prev, current, next }, 5), 
            events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
        
        // Move pointers
        prev = current;
        current = next;

        yield { 
            snapshot: makeState(`Shifting pointers forward`, { prev, current, next }, 6), 
            events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }
    
    head = prev; // New head is the old tail

    yield { snapshot: makeState("Reversal Complete", {}, 8), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;