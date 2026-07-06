import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'coin-change-min',
    name: 'Coin Change (Minimum Coins)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the minimum number of coins needed to make a target sum value from a set of coin denominations.',
    pseudocode: [
        'function MinCoins(Coins, V):',
        '  Initialize dp[] with Infinity, dp[0] = 0',
        '  for i from 1 to V:',
        '    for c in Coins:',
        '      if c <= i:',
        '        dp[i] = min(dp[i], dp[i-c] + 1)'
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

    const dp: (number | string)[] = Array(val + 1).fill(Infinity);
    dp[0] = 0;

    const makeState = (activeIdx: number | null, activeCoin: number | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = '0';
        if (activeIdx !== null && activeCoin !== null) {
            formulaEquation = `dp[${activeIdx}] = min(dp[${activeIdx}], dp[${activeIdx}-${activeCoin}] + 1) => min(${dp[activeIdx]}, ${dp[activeIdx - activeCoin]} + 1)`;
            const candidate = (dp[activeIdx - activeCoin] as number) + 1;
            formulaResult = String(Math.min(Number(dp[activeIdx]), candidate));
        }

        return {
            structures: {
                'dp_array': { type: 'array', id: 'Min Coins Table', data: dp.map(v => (v === Infinity ? 'inf' : v)) }
            },
            context: {
                variables: {
                    targetAmount: val,
                    coinsList: coins.join(', '),
                    activeAmount: activeIdx ?? 'None',
                    activeCoin: activeCoin ?? 'None',
                    formulaTemplate: 'dp[i] = min(dp[i], dp[i-c] + 1)',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, "Initializing DP table with Infinity, and base case dp[0] = 0.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    for (let i = 1; i <= val; i++) {
        for (const c of coins) {
            comparisons++;
            if (c <= i) {
                const prev = dp[i] as number;
                const candidate = (dp[i - c] as number) + 1;
                dp[i] = Math.min(prev, candidate);
                writes++;

                yield {
                    snapshot: makeState(i, c, `Evaluating coin ${c} for amount value ${i}.`, 6),
                    events: [{ type: 'compare', targetIds: ['dp_array'], indices: [i, i - c] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, null, `Coin Change Minimum Coins complete. Minimum coins to make ${val} is ${dp[val]}.`, 6),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
