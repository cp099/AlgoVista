import { AlgorithmBundle, AlgoState, AlgoStep } from '@core/types';

const manifest = {
    id: 'bogo-sort',
    name: 'Bogo Sort',
    category: 'Sorting',
    difficulty: 'Hard' as const,
    description: 'A highly ineffective sorting algorithm based on generating and testing permutations. It successively shuffles a list until it turns out to be sorted. Best case O(n), Worst case O(infinity).',
    pseudocode: [
        'while not isSorted(arr):',
        '  shuffle(arr)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Input Array (Keep it small!)',
            type: 'array' as const,
            defaultValue: [3, 1, 2], 
            constraints: { min: 1, max: 99, maxLength: 5 } 
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { n, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, "Starting Bogo Sort... Good luck.", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Explicitly define return type: Generator<AlgoStep, boolean, void>
    // Yields: AlgoStep
    // Returns: boolean
    function* isSorted(): Generator<AlgoStep, boolean, void> {
        for (let i = 0; i < n - 1; i++) {
            comparisons++;
            yield { 
                snapshot: makeState({ i }, `Checking: Is ${arr[i]} > ${arr[i+1]}?`, 1), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [i, i+1] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            if (arr[i] > arr[i + 1]) return false;
        }
        return true;
    }

    // Explicitly define return type: Generator<AlgoStep, void, void>
    function* shuffle(): Generator<AlgoStep, void, void> {
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            swaps++;
            yield { 
                snapshot: makeState({ i, j }, `Shuffling...`, 2), 
                events: [{ type: 'swap', targetIds: ['main'], indices: [i, j] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
        }
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 500;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // 1. Check if sorted (Delegate yield)
        const sorted = yield* isSorted();
        
        if (sorted) {
            yield { 
                snapshot: makeState({ attempts }, `Sorted after ${attempts} attempts!`, 1), 
                events: [{ type: 'lock', targetIds: ['main'], indices: Array.from({length:n},(_,k)=>k) }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            return;
        }

        // 2. Shuffle (Delegate yield)
        yield { 
            snapshot: makeState({ attempts }, `Not sorted. Shuffling (Attempt ${attempts})`, 1), 
            events: [],
            metrics: { comparisons, swaps, writes: 0 } 
        };
        yield* shuffle();
    }

    yield { 
        snapshot: makeState({ attempts }, `Gave up after ${attempts} attempts.`, 1), 
        events: [],
        metrics: { comparisons, swaps, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;