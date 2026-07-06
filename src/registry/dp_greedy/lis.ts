import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'lis-dp',
    name: 'Longest Increasing Subsequence (LIS)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the length of the longest subsequence in an array such that all elements of the subsequence are sorted in increasing order.',
    pseudocode: [
        'function LIS(Arr):',
        '  Initialize LIS[] filled with 1',
        '  for i from 1 to n-1:',
        '    for j from 0 to i-1:',
        '      if Arr[i] > Arr[j] and LIS[i] < LIS[j] + 1:',
        '        LIS[i] = LIS[j] + 1'
    ],
    inputs: [
        {
            id: 'arrayLength',
            label: 'Sequence Length',
            type: 'integer' as const,
            defaultValue: 5,
            constraints: { min: 3, max: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const len = inputs['arrayLength'] as number;
    const arr = [10, 22, 9, 33, 21, 50].slice(0, len);
    const n = arr.length;

    const lis: (number | string)[] = Array(n).fill(1);

    const makeState = (i: number | null, j: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '1';
        if (i !== null && j !== null) {
            formulaEquation = `LIS[${i}] = max(LIS[${i}], LIS[${j}] + 1) => max(${lis[i]}, ${lis[j]} + 1)`;
            formulaResult = String(arr[i] > arr[j] ? Math.max(lis[i] as number, (lis[j] as number) + 1) : lis[i]);
        }

        return {
            structures: {
                'array': { type: 'array', id: 'Input Sequence', data: [...arr] },
                'lis_cache': { type: 'array', id: 'LIS Lengths Table', data: [...lis] }
            },
            context: {
                variables: {
                    activeI: i ?? 'None',
                    activeJ: j ?? 'None',
                    formulaTemplate: 'LIS[i] = max(LIS[i], LIS[j] + 1) if Arr[i] > Arr[j]',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Initializing LIS cache table with base lengths of 1.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: n }
    };

    let comparisons = 0;
    let writes = n;

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            comparisons++;

            yield {
                snapshot: makeState(i, j, `Comparing element Arr[${i}] (${arr[i]}) with antecedent Arr[${j}] (${arr[j]})`, 5),
                events: [{ type: 'compare', targetIds: ['Input Sequence', 'lis_cache'], indices: [i, j] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (arr[i] > arr[j] && (lis[i] as number) < (lis[j] as number) + 1) {
                lis[i] = (lis[j] as number) + 1;
                writes++;

                yield {
                    snapshot: makeState(i, j, `Increasing LIS value at index ${i} to ${lis[i]}`, 6),
                    events: [{ type: 'write', targetIds: ['lis_cache'], indices: [i] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    const maxVal = Math.max(...lis.map(v => Number(v)));

    yield {
        snapshot: makeState(null, null, `LIS sequence search complete. Max LIS length: ${maxVal}`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
