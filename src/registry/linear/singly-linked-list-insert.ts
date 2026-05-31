import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'singly-linked-list-insert',
    name: 'Singly Linked List: Insert',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Demonstrates insertion into a Singly Linked List. Operations include inserting at the head (prepend), at the tail (append), and in the middle.',
    pseudocode: [
        '// Insert at Head',
        'newNode.next = head',
        'head = newNode',
        '',
        '// Insert at Tail',
        'while current.next != null: current = current.next',
        'current.next = newNode',
        '',
        '// Insert in Middle (after node P)',
        'newNode.next = P.next',
        'P.next = newNode'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Values to Insert',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 5, 25],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

class LLNode {
    val: number;
    next: LLNode | null = null;
    constructor(val: number) { this.val = val; }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    let head: LLNode | null = null;
    let listSize = 0;
    
    // Metrics
    let comparisons = 0;
    let writes = 0;

    const nodeSpacing = 100;
    const startX = 150;
    const yPos = 200;

    const makeState = (msg: string): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        nodes.push({ id: 'head_ptr', val: 0, label: 'HEAD', x: 50, y: yPos });

        if (head) {
            let curr: LLNode | null = head;
            let i = 0;
            while(curr) {
                nodes.push({ id: String(curr.val), val: curr.val, x: startX + i * nodeSpacing, y: yPos });
                if (curr.next) {
                    edges.push({ source: String(curr.val), target: String(curr.next.val) });
                }
                curr = curr.next;
                i++;
            }
            edges.push({ source: 'head_ptr', target: String(head.val) });
        }
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Linked List', nodes, edges, isDirected: true }
            },
            context: { variables: { head: head?.val ?? 'null' }, message: msg }
        };
    };

    yield { snapshot: makeState("Initialized Empty List"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    const ops = [
        { op: 'head', val: sequence[0] },
        { op: 'tail', val: sequence[1] },
        { op: 'tail', val: sequence[2] },
        { op: 'head', val: sequence[3] },
        { op: 'mid', val: sequence[4], after: sequence[1] }
    ];

    for (const op of ops) {
        if (!op.val) continue;

        if (op.op === 'head') {
            yield { snapshot: makeState(`Prepending ${op.val}`), events: [], metrics: { comparisons, swaps: 0, writes } };
            const newNode = new LLNode(op.val);
            newNode.next = head;
            head = newNode;
            listSize++;
            writes++;
            yield { 
                snapshot: makeState(`Prepended ${op.val}`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } 
        else if (op.op === 'tail') {
            yield { snapshot: makeState(`Appending ${op.val}`), events: [], metrics: { comparisons, swaps: 0, writes } };
            const newNode = new LLNode(op.val);
            if (!head) {
                head = newNode;
            } else {
                let curr = head;
                while(curr.next) {
                    comparisons++;
                    yield { 
                        snapshot: makeState(`Traversing to find tail...`),
                        events: [{ type: 'compare', targetIds: ['main'], indices: [] }],
                        metrics: { comparisons, swaps: 0, writes }
                    };
                    curr = curr.next;
                }
                curr.next = newNode;
            }
            listSize++;
            writes++;
             yield { 
                snapshot: makeState(`Appended ${op.val}`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
        else if (op.op === 'mid') {
            yield { snapshot: makeState(`Inserting ${op.val} after ${op.after}`), events: [], metrics: { comparisons, swaps: 0, writes } };
            let curr = head;
            while(curr && curr.val !== op.after) {
                 comparisons++;
                 yield { 
                    snapshot: makeState(`Traversing to find ${op.after}...`),
                    events: [{ type: 'compare', targetIds: ['main'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                curr = curr.next;
            }
            if (curr) {
                const newNode = new LLNode(op.val);
                newNode.next = curr.next;
                curr.next = newNode;
                listSize++;
                writes++;
            }
             yield { 
                snapshot: makeState(`Inserted ${op.val}`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield { snapshot: makeState("Insertions Complete"), events: [], metrics: { comparisons, swaps: 0, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;