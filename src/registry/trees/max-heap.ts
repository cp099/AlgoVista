import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'max-heapify',
    name: 'Max-Heapify Down',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Restores the Max-Heap property at a given node by bubbling it down and swapping with its largest child recursively.',
    pseudocode: [
        'function MaxHeapify(heap, index):',
        '  left = 2*index + 1, right = 2*index + 2',
        '  largest = index',
        '  if left < size and heap[left] > heap[largest]: largest = left',
        '  if right < size and heap[right] > heap[largest]: largest = right',
        '  if largest != index:',
        '    swap(heap[index], heap[largest])',
        '    MaxHeapify(heap, largest)'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Heap Scaling Scale',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 2 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const scale = inputs['multiplier'] as number;

    const initialHeap = [4 * scale, 15 * scale, 10 * scale, 8 * scale, 12 * scale];

    const makeState = (heap: number[], activeIdx: number | null, largestIdx: number | null, msg: string, line: number): AlgoState => {
        const nodes = heap.map((hval, idx) => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (idx === activeIdx) state = 'active';
            else if (idx === largestIdx) state = 'visited';
            return { id: String(idx), val: hval, label: String(hval), state };
        });

        const edges: { source: string; target: string }[] = [];
        for (let idx = 1; idx < heap.length; idx++) {
            const parent = Math.floor((idx - 1) / 2);
            edges.push({ source: String(parent), target: String(idx) });
        }

        return {
            structures: {
                'heap_array': { type: 'array', id: 'Heap Array', data: [...heap] },
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
                    activeNodeIndex: activeIdx !== null ? activeIdx : 'None',
                    largestChildIndex: largestIdx !== null ? largestIdx : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([...initialHeap], null, null, "Starting Max-Heapify operation at index 0.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let swaps = 0;
    let writes = 0;

    const heap = [...initialHeap];
    let index = 0;

    while (index < heap.length) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let largest = index;

        if (left < heap.length) {
            comparisons++;
            if (heap[left] > heap[largest]) {
                largest = left;
            }
        }

        if (right < heap.length) {
            comparisons++;
            if (heap[right] > heap[largest]) {
                largest = right;
            }
        }

        yield {
            snapshot: makeState([...heap], index, largest, `Comparing node index ${index} with left child ${left} and right child ${right}. Largest index: ${largest}.`, 4),
            events: [{ type: 'compare', targetIds: ['heap_array'], indices: [index, left, right].filter(x => x < heap.length) }],
            metrics: { comparisons, swaps, writes }
        };

        if (largest !== index) {
            const temp = heap[index];
            heap[index] = heap[largest];
            heap[largest] = temp;
            swaps++;
            writes += 2;

            yield {
                snapshot: makeState([...heap], largest, index, `Swapped root ${temp} with child ${heap[index]}. Bubbling down.`, 7),
                events: [{ type: 'swap', targetIds: ['heap_array'], indices: [index, largest] }],
                metrics: { comparisons, swaps, writes }
            };

            index = largest;
        } else {
            break;
        }
    }

    yield {
        snapshot: makeState([...heap], null, null, "Max-Heapify complete. Max-heap property successfully restored.", 8),
        events: [],
        metrics: { comparisons, swaps, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
