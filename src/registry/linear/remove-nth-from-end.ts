import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'remove-nth-from-end',
    name: 'Remove Nth Node From End',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description:
        'Removes the n-th node from the end of a linked list in a single pass. It uses two pointers with a fixed gap between them.',
    pseudocode: [
        'dummy = new Node(0, head)',
        'slow = dummy, fast = dummy',
        'for i from 1 to n+1: fast = fast.next',
        'while fast != null:',
        '  slow = slow.next',
        '  fast = fast.next',
        'slow.next = slow.next.next',
        'return dummy.next'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Initial Values',
            type: 'array' as const,
            defaultValue: [1, 2, 3, 4, 5],
            constraints: { min: 1, max: 99, maxLength: 8 }
        },
        {
            id: 'n',
            label: 'N (from end)',
            type: 'integer' as const,
            defaultValue: 2
        }
    ]
};

class LLNode {
    val: number;
    next: LLNode | null = null;
    constructor(val: number) {
        this.val = val;
    }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    const n = inputs['n'] as number;

    let comparisons = 0;
    let swaps = 0;
    let writes = 0;

    // Build initial list
    const dummy = new LLNode(0);
    let tail: LLNode | null = dummy;

    for (const val of sequence) {
        tail!.next = new LLNode(val);
        tail = tail!.next;
        writes++;
    }

    let head = dummy.next;

    const makeState = (msg: string,
        vars: { slow?: LLNode | null; fast?: LLNode | null } = {}, line: number = 0): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        let temp = head;
        let i = 0;

        while (temp) {
            nodes.push({
                id: String(temp.val),
                val: temp.val,
                label: String(temp.val),
                x: 150 + i * 100,
                y: 200
            });

            if (temp.next) {
                edges.push({
                    source: String(temp.val),
                    target: String(temp.next.val)
                });
            }

            temp = temp.next;
            i++;
        }

        const findNodePos = (node: LLNode) => {
            const visual = nodes.find(n => n.id === String(node.val));
            return visual ? { x: visual.x!, y: visual.y! } : { x: 0, y: 0 };
        };

        if (vars.slow && vars.slow.val !== 0) {
            const pos = findNodePos(vars.slow);
            nodes.push({
                id: 'slow_ptr',
                val: 0,
                label: 'Slow',
                x: pos.x,
                y: pos.y - 40
            });
        }

        if (vars.fast) {
            const pos = findNodePos(vars.fast);
            nodes.push({
                id: 'fast_ptr',
                val: 0,
                label: 'Fast',
                x: pos.x,
                y: pos.y + 40
            });
        }

        return {
            structures: {
                main: {
                    type: 'graph',
                    id: 'Linked List',
                    nodes,
                    edges,
                    isDirected: true
                }
            },
            context: { pseudocodeLine: line,
                variables: { n },
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState('Initial List', {}, 1),
        events: [],
        metrics: { comparisons, swaps, writes }
    };

    if (!head) {
        yield {
            snapshot: makeState('List is empty.', {}, 1),
            events: [],
            metrics: { comparisons, swaps, writes }
        };
        return;
    }

    let slow: LLNode | null = dummy;
    let fast: LLNode | null = dummy;

    yield {
        snapshot: makeState(`Moving Fast pointer ${n} steps ahead`, { slow, fast }, 3),
        events: [],
        metrics: { comparisons, swaps, writes }
    };

    for (let i = 1; i <= n + 1; i++) {
        if (!fast) {
            yield {
                snapshot: makeState('Error: n is larger than list', {}, 1),
                events: [],
                metrics: { comparisons, swaps, writes }
            };
            return;
        }
        fast = fast.next;
        comparisons++;
    }

    yield {
        snapshot: makeState('Gap created', { slow, fast }, 3),
        events: [],
        metrics: { comparisons, swaps, writes }
    };

    while (fast !== null) {
        yield {
            snapshot: makeState('Moving both pointers', { slow, fast }, 4),
            events: [],
            metrics: { comparisons, swaps, writes }
        };
        slow = slow!.next;
        fast = fast.next;
        comparisons++;
    }

    yield {
        snapshot: makeState(
            `Fast reached end. Slow is at ${slow!.val}. Deleting next node.`,
            { slow, fast }
        ),
        events: [],
        metrics: { comparisons, swaps, writes }
    };

    if (slow && slow.next) {
        slow.next = slow.next.next;
        writes++;
    }

    head = dummy.next;

    yield {
        snapshot: makeState('Node deleted. List rewired.', { slow, fast }, 7),
        events: [],
        metrics: { comparisons, swaps, writes }
    };

    yield {
        snapshot: makeState('Operation Complete', {}, 8),
        events: [],
        metrics: { comparisons, swaps, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;