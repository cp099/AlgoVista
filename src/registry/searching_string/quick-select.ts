import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'quick-select',
    name: 'Select Kth Smallest (QuickSelect)',
    category: 'Searching & String',
    difficulty: 'Medium' as const,
    description: 'Finds the k-th smallest element in an unordered list using the QuickSort partitioning logic. Average time O(n).',
    pseudocode: [
        'function select(left, right, k):',
        '  if left == right: return arr[left]',
        '  pivotIndex = partition(left, right)',
        '  if k == pivotIndex: return arr[k]',
        '  else if k < pivotIndex: return select(left, pivotIndex - 1, k)',
        '  else: return select(pivotIndex + 1, right, k)'
    ],
    inputs: [
        {
            id: 'arr',
            label: 'Unsorted Array',
            type: 'array' as const,
            defaultValue: [7, 10, 4, 3, 20, 15],
            constraints: { min: 1, max: 99, maxLength: 15 }
        },
        {
            id: 'k',
            label: 'k (1-based)',
            type: 'integer' as const,
            defaultValue: 3
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const arr = [...(inputs['arr'] as number[])];
    const n = arr.length;
    // User inputs 1-based k, convert to 0-based index
    const k = (inputs['k'] as number) - 1;
    let comparisons = 0, swaps = 0;

    const makeState = (vars: any = {}, msg: string = '', line: number = 0): AlgoState => ({
        structures: { 'main': { type: 'array', id: 'main', data: [...arr] } },
        context: { variables: { k: k+1, ...vars }, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState({}, `Looking for ${k+1}-th smallest element`, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    if (k < 0 || k >= n) {
        yield { snapshot: makeState({}, "Error: k is out of bounds", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
        return;
    }

    // Standard Lomuto Partition
    function* partition(low: number, high: number): Generator<any> {
        const pivot = arr[high];
        let i = low - 1;

        yield { 
            snapshot: makeState({ low, high, pivot }, `Partitioning range [${low}, ${high}] with Pivot ${pivot}`, 3), 
            events: [{ type: 'visit', targetIds: ['main'], indices: [high] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };

        for (let j = low; j < high; j++) {
            comparisons++;
            yield { 
                snapshot: makeState({ low, high, i, j }, `Comparing ${arr[j]} < ${pivot}?`, 3), 
                events: [{ type: 'compare', targetIds: ['main'], indices: [j, high] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };

            if (arr[j] < pivot) {
                i++;
                const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                swaps++;
                yield { 
                    snapshot: makeState({ low, high, i, j }, `Swapping smaller element`, 3), 
                    events: [{ type: 'swap', targetIds: ['main'], indices: [i, j] }],
                    metrics: { comparisons, swaps, writes: 0 } 
                };
            }
        }
        const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        swaps++;
        
        const pi = i + 1;
        yield { 
            snapshot: makeState({ pi }, `Pivot placed at index ${pi}`, 3), 
            events: [{ type: 'lock', targetIds: ['main'], indices: [pi] }],
            metrics: { comparisons, swaps, writes: 0 } 
        };
        return pi;
    }

    let left = 0;
    let right = n - 1;

    while (left <= right) {
        // Delegate partition
        const generator = partition(left, right);
        let result = generator.next();
        while (!result.done) {
            yield result.value;
            result = generator.next();
        }
        const pivotIndex = result.value as number;

        if (pivotIndex === k) {
            yield { 
                snapshot: makeState({ result: arr[pivotIndex] }, `Found k-th smallest: ${arr[pivotIndex]}`, 4), 
                events: [{ type: 'lock', targetIds: ['main'], indices: [pivotIndex] }],
                metrics: { comparisons, swaps, writes: 0 } 
            };
            return;
        } else if (pivotIndex < k) {
            left = pivotIndex + 1;
            yield { 
                snapshot: makeState({ left, right }, `Pivot (${pivotIndex}) < k (${k}). Search Right.`, 6), 
                events: [], 
                metrics: { comparisons, swaps, writes: 0 } 
            };
        } else {
            right = pivotIndex - 1;
            yield { 
                snapshot: makeState({ left, right }, `Pivot (${pivotIndex}) > k (${k}). Search Left.`, 5), 
                events: [], 
                metrics: { comparisons, swaps, writes: 0 } 
            };
        }
    }
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;