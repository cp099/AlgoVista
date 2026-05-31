import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'stooge-sort',
    name: 'Stooge Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'A recursive sorting algorithm with very poor time complexity O(n^2.7). It swaps the start/end if needed, then recursively sorts the first 2/3, last 2/3, and first 2/3 again.',
    pseudocode: [
        'function stoogeSort(arr, l, h):',
        '  if l >= h: return',
        '  if arr[l] > arr[h]: swap(arr[l], arr[h])',
        '  if h - l + 1 > 2:',
        '    t = floor((h - l + 1) / 3)',
        '    stoogeSort(arr, l, h - t)',
        '    stoogeSort(arr, l + t, h)',
        '    stoogeSort(arr, l, h - t)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            // Keep input small because Stooge is REALLY slow
            defaultValue: [5, 2, 4, 1, 3],
            constraints: { min: 1, max: 99, maxLength: 8 }
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

    yield { snapshot: makeState({}, "Starting Stooge Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    function* stoogeSort(l: number, h: number): Generator<any> {
        if (l >= h) return;

        comparisons++;
        yield { 
            snapshot: makeState({ l, h }, `Checking boundaries: ${arr[l]} > ${arr[h]}?`), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [l, h] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };

        if (arr[l] > arr[h]) {
            const temp = arr[l]; arr[l] = arr[h]; arr[h] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ l, h }, `Swapping boundaries`), 
                events: [{ type: 'swap', targetIds: ['main'], indices: [l, h] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
        }

        if (h - l + 1 > 2) {
            const t = Math.floor((h - l + 1) / 3);
            
            yield { 
                snapshot: makeState({ l, h, t }, `Recursively sorting first 2/3: [${l}..${h-t}]`), 
                events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: h-t-l+1}, (_, i) => l+i) }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* stoogeSort(l, h - t);

            yield { 
                snapshot: makeState({ l, h, t }, `Recursively sorting last 2/3: [${l+t}..${h}]`), 
                events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: h-(l+t)+1}, (_, i) => l+t+i) }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* stoogeSort(l + t, h);

            yield { 
                snapshot: makeState({ l, h, t }, `Recursively sorting first 2/3 again: [${l}..${h-t}]`), 
                events: [{ type: 'visit', targetIds: ['main'], indices: Array.from({length: h-t-l+1}, (_, i) => l+i) }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            yield* stoogeSort(l, h - t);
        }
    }

    yield* stoogeSort(0, n - 1);

    yield { 
        snapshot: makeState({}, "Stooge Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;