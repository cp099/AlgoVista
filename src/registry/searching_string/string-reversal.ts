import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'string-reversal',
    name: 'String Reversal',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Reverses a string in-place using two pointers. It swaps the characters at the start and end, then moves the pointers towards the center.',
    pseudocode: [
        'l = 0, r = length(str) - 1',
        'while l < r:',
        '  swap(str[l], str[r])',
        '  l++, r--'
    ],
    inputs: [
        {
            id: 'str',
            label: 'Text String',
            type: 'string' as const,
            defaultValue: "ALGOVISTA",
            constraints: { maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    const arr = str.split('');
    const n = arr.length;
    let swaps = 0;

    const makeState = (vars: any = {}, msg: string = ''): AlgoState => ({
        structures: { 'text': { type: 'array', id: 'String', data: [...arr] } },
        context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState({}, "Starting String Reversal"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    let l = 0;
    let r = n - 1;

    while (l < r) {
        yield { 
            snapshot: makeState({ l, r }, `Selecting indices ${l} and ${r}`), 
            events: [
                { type: 'visit', targetIds: ['String'], indices: [l] },
                { type: 'visit', targetIds: ['String'], indices: [r] }
            ],
            metrics: { comparisons: 0, swaps, writes: 0 } 
        };

        // Swap
        const temp = arr[l];
        arr[l] = arr[r];
        arr[r] = temp;
        swaps++;

        yield { 
            snapshot: makeState({ l, r }, `Swapping ${arr[l]} and ${arr[r]}`), 
            events: [
                { type: 'swap', targetIds: ['String'], indices: [l] },
                { type: 'swap', targetIds: ['String'], indices: [r] }
            ],
            metrics: { comparisons: 0, swaps, writes: 0 } 
        };

        l++;
        r--;
    }

    yield { 
        snapshot: makeState({}, "Reversal Complete"), 
        events: [{ type: 'lock', targetIds: ['String'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons: 0, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;