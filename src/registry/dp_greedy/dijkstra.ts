import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'dijkstra-greedy',
    name: 'Dijkstra\'s Shortest Path',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the single-source shortest paths from a start vertex to all other vertices in a weighted graph by greedily expanding the closest unvisited vertex.',
    pseudocode: [
        'function Dijkstra(Graph, Start):',
        '  Distances = fill with Infinity, Distances[Start] = 0',
        '  Queue = min-priority queue of all vertices',
        '  while Queue is not empty:',
        '    u = Queue.extractMin()',
        '    for v in Graph.neighbors(u):',
        '      alt = Distances[u] + weight(u, v)',
        '      if alt < Distances[v]:',
        '        Distances[v] = alt',
        '        Queue.decreaseKey(v, alt)'
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

    const dist: Record<string, number> = {};
    for (const n of initialNodes) dist[n.id] = Infinity;
    dist['A'] = 0;

    const makeState = (visitedNodes: string[], activeNode: string | null, msg: string, line: number): AlgoState => {
        const nodesPlot = currentNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeNode) state = 'active';
            else if (visitedNodes.includes(n.id)) state = 'visited';
            return {
                ...n,
                label: `${n.id} (d:${dist[n.id] === Infinity ? 'inf' : dist[n.id]})`,
                state
            };
        });

        // Queue candidates representing greedily evaluated vertices
        const queueItems = currentNodes.filter(n => !visitedNodes.includes(n.id));
        queueItems.sort((a, b) => dist[a.id] - dist[b.id]);

        const greedyCandidates = queueItems.map(n => {
            const isChosen = n.id === activeNode;
            return {
                id: n.id,
                ratio: `Dist:${dist[n.id] === Infinity ? 'inf' : dist[n.id]}`,
                state: isChosen ? ('chosen' as const) : ('active' as const)
            };
        });

        return {
            structures: {
                'dijkstra_graph': {
                    type: 'graph',
                    id: 'dijkstra_graph',
                    nodes: nodesPlot,
                    edges: currentEdges,
                    isDirected: false
                }
            },
            context: {
                variables: {
                    activeSource: activeNode ?? 'None',
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    const visited: string[] = [];

    yield {
        snapshot: makeState([...visited], null, "Initializing Dijkstra distances table. Set A distance = 0.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    while (visited.length < initialNodes.length) {
        // Extract min distance unvisited vertex
        let u: string | null = null;
        let minDist = Infinity;

        for (const n of initialNodes) {
            comparisons++;
            if (!visited.includes(n.id) && dist[n.id] < minDist) {
                minDist = dist[n.id];
                u = n.id;
            }
        }

        if (u === null) break;

        yield {
            snapshot: makeState([...visited], u, `Greedily extracting closest unvisited vertex: "${u}" (distance: ${minDist}).`, 5),
            events: [{ type: 'compare', targetIds: ['dijkstra_graph'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        visited.push(u);
        writes++;

        // Relax neighbors
        for (const e of initialEdges) {
            if (e.source === u || e.target === u) {
                const neighbor = e.source === u ? e.target : e.source;
                if (!visited.includes(neighbor)) {
                    comparisons++;
                    const alt = dist[u] + (e.weight || 0);

                    if (alt < dist[neighbor]) {
                        dist[neighbor] = alt;
                        writes++;

                        yield {
                            snapshot: makeState([...visited], u, `Relaxing neighbor "${neighbor}" through vertex "${u}". New distance: ${alt}.`, 8),
                            events: [{ type: 'write', targetIds: ['dijkstra_graph'], indices: [] }],
                            metrics: { comparisons, swaps: 0, writes }
                        };
                    }
                }
            }
        }
    }

    yield {
        snapshot: makeState(visited, null, "Dijkstra's shortest path search complete.", 10),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
