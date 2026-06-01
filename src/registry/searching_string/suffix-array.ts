import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'suffix-array',
    name: 'Suffix Array Construction',
    category: 'Searching & String',
    difficulty: 'Advanced' as const,
    description: 'Constructs an array of indices representing all suffixes of the string sorted lexicographically. Used for fast substring searches.',
    pseudocode: [
        'suffixes = []',
        'for i from 0 to n-1:',
        '  suffixes.push({ index: i, text: str.substring(i) })',
        'sort(suffixes, by text)',
        'result = [s.index for s in suffixes]'
    ],
    inputs: [
        {
            id: 'str',
            label: 'String',
            type: 'string' as const,
            defaultValue: "BANANA",
            constraints: { maxLength: 8 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    const n = str.length;
    let comparisons = 0, swaps = 0;

    // Create Suffix Objects
    // For visualization, we will show an array of STRINGS (the suffixes)
    // and track their original indices.
    let suffixes = Array.from({ length: n }, (_, i) => ({
        index: i,
        text: str.substring(i)
    }));

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'sa': { 
                type: 'array', 
                id: 'Suffixes (Sorted by Text)', 
                // We show the text, not the index, to make it visual
                data: suffixes.map(s => s.text) 
            }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Initialized Suffixes", {}, 3), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // We will simulate a Selection Sort for visualization clarity
    // (Real construction is O(n log n) or O(n), but Selection Sort is O(n^2) visualizable)
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        yield { 
            snapshot: makeState(`Finding min suffix starting at index ${i}`, { i }, 4), 
            events: [{ type: 'visit', targetIds: ['Suffixes (Sorted by Text)'], indices: [i] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };

        for (let j = i + 1; j < n; j++) {
            comparisons++;
            yield { 
                snapshot: makeState(`Comparing "${suffixes[j].text}" < "${suffixes[minIdx].text}"?`, { i, j }, 4), 
                events: [{ type: 'compare', targetIds: ['Suffixes (Sorted by Text)'], indices: [j, minIdx] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };

            if (suffixes[j].text < suffixes[minIdx].text) {
                minIdx = j;
                yield { 
                    snapshot: makeState(`New minimum found: "${suffixes[j].text}"`, { i, j, minIdx }, 4), 
                    events: [{ type: 'visit', targetIds: ['Suffixes (Sorted by Text)'], indices: [minIdx] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
        }

        if (minIdx !== i) {
            const temp = suffixes[i];
            suffixes[i] = suffixes[minIdx];
            suffixes[minIdx] = temp;
            swaps++;
            yield { 
                snapshot: makeState(`Swapping "${suffixes[i].text}" into position`, { i, minIdx }, 4), 
                events: [{ type: 'swap', targetIds: ['Suffixes (Sorted by Text)'], indices: [i, minIdx] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
        }
        
        yield { 
            snapshot: makeState(`Position ${i} Sorted`, { i }, 4), 
            events: [{ type: 'lock', targetIds: ['Suffixes (Sorted by Text)'], indices: [i] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };
    }

    yield { 
        snapshot: makeState("Suffix Array Construction Complete", {}, 5), 
        events: [{ type: 'lock', targetIds: ['Suffixes (Sorted by Text)'], indices: Array.from({length:n},(_,k)=>k) }],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;