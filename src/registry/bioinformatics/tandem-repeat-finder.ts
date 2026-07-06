import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'tandem-repeat-finder',
    name: 'Tandem Repeat Finder (TRF)',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Scans DNA sequences for adjacent, consecutive occurrences of a pattern (repeats) of period length p, which are crucial markers for genetic disease diagnostics.',
    pseudocode: [
        'function FindTandemRepeats(DNA, p):',
        '  for i from 0 to length(DNA) - 2*p:',
        '    pattern = DNA[i...i+p-1]',
        '    repeatsCount = 1',
        '    while DNA[i + repeatsCount*p ... i + (repeatsCount+1)*p - 1] == pattern:',
        '      repeatsCount++',
        '    if repeatsCount >= minRepeats:',
        '      Report tandem repeat at index i'
    ],
    inputs: [
        {
            id: 'period',
            label: 'Period Length (p)',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const p = inputs['period'] as number;
    const text = "ATCAGCAGCAGTA"; // CAG repeats at index 2

    const n = text.length;

    const makeState = (_textHl: number[], _patHl: number[], activeOffset: number, count: number, msg: string, line: number): AlgoState => {
        const textData = text.split('');
        const patternData = text.slice(activeOffset, activeOffset + p).split('');

        return {
            structures: {
                'text': { type: 'array', id: 'text', data: textData },
                'pattern': { type: 'array', id: 'pattern', data: patternData }
            },
            context: {
                variables: {
                    activeOffset,
                    periodSize: p,
                    activeMotif: text.slice(activeOffset, activeOffset + p),
                    repeatsCount: count
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], [], 0, 0, `Initializing Tandem Repeat Finder scan on DNA: "${text}" with period p=${p}`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;

    for (let i = 0; i <= n - 2 * p; i++) {
        const pattern = text.slice(i, i + p);
        let repeatsCount = 1;

        const checkTextIndices = Array.from({ length: p }, (_, idx) => i + idx);
        const checkPatIndices = Array.from({ length: p }, (_, idx) => idx);

        yield {
            snapshot: makeState(checkTextIndices, checkPatIndices, i, repeatsCount, `Scanning offset ${i}. Comparing first motif window: "${pattern}"`, 3),
            events: [{ type: 'compare', targetIds: ['text', 'pattern'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes: 0 }
        };

        while (i + (repeatsCount + 1) * p <= n) {
            comparisons++;
            const nextMotif = text.slice(i + repeatsCount * p, i + (repeatsCount + 1) * p);

            const nextTextIndices = Array.from({ length: p }, (_, idx) => i + repeatsCount * p + idx);

            yield {
                snapshot: makeState(nextTextIndices, checkPatIndices, i, repeatsCount, `Comparing motif "${pattern}" with consecutive adjacent segment "${nextMotif}"`, 5),
                events: [{ type: 'compare', targetIds: ['text', 'pattern'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes: 0 }
            };

            if (nextMotif === pattern) {
                repeatsCount++;
                yield {
                    snapshot: makeState(nextTextIndices, checkPatIndices, i, repeatsCount, `Tandem Repeat segment matched! Total consecutive repeats: ${repeatsCount}`, 6),
                    events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes: 1 }
                };
            } else {
                break;
            }
        }

        if (repeatsCount >= 2) {
            // Found a tandem repeat!
            const repeatRange = Array.from({ length: repeatsCount * p }, (_, idx) => i + idx);
            yield {
                snapshot: makeState(repeatRange, checkPatIndices, i, repeatsCount, `Reported Tandem Repeat of motif "${pattern}" repeating ${repeatsCount} times starting at index ${i}!`, 8),
                events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes: 1 }
            };
            // Skip the matched repeats to avoid redundant scans
            i += (repeatsCount - 1) * p;
        }
    }

    yield {
        snapshot: makeState([], [], 0, 0, "Tandem Repeat Search finished.", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 1 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
