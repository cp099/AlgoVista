import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fibonacci-dp',
    name: 'Fibonacci (Memoization vs Tabulation)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Easy' as const,
    description: 'Contrasts top-down memoization (recursion + caching) with bottom-up tabulation (iterative array filling) to solve the classic Fibonacci sequence recurrence relation.',
    pseudocode: [
        'function FibTabulation(n):',
        '  F = Array of size n+1',
        '  F[0] = 0, F[1] = 1',
        '  for i from 2 to n:',
        '    F[i] = F[i-1] + F[i-2]',
        '  return F[n]'
    ],
    inputs: [
        {
            id: 'n',
            label: 'Nth Fibonacci Value',
            type: 'integer' as const,
            defaultValue: 5,
            constraints: { min: 2, max: 7 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const n = inputs['n'] as number;

    const data: (number | string)[] = Array(n + 1).fill(0);
    data[0] = 0;
    data[1] = 1;

    const makeState = (activeIdx: number | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'fib_array': { type: 'array', id: 'Fibonacci Table', data: [...data] }
            },
            context: {
                variables: {
                    n,
                    activeIdx: activeIdx ?? 'None',
                    formulaTemplate: 'F[i] = F[i-1] + F[i-2]',
                    formulaEquation: activeIdx && activeIdx >= 2 
                        ? `F[${activeIdx}] = F[${activeIdx - 1}] + F[${activeIdx - 2}] => ${data[activeIdx - 1]} + ${data[activeIdx - 2]}` 
                        : 'Initialization',
                    formulaResult: activeIdx && activeIdx >= 2 ? String(data[activeIdx]) : '0'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(1, "Initializing Fibonacci boundary cases: F[0] = 0, F[1] = 1.", 3),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 2 }
    };

    let comparisons = 0;
    let writes = 2;

    for (let i = 2; i <= n; i++) {
        comparisons++;
        data[i] = (data[i - 1] as number) + (data[i - 2] as number);
        writes++;

        yield {
            snapshot: makeState(i, `Solving subproblem i = ${i} using the recurrence relation.`, 4),
            events: [{ type: 'compare', targetIds: ['Fibonacci Table'], indices: [i - 1, i - 2] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        yield {
            snapshot: makeState(i, `Saved F[${i}] = ${data[i]} in the tabulation table.`, 4),
            events: [{ type: 'write', targetIds: ['Fibonacci Table'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, `Tabulation complete! The ${n}th Fibonacci number is ${data[n]}.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
