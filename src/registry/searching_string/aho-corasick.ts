import { AlgorithmBundle, AlgoState, GraphNode, GraphEdge } from '@core/types';

const manifest = {
    id: 'aho-corasick',
    name: 'Aho-Corasick',
    category: 'Searching & String',
    difficulty: 'Advanced' as const,
    description: 'Constructs a finite automaton (Trie with failure links) for finding multiple patterns in a text simultaneously.',
    pseudocode: [
        'root = new Node()',
        'for word in patterns: insert(root, word)',
        'queue = []',
        'for child in root: queue.push(child), fail[child] = root',
        'while queue not empty:',
        '  u = queue.pop()',
        '  for v in u.children:',
        '    fail[v] = step(fail[u], char)',
        '    queue.push(v)'
    ],
    inputs: [
        {
            id: 'patterns',
            label: 'Patterns (comma separated)',
            type: 'array' as const,
            defaultValue: ["he", "she", "his", "hers"],
            constraints: { maxLength: 5 }
        }
    ]
};

// Trie Node Helper
class TrieNode {
    id: string;
    char: string;
    children: Record<string, TrieNode> = {};
    fail: TrieNode | null = null;
    isWord: boolean = false;
    x: number;
    y: number;

    constructor(id: string, char: string, x: number, y: number) {
        this.id = id;
        this.char = char;
        this.x = x;
        this.y = y;
    }
}

const run: AlgorithmBundle['run'] = function* (inputs) {
    const patterns = (inputs['patterns'] as any[]).map(String);
    
    // Graph State
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];
    
    const root = new TrieNode("root", "root", 400, 50);
    nodes.push({ id: root.id, val: 0, label: "ROOT", x: root.x, y: root.y });

    const makeState = (msg: string, line: number = 0): AlgoState => ({
        structures: { 
            'trie': { type: 'graph', id: 'Aho-Corasick Trie', nodes: [...nodes], edges: [...edges], isDirected: true }
        },
        context: { variables: {}, pseudocodeLine: line, message: msg }
    });

    yield { snapshot: makeState("Starting Trie Construction", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // 1. INSERT PATTERNS
    let nodeIdCounter = 1;
    
    for (const pat of patterns) {
        let curr = root;
        let depth = 0;

        yield { snapshot: makeState(`Inserting pattern "${pat}"`, 2), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

        for (const char of pat) {
            depth++;
            if (!curr.children[char]) {
                const x = curr.x + (Math.random() * 100 - 50); 
                const y = curr.y + 80;
                
                const newNode = new TrieNode(`n${nodeIdCounter++}`, char, x, y);
                curr.children[char] = newNode;
                
                nodes.push({ id: newNode.id, val: char.charCodeAt(0), label: char, x, y });
                edges.push({ source: curr.id, target: newNode.id });
                
                yield { 
                    snapshot: makeState(`Adding node '${char}'`, 2), 
                    events: [{ type: 'write', targetIds: ['Aho-Corasick Trie'], indices: [parseInt(newNode.id.slice(1)) || 0] }], 
                    metrics: { comparisons: 0, swaps: 0, writes: 0 } 
                };
            }
            curr = curr.children[char];
        }
        curr.isWord = true;
        yield { 
            snapshot: makeState(`Marked '${pat}' end`, 2), 
            events: [{ type: 'lock', targetIds: ['Aho-Corasick Trie'], indices: [parseInt(curr.id.slice(1)) || 0] }],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    yield { snapshot: makeState("Trie Construction Complete", 5), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;