import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'circular-linked-list',
    name: 'Circular Linked List',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'A linked list where the last node points to the first node, forming a circle. Traversal can continue indefinitely.',
    pseudocode: [
        '// Insertion (at end)',
        'newNode.next = head',
        'tail.next = newNode',
        'tail = newNode',
        '',
        '// Traversal',
        'do {',
        '  process(current)',
        '  current = current.next',
        '} while (current != head)'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 40, 50],
            constraints: { min: 1, max: 99, maxLength: 6 }
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
    let tail: LLNode | null = null;
    let comparisons = 0, swaps = 0, writes = 0;

    // Use a circular layout for nodes
    const getCirclePos = (index: number, total: number, centerX: number, centerY: number, radius: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    const makeState = (msg: string): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        if (head) {
            let curr: LLNode | null = head;
            let i = 0;
            const total = sequence.length; // Use sequence length for stable layout
            do {
                const { x, y } = getCirclePos(i, total, 400, 200, 120);
                nodes.push({ id: String(curr!.val), val: curr!.val, label: String(curr!.val), x, y });
                if (curr!.next) {
                    edges.push({ source: String(curr!.val), target: String(curr!.next.val) });
                }
                curr = curr!.next;
                i++;
            } while (curr !== head);
        }
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Circular Linked List', nodes, edges, isDirected: true }
            },
            context: { variables: { head: head?.val ?? 'null' }, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized Empty List"), events: [], metrics: { comparisons, swaps, writes } };

    // 1. Build List
    for (const val of sequence) {
        const newNode = new LLNode(val);
        if (!head) {
            head = newNode;
            newNode.next = head; // Point to itself
            tail = head;
        } else {
            newNode.next = head;
            tail!.next = newNode;
            tail = newNode;
        }
        writes++;
        yield { snapshot: makeState(`Appended ${val}`), events: [], metrics: { comparisons, swaps, writes } };
    }

    // 2. Animate Traversal
    yield { snapshot: makeState("Traversal starting from head"), events: [], metrics: { comparisons, swaps, writes } };
    
    if (head) {
        let curr = head;
        // Rebuild a flat list of node objects to find indices
        const tempNodes: GraphNode[] = [];
        let tempCurr: LLNode | null = head;
        let k = 0;
        do {
            const { x, y } = getCirclePos(k, sequence.length, 400, 200, 120);
            tempNodes.push({ id: String(tempCurr!.val), val: tempCurr!.val, label: String(tempCurr!.val), x, y });
            tempCurr = tempCurr!.next;
            k++;
        } while(tempCurr !== head);

        do {
            // Find index of current node in the visual layout array
            const currIdx = tempNodes.findIndex(n => n.id === String(curr.val));
            
            yield { 
                snapshot: makeState(`Visiting ${curr.val}`), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [currIdx] }],
                metrics: { comparisons, swaps, writes }
            };
            curr = curr.next!;
        } while (curr !== head);
    }
    
    yield { snapshot: makeState("Traversal Complete"), events: [], metrics: { comparisons, swaps, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;