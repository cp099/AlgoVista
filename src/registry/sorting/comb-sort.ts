import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'comb-sort',
    name: 'Comb Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'An improvement over Bubble Sort. It eliminates "turtles" (small values near the end) by using a gap larger than 1. The gap starts large and shrinks by a factor of 1.3.',
    pseudocode: [
        'gap = n',
        'shrink = 1.3',
        'sorted = false',
        'while !sorted:',
        '  gap = floor(gap / shrink)',
        '  if gap <= 1: gap = 1, sorted = true',
        '  else: sorted = false',
        '  for i = 0 to n - gap:',
        '    if arr[i] > arr[i+gap]:',
        '      swap(arr[i], arr[i+gap])',
        '      sorted = false'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [8, 4, 1, 56, 3, -44, 23, -6, 28, 0],
            constraints: { min: -99, max: 99, maxLength: 15 }
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

    let gap = n;
    const shrink = 1.3;
    let sorted = false;

    yield { snapshot: makeState({ gap }, "Starting Comb Sort"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (!sorted) {
        // Update Gap
        gap = Math.floor(gap / shrink);
        if (gap <= 1) {
            gap = 1;
            sorted = true; // Assume sorted if gap is 1, unless we swap later
        }

        yield { 
            snapshot: makeState({ gap }, `Gap reduced to ${gap}`), 
            events: [],
            metrics: { comparisons, swaps, writes: 0 }
        };

        for (let i = 0; i < n - gap; i++) {
            comparisons++;
            yield { 
                snapshot: makeState({ gap, i, j: i+gap }, `Comparing index ${i} and ${i+gap}`), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+gap] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[i] > arr[i + gap]) {
                const temp = arr[i]; arr[i] = arr[i + gap]; arr[i + gap] = temp;
                swaps++;
                sorted = false; // We swapped, so we might not be sorted yet
                
                yield { 
                    snapshot: makeState({ gap, i, j: i+gap }, `Swapping ${arr[i]} and ${arr[i+gap]}`), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+gap] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            }
        }
    }

    yield { 
        snapshot: makeState({}, "Comb Sort Complete"), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;