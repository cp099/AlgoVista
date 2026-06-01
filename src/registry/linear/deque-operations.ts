import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'deque-operations',
    name: 'Deque (Double-Ended Queue)',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'A Deque allows insertion and deletion from both ends. We visualize this using a circular buffer implementation.',
    pseudocode: [
        'function insertFront(val):',
        '  front = (front - 1 + N) % N',
        '  arr[front] = val',
        '',
        'function insertLast(val):',
        '  arr[rear] = val',
        '  rear = (rear + 1) % N',
        '',
        'function deleteFront():',
        '  val = arr[front]',
        '  front = (front + 1) % N',
        '',
        'function deleteLast():',
        '  rear = (rear - 1 + N) % N',
        '  val = arr[rear]'
    ],
    inputs: [
        {
            id: 'sequence',
            label: 'Values to Insert',
            type: 'array' as const,
            // We will use these values for a scripted sequence of Ops
            defaultValue: [10, 20, 30, 40, 50],
            constraints: { min: 1, max: 99, maxLength: 8 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const sequence = [...(inputs['sequence'] as number[])];
    
    // Fixed Capacity
    const N = 8; 
    const data: (number | string)[] = new Array(N).fill('-'); 
    
    let front = 0;
    let rear = 0;
    let count = 0;

    const makeState = (msg: string, line: number = 0): AlgoState => {
        return {
            structures: { 
                'main': { 
                    type: 'array', 
                    id: `Deque (Size ${N})`, 
                    data: [...data],
                    orientation: 'horizontal',
                    visualMode: 'box' // Force Box Mode
                }
            },
            context: { 
                variables: { front, rear, count, capacity: N }, 
                pseudocodeLine: line, 
                message: msg 
            }
        };
    };

    yield { snapshot: makeState("Deque Initialized (Empty)", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Helpers for logic
    const isFull = () => count === N;
    const isEmpty = () => count === 0;

    // We script a sequence of operations using the input values
    // Op 1: Insert Rear (val 0)
    // Op 2: Insert Front (val 1)
    // Op 3: Insert Rear (val 2)
    // Op 4: Delete Front
    // Op 5: Delete Rear
    // Op 6+: Insert Rear
    
    let step = 0;

    for (const val of sequence) {
        step++;
        
        // --- DECIDE OPERATION BASED ON STEP ---
        // This makes the visualization interesting by mixing front/rear
        
        if (step === 2 || step === 5) {
            // === INSERT FRONT ===
            if (isFull()) {
                yield { snapshot: makeState("Deque Full!", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
                break;
            }

            // Move Front Backwards
            front = (front - 1 + N) % N;
            
            yield { 
                snapshot: makeState(`Insert Front: Moved pointer to ${front}`, 2), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [front] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };

            data[front] = val;
            count++;

            yield { 
                snapshot: makeState(`Inserted ${val} at Front [${front}]`, 3), 
                events: [{ type: 'write', targetIds: ['main'], indices: [front] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };

        } else if (step === 4) {
            // === DELETE FRONT ===
            if (isEmpty()) continue;

            const removed = data[front];
            data[front] = '-';

            yield { 
                snapshot: makeState(`Delete Front: Removing ${removed}`, 10), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [front] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };

            front = (front + 1) % N;
            count--;

            yield { 
                snapshot: makeState(`New Front is ${front}`, 11), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [front] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };

            // Don't consume the input value for a delete op, re-use it next loop? 
            // Nah, just proceed to next input logic.
            
        } else if (step === 6) {
             // === DELETE REAR ===
             if (isEmpty()) continue;

             rear = (rear - 1 + N) % N;
             const removed = data[rear];
             data[rear] = '-';

             yield { 
                snapshot: makeState(`Delete Rear: Removing ${removed} at ${rear}`, 15), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [rear] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
            
            count--;

        } else {
            // === INSERT REAR (Default) ===
            if (isFull()) {
                yield { snapshot: makeState("Deque Full!", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
                break;
            }

            data[rear] = val;
            yield { 
                snapshot: makeState(`Insert Rear: Placed ${val} at ${rear}`, 6), 
                events: [{ type: 'write', targetIds: ['main'], indices: [rear] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };

            rear = (rear + 1) % N;
            count++;

            yield { 
                snapshot: makeState(`New Rear is ${rear}`, 7), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [rear] }], 
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState("Sequence Complete", 1), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:N},(_,k)=>k) }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;