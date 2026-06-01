import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'sliding-window-maximum',
    name: 'Sliding Window Maximum',
    category: 'Linear Data Structures',
    difficulty: 'Hard' as const,
    description: 'Finds the maximum in each subarray of size k. This is solved in O(n) time using a Deque to maintain a monotonically decreasing list of indices.',
    pseudocode: [
        'deque = []',
        'result = []',
        'for i from 0 to n-1:',
        '  // Remove elements outside window from front',
        '  if deque.front <= i - k: deque.popFront()',
        '  // Maintain decreasing order from front',
        '  while !deque.empty and arr[deque.back] <= arr[i]:',
        '    deque.popBack()',
        '  deque.pushBack(i)',
        '  if i >= k - 1: result.push(arr[deque.front])'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [1, 3, -1, -3, 5, 3, 6, 7],
            constraints: { min: -99, max: 99, maxLength: 10 }
        },
        {
            id: 'k',
            label: 'Window Size (k)',
            type: 'integer' as const,
            defaultValue: 3
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const k = inputs['k'] as number;
    const n = arr.length;
    
    // Internal state
    const result: number[] = [];
    // Deque stores INDICES
    const deque: number[] = []; 

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'input': { type: 'array', id: 'Input', data: [...arr], visualMode: 'bar' },
            'deque': { type: 'array', id: 'Deque (Indices)', data: [...deque], visualMode: 'box' },
            'result': { type: 'array', id: 'Result (Max Values)', data: [...result], visualMode: 'box' }
        },
        context: { pseudocodeLine: line, variables: { k, ...vars }, message: msg }
    });

    yield { snapshot: makeState("Initialized", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n; i++) {
        yield { 
            snapshot: makeState(`Processing index ${i} (Value: ${arr[i]})`, { i }, 3), 
            events: [{ type: 'visit', targetIds: ['Input'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // 1. Remove from front if out of window
        if (deque.length > 0 && deque[0] <= i - k) {
            const removed = deque.shift()!;
            yield { 
                snapshot: makeState(`Index ${removed} is out of window. Popping from Deque front.`, { i }, 5), 
                events: [{ type: 'visit', targetIds: ['Deque (Indices)'], indices: [0] }],
                metrics: { comparisons: 1, swaps: 0, writes: 0 } 
            };
        }

        // 2. Maintain decreasing order
        while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
            const removed = deque.pop()!;
            yield { 
                snapshot: makeState(`arr[${removed}]=${arr[removed]} <= arr[${i}]=${arr[i]}. Popping from Deque back.`, { i }, 7), 
                events: [
                    { type: 'compare', targetIds: ['Input'], indices: [removed, i] },
                    { type: 'visit', targetIds: ['Deque (Indices)'], indices: [deque.length] }
                ],
                metrics: { comparisons: 1, swaps: 0, writes: 0 } 
            };
        }

        // 3. Push current index
        deque.push(i);
        yield { 
            snapshot: makeState(`Pushing index ${i} to Deque back.`, {}, 9), 
            events: [{ type: 'write', targetIds: ['Deque (Indices)'], indices: [deque.length-1] }],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };

        // 4. If window is full, push result
        if (i >= k - 1) {
            const maxIdx = deque[0];
            result.push(arr[maxIdx]);
            yield { 
                snapshot: makeState(`Window max is ${arr[maxIdx]}. Pushing to result.`, {}, 2), 
                events: [
                    { type: 'lock', targetIds: ['Deque (Indices)'], indices: [0] },
                    { type: 'write', targetIds: ['Result (Max Values)'], indices: [result.length-1] }
                ],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
        }
    }

    yield { 
        snapshot: makeState("Complete", {}, 1), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;