import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'karp-rabin-dna',
    name: 'Karp-Rabin Motif Search',
    category: 'Bioinformatics & Sequence Alignment',
    difficulty: 'Medium' as const,
    description: 'Searches for DNA sequence motifs using rolling hashes. Computes hash values for the query pattern and sliding windows of the text, comparing raw characters only when hash values match.',
    pseudocode: [
        'function KarpRabin(Text, Pattern, d, q):',
        '  pHash = hash(Pattern), tHash = hash(Text[0...m-1])',
        '  for i from 0 to n - m:',
        '    if pHash == tHash:',
        '      if Text[i...i+m-1] == Pattern: match at i',
        '    if i < n - m:',
        '      tHash = (d * (tHash - Text[i]*h) + Text[i+m]) mod q'
    ],
    inputs: [
        {
            id: 'pattern',
            label: 'Query Motif (e.g. CG)',
            type: 'string' as const,
            defaultValue: 'CG',
            constraints: { minLength: 1, maxLength: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const pattern = (inputs['pattern'] as string).toUpperCase();
    const text = "ATCGATCGA";

    const n = text.length;
    const m = pattern.length;

    // Simple hash values for animation
    const d = 4; // bases count (A, C, G, T)
    const q = 101; // prime modulus

    const charVal = (c: string): number => {
        if (c === 'A') return 0;
        if (c === 'C') return 1;
        if (c === 'G') return 2;
        return 3; // T
    };

    const makeHash = (str: string): number => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (d * h + charVal(str[i])) % q;
        }
        return h;
    };

    const pHash = makeHash(pattern);

    const makeState = (_textHl: number[], _patHl: number[], activeOffset: number, currentTHash: number, msg: string, line: number): AlgoState => {
        const textData = text.split('');
        const patternData = pattern.split('');

        return {
            structures: {
                'text': { type: 'array', id: 'text', data: textData },
                'pattern': { type: 'array', id: 'pattern', data: patternData }
            },
            context: {
                variables: {
                    activeOffset,
                    patternHash: pHash,
                    currentWindowHash: currentTHash,
                    matchStatus: pHash === currentTHash ? 'Hash Match!' : 'Scanning'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState([], [], 0, 0, `Initializing Karp-Rabin search. Target pattern hash pHash = ${pHash}`, 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let tHash = makeHash(text.slice(0, m));

    for (let i = 0; i <= n - m; i++) {
        comparisons++;
        const checkTextIndices = Array.from({ length: m }, (_, idx) => i + idx);
        const checkPatIndices = Array.from({ length: m }, (_, idx) => idx);

        yield {
            snapshot: makeState(checkTextIndices, checkPatIndices, i, tHash, `Comparing pattern hash (${pHash}) with active window hash (${tHash}) at offset ${i}.`, 3),
            events: [{ type: 'compare', targetIds: ['text', 'pattern'], indices: [] }],
            metrics: { comparisons, swaps: 0, writes: 0 }
        };

        if (pHash === tHash) {
            // Hash match, verify characters
            const matched = text.slice(i, i + m) === pattern;
            comparisons += m;

            if (matched) {
                yield {
                    snapshot: makeState(checkTextIndices, checkPatIndices, i, tHash, `Spurious hit check passed! Full string match at index ${i}.`, 4),
                    events: [{ type: 'lock', targetIds: ['text', 'pattern'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes: 1 }
                };
            } else {
                yield {
                    snapshot: makeState(checkTextIndices, checkPatIndices, i, tHash, `Spurious hit! Hash values match, but raw character sequences differ. Skipping.`, 3),
                    events: [{ type: 'swap', targetIds: ['text', 'pattern'], indices: [] }],
                    metrics: { comparisons, swaps: 0, writes: 0 }
                };
            }
        }

        // Rolling hash update for next step
        if (i < n - m) {
            tHash = (d * (tHash - charVal(text[i]) * Math.pow(d, m - 1)) + charVal(text[i + m])) % q;
            if (tHash < 0) tHash += q;
        }
    }

    yield {
        snapshot: makeState([], [], 0, 0, "Scan finished.", 7),
        events: [],
        metrics: { comparisons, swaps: 0, writes: 1 }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
