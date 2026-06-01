import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'trapping-rain-water',
    name: 'Trapping Rain Water',
    category: 'Linear Data Structures',
    difficulty: 'Hard' as const,
    description: 'Given an elevation map (an array of non-negative integers), compute how much water it can trap after raining. Solved efficiently using a two-pointer approach.',
    pseudocode: [
        'left = 0, right = n-1',
        'leftMax = 0, rightMax = 0',
        'water = 0',
        'while left < right:',
        '  if arr[left] < arr[right]:',
        '    if arr[left] >= leftMax: leftMax = arr[left]',
        '    else: water += leftMax - arr[left]',
        '    left++',
        '  else:',
        '    if arr[right] >= rightMax: rightMax = arr[right]',
        '    else: water += rightMax - arr[right]',
        '    right--'
    ],
    inputs: [
        {
            id: 'heights',
            label: 'Elevation Map',
            type: 'array' as const,
            defaultValue: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
            constraints: { min: 0, max: 10, maxLength: 20 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const heights = [...(inputs['heights'] as number[])];
    const n = heights.length;
    
    let waterLevels = new Array(n).fill(0);
    let totalWater = 0;
    let comparisons = 0, writes = 0;

    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => ({
        structures: { 
            'elevation': { type: 'array', id: 'Elevation', data: [...heights], visualMode: 'bar' },
            'water': { type: 'array', id: 'Trapped Water', data: [...waterLevels], visualMode: 'bar', baseColor: 'fill-blue-700' }
        },
        context: { pseudocodeLine: line, variables: { totalWater, ...vars }, message: msg }
    });

    yield { snapshot: makeState("Starting Two-Pointer Approach", {}, 1), events: [], metrics: { comparisons, swaps: 0, writes } };

    let left = 0, right = n - 1;
    let leftMax = 0, rightMax = 0;

    while (left < right) {
        comparisons++;
        yield { 
            snapshot: makeState(`Comparing heights at Left(${left}) and Right(${right})`, { left, right, leftMax, rightMax }, 4), 
            events: [
                { type: 'compare', targetIds: ['Elevation'], indices: [left] },
                { type: 'compare', targetIds: ['Elevation'], indices: [right] }
            ],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (heights[left] < heights[right]) {
            // Process Left Pointer
            if (heights[left] >= leftMax) {
                leftMax = heights[left];
                 yield { 
                    snapshot: makeState(`New Left Max found: ${leftMax}`, { left, right, leftMax, rightMax }, 6), 
                    events: [{ type: 'visit', targetIds: ['Elevation'], indices: [left] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            } else {
                const waterToAdd = leftMax - heights[left];
                totalWater += waterToAdd;
                waterLevels[left] = waterToAdd;
                writes++;
                yield { 
                    snapshot: makeState(`Trapping ${waterToAdd} units of water at index ${left}`, {}, 7), 
                    events: [{ type: 'write', targetIds: ['Trapped Water'], indices: [left] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
            left++;
        } else {
            // Process Right Pointer
            if (heights[right] >= rightMax) {
                rightMax = heights[right];
                 yield { 
                    snapshot: makeState(`New Right Max found: ${rightMax}`, { left, right, leftMax, rightMax }, 10), 
                    events: [{ type: 'visit', targetIds: ['Elevation'], indices: [right] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            } else {
                const waterToAdd = rightMax - heights[right];
                totalWater += waterToAdd;
                waterLevels[right] = waterToAdd;
                writes++;
                 yield { 
                    snapshot: makeState(`Trapping ${waterToAdd} units of water at index ${right}`, {}, 7), 
                    events: [{ type: 'write', targetIds: ['Trapped Water'], indices: [right] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
            }
            right--;
        }
    }

    yield { 
        snapshot: makeState(`Complete. Total Water: ${totalWater}`, {}, 1), 
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;