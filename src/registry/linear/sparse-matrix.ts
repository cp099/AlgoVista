import { AlgorithmBundle, AlgoState } from '@core/types';

const manifest = {
    id: 'sparse-matrix',
    name: 'Sparse Matrix Representation',
    category: 'Linear Data Structures',
    difficulty: 'Medium' as const,
    description: 'Converts a sparse matrix (mostly zeros) into a compact format by storing only non-zero elements as (row, column, value) triplets.',
    pseudocode: [
        'compactList = []',
        'for i from 0 to rows-1:',
        '  for j from 0 to cols-1:',
        '    if matrix[i][j] != 0:',
        '      compactList.push(i, j, matrix[i][j])',
        'return compactList'
    ],
    inputs: [
        // For simplicity, we hardcode the matrix structure in the algorithm.
        // User input for matrices is a future feature.
        {
            id: 'note',
            label: 'Matrix is hardcoded in this demo',
            type: 'string' as const, // Placeholder type
            defaultValue: "Matrix: [[10,0,0,0],[0,0,20,0],[0,0,0,0],[0,30,0,0]]"
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (_inputs) {
    // We'll use a hardcoded 4x4 sparse matrix for this visualization
    const matrix = [
        [10, 0, 0, 0],
        [0, 0, 20, 0],
        [0, 0, 0, 0],
        [0, 30, 0, 0]
    ];
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // The compact representation
    const compact: (number|string)[] = [];
    let writes = 0;

    const makeState = (msg: string, line: number = 0): AlgoState => {
        const structures: Record<string, any> = {};
        
        // Create a structure for each row of the original matrix
        for (let i = 0; i < rows; i++) {
            structures[`row${i}`] = { 
                type: 'array', 
                id: `Matrix Row ${i}`, 
                data: [...matrix[i]], 
                visualMode: 'box' 
            };
        }
        
        // Add the compact array structure
        structures['compact'] = {
            type: 'array',
            id: 'Compact (Row, Col, Val)',
            data: [...compact],
            visualMode: 'box'
        };
        
        return {
            structures,
            context: { pseudocodeLine: line, variables: { NonZeroCount: compact.length / 3 }, message: msg }
        };
    };

    yield { snapshot: makeState("Starting Sparse Matrix Conversion", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    // Scan the matrix
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            
            yield { 
                snapshot: makeState(`Scanning cell [${i},${j}]`, 2), 
                events: [{ type: 'compare', targetIds: [`row${i}`], indices: [j] }],
                metrics: { comparisons: 1, swaps: 0, writes } 
            };

            if (matrix[i][j] !== 0) {
                const val = matrix[i][j];
                yield { 
                    snapshot: makeState(`Found non-zero value: ${val}`, 4), 
                    events: [{ type: 'lock', targetIds: [`row${i}`], indices: [j] }],
                    metrics: { comparisons: 0, swaps: 0, writes } 
                };

                // Add to compact list
                compact.push(i, j, val);
                writes += 3;

                yield { 
                    snapshot: makeState(`Adding triplet (${i}, ${j}, ${val}) to compact list`), 
                    events: [{ 
                        type: 'write', 
                        targetIds: ['Compact (Row, Col, Val)'], 
                        indices: [compact.length-3, compact.length-2, compact.length-1] 
                    }],
                    metrics: { comparisons: 0, swaps: 0, writes } 
                };
            }
        }
    }

    yield { 
        snapshot: makeState("Conversion Complete", 1), 
        events: [{ type: 'lock', targetIds: ['Compact (Row, Col, Val)'], indices: Array.from({length: compact.length}, (_, k) => k)}],
        metrics: { comparisons: 0, swaps: 0, writes } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;