import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'cycle-sort',
    name: 'Cycle Sort',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'A sorting algorithm that is optimal in terms of memory writes. It effectively decomposes the array into cycles and rotates them to their correct positions.',
    pseudocode: [
        'for cycleStart from 0 to n - 2:',
        '  item = arr[cycleStart]',
        '  pos = cycleStart',
        '  for i from cycleStart + 1 to n - 1:',
        '    if arr[i] < item: pos++',
        '  if pos == cycleStart: continue',
        '  while item == arr[pos]: pos++',
        '  swap(item, arr[pos])',
        '  while pos != cycleStart:',
        '    pos = cycleStart',
        '    for i from cycleStart + 1 to n - 1:',
        '      if arr[i] < item: pos++',
        '    while item == arr[pos]: pos++',
        '    swap(item, arr[pos])'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array',
            type: 'array' as const,
            defaultValue: [20, 40, 50, 10, 30],
            constraints: { min: 1, max: 99, maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, writes = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, "Starting Cycle Sort", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let cycleStart = 0; cycleStart <= n - 2; cycleStart++) {
        let item = arr[cycleStart];
        let pos = cycleStart;

        yield { 
            snapshot: makeState({ cycleStart, item, pos }, `Processing Cycle starting at ${cycleStart}`, 1), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [cycleStart] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        // Find position where we put the item
        for (let i = cycleStart + 1; i < n; i++) {
            comparisons++;
            yield { 
                snapshot: makeState({ cycleStart, i, item }, `Comparing ${arr[i]} < ${item}?`, 4), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
            if (arr[i] < item) {
                pos++;
            }
        }

        // If item is already in correct position
        if (pos === cycleStart) continue;

        // Skip duplicates
        while (item === arr[pos]) {
            pos++;
        }

        // Put the item there or swap
        if (pos !== cycleStart) {
            const temp = arr[pos];
            arr[pos] = item;
            item = temp;
            writes++;
            
            yield { 
                snapshot: makeState({ cycleStart, pos, item: temp }, `Writing item to position ${pos}`, 8), 
                events: [{ type: 'write', targetIds: ['main'], indices: [pos] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // Rotate rest of the cycle
        while (pos !== cycleStart) {
            pos = cycleStart;
            for (let i = cycleStart + 1; i < n; i++) {
                comparisons++;
                if (arr[i] < item) {
                    pos++;
                }
            }

            while (item === arr[pos]) {
                pos++;
            }

            if (item !== arr[pos]) {
                const temp = arr[pos];
                arr[pos] = item;
                item = temp;
                writes++;
                
                yield { 
                    snapshot: makeState({ cycleStart, pos, item: temp }, `Rotating cycle: writing to ${pos}`, 14), 
                    events: [{ type: 'write', targetIds: ['main'], indices: [pos] }],
                    metrics: { comparisons, swaps: 0, writes } 
                };
            }
        }
    }

    yield { 
        snapshot: makeState({}, "Cycle Sort Complete", 1), 
        events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;