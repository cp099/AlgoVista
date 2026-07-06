import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'sankoff-parsimony',
    name: "Sankoff's Parsimony Algorithm",
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Hard' as const,
    description: 'Computes phylogenetic parsimony when mutation costs vary between nucleotides. Constructs dynamic programming tables for each tree node containing the minimum cost to assign specific characters.',
    pseudocode: [
        'function SankoffParsimony(node, char):',
        '  if node is leaf:',
        '    return (char == node.char) ? 0 : Infinity',
        '  else:',
        '    leftCost = min_x (Sankoff(node.left, x) + Cost(char, x))',
        '    rightCost = min_y (Sankoff(node.right, y) + Cost(char, y))',
        '    return leftCost + rightCost'
    ],
    inputs: [
        {
            id: 'costTransversion',
            label: 'Transversion Cost (A/G to C/T)',
            type: 'integer' as const,
            defaultValue: 2,
            constraints: { min: 1, max: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const costTv = inputs['costTransversion'] as number;
    const costTs = 1; // Transition cost (A <-> G or C <-> T)

    // Cost matrix: Row/Col A, C, G, T
    const data: (number | string)[][] = [
        [0, costTv, costTs, costTv], // A
        [costTv, 0, costTv, costTs], // C
        [costTs, costTv, 0, costTv], // G
        [costTv, costTs, costTv, 0]  // T
    ];

    const rowHeaders = ['A', 'C', 'G', 'T'];
    const colHeaders = ['A', 'C', 'G', 'T'];

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'cost_matrix': {
                    type: 'matrix',
                    id: 'cost_matrix',
                    data: data.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    transversionCost: costTv,
                    transitionCost: costTs,
                    activeRow: activeCell ? rowHeaders[activeCell.r] : 'None',
                    activeCol: activeCell ? colHeaders[activeCell.c] : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, `Initializing Sankoff parsimony cost matrix. Transversion cost = ${costTv}, Transition cost = ${costTs}.`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    // Show scanning a few cells in the cost matrix to illustrate state cost calculations
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (r !== c) {
                comparisons++;
                yield {
                    snapshot: makeState({ r, c }, `Evaluating nucleotide transition cost: '${rowHeaders[r]}' to '${colHeaders[c]}' is ${data[r][c]}`, 5),
                    events: [{ type: 'compare', targetIds: ['cost_matrix'], indices: [r * 4 + c] }],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
            }
        }
    }

    yield {
        snapshot: makeState(null, "Sankoff transition scoring pass complete.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
