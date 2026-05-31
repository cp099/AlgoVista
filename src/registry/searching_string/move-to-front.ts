import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'move-to-front',
    name: 'Move-to-Front Transform',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'A data transform used in compression. It maintains a list of symbols. For each character, output its index and move it to the front. Frequent characters end up with small indices.',
    pseudocode: [
        'list = [a, b, c, ... z]',
        'for char in input:',
        '  idx = list.indexOf(char)',
        '  output.push(idx)',
        '  list.remove(idx)',
        '  list.unshift(char)'
    ],
    inputs: [
        {
            id: 'str',
            label: 'String',
            type: 'string' as const,
            defaultValue: "BANANA",
            constraints: { maxLength: 10 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    // Initialize symbol list with unique chars sorted (or a-z)
    // For visual clarity, we just use the unique chars present in string sorted
    const uniqueChars = Array.from(new Set(str.split(''))).sort();
    
    // We visualize: Input, Output, and the Dynamic List
    const inputArr = str.split('');
    const outputArr: number[] = [];
    let list = [...uniqueChars]; // Dynamic

    const makeState = (msg: string, vars: any = {}): AlgoState => ({
        structures: { 
            'input': { type: 'array', id: 'Input', data: [...inputArr] },
            'list': { type: 'array', id: 'Symbol List (Dynamic)', data: [...list] },
            'output': { type: 'array', id: 'Encoded Output', data: [...outputArr] }
        },
        context: { variables: { ...vars }, pseudocodeLine: 0, message: msg }
    });

    yield { snapshot: makeState("Starting Move-to-Front"), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < inputArr.length; i++) {
        const char = inputArr[i];
        
        yield { 
            snapshot: makeState(`Processing '${char}'`, { i }), 
            events: [{ type: 'visit', targetIds: ['Input'], indices: [i] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        const idx = list.indexOf(char);
        outputArr.push(idx);

        yield { 
            snapshot: makeState(`Found '${char}' at index ${idx}. Outputting ${idx}.`, { i, idx }), 
            events: [
                { type: 'compare', targetIds: ['Symbol List (Dynamic)'], indices: [idx] },
                { type: 'write', targetIds: ['Encoded Output'], indices: [outputArr.length - 1] }
            ],
            metrics: { comparisons: idx + 1, swaps: 0, writes: 1 } 
        };

        // Move to Front Logic
        list.splice(idx, 1);
        list.unshift(char);

        yield { 
            snapshot: makeState(`Moved '${char}' to front`, { i }), 
            events: [{ type: 'write', targetIds: ['Symbol List (Dynamic)'], indices: [0] }],
            metrics: { comparisons: 0, swaps: 0, writes: 1 } 
        };
    }

    yield { 
        snapshot: makeState("Transform Complete"), 
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;