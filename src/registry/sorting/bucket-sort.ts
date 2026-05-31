import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'bucket-sort',
    name: 'Bucket Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'Distributes elements into several "buckets" based on value ranges. Each bucket is then sorted individually, and finally, the buckets are concatenated.',
    pseudocode: [
        'function bucketSort(arr, k):',
        '  buckets = create k empty lists',
        '  M = max(arr) + 1',
        '  for x in arr:',
        '    idx = floor(k * x / M)',
        '    buckets[idx].push(x)',
        '  for b in buckets:',
        '    sort(b)',
        '  arr = concatenate(buckets)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (0-49)',
            type: 'array' as const,
            defaultValue: [29, 25, 3, 49, 9, 37, 21, 43, 15, 6],
            constraints: { min: 0, max: 49, maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    
    // Config: 5 Buckets for range 0-49
    const K = 5; 
    const maxVal = 50; 
    
    const buckets: number[][] = Array.from({ length: K }, () => []);
    let comparisons = 0; // Explicitly declared here
    let swaps = 0;
    let writes = 0;

    const makeState = (msg: string, vars: any = {}): AlgoState => {
        const structures: Record<string, any> = {
            'main': { type: 'array', id: 'Main Array', data: [...arr] }
        };
        for (let i = 0; i < K; i++) {
            structures[`b${i}`] = { 
                type: 'array', 
                id: `Bucket ${i} (${i*10}-${(i+1)*10-1})`, 
                data: [...buckets[i]] 
            };
        }
        return {
            structures,
            context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
        };
    };

    yield { snapshot: makeState("Starting Bucket Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. SCATTER
    for (let i = 0; i < n; i++) {
        const val = arr[i];
        const bIdx = Math.floor((K * val) / maxVal);
        
        yield { 
            snapshot: makeState(`Distributing ${val} into Bucket ${bIdx}`, { i, val, bIdx }), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
            metrics: { comparisons, swaps, writes } 
        };

        buckets[bIdx].push(val);
        arr[i] = 0;
        writes++;

        yield { 
            snapshot: makeState(`Moved ${val} to Bucket ${bIdx}`, { i, val, bIdx }), 
            events: [
                { type: 'write', targetIds: ['main'], indices: [i] },
                { type: 'write', targetIds: [`b${bIdx}`], indices: [buckets[bIdx].length - 1] }
            ],
            metrics: { comparisons, swaps, writes } 
        };
    }

    // 2. SORT BUCKETS
    for (let b = 0; b < K; b++) {
        const bucket = buckets[b];
        if (bucket.length <= 1) continue;

        yield { 
            snapshot: makeState(`Sorting Bucket ${b}`, { b }), 
            events: [], 
            metrics: { comparisons, swaps, writes } 
        };

        // Insertion Sort on Bucket
        for (let i = 1; i < bucket.length; i++) {
            let key = bucket[i];
            let j = i - 1;
            
            while (j >= 0) {
                comparisons++; // Increment global counter
                if (bucket[j] > key) {
                    bucket[j + 1] = bucket[j];
                    j--;
                    writes++;
                    
                    yield { 
                        snapshot: makeState(`Sorting Bucket ${b}: Shifting`, { b }), 
                        events: [{ type: 'write', targetIds: [`b${b}`], indices: [j+1, j+2] }],
                        metrics: { comparisons, swaps, writes } 
                    };
                } else {
                    break;
                }
            }
            bucket[j + 1] = key;
        }
        
        yield { 
            snapshot: makeState(`Bucket ${b} Sorted`, { b }), 
            events: [{ type: 'lock', targetIds: [`b${b}`], indices: bucket.map((_, i) => i) }], 
            metrics: { comparisons, swaps, writes } 
        };
    }

    // 3. GATHER
    let mainIdx = 0;
    for (let b = 0; b < K; b++) {
        const bucket = buckets[b];
        
        // We iterate through the bucket, moving items to main
        // To visualize "emptying", we will modify the bucket array in place
        while (bucket.length > 0) {
            const val = bucket.shift()!; // Remove from front (Queue style)
            
            yield { 
                snapshot: makeState(`Gathering ${val} from Bucket ${b}`, { b, mainIdx }), 
                events: [
                    { type: 'visit', targetIds: [`b${b}`], indices: [0] }, // Highlight element leaving
                    { type: 'write', targetIds: ['main'], indices: [mainIdx] }
                ], 
                metrics: { comparisons, swaps, writes: writes + 1 } 
            };

            arr[mainIdx] = val;
            writes++;
            mainIdx++;
        }
        
        // Final state after emptying this bucket
        yield { 
            snapshot: makeState(`Bucket ${b} Empty`, { b, mainIdx }), 
            events: [],
            metrics: { comparisons, swaps, writes } 
        };
    }

    yield { 
        snapshot: makeState("Bucket Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;