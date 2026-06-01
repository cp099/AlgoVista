import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'levenshtein-distance',
    name: 'Levenshtein Distance',
    category: 'Searching & String',
    difficulty: 'Hard' as const,
    description: 'Calculates the minimum number of single-character edits (insertions, deletions or substitutions) required to change one word into the other using Dynamic Programming.',
    pseudocode: [
        'dp = matrix(m+1, n+1)',
        'for i in 0..m: dp[i][0] = i',
        'for j in 0..n: dp[0][j] = j',
        'for i in 1..m:',
        '  for j in 1..n:',
        '    if s1[i-1] == s2[j-1]: dp[i][j] = dp[i-1][j-1]',
        '    else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])'
    ],
    inputs: [
        {
            id: 's1',
            label: 'Source',
            type: 'string' as const,
            defaultValue: "HORSE",
            constraints: { maxLength: 8 }
        },
        {
            id: 's2',
            label: 'Target',
            type: 'string' as const,
            defaultValue: "ROS"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const s1 = String(inputs['s1']);
    const s2 = String(inputs['s2']);
    const m = s1.length;
    const n = s2.length;
    
    // DP Table Initialization
    // We visualize it as an array of arrays
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Helper to generate the multi-row state
    const makeState = (msg: string, vars: any = {}, line: number = 0): AlgoState => {
        const structures: Record<string, any> = {
            // We skip showing the strings as separate arrays to save space, 
            // the table labels should ideally imply them, but let's show them for clarity.
            // Actually, let's just show the matrix rows.
        };
        
        // Add each row of the DP table as a structure
        for (let i = 0; i <= m; i++) {
            const labelChar = i === 0 ? 'ε' : s1[i-1];
            structures[`row${i}`] = { 
                type: 'array', 
                id: `Row ${i} (${labelChar})`, 
                data: [...dp[i]] 
            };
        }
        
        return {
            structures,
            context: { variables: { ...vars }, pseudocodeLine: line, message: msg }
        };
    };

    yield { snapshot: makeState("Initializing DP Table", {}, 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Base Cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    yield { snapshot: makeState("Base Cases Filled", {}, 2), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Fill Table
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const char1 = s1[i - 1];
            const char2 = s2[j - 1];
            
            yield { 
                snapshot: makeState(`Comparing ${char1} vs ${char2}`, { i, j }, 5), 
                events: [{ type: 'compare', targetIds: [`row${i}`], indices: [j] }], // Highlight cell
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
            };

            if (char1 === char2) {
                dp[i][j] = dp[i - 1][j - 1];
                yield { 
                    snapshot: makeState(`Match! Copy diagonal: ${dp[i][j]}`, { i, j }, 6), 
                    events: [{ type: 'write', targetIds: [`row${i}`], indices: [j] }],
                    metrics: { comparisons: 0, swaps: 0, writes: 1 } 
                };
            } else {
                const minVal = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                dp[i][j] = 1 + minVal;
                yield { 
                    snapshot: makeState(`Mismatch. 1 + min(${minVal}) = ${dp[i][j]}`, { i, j }, 7), 
                    events: [{ type: 'write', targetIds: [`row${i}`], indices: [j] }],
                    metrics: { comparisons: 0, swaps: 0, writes: 1 } 
                };
            }
        }
    }

    yield { 
        snapshot: makeState(`Distance: ${dp[m][n]}`, {}, 7), 
        events: [{ type: 'lock', targetIds: [`row${m}`], indices: [n] }],
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;