import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'queue-operations',
    name: 'Queue: Enqueue & Dequeue',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'A Queue is a FIFO (First-In, First-Out) structure. Elements are added to the rear (Enqueue) and removed from the front (Dequeue).',
    pseudocode: [
        'function enqueue(queue, val):',
        '  if isFull(): return Overflow',
        '  queue.rear++',
        '  queue[rear] = val',
        '',
        'function dequeue(queue):',
        '  if isEmpty(): return Underflow',
        '  val = queue[front]',
        '  front++',
        '  return val'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Values to Enqueue',
            type: 'array' as const,
            defaultValue: [10, 20, 30, 40, 50],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Internal State
    const queueData: number[] = [];
    const capacity = 8; 

    const makeState = (msg: string): AlgoState => {
        return {
            structures: { 
                'main': { 
                    type: 'array', 
                    id: 'Queue (FIFO)', 
                    data: [...queueData],
                    orientation: 'horizontal'
                }
            },
            context: { 
                variables: { 
                    front: 0, 
                    rear: Math.max(0, queueData.length - 1),
                    size: queueData.length,
                    capacity 
                }, 
                pseudocodeLine: 0, 
                message: msg 
            }
        };
    };

    yield { snapshot: makeState("Queue Initialized (Empty)"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. ENQUEUE PHASE
    for (const val of sequence) {
        if (queueData.length >= capacity) {
            yield { 
                snapshot: makeState("Queue Overflow! Cannot enqueue."), 
                events: [],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
            break;
        }

        // Prepare
        yield { 
            snapshot: makeState(`Preparing to Enqueue ${val}...`), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Enqueue
        queueData.push(val);
        const rearIdx = queueData.length - 1;

        yield { 
            snapshot: makeState(`Enqueued ${val} at Rear [Index ${rearIdx}]`), 
            events: [{ type: 'write', targetIds: ['main'], indices: [rearIdx] }], // Green/Purple flash
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // 2. PEEK FRONT
    if (queueData.length > 0) {
        yield { 
            snapshot: makeState(`Peeking Front Element: ${queueData[0]}`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [0] }], // Yellow flash
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    // 3. DEQUEUE PHASE
    while (queueData.length > 0) {
        const val = queueData[0];

        yield { 
            snapshot: makeState(`Dequeueing Front Element (${val})...`), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [0] }], // Red/Purple flash
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Remove from front (Shift)
        queueData.shift();

        yield { 
            snapshot: makeState(`Dequeued ${val}. Elements shifted left.`), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // 4. UNDERFLOW CHECK
    yield { 
        snapshot: makeState("Queue is Empty. Attempting Dequeue..."), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };

    yield { 
        snapshot: makeState("Queue Underflow Error!"), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;