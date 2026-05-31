import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'radix-sort-msd',
    name: 'Radix Sort (MSD)',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'Sorts by processing the Most Significant Digit first. It partitions the array into buckets based on the current digit, then recursively sorts each bucket.',
    pseudocode: [
        'function msdSort(arr, low, high, d):',
        '  if low >= high or d < 0: return',
        '  count = new Array(10 + 2).fill(0)',
        '  for i in low..high:',
        '    c = getDigit(arr[i], d)',
        '    count[c + 2]++',
        '  for r in 0..10:',
        '    count[r+1] += count[r]',
        '  for i in low..high:',
        '    c = getDigit(arr[i], d)',
        '    aux[count[c+1]++] = arr[i]',
        '  for i in low..high:',
        '    arr[i] = aux[i - low]',
        '  for r in 0..10:',
        '    msdSort(arr, low + count[r], low + count[r+1] - 1, d - 1)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
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
    const maxDigits = Math.floor(Math.log10(maxVal)) + 1;

    // Helper: get digit at position d (0 = 1s, 1 = 10s...)
    const getDigit = (num: number, d: number) => Math.floor(num / Math.pow(10, d)) % 10;

    function* msdSort(lo: number, hi: number, d: number): Generator<any> {
        if (lo >= hi || d < 0) return;

        yield { 
            snapshot: makeState({ lo, hi, d }, `Sorting range [${lo}, ${hi}] by digit ${Math.pow(10, d)}`), 
            events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: hi-lo+1}, (_, k) => k + lo) }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        const count = new Array(10 + 2).fill(0);
        const aux = new Array(hi - lo + 1).fill(0);

        // 1. Count frequencies
        for (let i = lo; i <= hi; i++) {
            const digit = getDigit(arr[i], d);
            count[digit + 2]++;
        }

        // 2. Compute cumulates
        for (let r = 0; r < 10 + 1; r++) {
            count[r + 1] += count[r];
        }

        // 3. Distribute to Aux
        for (let i = lo; i <= hi; i++) {
            const digit = getDigit(arr[i], d);
            const targetPos = count[digit + 1]++;
            aux[targetPos] = arr[i];
            
            yield { 
                snapshot: makeState({ lo, hi, val: arr[i] }, `Bucketing ${arr[i]} based on digit ${digit}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // 4. Copy back
        for (let i = lo; i <= hi; i++) {
            arr[i] = aux[i - lo];
            writes++;
            yield { 
                snapshot: makeState({ lo, hi, i }, `Copying back sorted chunk`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // 5. Recursively sort sub-buckets
        // We reset count to start positions to iterate buckets correctly
        // (count array was modified in step 3, so we need to be careful or recompute)
        // Simplification: Recalculate ranges.
        // Actually, in the standard algo, the `count` array in step 3 ends up shifting.
        // Let's use the logic where we stored the starts.
        
        // Rebuild count for recursion boundaries
        const ranges = new Array(10 + 2).fill(0);
        for (let i = 0; i < aux.length; i++) {
             const digit = getDigit(aux[i], d);
             ranges[digit + 2]++;
        }
        for (let r = 0; r < 10 + 1; r++) ranges[r + 1] += ranges[r];

        for (let r = 0; r < 10; r++) {
            yield* msdSort(lo + ranges[r], lo + ranges[r + 1] - 1, d - 1);
        }
    }

    yield { snapshot: makeState({}, "Starting MSD Radix Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
    
    yield* msdSort(0, n - 1, maxDigits - 1);

    yield { 
        snapshot: makeState({}, "Radix Sort MSD Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;