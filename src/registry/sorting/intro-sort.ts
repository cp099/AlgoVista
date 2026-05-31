import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'intro-sort',
    name: 'IntroSort',
    category: 'Sorting',
    difficulty: 'Advanced' as const,
    description: 'The real-world algorithm used by C++ std::sort. It starts with Quick Sort. If recursion gets too deep, it switches to Heap Sort. For small arrays, it uses Insertion Sort.',
    pseudocode: [
        'function introSort(arr, depthLimit):',
        '  n = length(arr)',
        '  if n < 16: return insertionSort(arr)',
        '  if depthLimit == 0: return heapSort(arr)',
        '  p = partition(arr)',
        '  introSort(left, depthLimit - 1)',
        '  introSort(right, depthLimit - 1)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [10, 7, 8, 9, 1, 5, 20, 15, 3, 2, 6, 12],
            constraints: { min: 1, max: 99, maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState({}, "Starting IntroSort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // --- INSERTION SORT HELPER ---
    function* insertionSort(low: number, high: number): Generator<any> {
        yield { snapshot: makeState({ low, high, mode: 'Insertion' }, `Size < 4: Switching to Insertion Sort for [${low}..${high}]`), events: [], metrics: { comparisons, swaps, writes: 0 } };
        
        for (let i = low + 1; i <= high; i++) {
            let key = arr[i];
            let j = i - 1;
            while (j >= low && arr[j] > key) {
                comparisons++;
                arr[j + 1] = arr[j];
                j--;
                yield { 
                    snapshot: makeState({ i, j, mode: 'Insertion' }, `Insertion Shift`), 
                    events: [{ type: 'write', targetIds: ['main'], indices: [j+1] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
            arr[j + 1] = key;
            yield { 
                snapshot: makeState({ i, mode: 'Insertion' }, `Inserted ${key}`), 
                events: [{ type: 'write', targetIds: ['main'], indices: [j+1] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
        }
    }

    // --- HEAP SORT HELPER ---
    function* heapify(n: number, i: number, base: number): Generator<any> {
        let largest = i;
        let l = 2 * i + 1;
        let r = 2 * i + 2;

        if (l < n && arr[base + l] > arr[base + largest]) largest = l;
        if (r < n && arr[base + r] > arr[base + largest]) largest = r;

        if (largest !== i) {
            const temp = arr[base + i]; arr[base + i] = arr[base + largest]; arr[base + largest] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ base, mode: 'Heap' }, `Heapify Swap`), 
                events: [{ type: 'swap', targetIds: ['main'], indices: [base+i, base+largest] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* heapify(n, largest, base);
        }
    }

    function* heapSort(low: number, high: number): Generator<any> {
        yield { snapshot: makeState({ low, high, mode: 'Heap' }, `Depth Limit Reached! Switching to Heap Sort for [${low}..${high}]`), events: [], metrics: { comparisons, swaps, writes: 0 } };
        
        const n = high - low + 1;
        // Build Heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            yield* heapify(n, i, low);
        }
        // Extract
        for (let i = n - 1; i > 0; i--) {
            const temp = arr[low]; arr[low] = arr[low + i]; arr[low + i] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ low, high, mode: 'Heap' }, `Heap Pop Max`), 
                events: [{ type: 'swap', targetIds: ['main'], indices: [low, low+i] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* heapify(i, 0, low);
        }
    }

    // --- PARTITION HELPER (QUICK SORT) ---
    function* partition(low: number, high: number): Generator<any> {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            comparisons++;
            yield { 
                snapshot: makeState({ low, high, pivot, mode: 'Quick' }, `QuickSort Partition: compare ${arr[j]} < ${pivot}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [j, high] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            if (arr[j] < pivot) {
                i++;
                const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                swaps++;
                yield { 
                    snapshot: makeState({ i, j, mode: 'Quick' }, `Swap smaller element`), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, j] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
        }
        const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        swaps++;
        yield { 
            snapshot: makeState({ i, high, mode: 'Quick' }, `Place Pivot`), 
            events: [{ type: 'swap', targetIds: ['main'], indices: [i+1, high] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };
        return i + 1;
    }

    // --- MAIN INTROSORT ---
    function* introSortRecursive(low: number, high: number, depthLimit: number): Generator<any> {
        const size = high - low + 1;
        if (size < 4) { // Small size limit (usually 16, artificially 4 here)
            if (size > 1) yield* insertionSort(low, high);
            return;
        }

        if (depthLimit === 0) {
            yield* heapSort(low, high);
            return;
        }

        // Quick Sort Logic
        const pGenerator = partition(low, high);
        let pResult = pGenerator.next();
        while(!pResult.done) { yield pResult.value; pResult = pGenerator.next(); }
        const p = pResult.value as number;

        yield* introSortRecursive(low, p - 1, depthLimit - 1);
        yield* introSortRecursive(p + 1, high, depthLimit - 1);
    }

    // Calc depth limit: 2 * log(n)
    // Artificially low (2) for visualization purposes
    const depthLimit = 2; 
    yield* introSortRecursive(0, n - 1, depthLimit);

    yield { 
        snapshot: makeState({}, "IntroSort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;