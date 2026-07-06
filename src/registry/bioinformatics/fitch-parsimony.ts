import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'fitch-parsimony',
    name: "Fitch's Phylogenetic Parsimony",
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: "Computes the minimal number of mutations required to explain leaf character states on a phylogenetic tree. Runs a bottom-up pass building candidate intersection sets at internal nodes.",
    pseudocode: [
        'function FitchParsimony(node):',
        '  if node is leaf:',
        '    node.set = { node.character }',
        '  else:',
        '    leftSet = FitchParsimony(node.left)',
        '    rightSet = FitchParsimony(node.right)',
        '    if intersection(leftSet, rightSet) is not empty:',
        '      node.set = intersection(leftSet, rightSet)',
        '    else:',
        '      node.set = union(leftSet, rightSet)',
        '      totalScore = totalScore + 1'
    ],
    inputs: [
        {
            id: 'char1',
            label: 'Taxon A State',
            type: 'string' as const,
            defaultValue: 'A',
            constraints: { minLength: 1, maxLength: 1 }
        },
        {
            id: 'char2',
            label: 'Taxon B State',
            type: 'string' as const,
            defaultValue: 'G',
            constraints: { minLength: 1, maxLength: 1 }
        },
        {
            id: 'char3',
            label: 'Taxon C State',
            type: 'string' as const,
            defaultValue: 'A',
            constraints: { minLength: 1, maxLength: 1 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const c1 = (inputs['char1'] as string).toUpperCase();
    const c2 = (inputs['char2'] as string).toUpperCase();
    const c3 = (inputs['char3'] as string).toUpperCase();

    // Define tree layout: Leaf A, Leaf B join at Ancestor U1.
    // U1 and Leaf C join at Ancestor U2 (Root).
    const initialNodes = [
        { id: 'A', val: 0, label: `A: {${c1}}`, x: 250, y: 220, state: 'default' as const },
        { id: 'B', val: 0, label: `B: {${c2}}`, x: 350, y: 220, state: 'default' as const },
        { id: 'C', val: 0, label: `C: {${c3}}`, x: 500, y: 220, state: 'default' as const },
        { id: 'U1', val: 0, label: 'Ancestor U1: ?', x: 300, y: 140, state: 'default' as const },
        { id: 'U2', val: 0, label: 'Root U2: ?', x: 400, y: 60, state: 'default' as const }
    ];

    const edges = [
        { source: 'A', target: 'U1', weight: 0 },
        { source: 'B', target: 'U1', weight: 0 },
        { source: 'U1', target: 'U2', weight: 0 },
        { source: 'C', target: 'U2', weight: 0 }
    ];

    const makeState = (nodesList: typeof initialNodes, activeId: string | null, mutations: number, msg: string, line: number): AlgoState => {
        const plotNodes = nodesList.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            return { ...n, state };
        });

        return {
            structures: {
                'parsimony_tree': {
                    type: 'graph',
                    id: 'parsimony_tree',
                    nodes: plotNodes,
                    edges,
                    isDirected: false
                }
            },
            context: {
                variables: {
                    mutationsCount: mutations,
                    taxonA: c1,
                    taxonB: c2,
                    taxonC: c3,
                    activeBranchNode: activeId || 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(initialNodes, null, 0, "Starting Fitch Parsimony bottom-up pass on the phylogenetic tree.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let mutations = 0;
    const currentNodes = [...initialNodes];

    // Step 1: Compute U1 set from children A and B
    comparisons++;
    let u1Set: string[] = [];
    let isIntersectU1 = false;
    let u1Msg = "";

    if (c1 === c2) {
        u1Set = [c1];
        isIntersectU1 = true;
        u1Msg = `Intersection of A{${c1}} and B{${c2}} is not empty: U1 set = {${c1}}. Mutation cost = 0.`;
    } else {
        u1Set = [c1, c2];
        mutations++;
        u1Msg = `Intersection of A{${c1}} and B{${c2}} is empty. Union U1 set = {${c1}, ${c2}}. Mutation cost = 1.`;
    }

    currentNodes[3] = { ...currentNodes[3], label: `Ancestor U1: {${u1Set.join(',')}}` };

    yield {
        snapshot: makeState(currentNodes, 'U1', mutations, u1Msg, 7),
        events: [{ type: isIntersectU1 ? 'lock' : 'swap', targetIds: ['parsimony_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes: 1 }
    };

    // Step 2: Compute U2 (Root) from child U1 and child C
    comparisons++;
    let u2Set: string[] = [];
    let isIntersectU2 = false;
    let u2Msg = "";

    const intersects = u1Set.includes(c3);

    if (intersects) {
        u2Set = [c3];
        isIntersectU2 = true;
        u2Msg = `Intersection of U1{${u1Set.join(',')}} and C{${c3}} is not empty: Root U2 = {${c3}}. Mutation cost unchanged.`;
    } else {
        u2Set = [...u1Set, c3];
        mutations++;
        u2Msg = `Intersection of U1{${u1Set.join(',')}} and C{${c3}} is empty. Union Root U2 = {${u2Set.join(',')}}. Mutation cost +1.`;
    }

    currentNodes[4] = { ...currentNodes[4], label: `Root U2: {${u2Set.join(',')}}` };

    yield {
        snapshot: makeState(currentNodes, 'U2', mutations, u2Msg, 7),
        events: [{ type: isIntersectU2 ? 'lock' : 'swap', targetIds: ['parsimony_tree'], indices: [] }],
        metrics: { comparisons, swaps: 0, writes: 2 }
    };

    yield {
        snapshot: makeState(currentNodes, null, mutations, `Parsimony check complete. Minimum mutations required: ${mutations}.`, 11),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 2 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
