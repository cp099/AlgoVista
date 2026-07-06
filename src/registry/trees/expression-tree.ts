import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'expression-tree-eval',
    name: 'Expression Tree Evaluator',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Recursively evaluates an arithmetic expression tree containing operator nodes (+, -, *, /) and integer leaf nodes.',
    pseudocode: [
        'function EvaluateExpression(node):',
        '  if node.isLeaf: return node.val',
        '  leftVal = EvaluateExpression(node.left)',
        '  rightVal = EvaluateExpression(node.right)',
        '  return ApplyOperator(node.operator, leftVal, rightVal)'
    ],
    inputs: [
        {
            id: 'multiplier',
            label: 'Leaf Value Scale Multiplier',
            type: 'integer' as const,
            defaultValue: 1,
            constraints: { min: 1, max: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const scale = inputs['multiplier'] as number;

    const initialNodes = [
        { id: 'mult', val: 0, label: '*' },
        { id: 'add', val: 0, label: '+' },
        { id: 'val5', val: 5 * scale, label: String(5 * scale) },
        { id: 'val3', val: 3 * scale, label: String(3 * scale) },
        { id: 'val4', val: 4 * scale, label: String(4 * scale) }
    ];

    const initialEdges = [
        { source: 'mult', target: 'add' },
        { source: 'mult', target: 'val4' },
        { source: 'add', target: 'val5' },
        { source: 'add', target: 'val3' }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, runningVal: number, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'expression_tree': {
                    type: 'graph',
                    id: 'expression_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    activeExpression: '(5 + 3) * 4',
                    activeNodeLabel: activeId ? initialNodes.find(n => n.id === activeId)?.label : 'None',
                    evaluatedSubValue: runningVal
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, 0, "Starting recursive expression tree evaluation.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = [];

    // Evaluate root '*'
    comparisons++;
    visited.push('mult');
    yield {
        snapshot: makeState([...visited], 'mult', 0, "Checking root node operator '*'. Evaluating left subproblem.", 2),
        events: [{ type: 'compare', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate '+' operator
    comparisons++;
    visited.push('add');
    yield {
        snapshot: makeState([...visited], 'add', 0, "Checking left subproblem node '+'. Evaluating its left leaf node.", 2),
        events: [{ type: 'compare', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate leaf 5
    comparisons++;
    visited.push('val5');
    yield {
        snapshot: makeState([...visited], 'val5', 5 * scale, `Found leaf node value ${5 * scale}. Returning.`, 2),
        events: [{ type: 'compare', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate leaf 3
    comparisons++;
    visited.push('val3');
    yield {
        snapshot: makeState([...visited], 'val3', 3 * scale, `Found leaf node value ${3 * scale}. Returning.`, 2),
        events: [{ type: 'compare', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate addition result: 5 + 3 = 8
    const sumVal = (5 + 3) * scale;
    writes++;
    yield {
        snapshot: makeState([...visited], 'add', sumVal, `Addition subproblem complete: ${5*scale} + ${3*scale} = ${sumVal}. Returning sum.`, 5),
        events: [{ type: 'write', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate leaf 4
    comparisons++;
    visited.push('val4');
    yield {
        snapshot: makeState([...visited], 'val4', 4 * scale, `Found leaf node value ${4 * scale}. Returning.`, 2),
        events: [{ type: 'compare', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    // Evaluate multiplication: 8 * 4 = 32
    const finalVal = sumVal * 4 * scale;
    writes++;
    yield {
        snapshot: makeState([...visited], 'mult', finalVal, `Multiplication complete: ${sumVal} * ${4*scale} = ${finalVal}.`, 5),
        events: [{ type: 'write', targetIds: ['expression_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes }
    };

    yield {
        snapshot: makeState([...visited], null, finalVal, `Expression tree evaluation finished. Result value: ${finalVal}`, 5),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
