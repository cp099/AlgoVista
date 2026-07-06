import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'blast-search',
    name: 'BLAST Local Alignment Search Heuristic',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Models the seed-and-extend database lookup heuristic. Locates short seed word matches (length k) and extends them on both sides to evaluate local alignment score boundaries.',
    pseudocode: [
        'function BLASTSearch(Query, Database, k):',
        '  Seeds = generate all subwords of Query of length k',
        '  for each Seed in Seeds:',
        '    for each offset in Database matching Seed:',
        '      Extend seed left and right',
        '      Stop extension if score drops below threshold T',
        '      Save matching High-scoring Segment Pairs (HSP)'
    ],
    inputs: [
        {
            id: 'query',
            label: 'DNA Query (e.g. TGCA)',
            type: 'string' as const,
            defaultValue: 'TGCA',
            constraints: { minLength: 3, maxLength: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const query = (inputs['query'] as string).toUpperCase();
    const database = "ATGCTAGCTCAGC"; // Reference database sequence

    const k = 3; // Seed word length

    const makeState = (_textHl: number[], _patHl: number[], activeOffset: number, msg: string, line: number): AlgoState => {
        const textData = database.split('');
        const patternData = query.split('');

        return {
            structures: {
                'text': { type: 'array', id: 'text', data: textData },
                'pattern': { type: 'array', id: 'pattern', data: patternData }
            },
            context: {
                variables: {
                    activeOffset,
                    query,
                    database,
                    seedSize: k
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], [], 0, "Initializing BLAST heuristic scan. Generating query seeds of size k=3.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    
    // Find all seeds of length k in query
    const seeds: string[] = [];
    for (let i = 0; i <= query.length - k; i++) {
        seeds.push(query.slice(i, i + k));
    }

    yield {
        snapshot: makeState([], [], 0, `Generated query seeds: ${seeds.map(s => `"${s}"`).join(', ')}. Matching seeds against database...`, 2),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 0 }
    };

    for (const seed of seeds) {
        const seedIndex = query.indexOf(seed);
        
        // Scan database for seed occurrences
        for (let dbOffset = 0; dbOffset <= database.length - k; dbOffset++) {
            comparisons++;
            const dbWord = database.slice(dbOffset, dbOffset + k);

            // Animate scanning/comparison
            const compareTextIndices = Array.from({ length: k }, (_, i) => dbOffset + i);
            const comparePatIndices = Array.from({ length: k }, (_, i) => seedIndex + i);

            yield {
                snapshot: makeState(compareTextIndices, comparePatIndices, dbOffset, `Comparing database subword "${dbWord}" with seed "${seed}"`, 3),
                events: [{ type: 'compare', targetIds: ['text', 'pattern'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };

            if (dbWord === seed) {
                // Found seed hit!
                yield {
                    snapshot: makeState(compareTextIndices, comparePatIndices, dbOffset, `Seed Hit! Match found at database offset ${dbOffset}. Commencing left-right extension...`, 4),
                    events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes: 1 }
                };

                // Perform alignment extensions left and right
                let left = dbOffset - 1;
                let right = dbOffset + k;
                let qLeft = seedIndex - 1;
                let qRight = seedIndex + k;

                let hspScore = k; // seed length matches score
                const hspTextIndices = [...compareTextIndices];
                const hspPatIndices = [...comparePatIndices];

                // Extend right
                while (left >= 0 && qLeft >= 0) {
                    comparisons++;
                    hspTextIndices.unshift(left);
                    hspPatIndices.unshift(qLeft);

                    if (database[left] === query[qLeft]) {
                        hspScore++;
                        yield {
                            snapshot: makeState(hspTextIndices, hspPatIndices, dbOffset, `Extended left: matches '${database[left]}' (Score: ${hspScore})`, 5),
                            events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                            metrics: { comparisons, swaps: 0, writes: 1 }
                        };
                    } else {
                        hspScore--;
                        yield {
                            snapshot: makeState(hspTextIndices, hspPatIndices, dbOffset, `Extended left: mismatch '${database[left]}' vs '${query[qLeft]}' (Score: ${hspScore})`, 5),
                            events: [{ type: 'swap', targetIds: ['text', 'pattern'], indices: [] }],
                            metrics: { comparisons, swaps: 0, writes: 1 }
                        };
                        break; // Stop extension if score drops
                    }
                    left--;
                    qLeft--;
                }

                while (right < database.length && qRight < query.length) {
                    comparisons++;
                    hspTextIndices.push(right);
                    hspPatIndices.push(qRight);

                    if (database[right] === query[qRight]) {
                        hspScore++;
                        yield {
                            snapshot: makeState(hspTextIndices, hspPatIndices, dbOffset, `Extended right: matches '${database[right]}' (Score: ${hspScore})`, 5),
                            events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                            metrics: { comparisons, swaps: 0, writes: 1 }
                        };
                    } else {
                        hspScore--;
                        yield {
                            snapshot: makeState(hspTextIndices, hspPatIndices, dbOffset, `Extended right: mismatch '${database[right]}' vs '${query[qRight]}' (Score: ${hspScore})`, 5),
                            events: [{ type: 'swap', targetIds: ['text', 'pattern'], indices: [] }],
                            metrics: { comparisons, swaps: 0, writes: 1 }
                        };
                        break;
                    }
                    right++;
                    qRight++;
                }

                yield {
                    snapshot: makeState(hspTextIndices, hspPatIndices, dbOffset, `Saved High-scoring Segment Pair (HSP) with final score: ${hspScore}`, 6),
                    events: [],
                    metrics: { comparisons, swaps: 0, writes: 1 }
                };
            }
        }
    }

    yield {
        snapshot: makeState([], [], 0, "BLAST database scan complete.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 1 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
