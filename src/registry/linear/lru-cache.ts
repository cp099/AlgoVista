import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'lru-cache',
    name: 'LRU Cache',
    category: 'Linear Data Structures',
    difficulty: 'Hard' as const,
    description: 'A Least Recently Used (LRU) Cache. It uses a Hash Map for O(1) lookups and a Doubly Linked List to track usage order.',
    pseudocode: [
        '// Get(key)',
        'if key in map:',
        '  node = map[key]',
        '  moveToHead(node)',
        '  return node.val',
        '',
        '// Put(key, val)',
        'if key in map:',
        '  node = map[key], node.val = val',
        '  moveToHead(node)',
        'else:',
        '  newNode = ...',
        '  addToHead(newNode)',
        '  map[key] = newNode',
        '  if size > capacity: removeTail()'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Operations (Key, Value)',
            type: 'array' as const, // We will interpret this array
            defaultValue: [
                ['put', 1, 1], ['put', 2, 2], ['get', 1], 
                ['put', 3, 3], ['get', 2], ['put', 4, 4], 
                ['get', 1], ['get', 3], ['get', 4]
            ],
            constraints: { maxLength: 10 }
        }
    ]
};

// Internal classes
class DLLNode {
    key: number;
    val: number;
    next: DLLNode | null = null;
    prev: DLLNode | null = null;
    constructor(key: number, val: number) { this.key = key; this.val = val; }
}

class LRUCache {
    capacity: number;
    map: Map<number, DLLNode> = new Map();
    head: DLLNode = new DLLNode(-1, -1); // Dummy nodes
    tail: DLLNode = new DLLNode(-1, -1);

    constructor(capacity: number) {
        this.capacity = capacity;
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    
    // Internal helpers
    remove(node: DLLNode) {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }
    
    addToHead(node: DLLNode) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next!.prev = node;
        this.head.next = node;
    }
    
    *get(key: number, gen: any) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            yield* gen.makeStep(`GET(${key}): Found. Moving to head.`);
            this.remove(node);
            this.addToHead(node);
            yield* gen.makeStep(`GET(${key}): Moved to head.`);
            return node.val;
        }
        yield* gen.makeStep(`GET(${key}): Miss.`);
        return -1;
    }

    *put(key: number, val: number, gen: any) {
        if (this.map.has(key)) {
            const node = this.map.get(key)!;
            node.val = val;
            yield* gen.makeStep(`PUT(${key},${val}): Updated. Moving to head.`);
            this.remove(node);
            this.addToHead(node);
            yield* gen.makeStep(`PUT(${key},${val}): Moved to head.`);
        } else {
            if (this.map.size === this.capacity) {
                const tail = this.tail.prev!;
                yield* gen.makeStep(`PUT(${key},${val}): Cache full. Evicting ${tail.key}.`);
                this.remove(tail);
                this.map.delete(tail.key);
            }
            const newNode = new DLLNode(key, val);
            yield* gen.makeStep(`PUT(${key},${val}): New item. Adding to head.`);
            this.addToHead(newNode);
            this.map.set(key, newNode);
            yield* gen.makeStep(`PUT(${key},${val}): Added.`);
        }
    }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = inputs['sequence'] as any[];
    const capacity = 3;
    const cache = new LRUCache(capacity);

    const makeState = (msg: string): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];
        
        let curr: DLLNode | null = cache.head.next;
        let i = 0;
        while(curr && curr !== cache.tail) {
            nodes.push({ id: String(curr.key), val: curr.val, label: `${curr.key}:${curr.val}`, x: 150 + i * 120, y: 200 });
            if (curr.next && curr.next !== cache.tail) {
                edges.push({ source: String(curr.key), target: String(curr.next.key) });
            }
            curr = curr.next;
            i++;
        }
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Cache (Head -> Tail)', nodes, edges, isDirected: true }
            },
            context: { variables: { size: cache.map.size, capacity }, message: msg }
        };
    };

    // Generator helper to yield steps
    const generatorHelper = {
        *makeStep(msg: string) {
            yield { snapshot: makeState(msg), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
        }
    };
    
    yield* generatorHelper.makeStep("Initialized LRU Cache");

    for (const op of sequence) {
        const [type, key, val] = op;
        if (type === 'get') {
            yield* cache.get(key, generatorHelper);
        } else if (type === 'put') {
            yield* cache.put(key, val, generatorHelper);
        }
    }

    yield* generatorHelper.makeStep("Sequence Complete");
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;