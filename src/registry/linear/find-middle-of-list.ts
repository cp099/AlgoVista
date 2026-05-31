import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'find-middle-of-list',
    name: 'Find Middle of List',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'Finds the middle node of a linked list in a single pass using the "Tortoise and Hare" (slow and fast pointer) method.',
    pseudocode: [
        'slow = head, fast = head',
        'while fast and fast.next:',
        '  slow = slow.next',
        '  fast = fast.next.next',
        'return slow'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            // Even and Odd length examples
            defaultValue: [1, 2, 3, 4, 5, 6, 7],
            constraints: { min: 1, max: 99, maxLength: 9 }
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

    const makeState = (msg: string, vars: { slow?: LLNode|null, fast?: LLNode|null } = {}): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
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
        
        const findNodePos = (node: LLNode) => {
            const visualNode = nodes.find(n => n.id === String(node.val));
            return visualNode ? { x: visualNode.x!, y: visualNode.y! } : {x:0, y:0};
        };

        if (vars.slow) {
            const pos = findNodePos(vars.slow);
            nodes.push({ id: 'slow_ptr', val: 0, label: 'Slow', x: pos.x, y: pos.y - 40 });
        }
        if (vars.fast) {
            const pos = findNodePos(vars.fast);
            nodes.push({ id: 'fast_ptr', val: 0, label: 'Fast', x: pos.x, y: pos.y + 40 });
        }

        return {
            structures: { 'main': { type: 'graph', id: 'Linked List', nodes, edges, isDirected: true } },
            context: { variables: {}, message: msg }
        };
    };

    yield { snapshot: makeState("Initial List"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    if (!head) return;
    
    let slow = head;
    let fast = head;

    yield { snapshot: makeState(`Pointers Initialized`, { slow, fast }), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (fast && fast.next) {
        slow = slow.next!;
        fast = fast.next.next!;
        
        yield { 
            snapshot: makeState(`Moving: Slow to ${slow?.val}, Fast to ${fast?.val ?? 'null'}`, { slow, fast }), 
            events: [],
            metrics: { comparisons: 1, swaps: 0, writes: 0 } 
        };
    }

    yield { 
        snapshot: makeState(`Fast pointer reached end. Middle is ${slow.val}.`, { slow }), 
        events: [{ type: 'lock', targetIds: ['main'], indices: [] }], // Highlight middle node
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;