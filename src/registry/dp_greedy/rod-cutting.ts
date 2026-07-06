import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'rod-cutting-dp',
    name: 'Rod Cutting Problem',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the best way to cut a rod of length n into pieces to maximize the total sales revenue using dynamic programming.',
    pseudocode: [
        'function CutRod(Prices, n):',
        '  Initialize dp[] filled with 0',
        '  for i from 1 to n:',
        '    maxVal = -Infinity',
        '    for j from 0 to i-1:',
        '      maxVal = max(maxVal, Prices[j] + dp[i-j-1])',
        '    dp[i] = maxVal'
    ],
    inputs: [
        {
            id: 'rodLength',
            label: 'Rod Length',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 2, max: 6 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const rodLen = inputs['rodLength'] as number;
    const prices = [1, 5, 8, 9, 10, 17, 17, 20].slice(0, rodLen);

    const dp: (number | string)[] = Array(rodLen + 1).fill(0);

    const makeState = (activeIdx: number | null, cutIndex: number | null, maxVal: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeIdx !== null && cutIndex !== null && maxVal !== null) {
            formulaEquation = `dp[${activeIdx}] = max(dp[${activeIdx}], Price[${cutIndex}] + dp[${activeIdx}-${cutIndex}-1]) => max(${maxVal}, ${prices[cutIndex]} + ${dp[activeIdx - cutIndex - 1]})`;
            formulaResult = String(Math.max(maxVal, prices[cutIndex] + (dp[activeIdx - cutIndex - 1] as number)));
        }

        return {
            structures: {
                'dp_array': { type: 'array', id: 'Max Revenue Table', data: [...dp] }
            },
            context: {
                variables: {
                    rodLength: rodLen,
                    pricesList: prices.map((p, idx) => `Len ${idx+1}: $${p}`).join(', '),
                    activeLength: activeIdx ?? 'None',
                    cutLength: cutIndex !== null ? cutIndex + 1 : 'None',
                    formulaTemplate: 'dp[i] = max_j(Price[j] + dp[i-j-1])',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, null, "Initializing rod cutting revenue cache.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    for (let i = 1; i <= rodLen; i++) {
        let currentMax = -Infinity;
        for (let j = 0; j < i; j++) {
            comparisons++;
            const cost = prices[j] + (dp[i - j - 1] as number);

            yield {
                snapshot: makeState(i, j, currentMax === -Infinity ? 0 : currentMax, `Evaluating cutting rod of length ${i} at partition offset ${j+1}. Cost: $${cost}`, 5),
                events: [{ type: 'compare', targetIds: ['dp_array'], indices: [i, i - j - 1] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (cost > currentMax) {
                currentMax = cost;
                dp[i] = currentMax;
                writes++;
            }
        }

        yield {
            snapshot: makeState(i, null, null, `Solved subproblem: Max revenue for length ${i} is $${dp[i]}`, 7),
            events: [{ type: 'write', targetIds: ['dp_array'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState(null, null, null, `Rod cutting optimization complete. Maximum obtainable revenue: $${dp[rodLen]}`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
