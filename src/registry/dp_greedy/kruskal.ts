import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'kruskal-greedy',
    name: 'Kruskal\'s Minimum Spanning Tree',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the Minimum Spanning Tree (MST) of a connected weighted graph by sorting all edges by weight and greedily adding non-cycling edges using a Disjoint Set (Union-Find) structure.',
    pseudocode: [
        'function Kruskal(Graph):',
        '  Sort Graph.edges ascending by weight',
        '  MST = []',
        '  DSU = InitializeDSU(Graph.vertices)',
        '  for edge in Graph.edges:',
        '    if DSU.find(edge.source) != DSU.find(edge.target):',
        '      DSU.union(edge.source, edge.target)',
        '      MST.push(edge)',
        '  return MST'
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

    // Sort edges by weight ascending
    const sortedEdges = [...initialEdges].sort((a, b) => (a.weight || 0) - (b.weight || 0));

    const currentNodes = [...initialNodes];
    const currentEdges = [...initialEdges];

    const makeState = (activeEdge: GraphEdge | null, mstEdges: GraphEdge[], activeIdx: number | null, msg: string, line: number): AlgoState => {
        const nodesPlot = currentNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (activeEdge && (n.id === activeEdge.source || n.id === activeEdge.target)) {
                state = 'active';
            }
            return { ...n, state };
        });

        const edgesPlot = currentEdges.map(e => {
            const isMST = mstEdges.some(me => me.source === e.source && me.target === e.target);
            return { ...e, isMST };
        });

        const greedyCandidates = sortedEdges.map((e, idx) => {
            let state: 'default' | 'active' | 'chosen' = 'default';
            if (idx === activeIdx) state = 'active';
            else if (mstEdges.some(me => me.source === e.source && me.target === e.target)) state = 'chosen';
            return {
                id: `${e.source}-${e.target}`,
                ratio: `Weight:${e.weight}`,
                state
            };
        });

        return {
            structures: {
                'kruskal_graph': {
                    type: 'graph',
                    id: 'kruskal_graph',
                    nodes: nodesPlot,
                    edges: edgesPlot,
                    isDirected: false
                }
            },
            context: {
                variables: {
                    mstEdgeCount: mstEdges.length,
                    activeEdgeId: activeEdge ? `${activeEdge.source}-${activeEdge.target}` : 'None',
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], null, "Kruskal's MST initialization. Sorting all edges by weight.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const mst: GraphEdge[] = [];

    // Simple Union-Find for A, B, C, D
    const parent: Record<string, string> = {};
    for (const n of initialNodes) parent[n.id] = n.id;

    const find = (u: string): string => {
        if (parent[u] === u) return u;
        return find(parent[u]);
    };

    const union = (u: string, v: string): boolean => {
        const rootU = find(u);
        const rootV = find(v);
        if (rootU !== rootV) {
            parent[rootU] = rootV;
            return true;
        }
        return false;
    };

    for (let i = 0; i < sortedEdges.length; i++) {
        comparisons++;
        const edge = sortedEdges[i];

        yield {
            snapshot: makeState(edge, [...mst], i, `Evaluating cheapest edge: ${edge.source} - ${edge.target} (weight: ${edge.weight}).`, 5),
            events: [{ type: 'compare', targetIds: ['kruskal_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        const u = find(edge.source);
        const v = find(edge.target);

        if (u !== v) {
            union(u, v);
            mst.push(edge);
            writes++;

            yield {
                snapshot: makeState(edge, [...mst], i, `No cycle detected. Adding edge ${edge.source} - ${edge.target} to MST.`, 7),
                events: [{ type: 'lock', targetIds: ['kruskal_graph'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            yield {
                snapshot: makeState(edge, [...mst], i, `Edge ${edge.source} - ${edge.target} forms a cycle in the tree. Rejected.`, 6),
                events: [{ type: 'compare', targetIds: ['kruskal_graph'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [...mst], null, "Kruskal's Minimum Spanning Tree solved successfully.", 9),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
