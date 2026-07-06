import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'min-heap-bubble',
    name: 'Min-Heap Bubble Up',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Inserts an element into a Binary Min-Heap and bubbles it up to preserve the heap property (parent must be smaller than children).',
    pseudocode: [
        'function BubbleUp(heap, index):',
        '  while index > 0 and heap[parent] > heap[index]:',
        '    swap(heap[parent], heap[index])',
        '    index = parent'
    ],
    inputs: [
        {
            id: 'insertVal',
            label: 'Insert Node Value',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 25 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const val = inputs['insertVal'] as number;

    const initialHeap = [5, 8, 10, 15];

    const makeState = (heap: number[], activeIdx: number | null, parentIdx: number | null, msg: string, line: number): AlgoState => {
        // Map heap array to a tree layout
        // Root (0): heap[0]
        // Left (1): heap[1], Right (2): heap[2]
        // Left-Left (3): heap[3], Left-Right (4): heap[4]
        const nodes = heap.map((hval, idx) => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (idx === activeIdx) state = 'active';
            else if (idx === parentIdx) state = 'visited';
            return { id: String(idx), val: hval, label: String(hval), state };
        });

        const edges: { source: string; target: string }[] = [];
        for (let idx = 1; idx < heap.length; idx++) {
            const parent = Math.floor((idx - 1) / 2);
            edges.push({ source: String(parent), target: String(idx) });
        }

        return {
            structures: {
                'heap_array': { type: 'array', id: 'Heap Array Representation', data: [...heap] },
                'heap_tree': {
                    type: 'graph',
                    id: 'heap_tree',
                    layout: 'tree' as const,
                    nodes,
                    edges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    insertedValue: val,
                    activeIndex: activeIdx !== null ? activeIdx : 'None',
                    parentIndex: parentIdx !== null ? parentIdx : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([...initialHeap], null, null, "Starting Min-Heap insert bubble operation.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let swaps = 0;
    let writes = 1;

    const heap = [...initialHeap, val];
    let index = heap.length - 1;

    yield {
        snapshot: makeState([...heap], index, null, `Appended ${val} to the end of the heap. Checking parent values to bubble up.`, 1),
        events: [{ type: 'write', targetIds: ['heap_array'], indices: [index] }],
        metrics: { comparisons, swaps, writes }
    };

    while (index > 0) {
        comparisons++;
        const parent = Math.floor((index - 1) / 2);

        yield {
            snapshot: makeState([...heap], index, parent, `Comparing node ${heap[index]} at index ${index} with parent ${heap[parent]} at index ${parent}.`, 2),
            events: [{ type: 'compare', targetIds: ['heap_array'], indices: [index, parent] }],
            metrics: { comparisons, swaps, writes }
        };

        if (heap[parent] > heap[index]) {
            // Swap
            const temp = heap[parent];
            heap[parent] = heap[index];
            heap[index] = temp;
            swaps++;
            writes += 2;

            yield {
                snapshot: makeState([...heap], parent, index, `Swapped elements ${heap[parent]} and ${heap[index]} (heap violation resolved here).`, 3),
                events: [{ type: 'swap', targetIds: ['heap_array'], indices: [index, parent] }],
                metrics: { comparisons, swaps, writes }
            };

            index = parent;
        } else {
            break;
        }
    }

    yield {
        snapshot: makeState([...heap], null, null, "Min-Heap bubble-up complete. Heap invariants successfully restored.", 4),
        events: [],
        metrics: { comparisons, swaps, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
