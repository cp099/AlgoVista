import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'A non-comparative integer sorting algorithm. It operates by counting the number of objects that have each distinct key value.',
    pseudocode: [
        'function countingSort(arr):',
        '  max = findMax(arr)',
        '  counts = new Array(max + 1).fill(0)',
        '  for x in arr:',
        '    counts[x]++',
        '  k = 0',
        '  for i from 0 to max:',
        '    while counts[i] > 0:',
        '      arr[k] = i',
        '      counts[i]--',
        '      k++'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (Values 0-9)',
            type: 'array' as const,
            // Counting sort needs small numbers for visual clarity
            defaultValue: [4, 2, 2, 8, 3, 3, 1], 
            constraints: { min: 0, max: 9, maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    
    // Find range
    const maxVal = Math.max(...arr);
    // Initialize count array
    const countArr = new Array(maxVal + 1).fill(0);

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 
            'main': { type: 'array', id: 'Input Array', data: [...arr] },
            'counts': { type: 'array', id: 'Count Array', data: [...countArr] }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, "Initialize Count Array (Size = MaxVal + 1)", 3), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. COUNT FREQUENCIES
    for (let i = 0; i < n; i++) {
        const val = arr[i];
        
        yield { 
            snapshot: makeState({ i, val }, `Reading Input[${i}] = ${val}`, 4), 
            events: [{ type: 'visit', targetIds: ['Input Array'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        countArr[val]++;
        
        yield { 
            snapshot: makeState({ i, val }, `Incrementing Count[${val}]`, 5), 
            events: [{ type: 'write', targetIds: ['Count Array'], indices: [val] }],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // 2. RECONSTRUCT
    let k = 0;
    for (let i = 0; i <= maxVal; i++) {
        while (countArr[i] > 0) {
            yield { 
                snapshot: makeState({ i, count: countArr[i] }, `Count[${i}] is > 0. Restoring ${i} to Input.`, 7), 
                events: [{ type: 'visit', targetIds: ['Count Array'], indices: [i] }],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };

            arr[k] = i;
            countArr[i]--;
            
            yield { 
                snapshot: makeState({ i, k }, `Overwriting Input[${k}] with ${i}`, 9), 
                events: [
                    { type: 'write', targetIds: ['Input Array'], indices: [k] },
                    { type: 'write', targetIds: ['Count Array'], indices: [i] } // Show count decreasing
                ],
                metrics: { comparisons: 0, swaps: 0, writes: 1 } 
            };
            k++;
        }
    }

    yield { 
        snapshot: makeState({}, "Counting Sort Complete", 7), 
        events: [{ type: 'lock', targetIds: ['Input Array'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;