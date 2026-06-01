import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'hamming-distance',
    name: 'Hamming Distance',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Calculates the Hamming distance between two strings of equal length. It counts the number of positions where the corresponding characters are different.',
    pseudocode: [
        'if len(s1) != len(s2): error',
        'dist = 0',
        'for i from 0 to n-1:',
        '  if s1[i] != s2[i]: dist++',
        'return dist'
    ],
    inputs: [
        {
            id: 's1',
            label: 'String 1',
            type: 'string' as const,
            defaultValue: "KAROLIN",
            constraints: { maxLength: 10 }
        },
        {
            id: 's2',
            label: 'String 2',
            type: 'string' as const,
            defaultValue: "KATHRIN"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const s1 = String(inputs['s1']);
    const s2 = String(inputs['s2']);
    const arr1 = s1.split('');
    const arr2 = s2.split('');
    
    let dist = 0;
    let comparisons = 0;

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            's1': { type: 'array', id: 'String 1', data: arr1 },
            's2': { type: 'array', id: 'String 2', data: arr2 }
        },
        context: { variables: { ...vars, dist }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Hamming Distance", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    if (s1.length !== s2.length) {
        yield { snapshot: makeState("Error: Lengths must be equal", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
        return;
    }

    for (let i = 0; i < s1.length; i++) {
        comparisons++;
        yield { 
            snapshot: makeState(`Comparing index ${i}: ${arr1[i]} vs ${arr2[i]}`, { i }, 3), 
            events: [
                { type: 'compare', targetIds: ['String 1'], indices: [i] },
                { type: 'compare', targetIds: ['String 2'], indices: [i] }
            ],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (arr1[i] !== arr2[i]) {
            dist++;
            yield { 
                snapshot: makeState(`Mismatch! Distance incremented to ${dist}`, { i }, 4), 
                events: [
                    { type: 'write', targetIds: ['String 1'], indices: [i] }, // Using write to show "change/diff" color (Purple)
                    { type: 'write', targetIds: ['String 2'], indices: [i] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        } else {
            yield { 
                snapshot: makeState(`Match. Distance remains ${dist}`, { i }, 3), 
                events: [
                    { type: 'lock', targetIds: ['String 1'], indices: [i] },
                    { type: 'lock', targetIds: ['String 2'], indices: [i] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
        }
    }

    yield { 
        snapshot: makeState(`Complete. Hamming Distance: ${dist}`, {}, 5), 
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;