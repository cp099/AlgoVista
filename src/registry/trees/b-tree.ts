import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'b-tree-search',
    name: 'B-Tree Key Search',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Hard' as const,
    description: 'Searches for a key in a self-balancing B-Tree by matching keys within multi-key block nodes and branching to appropriate child intervals.',
    pseudocode: [
        'function BTreeSearch(node, key):',
        '  i = 0',
        '  while i < node.keysCount and key > node.keys[i]:',
        '    i++',
        '  if i < node.keysCount and key == node.keys[i]:',
        '    return (node, i) // Found',
        '  if node.isLeaf: return null // Not found',
        '  return BTreeSearch(node.children[i], key)'
    ],
    inputs: [
        {
            id: 'searchKey',
            label: 'Search Key',
            type: 'integer' as const,
            defaultValue: 35,
            constraints: { min: 5, max: 99 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const key = inputs['searchKey'] as number;

    // We can show B-Tree nodes as cell arrays in Matrix2D
    const data: (number | string)[][] = [
        [10, 20, 30, 'Root'],
        [5, 8, '.', 'Child 0'],
        [12, 15, '.', 'Child 1'],
        [22, 25, 28, 'Child 2'],
        [32, 35, 38, 'Child 3']
    ];

    const rowHeaders = ['Root', 'Child 0', 'Child 1', 'Child 2', 'Child 3'];
    const colHeaders = ['Key 1', 'Key 2', 'Key 3', 'Node Label'];

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'btree_grid': {
                    type: 'matrix',
                    id: 'btree_grid',
                    data: data.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    targetSearchKey: key,
                    activeKeyChecked: activeCell ? data[activeCell.r][activeCell.c] : 'None',
                    activeNodeBlock: activeCell ? rowHeaders[activeCell.r] : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Starting B-Tree multi-key search.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    const writes = 0;

    // Search in root keys [10, 20, 30]
    let foundInRoot = false;
    for (let c = 0; c < 3; c++) {
        comparisons++;
        yield {
            snapshot: makeState({ r: 0, c }, `Comparing search key ${key} with Root key ${data[0][c]} at index ${c}.`, 3),
            events: [{ type: 'compare', targetIds: ['btree_grid'], indices: [c] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (key === (data[0][c] as number)) {
            foundInRoot = true;
            break;
        }
    }

    if (!foundInRoot) {
        // Branch to child interval based on target size
        // If key = 35, it falls in Child 3 (since 35 > 30)
        let targetRow = 1;
        if (key > 10 && key <= 20) targetRow = 2;
        else if (key > 20 && key <= 30) targetRow = 3;
        else if (key > 30) targetRow = 4;

        yield {
            snapshot: makeState(null, `Branching to child node block: "${rowHeaders[targetRow]}" (interval interval check).`, 8),
            events: [{ type: 'lock', targetIds: ['btree_grid'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        // Scan keys inside the child node
        for (let c = 0; c < 3; c++) {
            const val = data[targetRow][c];
            if (val === '.') continue;

            comparisons++;
            yield {
                snapshot: makeState({ r: targetRow, c }, `Comparing search key ${key} with key ${val} in child block.`, 3),
                events: [{ type: 'compare', targetIds: ['btree_grid'], indices: [targetRow * 4 + c] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            if (key === (val as number)) {
                yield {
                    snapshot: makeState({ r: targetRow, c }, `Key ${key} successfully FOUND in node "${rowHeaders[targetRow]}" at index ${c}!`, 6),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes }
                };
                return;
            }
        }
    }

    yield {
        snapshot: makeState(null, `Search complete. Key ${key} is NOT present in the B-Tree.`, 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
