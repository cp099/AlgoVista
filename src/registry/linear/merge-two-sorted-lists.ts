import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'merge-two-sorted-lists',
    name: 'Merge Two Sorted Lists',
    category: 'Linear Data Structures',
    difficulty: 'Easy' as const,
    description: 'Merges two sorted linked lists into a single sorted list by iteratively comparing the heads of both lists and appending the smaller one.',
    pseudocode: [
        'dummy = new Node()',
        'tail = dummy',
        'while l1 and l2:',
        '  if l1.val < l2.val:',
        '    tail.next = l1, l1 = l1.next',
        '  else:',
        '    tail.next = l2, l2 = l2.next',
        '  tail = tail.next',
        'tail.next = l1 or l2'
    ],
    inputs: [
        {
            id: 'list1',
            label: 'List 1 (Sorted)',
            type: 'array' as const,
            defaultValue: [1, 3, 5, 7],
            constraints: { min: 1, max: 99, maxLength: 5 }
        },
        {
            id: 'list2',
            label: 'List 2 (Sorted)',
            type: 'array' as const,
            defaultValue: [2, 4, 6, 8],
            constraints: { min: 1, max: 99, maxLength: 5 }
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    let list1 = [...(inputs['list1'] as number[])];
    let list2 = [...(inputs['list2'] as number[])];
    
    // Internal state
    let merged: number[] = [];
    
    let comparisons = 0, writes = 0;

    const makeState = (msg: string): AlgoState => ({
        structures: { 
            'l1': { type: 'array', id: 'List 1', data: [...list1], visualMode: 'box' },
            'l2': { type: 'array', id: 'List 2', data: [...list2], visualMode: 'box' },
            'merged': { type: 'array', id: 'Merged List', data: [...merged], visualMode: 'box' }
        },
        context: { variables: {}, message: msg }
    });

    yield { snapshot: makeState("Starting Merge"), events: [], metrics: { comparisons, swaps: 0, writes } };

    while (list1.length > 0 && list2.length > 0) {
        comparisons++;
        yield { 
            snapshot: makeState(`Comparing ${list1[0]} vs ${list2[0]}`), 
            events: [
                { type: 'compare', targetIds: ['List 1'], indices: [0] },
                { type: 'compare', targetIds: ['List 2'], indices: [0] }
            ],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (list1[0] <= list2[0]) {
            const val = list1.shift()!;
            merged.push(val);
            writes++;
            yield { 
                snapshot: makeState(`Taking ${val} from List 1`), 
                events: [{ type: 'write', targetIds: ['Merged List'], indices: [merged.length-1] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            const val = list2.shift()!;
            merged.push(val);
            writes++;
            yield { 
                snapshot: makeState(`Taking ${val} from List 2`), 
                events: [{ type: 'write', targetIds: ['Merged List'], indices: [merged.length-1] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    // Append remaining
    while (list1.length > 0) {
        const val = list1.shift()!;
        merged.push(val);
        writes++;
        yield { 
            snapshot: makeState(`Appending remaining from List 1: ${val}`), 
            events: [{ type: 'write', targetIds: ['Merged List'], indices: [merged.length-1] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }
    while (list2.length > 0) {
        const val = list2.shift()!;
        merged.push(val);
        writes++;
        yield { 
            snapshot: makeState(`Appending remaining from List 2: ${val}`), 
            events: [{ type: 'write', targetIds: ['Merged List'], indices: [merged.length-1] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield { 
        snapshot: makeState("Merge Complete"), 
        events: [{ type: 'lock', targetIds: ['Merged List'], indices: Array.from({length:merged.length},(_,k)=>k) }],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;