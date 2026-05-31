import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'longest-common-prefix',
    name: 'Longest Common Prefix',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'Finds the longest common prefix string amongst an array of strings. It iteratively compares the current prefix with the next string, shortening the prefix as needed.',
    pseudocode: [
        'prefix = strs[0]',
        'for i = 1 to n-1:',
        '  while strs[i].indexOf(prefix) != 0:',
        '    prefix = prefix.substring(0, len-1)',
        '    if prefix is empty: return ""',
        'return prefix'
    ],
    inputs: [
        {
            id: 'strs',
            label: 'String Array (comma separated)',
            type: 'array' as const,
            defaultValue: ["flower", "flow", "flight", "flee"],
            constraints: { maxLength: 5 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const strs = (inputs['strs'] as any[]).map(String); 
    
    if (strs.length === 0) return;

    let prefix = strs[0];
    let comparisons = 0;

    // Helper to visualize state
    // Removed unused hl params
    const makeState = (currWord: string, msg: string): AlgoState => ({
        structures: { 
            'prefix': { type: 'array', id: 'Current Prefix', data: prefix.split('') },
            'word': { type: 'array', id: 'Comparing Against', data: currWord.split('') }
        },
        context: { variables: { prefix }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState(strs[0], "Start: Assume first word is prefix"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 1; i < strs.length; i++) {
        const word = strs[i];
        
        yield { 
            snapshot: makeState(word, `Comparing with "${word}"`), 
            events: [],
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        // Horizontal scanning logic
        let j = 0;
        while (j < prefix.length && j < word.length) {
            comparisons++;
            yield { 
                snapshot: makeState(word, `Checking char ${j}: ${prefix[j]} vs ${word[j]}`), 
                events: [
                    { type: 'compare', targetIds: ['Current Prefix'], indices: [j] },
                    { type: 'compare', targetIds: ['Comparing Against'], indices: [j] }
                ],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };

            if (prefix[j] !== word[j]) break;
            j++;
        }

        // Trim prefix
        prefix = prefix.substring(0, j);
        
        yield { 
            snapshot: makeState(word, `Mismatch! Shortening prefix to "${prefix}"`), 
            events: [{ type: 'write', targetIds: ['Current Prefix'], indices: Array.from({length:prefix.length},(_,k)=>k) }], 
            metrics: { comparisons, swaps: 0, writes: 0 } 
        };

        if (prefix === "") {
            yield { 
                snapshot: makeState(word, "Prefix became empty. No common prefix."), 
                events: [],
                metrics: { comparisons, swaps: 0, writes: 0 } 
            };
            return;
        }
    }

    yield { 
        snapshot: makeState("", `Final Result: "${prefix}"`), 
        events: [{ type: 'lock', targetIds: ['Current Prefix'], indices: Array.from({length:prefix.length},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;