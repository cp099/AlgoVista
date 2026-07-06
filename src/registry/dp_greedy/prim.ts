import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'prim-greedy',
    name: 'Prim\'s Minimum Spanning Tree',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the Minimum Spanning Tree (MST) of a connected weighted graph by starting from a single node and greedily expanding the cut edge of minimum weight.',
    pseudocode: [
        'function Prim(Graph, Start):',
        '  Visited = [Start]',
        '  MST = []',
        '  while Visited is not all vertices:',
        '    Find edge (u, v) with min weight where u is Visited, v is not',
        '    Visited.push(v)',
        '    MST.push(edge)'
    ],
    inputs: [
        {
            id: 'vertexCount',
            label: 'Vertices Density',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 3, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const vCount = inputs['vertexCount'] as number;

    const initialNodes: GraphNode[] = [
        { id: 'A', val: 0, label: 'A', x: 250, y: 100, state: 'default' as const },
        { id: 'B', val: 0, label: 'B', x: 250, y: 220, state: 'default' as const },
        { id: 'C', val: 0, label: 'C', x: 550, y: 100, state: 'default' as const },
        { id: 'D', val: 0, label: 'D', x: 550, y: 220, state: 'default' as const }
    ].slice(0, vCount);

    const initialEdges: GraphEdge[] = [
        { source: 'A', target: 'B', weight: 1 },
        { source: 'B', target: 'C', weight: 4 },
        { source: 'A', target: 'C', weight: 5 },
        { source: 'C', target: 'D', weight: 2 },
        { source: 'B', target: 'D', weight: 6 }
    ].filter(e => {
        const hasSrc = initialNodes.some(n => n.id === e.source);
        const hasTgt = initialNodes.some(n => n.id === e.target);
        return hasSrc && hasTgt;
    });

    const currentNodes = [...initialNodes];
    const currentEdges = [...initialEdges];

    const makeState = (visitedNodes: string[], mstEdges: GraphEdge[], activeEdge: GraphEdge | null, msg: string, line: number): AlgoState => {
        const nodesPlot = currentNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (activeEdge && (n.id === activeEdge.source || n.id === activeEdge.target)) state = 'active';
            else if (visitedNodes.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        const edgesPlot = currentEdges.map(e => {
            const isMST = mstEdges.some(me => (me.source === e.source && me.target === e.target) || (me.target === e.source && me.source === e.target));
            return { ...e, isMST };
        });

        // Greedy candidates: frontier edges
        const frontierEdges: GraphEdge[] = [];
        for (const e of initialEdges) {
            const uVisited = visitedNodes.includes(e.source);
            const vVisited = visitedNodes.includes(e.target);
            if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
                frontierEdges.push(e);
            }
        }
        frontierEdges.sort((a, b) => (a.weight || 0) - (b.weight || 0));

        const greedyCandidates = frontierEdges.map(e => {
            const isChosen = activeEdge !== null && ((e.source === activeEdge.source && e.target === activeEdge.target) || (e.target === activeEdge.source && e.source === activeEdge.target));
            return {
                id: `${e.source}-${e.target}`,
                ratio: `Weight:${e.weight}`,
                state: isChosen ? ('chosen' as const) : ('active' as const)
            };
        });

        return {
            structures: {
                'prim_graph': {
                    type: 'graph',
                    id: 'prim_graph',
                    nodes: nodesPlot,
                    edges: edgesPlot,
                    isDirected: false
                }
            },
            context: {
                variables: {
                    visitedVertices: visitedNodes.join(', '),
                    mstWeight: mstEdges.reduce((sum, e) => sum + (e.weight || 0), 0),
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    const visited = ['A'];
    const mst: GraphEdge[] = [];

    yield {
        snapshot: makeState([...visited], [...mst], null, "Initializing Prim's MST starting from vertex A.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;

    while (visited.length < initialNodes.length) {
        // Find minimum edge connecting visited to unvisited
        let minEdge: GraphEdge | null = null;
        let minWt = Infinity;

        for (const e of initialEdges) {
            comparisons++;
            const uVisited = visited.includes(e.source);
            const vVisited = visited.includes(e.target);

            if ((uVisited && !vVisited) || (!uVisited && vVisited)) {
                if ((e.weight || 0) < minWt) {
                    minWt = e.weight || 0;
                    minEdge = e;
                }
            }
        }

        if (minEdge) {
            const nextNode = visited.includes(minEdge.source) ? minEdge.target : minEdge.source;
            
            yield {
                snapshot: makeState([...visited], [...mst], minEdge, `Evaluating frontier edges. Minimum cut edge found: ${minEdge.source} - ${minEdge.target} (weight: ${minEdge.weight}).`, 5),
                events: [{ type: 'compare', targetIds: ['prim_graph'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };

            visited.push(nextNode);
            mst.push(minEdge);
            writes++;

            yield {
                snapshot: makeState([...visited], [...mst], minEdge, `Added edge ${minEdge.source} - ${minEdge.target} and vertex ${nextNode} to MST.`, 6),
                events: [{ type: 'lock', targetIds: ['prim_graph'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            break;
        }
    }

    yield {
        snapshot: makeState(visited, mst, null, "Prim's Minimum Spanning Tree complete.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
