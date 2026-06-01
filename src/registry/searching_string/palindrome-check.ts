import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'palindrome-check',
    name: 'Palindrome Check',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Checks if a string reads the same forwards and backwards using two pointers moving towards the center.',
    pseudocode: [
        'l = 0, r = length(str) - 1',
        'while l < r:',
        '  if str[l] != str[r]: return false',
        '  l++, r--',
        'return true'
    ],
    inputs: [
        {
            id: 'str',
            label: 'Text String',
            type: 'string' as const,
            defaultValue: "RACECAR",
            constraints: { maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    const arr = str.split('');
    const n = arr.length;
    let comparisons = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'text': { type: 'array', id: 'String', data: arr } },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, "Starting Palindrome Check", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    let l = 0;
    let r = n - 1;

    while (l < r) {
        comparisons++;
        yield { 
            snapshot: makeState({ l, r, charL: arr[l], charR: arr[r] }, `Comparing ${arr[l]} vs ${arr[r]}`, 2), 
            events: [
                { type: 'compare', targetIds: ['String'], indices: [l] },
                { type: 'compare', targetIds: ['String'], indices: [r] }
            ],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr[l] !== arr[r]) {
            yield { 
                snapshot: makeState({ l, r }, `Mismatch found! Not a Palindrome.`, 3), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }

        l++;
        r--;
    }

    yield { 
        snapshot: makeState({}, "It is a Palindrome!", 5), 
        events: [{ type: 'lock', targetIds: ['String'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;