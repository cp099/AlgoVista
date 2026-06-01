import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'tim-sort',
    name: 'Tim Sort',
    category: 'Sorting',
    difficulty: 'Advanced' as const,
    description: 'A hybrid sorting algorithm derived from merge sort and insertion sort. It divides the array into small "runs", sorts them with Insertion Sort, and then merges them.',
    pseudocode: [
        'RUN = 4',
        'for i from 0 to n by RUN:',
        '  insertionSort(arr, i, min(i + RUN - 1, n - 1))',
        'for size from RUN to n by 2*size:',
        '  for left from 0 to n by 2*size:',
        '    mid = left + size - 1',
        '    right = min(left + 2*size - 1, n - 1)',
        '    merge(arr, left, mid, right)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [5, 21, 7, 23, 19, 1, 15, 6, 2, 10, 14, 3, 9, 8, 12, 11], // 16 items perfect for size 4 runs
            constraints: { min: 1, max: 99, maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    const RUN = 4; // Small run size for visualization
    let comparisons = 0, writes = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, RUN, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, "Starting TimSort (Run Size = 4)", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // --- HELPER: Insertion Sort for a range ---
    function* insertionSort(left: number, right: number): Generator<any> {
        yield { 
            snapshot: makeState({ left, right }, `Processing Run [${left}..${right}] using Insertion Sort`, 3), 
            events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: right-left+1}, (_, k) => k + left) }],
            metrics: { comparisons, swaps: 0, writes }
        };

        for (let i = left + 1; i <= right; i++) {
            const key = arr[i];
            let j = i - 1;
            while (j >= left && arr[j] > key) {
                comparisons++;
                yield { 
                    snapshot: makeState({ left, right, i, j, key }, `Insertion: ${arr[j]} > ${key}, Shifting`), 
                    events: [{ type: 'compare', targetIds: ['main'], indices: [j, j+1] }],
                    metrics: { comparisons, swaps: 0, writes }
                };

                arr[j + 1] = arr[j];
                writes++;
                
                yield { 
                    snapshot: makeState({ left, right, i, j, key }, `Shifting`, 3), 
                    events: [{ type: 'write', targetIds: ['main'], indices: [j+1] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                j--;
            }
            arr[j + 1] = key;
            writes++;
            yield { 
                snapshot: makeState({ left, right, i, key }, `Inserted ${key}`, 3), 
                events: [{ type: 'write', targetIds: ['main'], indices: [j+1] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    // --- HELPER: Merge for a range ---
    function* merge(l: number, m: number, r: number): Generator<any> {
        const len1 = m - l + 1;
        const len2 = r - m;
        const leftArr = new Array(len1);
        const rightArr = new Array(len2);

        for (let i = 0; i < len1; i++) leftArr[i] = arr[l + i];
        for (let i = 0; i < len2; i++) rightArr[i] = arr[m + 1 + i];

        let i = 0, j = 0, k = l;

        yield { 
            snapshot: makeState({ l, m, r }, `Merging runs [${l}..${m}] and [${m+1}..${r}]`, 8), 
            events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: r-l+1}, (_, idx) => idx + l) }],
            metrics: { comparisons, swaps: 0, writes }
        };

        while (i < len1 && j < len2) {
            comparisons++;
            yield { 
                snapshot: makeState({ i, j, k, leftVal: leftArr[i], rightVal: rightArr[j] }, `Comparing ${leftArr[i]} vs ${rightArr[j]}`, 8), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [l+i, m+1+j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            writes++;
            yield { 
                snapshot: makeState({ k }, `Writing to position ${k}`, 8), 
                events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            k++;
        }

        while (i < len1) {
            arr[k] = leftArr[i];
            writes++;
            yield { 
                snapshot: makeState({ k }, `Copying remaining left`, 8), 
                events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            k++; i++;
        }
        while (j < len2) {
            arr[k] = rightArr[j];
            writes++;
            yield { 
                snapshot: makeState({ k }, `Copying remaining right`, 8), 
                events: [{ type: 'write', targetIds: ['main'], indices: [k] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            k++; j++;
        }
    }

    // 1. Sort individual subarrays of size RUN
    for (let i = 0; i < n; i += RUN) {
        yield* insertionSort(i, Math.min((i + RUN - 1), (n - 1)));
    }

    // 2. Merge runs
    for (let size = RUN; size < n; size = 2 * size) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = left + size - 1;
            const right = Math.min((left + 2 * size - 1), (n - 1));

            if (mid < right) {
                yield* merge(left, mid, right);
            }
        }
    }

    yield { 
        snapshot: makeState({}, "TimSort Complete", 4), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;