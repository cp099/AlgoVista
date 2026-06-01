import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'circular-queue',
    name: 'Circular Queue',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'A fixed-size queue that connects the end back to the start to avoid wasting space. It uses modulo arithmetic for the pointers.',
    pseudocode: [
        'function enqueue(val):',
        '  if (rear + 1) % N == front: return Full',
        '  arr[rear] = val',
        '  rear = (rear + 1) % N',
        '  count++',
        '',
        'function dequeue():',
        '  if count == 0: return Empty',
        '  val = arr[front]',
        '  front = (front + 1) % N',
        '  count--',
        '  return val'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Sequence',
            type: 'array' as const,
            // Designed to trigger wrap-around: Fill 5, Remove 2, Add 3
            defaultValue: [10, 20, 30, 40, 50, 60, 70, 80],
            constraints: { min: 1, max: 99, maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Fixed Capacity
    const N = 6; 
    const queueData: (number | string)[] = new Array(N).fill('-'); // '-' denotes empty
    
    let front = 0;
    let rear = 0;
    let count = 0;

    const makeState = (msg: string, line: number = 0): AlgoState => {
        return {
            structures: { 
                'main': { 
                    type: 'array', 
                    id: `Circular Queue (Size ${N})`, 
                    data: [...queueData],
                    orientation: 'horizontal',
                    visualMode: 'box'
                }
            },
            context: { 
                variables: { front, rear, count, capacity: N }, 
                pseudocodeLine: line, 
                message: msg 
            }
        };
    };

    yield { snapshot: makeState("Initialized Fixed Array", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Simulation Logic:
    // We will Enqueue elements. If full, we Dequeue one to make space, demonstrating the cycle.
    
    for (const val of sequence) {
        // 1. Check Full
        if (count === N) {
            yield { 
                snapshot: makeState(`Queue is Full! Need to Dequeue to make space for ${val}`, 2), 
                events: [],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
            
            // Auto-Dequeue
            const removed = queueData[front];
            queueData[front] = '-'; // Mark empty visual
            
            yield { 
                snapshot: makeState(`Dequeuing ${removed} from index ${front}`, 9), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [front] }], // Red flash
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };

            front = (front + 1) % N;
            count--;
            
            yield { 
                snapshot: makeState(`Front moved to ${front} (Wrap around logic)`, 10), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [front] }], // Highlight new front
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
        }

        // 2. Enqueue
        queueData[rear] = val;
        
        yield { 
            snapshot: makeState(`Enqueuing ${val} at Rear index ${rear}`, 3), 
            events: [{ type: 'write', targetIds: ['main'], indices: [rear] }], // Green flash
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };

        rear = (rear + 1) % N;
        count++;

        yield { 
            snapshot: makeState(`Rear moved to ${rear}`, 4), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    yield { 
        snapshot: makeState("Sequence Complete", 1), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:N},(_,k)=>k) }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;