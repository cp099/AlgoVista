import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'huffman-greedy',
    name: 'Huffman Coding Tree',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Generates optimal variable-length prefix codes for characters based on their frequencies by greedily merging the lowest frequency nodes in a priority queue.',
    pseudocode: [
        'function HuffmanCoding(Chars, Freqs):',
        '  Queue = InitializePriorityQueue(Chars, Freqs)',
        '  while Queue.size > 1:',
        '    Left = Queue.popMin()',
        '    Right = Queue.popMin()',
        '    Parent = CreateNode(Left.freq + Right.freq)',
        '    Queue.push(Parent)',
        '  return Queue.popMin()'
    ],
    inputs: [
        {
            id: 'charsCount',
            label: 'Alphabet Size',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['charsCount'] as number;

    const initialLeafs = [
        { id: 'A', freq: 45, x: 200, y: 220 },
        { id: 'B', freq: 13, x: 350, y: 220 },
        { id: 'C', freq: 12, x: 500, y: 220 },
        { id: 'D', freq: 30, x: 650, y: 220 }
    ].slice(0, size);

    const initialNodes: GraphNode[] = initialLeafs.map(l => ({
        id: l.id, val: 0, label: `${l.id}:${l.freq}`, x: l.x, y: l.y, state: 'default' as const
    }));

    const currentNodes = [...initialNodes];
    const currentEdges: GraphEdge[] = [];

    const makeState = (queue: { id: string; freq: number }[], activePair: string[], msg: string, line: number): AlgoState => {
        const nodesPlot = currentNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (activePair.includes(n.id)) state = 'active';
            return { ...n, state };
        });

        // Sorted greedy candidates represent the priority queue state
        const sortedQueue = [...queue].sort((a, b) => a.freq - b.freq);
        const greedyCandidates = sortedQueue.map(item => {
            const isChosen = activePair.includes(item.id);
            return {
                id: item.id,
                ratio: `Freq:${item.freq}`,
                state: isChosen ? ('chosen' as const) : ('active' as const)
            };
        });

        return {
            structures: {
                'huffman_tree': {
                    type: 'graph',
                    id: 'huffman_tree',
                    nodes: nodesPlot,
                    edges: [...currentEdges],
                    isDirected: true
                }
            },
            context: {
                variables: {
                    activeQueueSize: queue.length,
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    const queue = initialLeafs.map(l => ({ id: l.id, freq: l.freq }));

    yield {
        snapshot: makeState([...queue], [], "Initializing Huffman leaves priority queue.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let parentCounter = 1;

    while (queue.length > 1) {
        comparisons++;
        // Sort priority queue to pick two lowest frequencies
        queue.sort((a, b) => a.freq - b.freq);

        const left = queue.shift()!;
        const right = queue.shift()!;
        const parentId = `N${parentCounter++}`;
        const parentFreq = left.freq + right.freq;

        // Position parent node in the middle above children
        const leftNode = currentNodes.find(n => n.id === left.id)!;
        const rightNode = currentNodes.find(n => n.id === right.id)!;
        const px = ((leftNode.x || 0) + (rightNode.x || 0)) / 2;
        const py = Math.min(leftNode.y || 0, rightNode.y || 0) - 60;

        const parentNode: GraphNode = {
            id: parentId,
            val: 0,
            label: `${parentId}:${parentFreq}`,
            x: px,
            y: py,
            state: 'default'
        };

        yield {
            snapshot: makeState([left, right, ...queue], [left.id, right.id], `Selected two nodes with lowest frequency: "${left.id}" (${left.freq}) and "${right.id}" (${right.freq})`, 4),
            events: [{ type: 'compare', targetIds: ['huffman_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        currentNodes.push(parentNode);
        currentEdges.push({ source: parentId, target: left.id });
        currentEdges.push({ source: parentId, target: right.id });
        queue.push({ id: parentId, freq: parentFreq });
        writes += 3;

        yield {
            snapshot: makeState([...queue], [parentId], `Merged into new parent node "${parentId}" (freq: ${parentFreq}).`, 6),
            events: [{ type: 'lock', targetIds: ['huffman_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    yield {
        snapshot: makeState([...queue], [], "Huffman prefix tree constructed successfully.", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
