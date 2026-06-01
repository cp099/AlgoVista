import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'odd-even-sort',
    name: 'Odd-Even Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'A variation of Bubble Sort designed for parallel processors. It compares all odd/even indexed pairs of adjacent elements in two alternating phases.',
    pseudocode: [
        'sorted = false',
        'while !sorted:',
        '  sorted = true',
        '  for i = 1 to n-2 by 2:',
        '    if arr[i] > arr[i+1]: swap, sorted = false',
        '  for i = 0 to n-2 by 2:',
        '    if arr[i] > arr[i+1]: swap, sorted = false'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [5, 2, 9, 1, 5, 6],
            constraints: { min: 1, max: 99, maxLength: 15 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    let sorted = false;
    
    yield { snapshot: makeState({}, "Starting Odd-Even Sort", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (!sorted) {
        sorted = true;

        // ODD PHASE
        yield { 
            snapshot: makeState({ phase: 'ODD' }, "Phase 1: Odd Indices", 4), 
            events: [],
            metrics: { comparisons, swaps, writes: 0 } 
        };

        for (let i = 1; i <= n - 2; i += 2) {
            comparisons++;
            yield { 
                snapshot: makeState({ phase: 'ODD', i, j: i+1 }, `Checking ${arr[i]} vs ${arr[i+1]}`, 5), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+1] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };

            if (arr[i] > arr[i + 1]) {
                const temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swaps++;
                sorted = false;
                yield { 
                    snapshot: makeState({ phase: 'ODD', i, j: i+1 }, `Swapping ${arr[i]} and ${arr[i+1]}`, 5), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+1] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
        }

        // EVEN PHASE
        yield { 
            snapshot: makeState({ phase: 'EVEN' }, "Phase 2: Even Indices", 6), 
            events: [],
            metrics: { comparisons, swaps, writes: 0 } 
        };

        for (let i = 0; i <= n - 2; i += 2) {
            comparisons++;
            yield { 
                snapshot: makeState({ phase: 'EVEN', i, j: i+1 }, `Checking ${arr[i]} vs ${arr[i+1]}`, 5), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+1] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };

            if (arr[i] > arr[i + 1]) {
                const temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swaps++;
                sorted = false;
                yield { 
                    snapshot: makeState({ phase: 'EVEN', i, j: i+1 }, `Swapping ${arr[i]} and ${arr[i+1]}`, 5), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+1] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
        }
    }

    yield { 
        snapshot: makeState({}, "Odd-Even Sort Complete", 2), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;