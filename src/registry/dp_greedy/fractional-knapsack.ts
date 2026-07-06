import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fractional-knapsack-greedy',
    name: 'Fractional Knapsack (Greedy)',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Solves the knapsack problem by allowing items to be broken into fractions. Selects items greedily based on their value-to-weight ratio to maximize total value.',
    pseudocode: [
        'function FractionalKnapsack(Items, Capacity):',
        '  Sort Items descending by value / weight ratio',
        '  totalValue = 0',
        '  for item in Items:',
        '    if capacity >= item.weight:',
        '      capacity -= item.weight',
        '      totalValue += item.value',
        '    else:',
        '      totalValue += item.value * (capacity / item.weight)',
        '      break',
        '  return totalValue'
    ],
    inputs: [
        {
            id: 'capacity',
            label: 'Knapsack Capacity',
            type: 'integer' as const,
            defaultValue: 50,
            constraints: { min: 20, max: 80 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    let capacity = inputs['capacity'] as number;

    // Items: ID, Value, Weight, Ratio
    const items = [
        { id: 'Item A', val: 60, wt: 10, ratio: 6.0 },
        { id: 'Item B', val: 100, wt: 20, ratio: 5.0 },
        { id: 'Item C', val: 120, wt: 30, ratio: 4.0 }
    ];

    const data: (number | string)[] = items.map(item => `${item.id} (v:${item.val}, w:${item.wt})`);

    const makeState = (activeIdx: number | null, activeState: 'active' | 'chosen' | 'default', capacityLeft: number, totalValue: number, msg: string, line: number): AlgoState => {
        const greedyCandidates = items.map((item, idx) => {
            let state: 'default' | 'active' | 'chosen' = 'default';
            if (idx === activeIdx) state = activeState;
            else if (activeIdx !== null && idx < activeIdx) state = 'chosen';
            return {
                id: item.id,
                ratio: `${item.ratio.toFixed(1)}/kg`,
                state
            };
        });

        return {
            structures: {
                'items_list': { type: 'array', id: 'Sorted Items (By Density)', data: [...data] }
            },
            context: {
                variables: {
                    capacityLeft,
                    totalValue: totalValue.toFixed(1),
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, 'default', capacity, 0, "Sorting items by value/weight ratio descending.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let totalValue = 0;

    for (let i = 0; i < items.length; i++) {
        comparisons++;
        const item = items[i];

        yield {
            snapshot: makeState(i, 'active', capacity, totalValue, `Evaluating item "${item.id}" (weight: ${item.wt}, capacity left: ${capacity}).`, 4),
            events: [{ type: 'compare', targetIds: ['items_list'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (capacity >= item.wt) {
            capacity -= item.wt;
            totalValue += item.val;
            writes++;

            yield {
                snapshot: makeState(i, 'chosen', capacity, totalValue, `Took full item "${item.id}". Added $${item.val} value.`, 6),
                events: [{ type: 'lock', targetIds: ['items_list'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            // Take fraction
            const fraction = capacity / item.wt;
            const addedVal = item.val * fraction;
            totalValue += addedVal;
            capacity = 0;
            writes++;

            yield {
                snapshot: makeState(i, 'chosen', capacity, totalValue, `Knapsack full. Took fraction ${(fraction * 100).toFixed(0)}% of item "${item.id}" for value $${addedVal.toFixed(1)}.`, 8),
                events: [{ type: 'lock', targetIds: ['items_list'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes }
            };
            break;
        }
    }

    yield {
        snapshot: makeState(null, 'default', capacity, totalValue, `Fractional Knapsack complete. Total optimized value obtained: $${totalValue.toFixed(1)}.`, 10),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
