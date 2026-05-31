import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'shell-sort',
    name: 'Shell Sort',
    category: 'Sorting',
    difficulty: 'Medium' as const,
    description: 'An optimization of Insertion Sort. It allows the exchange of items that are far apart. It starts with a large "gap" and reduces it until the gap is 1.',
    pseudocode: [
        'function shellSort(arr):',
        '  gap = length(arr) / 2',
        '  while gap > 0:',
        '    for i from gap to n-1:',
        '      temp = arr[i]',
        '      j = i',
        '      while j >= gap and arr[j-gap] > temp:',
        '        arr[j] = arr[j-gap]',
        '        j -= gap',
        '      arr[j] = temp',
        '    gap = floor(gap / 2)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [23, 12, 1, 8, 34, 54, 2, 3],
            constraints: { min: 1, max: 99, maxLength: 15 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, writes = 0;

    const makeState = (vars: any = {}, line: number = 0, msg: string = ''): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, 1, "Starting Shell Sort..."), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        
        yield { 
            snapshot: makeState({ gap }, 2, `Reducing Gap to ${gap}`),
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };

        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;

            yield { 
                snapshot: makeState({ gap, i, temp, j }, 4, `Selecting ${temp} at index ${i}`),
                events: [{ type: 'visit', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            while (j >= gap) {
                comparisons++;
                yield { 
                    snapshot: makeState({ gap, i, temp, j, cmp: j-gap }, 6, `Comparing ${arr[j-gap]} > ${temp}?`),
                    events: [{ type: 'compare', targetIds: ['main'], indices: [j, j - gap] }],
                    metrics: { comparisons, swaps: 0, writes }
                };

                if (arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    writes++;
                    
                    yield { 
                        snapshot: makeState({ gap, i, temp, j }, 7, `Moving ${arr[j-gap]} to position ${j}`),
                        events: [{ type: 'write', targetIds: ['main'], indices: [j] }],
                        metrics: { comparisons, swaps: 0, writes }
                    };
                    
                    j -= gap;
                } else {
                    break;
                }
            }
            
            arr[j] = temp;
            writes++;
            yield { 
                snapshot: makeState({ gap, i, temp, j }, 10, `Inserted ${temp} at position ${j}`),
                events: [{ type: 'write', targetIds: ['main'], indices: [j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield { 
        snapshot: makeState({}, 11, "Shell Sort Complete."), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length: n}, (_, k) => k) }], 
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;