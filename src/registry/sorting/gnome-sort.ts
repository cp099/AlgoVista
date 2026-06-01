import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'gnome-sort',
    name: 'Gnome Sort',
    category: 'Sorting',
    difficulty: 'Easy' as const,
    description: 'Based on the concept of a garden gnome sorting flower pots. If two pots are out of order, he swaps them and steps back. Otherwise, he steps forward.',
    pseudocode: [
        'pos = 0',
        'while pos < length(arr):',
        '  if pos == 0 or arr[pos] >= arr[pos-1]:',
        '    pos = pos + 1',
        '  else:',
        '    swap(arr[pos], arr[pos-1])',
        '    pos = pos - 1'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [34, 2, 10, -9, 5, 23, 0],
            constraints: { min: -99, max: 99, maxLength: 15 }
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

    let pos = 0;
    yield { snapshot: makeState({ pos }, "Starting Gnome Sort", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    while (pos < n) {
        if (pos === 0) {
            pos++;
            yield { 
                snapshot: makeState({ pos }, "At start, stepping forward"), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [pos] }],
                metrics: { comparisons, swaps, writes: 0 }
            };
        } else {
            comparisons++;
            yield { 
                snapshot: makeState({ pos }, `Comparing ${arr[pos]} vs ${arr[pos-1]}`, 3), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [pos, pos-1] }],
                metrics: { comparisons, swaps, writes: 0 }
            };

            if (arr[pos] >= arr[pos - 1]) {
                pos++;
                yield { 
                    snapshot: makeState({ pos }, "Order correct, stepping forward"), 
                    events: [{ type: 'visit', targetIds: ['main'], indices: [pos] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
            } else {
                const temp = arr[pos]; arr[pos] = arr[pos - 1]; arr[pos - 1] = temp;
                swaps++;
                yield { 
                    snapshot: makeState({ pos }, `Swapping and stepping back`, 6), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [pos, pos-1] }],
                    metrics: { comparisons, swaps, writes: 0 }
                };
                pos--;
            }
        }
    }

    yield { 
        snapshot: makeState({}, "Gnome Sort Complete", 2), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;