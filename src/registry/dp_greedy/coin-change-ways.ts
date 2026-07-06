import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'coin-change-ways',
    name: 'Coin Change (Total Ways)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the number of unique combinations to sum up to a target value using a given set of coin denominations.',
    pseudocode: [
        'function CoinWays(Coins, V):',
        '  Initialize dp[] filled with 0, dp[0] = 1',
        '  for c in Coins:',
        '    for i from c to V:',
        '      dp[i] = dp[i] + dp[i-c]'
    ],
    inputs: [
        {
            id: 'targetAmount',
            label: 'Target Value',
            type: 'integer' as const,
            defaultValue: 5,
            constraints: { min: 3, max: 7 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const val = inputs['targetAmount'] as number;
    const coins = [1, 2, 5];

    const dp: (number | string)[] = Array(val + 1).fill(0);
    dp[0] = 1;

    const makeState = (activeIdx: number | null, activeCoin: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeIdx !== null && activeCoin !== null) {
            formulaEquation = `dp[${activeIdx}] = dp[${activeIdx}] + dp[${activeIdx}-${activeCoin}] => ${dp[activeIdx]} + ${dp[activeIdx - activeCoin]}`;
            formulaResult = String((dp[activeIdx] as number) + (dp[activeIdx - activeCoin] as number));
        }

        return {
            structures: {
                'dp_array': { type: 'array', id: 'Ways Count Table', data: [...dp] }
            },
            context: {
                variables: {
                    targetAmount: val,
                    coinsList: coins.join(', '),
                    activeAmount: activeIdx ?? 'None',
                    activeCoin: activeCoin ?? 'None',
                    formulaTemplate: 'dp[i] = dp[i] + dp[i-c]',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Initializing DP table with 0s, and base case dp[0] = 1.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    for (const c of coins) {
        for (let i = c; i <= val; i++) {
            comparisons++;
            const prev = dp[i] as number;
            const ways = dp[i - c] as number;
            dp[i] = prev + ways;
            writes++;

            yield {
                snapshot: makeState(i, c, `Evaluating coin ${c} for amount value ${i}. Adding ways count.`, 5),
                events: [{ type: 'compare', targetIds: ['dp_array'], indices: [i, i - c] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, null, `Coin Change Ways evaluation complete. Unique ways to make sum ${val} is ${dp[val]}.`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
