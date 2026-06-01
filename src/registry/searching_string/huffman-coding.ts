import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'huffman-coding',
    name: 'Huffman Coding',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'A compression algorithm that assigns variable-length codes to input characters, with shorter codes assigned to more frequent characters. It builds a binary tree bottom-up.',
    pseudocode: [
        'count frequencies',
        'create leaf node for each char',
        'insert all nodes into Min-Priority Queue',
        'while queue size > 1:',
        '  left = extractMin()',
        '  right = extractMin()',
        '  top = new Node(left.freq + right.freq)',
        '  top.left = left, top.right = right',
        '  insert(top)',
        'return root'
    ],
    inputs: [
        {
            id: 'str',
            label: 'String',
            type: 'string' as const,
            defaultValue: "BEEP BOOP",
            constraints: { maxLength: 15 }
        }
    ]
};

// Huffman Node
class HNode {
    id: string;
    char: string | null;
    freq: number;
    left: HNode | null = null;
    right: HNode | null = null;
    x: number;
    y: number;

    constructor(id: string, char: string | null, freq: number, x: number, y: number) {
        this.id = id;
        this.char = char;
        this.freq = freq;
        this.x = x;
        this.y = y;
    }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const str = String(inputs['str']);
    
    // 1. Freq Map
    const freqs: Record<string, number> = {};
    for (const char of str) freqs[char] = (freqs[char] || 0) + 1;

    // 2. Initial Forest
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];
    let hNodes: HNode[] = [];
    let idCounter = 0;

    const entries = Object.entries(freqs).sort((a, b) => a[1] - b[1]); // Pre-sort for visuals
    
    // Spread nodes horizontally
    const width = 800;
    const gap = width / (entries.length + 1);

    entries.forEach(([char, freq], i) => {
        const node = new HNode(`n${idCounter++}`, char, freq, gap * (i + 1), 350);
        hNodes.push(node);
        nodes.push({ id: node.id, val: freq, label: `${char}:${freq}`, x: node.x, y: node.y });
    });

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'tree': { type: 'graph', id: 'Huffman Forest', nodes: [...nodes], edges: [...edges], isDirected: true }
        },
        context: { variables: {}, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Initialized Leaf Nodes (Char:Freq)", 3), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 3. Build Tree
    while (hNodes.length > 1) {
        // Find 2 smallest (Sort every time to simulate Priority Queue)
        hNodes.sort((a, b) => a.freq - b.freq);
        
        const left = hNodes.shift()!;
        const right = hNodes.shift()!;

        yield { 
            snapshot: makeState(`Merging '${left.char || 'node'}' (${left.freq}) and '${right.char || 'node'}' (${right.freq})`, 4), 
            events: [
                { type: 'compare', targetIds: ['Huffman Forest'], indices: [parseInt(left.id.slice(1))] },
                { type: 'compare', targetIds: ['Huffman Forest'], indices: [parseInt(right.id.slice(1))] }
            ],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Create Parent
        // Position parent between children, but higher up
        const newX = (left.x + right.x) / 2;
        const newY = Math.min(left.y, right.y) - 60; // Move up
        
        const parent = new HNode(`n${idCounter++}`, null, left.freq + right.freq, newX, newY);
        parent.left = left;
        parent.right = right;

        // Update visuals
        hNodes.push(parent);
        nodes.push({ id: parent.id, val: parent.freq, label: String(parent.freq), x: parent.x, y: parent.y });
        edges.push({ source: parent.id, target: left.id });
        edges.push({ source: parent.id, target: right.id });

        yield { 
            snapshot: makeState(`Created Parent Node (${parent.freq})`, 7), 
            events: [{ type: 'write', targetIds: ['Huffman Forest'], indices: [parseInt(parent.id.slice(1))] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    yield { snapshot: makeState("Huffman Tree Complete", 10), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;