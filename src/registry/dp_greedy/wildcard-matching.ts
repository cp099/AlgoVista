import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'wildcard-matching-dp',
    name: 'Wildcard Pattern Matching',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Hard' as const,
    description: 'Matches a string against a pattern containing wildcard symbols: "?" (matches any single character) and "*" (matches zero or more characters).',
    pseudocode: [
        'function Match(Text, Pat):',
        '  Initialize dp[m+1][n+1] with false, dp[0][0] = true',
        '  for j from 1 to n:',
        '    if Pat[j-1] == "*": dp[0][j] = dp[0][j-1]',
        '  for i from 1 to m:',
        '    for j from 1 to n:',
        '      if Pat[j-1] == "*" OR "?":',
        '        dp[i][j] = dp[i-1][j-1] OR dp[i][j-1] OR dp[i-1][j]',
        '      else if Pat[j-1] == Text[i-1]:',
        '        dp[i][j] = dp[i-1][j-1]'
    ],
    inputs: [
        {
            id: 'text',
            label: 'String (e.g. AD)',
            type: 'string' as const,
            defaultValue: 'AD',
            constraints: { minLength: 2, maxLength: 3 }
        },
        {
            id: 'pattern',
            label: 'Pattern (e.g. A*)',
            type: 'string' as const,
            defaultValue: 'A*',
            constraints: { minLength: 2, maxLength: 3 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const text = (inputs['text'] as string).toUpperCase();
    const pattern = (inputs['pattern'] as string).toUpperCase();
    const m = text.length;
    const n = pattern.length;

    const dp: (string | number)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill('F'));
    dp[0][0] = 'T';

    for (let j = 1; j <= n; j++) {
        if (pattern[j-1] === '*') dp[0][j] = dp[0][j-1];
    }

    const rowHeaders = ['-', ...text.split('')];
    const colHeaders = ['-', ...pattern.split('')];

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        let formulaEquation = 'Initialization';
        let formulaResult = 'F';
        if (activeCell && activeCell.r > 0 && activeCell.c > 0) {
            const r = activeCell.r;
            const c = activeCell.c;
            const patChar = pattern[c-1];
            if (patChar === '*') {
                formulaEquation = `dp[${r}][${c}] = dp[${r-1}][${c}] OR dp[${r}][${c-1}] => ${dp[r-1][c]} OR ${dp[r][c-1]}`;
                formulaResult = String(dp[r-1][c] === 'T' || dp[r][c-1] === 'T' ? 'T' : 'F');
            } else if (patChar === '?' || patChar === text[r-1]) {
                formulaEquation = `dp[${r}][${c}] = dp[${r-1}][${c-1}] => ${dp[r-1][c-1]}`;
                formulaResult = String(dp[r-1][c-1]);
            } else {
                formulaEquation = `No Match! dp[${r}][${c}] = F`;
                formulaResult = 'F';
            }
        }

        return {
            structures: {
                'match_matrix': {
                    type: 'matrix',
                    id: 'match_matrix',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    textVal: text,
                    patternVal: pattern,
                    activeI: activeCell?.r ?? 'None',
                    activeJ: activeCell?.c ?? 'None',
                    formulaTemplate: 'dp[i][j] = dp[i-1][j-1] if match else (dp[i-1][j] || dp[i][j-1]) if "*"',
                    formulaEquation,
                    formulaResult
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing Wildcard matching matrix.", 2),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 1 }
    };

    let comparisons = 0;
    let writes = 1;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            comparisons++;
            const patChar = pattern[j-1];

            if (patChar === '*') {
                dp[i][j] = (dp[i-1][j] === 'T' || dp[i][j-1] === 'T') ? 'T' : 'F';
            } else if (patChar === '?' || patChar === text[i-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = 'F';
            }
            writes++;

            yield {
                snapshot: makeState({ r: i, c: j }, `Evaluating matching state for text index ${i} ("${text[i-1]}") against pattern index ${j} ("${patChar}")`, 6),
                events: [{ type: 'compare', targetIds: ['match_matrix'], indices: [i * (n + 1) + j] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    const matches = dp[m][n] === 'T';
    yield {
        snapshot: makeState(null, `Matching evaluation complete! String matches pattern: ${matches ? 'YES' : 'NO'}`, 10),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
