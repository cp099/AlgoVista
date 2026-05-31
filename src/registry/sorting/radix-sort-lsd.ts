import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'radix-sort-lsd',
    name: 'Radix Sort (LSD)',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'Sorts integers by processing individual digits. LSD (Least Significant Digit) starts from the rightmost digit and moves left, using a stable sort (Counting Sort) for each position.',
    pseudocode: [
        'max = getMax(arr)',
        'exp = 1',
        'while max / exp > 0:',
        '  countingSortByDigit(arr, exp)',
        '  exp *= 10'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (Positive Integers)',
            type: 'array' as const,
            defaultValue: [170, 45, 75, 90, 802, 24, 2, 66],
            constraints: { min: 0, max: 999, maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, writes = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
    });

    const maxVal = Math.max(...arr);
    
    // Process each digit (1s, 10s, 100s...)
    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        
        yield { 
            snapshot: makeState({ exp }, `Sorting by digit place: ${exp}`), 
            events: [],
            metrics: { comparisons, swaps: 0, writes } 
        };

        // Counting Sort logic for this digit
        const output = new Array(n).fill(0);
        const count = new Array(10).fill(0);

        // Store count of occurrences
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(arr[i] / exp) % 10;
            count[digit]++;
            
            yield { 
                snapshot: makeState({ exp, i, digit }, `Scanning ${arr[i]}: digit is ${digit}`), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // Change count[i] so that count[i] now contains actual
        // position of this digit in output[]
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // Build the output array
        // Must go in REVERSE to maintain stability
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            const targetIndex = count[digit] - 1;
            
            output[targetIndex] = arr[i];
            count[digit]--;
            
            yield { 
                snapshot: makeState({ exp, i, targetIndex }, `Moving ${arr[i]} based on digit ${digit}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // Copy the output array to arr[], so that arr[] now
        // contains sorted numbers according to current digit
        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            writes++;
            yield { 
                snapshot: makeState({ exp, i }, `Updating main array`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }
    }

    yield { 
        snapshot: makeState({}, "Radix Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;