import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'heap-sort',
    name: 'Heap Sort (Tree View)',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'Visualizing Heap Sort as a Binary Tree. We build a Max Heap where every Parent node is greater than its Children, then extract the root repeatedly.',
    pseudocode: [
        'function heapSort(arr):',
        '  for i = n/2 - 1 down to 0:',
        '    heapify(arr, n, i)',
        '  for i = n - 1 down to 0:',
        '    swap(arr[0], arr[i])',
        '    heapify(arr, i, 0)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [4, 10, 3, 5, 1, 2, 12, 7, 15],
            constraints: { min: 1, max: 99, maxLength: 15 }
        }
    ]
};

// --- HELPER: Tree Geometry ---
// Removed unused params 'total' and 'height'
const getTreeLayout = (index: number, width = 800) => {
    const level = Math.floor(Math.log2(index + 1));
    const maxNodesInLevel = Math.pow(2, level);
    const positionInLevel = index - (maxNodesInLevel - 1);
    
    const spread = width / (maxNodesInLevel + 1);
    const x = spread * (positionInLevel + 1);
    const y = 50 + (level * 80); 

    return { x, y };
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    // Removed unused 'activeIndices' and 'sortedIndices'
    const makeState = (vars: any = {}, msg: string = ''): AlgoState => {
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        // 1. Create Nodes
        for (let i = 0; i < n; i++) {
            const { x, y } = getTreeLayout(i);
            nodes.push({ id: String(i), val: arr[i], x, y });
        }

        // 2. Create Edges
        const limit = vars.heapSize !== undefined ? vars.heapSize : n;
        
        for (let i = 0; i < limit; i++) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < limit) edges.push({ source: String(i), target: String(left) });
            if (right < limit) edges.push({ source: String(i), target: String(right) });
        }

        return {
            structures: { 
                'main': { type: 'graph', id: 'main', nodes, edges, isDirected: true } 
            },
            context: { variables: { n, ...vars }, pseudocodeLine: 0, message: msg }
        };
    };

    yield { snapshot: makeState({ heapSize: n }, "Starting Heap Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    function* heapify(size: number, i: number): Generator<any> {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < size) {
            comparisons++;
            yield { 
                snapshot: makeState({ heapSize: size, i, largest, left }, `Compare Parent ${arr[largest]} vs Left ${arr[left]}`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [largest, left] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
            if (arr[left] > arr[largest]) largest = left;
        }

        if (right < size) {
            comparisons++;
            yield { 
                snapshot: makeState({ heapSize: size, i, largest, right }, `Compare Winner ${arr[largest]} vs Right ${arr[right]}`),
                events: [{ type: 'compare', targetIds: ['main'], indices: [largest, right] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
            if (arr[right] > arr[largest]) largest = right;
        }

        if (largest !== i) {
            const temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ heapSize: size, i, largest }, `Swapping Parent with Child`),
                events: [{ type: 'swap', targetIds: ['main'], indices: [i, largest] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
            yield* heapify(size, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield { snapshot: makeState({ heapSize: n }, `Building Heap: Heapify index ${i}`), events: [], metrics: { comparisons, swaps, writes: 0 } };
        yield* heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        const temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        swaps++;
        
        yield { 
            snapshot: makeState({ heapSize: i }, `Extract Max: Move ${arr[i]} to sorted list`),
            events: [{ type: 'swap', targetIds: ['main'], indices: [0, i] }],
            metrics: { comparisons, swaps, writes: 0 }
        };

        yield* heapify(i, 0);
    }

    yield { 
        snapshot: makeState({ heapSize: 0 }, "Heap Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }], 
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;