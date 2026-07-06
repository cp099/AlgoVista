import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'subset-sum-dp',
    name: 'Partition Equal Subset Sum',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Determines if a set of positive integers can be partitioned into two subsets with equal sum by building a 2D subset sum table.',
    pseudocode: [
        'function CanPartition(Arr):',
        '  Sum = sum of elements in Arr',
        '  if Sum is odd: return false',
        '  Target = Sum / 2',
        '  Initialize dp[n+1][Target+1] with false, dp[i][0] = true',
        '  for i from 1 to n:',
        '    for j from 1 to Target:',
        '      if Arr[i-1] <= j:',
        '        dp[i][j] = dp[i-1][j] OR dp[i-1][j - Arr[i-1]]',
        '      else:',
        '        dp[i][j] = dp[i-1][j]'
    ],
    inputs: [
        {
            id: 'capacity',
            label: 'Total Element Count',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const count = inputs['capacity'] as number;
    const arr = [1, 5, 11, 5].slice(0, count);

    const totalSum = arr.reduce((a, b) => a + b, 0);
    const hasEqualPartition = totalSum % 2 === 0;
    const target = hasEqualPartition ? totalSum / 2 : Math.floor(totalSum / 2);

    const n = arr.length;
    const dp: (string | number)[][] = Array.from({ length: n + 1 }, () => Array(target + 1).fill('F'));

    // Base cases
    for (let i = 0; i <= n; i++) dp[i][0] = 'T';

    const rowHeaders = ['0', ...arr.map((val, idx) => `Val:${val} (i:${idx})`)];
    const colHeaders = Array.from({ length: target + 1 }, (_, w) => `Sum:${w}`);

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = 'F';
        if (activeCell && activeCell.r > 0 && activeCell.c > 0) {
            const i = activeCell.r;
            const j = activeCell.c;
            if (arr[i-1] <= j) {
                formulaEquation = `dp[${i}][${j}] = dp[${i-1}][${j}] OR dp[${i-1}][${j}-${arr[i-1]}] => ${dp[i-1][j]} OR ${dp[i-1][j-arr[i-1]]}`;
                formulaResult = String(dp[i-1][j] === 'T' || dp[i-1][j-arr[i-1]] === 'T' ? 'T' : 'F');
            } else {
                formulaEquation = `dp[${i}][${j}] = dp[${i-1}][${j}] => ${dp[i-1][j]}`;
                formulaResult = String(dp[i-1][j]);
            }
        }

        return {
            structures: {
                'partition_matrix': {
                    type: 'matrix',
                    id: 'partition_matrix',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    elements: arr.join(', '),
                    targetSum: target,
                    isEvenSum: hasEqualPartition ? 'Yes' : 'No (Sum is odd)',
                    activeI: activeCell?.r ?? 'None',
                    activeJ: activeCell?.c ?? 'None',
                    formulaTemplate: 'dp[i][j] = dp[i-1][j] || dp[i-1][j - Arr[i-1]]',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, `Partition Sum initialization. Targets sum: ${target}.`, 5),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: n + 1 }
    };

    let comparisons = 0;
    let writes = n + 1;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= target; j++) {
            comparisons++;
            if (arr[i-1] <= j) {
                dp[i][j] = (dp[i-1][j] === 'T' || dp[i-1][j - arr[i-1]] === 'T') ? 'T' : 'F';
            } else {
                dp[i][j] = dp[i-1][j];
            }
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, `Evaluating if subset of first ${i} items can form sum ${j}.`, 9),
                events: [{ type: 'compare', targetIds: ['partition_matrix'], indices: [i * (target + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    const partitionPossible = hasEqualPartition && (dp[n][target] === 'T');
    yield {
        snapshot: makeState(null, `Partition search finished. Equal subset sum partition possible: ${partitionPossible ? 'YES' : 'NO'}.`, 10),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
