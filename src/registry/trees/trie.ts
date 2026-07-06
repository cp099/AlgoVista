import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'trie-prefix',
    name: 'Trie Prefix Search',
    category: 'Trees & Hierarchical Structures',
    difficulty: 'Medium' as const,
    description: 'Searches for word keys and prefixes in a character Trie by walking down sequential character node branches.',
    pseudocode: [
        'function SearchTrie(root, word):',
        '  curr = root',
        '  for char in word:',
        '    if curr.children[char] is null:',
        '      return false // Not found',
        '    curr = curr.children[char]',
        '  return curr.isEndOfWord'
    ],
    inputs: [
        {
            id: 'word',
            label: 'Search Word',
            type: 'string' as const,
            defaultValue: 'CAT',
            constraints: { minLength: 2, maxLength: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const word = (inputs['word'] as string).toUpperCase();

    const initialNodes = [
        { id: 'root', val: 0, label: 'Root' },
        { id: 'C', val: 0, label: 'C' },
        { id: 'CA', val: 0, label: 'A' },
        { id: 'CAT', val: 0, label: 'T (Word)' },
        { id: 'CO', val: 0, label: 'O' },
        { id: 'COD', val: 0, label: 'D (Word)' }
    ];

    const initialEdges = [
        { source: 'root', target: 'C' },
        { source: 'C', target: 'CA' },
        { source: 'CA', target: 'CAT' },
        { source: 'C', target: 'CO' },
        { source: 'CO', target: 'COD' }
    ];

    const makeState = (visitedIds: string[], activeId: string | null, msg: string, line: number): AlgoState => {
        const plotNodes = initialNodes.map(n => {
            let state: 'default' | 'active' | 'visited' | 'lock' = 'default';
            if (n.id === activeId) state = 'active';
            else if (visitedIds.includes(n.id)) state = 'visited';
            return { ...n, state };
        });

        return {
            structures: {
                'trie_tree': {
                    type: 'graph',
                    id: 'trie_tree',
                    layout: 'tree' as const,
                    nodes: plotNodes,
                    edges: initialEdges,
                    isDirected: true
                }
            },
            context: {
                variables: {
                    searchTargetWord: word,
                    activeNodeChar: activeId || 'None',
                    visitedPrefix: visitedIds.join(' -> ')
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], null, `Starting prefix Trie search for word "${word}".`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const visited: string[] = ['root'];

    let path = '';
    let found = true;

    for (let i = 0; i < word.length; i++) {
        comparisons++;
        const char = word[i];
        path += (path === '' ? char : char);

        // Check if node exists matching the path
        const nextNode = initialNodes.find(n => n.id === path);

        if (!nextNode) {
            found = false;
            yield {
                snapshot: makeState([...visited], null, `Character '${char}' not found along active prefix path. Search failed.`, 4),
                events: [],
                metrics: { comparisons, swaps: 0, writes }
            };
            break;
        }

        visited.push(path);
        writes++;

        yield {
            snapshot: makeState([...visited], path, `Found character '${char}' node branch. Advancing.`, 5),
            events: [{ type: 'compare', targetIds: ['trie_tree'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes }
        };
    }

    if (found) {
        const leafNode = initialNodes.find(n => n.id === path);
        const isWord = leafNode?.label.includes('(Word)');

        yield {
            snapshot: makeState([...visited], path, `Search complete. Prefix matched! ${isWord ? 'Word exists.' : 'Substring is prefix only.'}`, 7),
            events: [],
            metrics: { comparisons, swaps: 0, writes }
        };
    }
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
