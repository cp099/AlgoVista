import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'run-length-encoding',
    name: 'Run Length Encoding',
    category: 'Searching & String',
    difficulty: 'Easy' as const,
    description: 'A simple form of lossless data compression. Consecutive identical characters (runs) are replaced by the character and its count.',
    pseudocode: [
        'encoded = ""',
        'i = 0',
        'while i < n:',
        '  count = 1',
        '  while i+1 < n and str[i] == str[i+1]:',
        '    count++, i++',
        '  encoded += count + str[i]',
        '  i++'
    ],
    inputs: [
        {
            id: 'str',
            label: 'Input String',
            type: 'string' as const,
            defaultValue: "AAAABBBCCDAA",
            constraints: { maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    const arr = str.split('');
    const n = arr.length;
    let comparisons = 0, writes = 0;

    // Output starts empty
    const output: string[] = [];

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'input': { type: 'array', id: 'Input String', data: [...arr] },
            'output': { type: 'array', id: 'Encoded Output', data: [...output] }
        },
        context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting RLE Compression", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    for (let i = 0; i < n; i++) {
        let count = 1;
        
        yield { 
            snapshot: makeState(`Starting new run at ${arr[i]}`, { i, char: arr[i] }, 3), 
            events: [{ type: 'visit', targetIds: ['Input String'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes } 
        };

        while (i + 1 < n && arr[i] === arr[i + 1]) {
            comparisons++;
            yield { 
                snapshot: makeState(`Found match: ${arr[i]} == ${arr[i+1]}. Count: ${count+1}`, { i, next: i+1, count: count+1 }, 5), 
                events: [{ type: 'compare', targetIds: ['Input String'], indices: [i, i+1] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
            count++;
            i++;
        }

        // Check mismatch if not end
        if (i + 1 < n) {
            comparisons++;
            yield { 
                snapshot: makeState(`Mismatch: ${arr[i]} != ${arr[i+1]}. End of run.`, { i, next: i+1 }, 5), 
                events: [{ type: 'compare', targetIds: ['Input String'], indices: [i, i+1] }],
                metrics: { comparisons, swaps: 0, writes } 
            };
        }

        // Append to output
        output.push(String(count));
        output.push(arr[i]);
        writes += 2;

        yield { 
            snapshot: makeState(`Appending "${count}${arr[i]}" to output`, { i, count, char: arr[i] }, 7), 
            events: [{ type: 'write', targetIds: ['Encoded Output'], indices: [output.length - 2, output.length - 1] }],
            metrics: { comparisons, swaps: 0, writes } 
        };
    }

    yield { 
        snapshot: makeState("Compression Complete", {}, 3), 
        events: [{ type: 'lock', targetIds: ['Encoded Output'], indices: Array.from({length:output.length},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;