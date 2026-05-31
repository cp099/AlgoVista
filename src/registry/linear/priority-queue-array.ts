import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'priority-queue-array',
    name: 'Priority Queue (Unsorted Array)',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'Implements a Priority Queue with an unsorted array. Enqueue is fast (add to end), but Dequeue is slow (scan for max/min).',
    pseudocode: [
        '// Enqueue',
        'arr.push(item)',
        '',
        '// Dequeue (Max Priority)',
        'max_idx = 0',
        'for i from 1 to n:',
        '  if arr[i] > arr[max_idx]: max_idx = i',
        'item = arr.splice(max_idx, 1)',
        'return item'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Values to Enqueue',
            type: 'array' as const,
            defaultValue: [30, 50, 10, 70, 40],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Internal state
    let pq: number[] = [];
    let comparisons = 0, writes = 0;

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'main': { 
                type: 'array', 
                id: 'Priority Queue (Array)', 
                data: [...pq],
                visualMode: 'bar'
            }
        },
        context: { variables: { size: pq.length }, message: msg }
    });

    yield { snapshot: makeState("Initialized Empty Priority Queue"), events: [], metrics: { comparisons, swaps: 0, writes } };

    // 1. Enqueue Phase
    for (const val of sequence) {
        pq.push(val);
        writes++;
        yield { 
            snapshot: makeState(`Enqueued ${val}`), 
            events: [{ type: 'write', targetIds: ['main'], indices: [pq.length - 1] }],
            metrics: { comparisons, swaps: 0, writes } 
        };
    }

    yield { snapshot: makeState("Enqueue complete. Now Dequeueing highest priority (max value)..."), events: [], metrics: { comparisons, swaps: 0, writes } };

    // 2. Dequeue Phase (Max Priority)
    while (pq.length > 0) {
        
        let maxIdx = 0;
        yield { 
            snapshot: makeState(`Scanning for max... Assuming index 0 (${pq[0]}) is max`), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [0] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        for (let i = 1; i < pq.length; i++) {
            comparisons++;
            yield { 
                snapshot: makeState(`Comparing ${pq[i]} vs current max ${pq[maxIdx]}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, maxIdx] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
            if (pq[i] > pq[maxIdx]) {
                maxIdx = i;
                yield { 
                    snapshot: makeState(`New max found: ${pq[i]}`), 
                    events: [{ type: 'visit', targetIds: ['main'], indices: [i] }],
                    metrics: { comparisons, swaps: 0, writes } 
                };
            }
        }

        const maxVal = pq[maxIdx];
        yield { 
            snapshot: makeState(`Highest priority is ${maxVal}. Dequeueing...`), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [maxIdx] }],
            metrics: { comparisons, swaps: 0, writes } 
        };
        
        // Remove from array
        pq.splice(maxIdx, 1);
        writes += pq.length; // Splice is expensive

        yield { 
            snapshot: makeState(`Dequeued ${maxVal}.`), 
            events: [],
            metrics: { comparisons, swaps: 0, writes } 
        };
    }

    yield { snapshot: makeState("Priority Queue is Empty"), events: [], metrics: { comparisons, swaps: 0, writes } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;