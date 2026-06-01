import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'cocktail-sort',
    name: 'Cocktail Shaker Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'A variation of Bubble Sort that traverses the list in both directions alternately. It can be slightly faster than standard Bubble Sort.',
    pseudocode: [
        'swapped = true',
        'start = 0, end = n-1',
        'while swapped:',
        '  swapped = false',
        '  for i from start to end-1:',
        '    if arr[i] > arr[i+1]: swap, swapped = true',
        '  if !swapped: break',
        '  swapped = false, end--',
        '  for i from end-1 down to start:',
        '    if arr[i] > arr[i+1]: swap, swapped = true',
        '  start++'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [5, 1, 4, 2, 8, 0, 2],
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

    let swapped = true;
    let start = 0;
    let end = n - 1;

    yield { snapshot: makeState({ start, end }, "Starting Cocktail Sort", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (swapped) {
        swapped = false;

        // Forward Pass
        for (let i = start; i < end; i++) {
            comparisons++;
            yield { 
                snapshot: makeState({ i, start, end, direction: '-->' }, `Scanning Right: ${arr[i]} > ${arr[i+1]}?`, 5), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+1] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[i] > arr[i + 1]) {
                const temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swaps++;
                swapped = true;
                yield { 
                    snapshot: makeState({ i, start, end, direction: '-->' }, `Swapping ${arr[i]} and ${arr[i+1]}`, 6), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+1] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            }
        }

        if (!swapped) break;

        // Lock end element
        yield { 
            snapshot: makeState({ start, end }, `Element ${arr[end]} is sorted`, 8), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [end] }],
            metrics: { comparisons, swaps, writes: 0 }
        };
        swapped = false;
        end--;

        // Backward Pass
        for (let i = end - 1; i >= start; i--) {
            comparisons++;
            yield { 
                snapshot: makeState({ i, start, end, direction: '<--' }, `Scanning Left: ${arr[i]} > ${arr[i+1]}?`, 9), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+1] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[i] > arr[i + 1]) {
                const temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swaps++;
                swapped = true;
                yield { 
                    snapshot: makeState({ i, start, end, direction: '<--' }, `Swapping ${arr[i]} and ${arr[i+1]}`, 6), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, i+1] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            }
        }

        // Lock start element
        yield { 
            snapshot: makeState({ start, end }, `Element ${arr[start]} is sorted`, 8), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [start] }],
            metrics: { comparisons, swaps, writes: 0 }
        };
        start++;
    }

    yield { 
        snapshot: makeState({}, "Cocktail Sort Complete", 3), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;