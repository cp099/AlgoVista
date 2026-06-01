import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'anagram-check',
    name: 'Anagram Check',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Checks if two strings are anagrams by counting character frequencies. First string increments counts, second string decrements. If all counts return to zero, they are anagrams.',
    pseudocode: [
        'if len(s1) != len(s2): return false',
        'counts = new Map()',
        'for char in s1: counts[char]++',
        'for char in s2: counts[char]--',
        'for count in counts: if count != 0 return false',
        'return true'
    ],
    inputs: [
        {
            id: 's1',
            label: 'String 1',
            type: 'string' as const,
            defaultValue: "LISTEN",
            constraints: { maxLength: 10 }
        },
        {
            id: 's2',
            label: 'String 2',
            type: 'string' as const,
            defaultValue: "SILENT"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const s1 = String(inputs['s1']).toUpperCase();
    const s2 = String(inputs['s2']).toUpperCase();
    const arr1 = s1.split('');
    const arr2 = s2.split('');
    
    // Union of chars in both strings for visualization
    const distinctChars = Array.from(new Set([...arr1, ...arr2])).sort();
    
    // Map char to index
    const charMap: Record<string, number> = {};
    distinctChars.forEach((c, i) => charMap[c] = i);
    
    const counts = new Array(distinctChars.length).fill(0);

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            's1': { type: 'array', id: 'String 1', data: arr1 },
            's2': { type: 'array', id: 'String 2', data: arr2 },
            // Label the counts array with the characters it represents
            'counts': { type: 'array', id: `Counts (${distinctChars.join('')})`, data: [...counts] }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Anagram Check", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    if (s1.length !== s2.length) {
        yield { 
            snapshot: makeState("Lengths differ! Cannot be anagrams.", {}, 1), 
            events: [],
            metrics: { comparisons: 1, swaps: 0, writes: 0 } 
        };
        return;
    }

    // Pass 1: Increment
    for (let i = 0; i < s1.length; i++) {
        const char = s1[i];
        const idx = charMap[char];
        
        yield { 
            snapshot: makeState(`Scanning ${char} from String 1`, { i }, 3), 
            events: [{ type: 'visit', targetIds: ['String 1'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        counts[idx]++;
        yield { 
            snapshot: makeState(`Incrementing count for ${char}`, { i }, 3), 
            events: [{ type: 'write', targetIds: [`Counts (${distinctChars.join('')})`], indices: [idx] }],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // Pass 2: Decrement
    for (let i = 0; i < s2.length; i++) {
        const char = s2[i];
        const idx = charMap[char];

        yield { 
            snapshot: makeState(`Scanning ${char} from String 2`, { i }, 3), 
            events: [{ type: 'visit', targetIds: ['String 2'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        counts[idx]--;
        yield { 
            snapshot: makeState(`Decrementing count for ${char}`, { i }, 4), 
            events: [{ type: 'write', targetIds: [`Counts (${distinctChars.join('')})`], indices: [idx] }],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    // Check Zeros
    for (let i = 0; i < counts.length; i++) {
        if (counts[i] !== 0) {
            yield { 
                snapshot: makeState(`Count for ${distinctChars[i]} is not 0!`, { i, val: counts[i] }, 5), 
                events: [{ type: 'compare', targetIds: [`Counts (${distinctChars.join('')})`], indices: [i] }],
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };
            return;
        }
    }

    yield { 
        snapshot: makeState("All counts are zero. It is an Anagram!", {}, 6), 
        events: [
            { type: 'lock', targetIds: ['String 1'], indices: Array.from({length:s1.length},(_,k)=>k) },
            { type: 'lock', targetIds: ['String 2'], indices: Array.from({length:s2.length},(_,k)=>k) }
        ],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;