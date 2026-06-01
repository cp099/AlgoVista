import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'pigeonhole-sort',
    name: 'Pigeonhole Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'Suitable for sorting lists where the number of elements (n) and the range of possible key values (N) are approximately the same. It maps items to "pigeonholes" (buckets of size 1).',
    pseudocode: [
        'min = min(arr), max = max(arr)',
        'range = max - min + 1',
        'holes = new Array(range).fill(0)',
        'for x in arr: holes[x - min]++',
        'i = 0',
        'for count in holes:',
        '  while count > 0:',
        '    arr[i++] = index + min',
        '    count--'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (Values 0-20)',
            type: 'array' as const,
            defaultValue: [8, 3, 2, 7, 4, 6, 8, 12, 1, 9],
            constraints: { min: 0, max: 20, maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, writes = 0;

    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const range = maxVal - minVal + 1;
    
    // We treat the holes as counts, similar to Counting Sort
    // We visualize this using our Bucket/Multi-Array system
    // We will create one "Holes" array structure that holds the counts
    const holes = new Array(range).fill(0);

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'main': { type: 'array', id: 'Input Array', data: [...arr] },
            // We visualize the holes as a secondary array
            'holes': { type: 'array', id: `Pigeonholes (Range ${minVal}-${maxVal})`, data: [...holes] }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Pigeonhole Sort", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. FILL HOLES
    for (let i = 0; i < n; i++) {
        const val = arr[i];
        const idx = val - minVal;
        
        yield { 
            snapshot: makeState(`Reading ${val}`, { i, val }, 4), 
            events: [{ type: 'visit', targetIds: ['Input Array'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes } 
        };

        holes[idx]++;
        writes++;
        
        yield { 
            snapshot: makeState(`Placing into Hole ${idx} (Value ${val})`, { i, val, idx }, 4), 
            events: [{ type: 'write', targetIds: ['Pigeonholes (Range ' + minVal + '-' + maxVal + ')'], indices: [idx] }],
            metrics: { comparisons: 0, swaps: 0, writes } 
        };
    }

    // 2. EMPTY HOLES
    let index = 0;
    for (let j = 0; j < range; j++) {
        while (holes[j] > 0) {
            holes[j]--;
            arr[index] = j + minVal;
            writes++;

            yield { 
                snapshot: makeState(`Restoring ${j + minVal} from Hole ${j}`, { index, val: j+minVal }, 8), 
                events: [
                    { type: 'write', targetIds: ['Input Array'], indices: [index] },
                    { type: 'write', targetIds: ['Pigeonholes (Range ' + minVal + '-' + maxVal + ')'], indices: [j] }
                ],
                metrics: { comparisons: 0, swaps: 0, writes } 
            };
            index++;
        }
    }

    yield { 
        snapshot: makeState("Pigeonhole Sort Complete", {}, 6), 
        events: [{ type: 'lock', targetIds: ['Input Array'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;