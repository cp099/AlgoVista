import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'detect-cycle-floyd',
    name: 'Detect Cycle (Floyd)',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: "Detects a cycle in a linked list using two pointers, a 'slow' one and a 'fast' one (Tortoise and Hare). If they meet, a cycle exists.",
    pseudocode: [
        'slow = head, fast = head',
        'while fast and fast.next:',
        '  slow = slow.next',
        '  fast = fast.next.next',
        '  if slow == fast:',
        '    return true',
        'return false'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [1, 2, 3, 4, 5, 6], // Cycle will be created from 6 back to 3
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
    
    // Metrics
    let comparisons = 0, swaps = 0, writes = 0;
    
    let head: LLNode | null = null;
    let tail: LLNode | null = null;
    let cycleNode: LLNode | null = null; 
    
    for(const val of sequence) {
        if (!head) {
            head = new LLNode(val);
            tail = head;
        } else {
            tail!.next = new LLNode(val);
            tail = tail!.next;
        }
        if (val === 3) cycleNode = tail;
    }
    if (tail && cycleNode) tail.next = cycleNode;
    
    const nodeCount = sequence.length;

    const getCirclePos = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI;
        return { x: 400 + 150 * Math.cos(angle), y: 200 + 150 * Math.sin(angle) };
    };

    const makeState = (msg: string, vars: { slow?: LLNode|null, fast?: LLNode|null } = {}): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        if (head) {
            let temp: LLNode | null = head;
            const visited = new Set();
            let i = 0;
            while(temp && !visited.has(temp)) {
                visited.add(temp);
                const {x, y} = getCirclePos(i, nodeCount);
                nodes.push({ id: String(temp.val), val: temp.val, label: String(temp.val), x, y });
                if (temp.next) {
                    edges.push({ source: String(temp.val), target: String(temp.next.val) });
                }
                temp = temp.next;
                i++;
            }
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

    yield { snapshot: makeState("List with Cycle Created"), events: [], metrics: { comparisons, swaps, writes } };

    if (!head) return;
    
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        yield { 
            snapshot: makeState(`Moving pointers`, { slow, fast }), 
            events: [],
            metrics: { comparisons, swaps, writes }
        };
        
        slow = slow.next!;
        fast = fast.next.next!;
        
        yield { 
            snapshot: makeState(`Pointers at: Slow=${slow?.val}, Fast=${fast?.val}`, { slow, fast }), 
            events: [],
            metrics: { comparisons, swaps, writes }
        };
        
        comparisons++; // The check "slow === fast" is a comparison
        if (slow === fast) {
            yield { 
                snapshot: makeState(`Collision! Slow and Fast met at ${slow.val}. Cycle Detected!`, { slow, fast }), 
                events: [{type: 'lock', targetIds:['main'], indices:[]}], // Highlight meeting point
                metrics: { comparisons, swaps, writes }
            };
            return;
        }
    }

    yield { snapshot: makeState("No Collision. No Cycle Detected."), events: [], metrics: { comparisons, swaps, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;