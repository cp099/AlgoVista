import { AlgorithmBundle, AlgoState, GraphNode } from '@core/types';

const manifest = {
    id: 'josephus-problem',
    name: 'Josephus Problem',
    category: 'Linear Data Structures',
    difficulty: 'Hard' as const,
    description: 'N people are in a circle. Every k-th person is eliminated. The problem is to find the position of the last person remaining.',
    pseudocode: [
        'people = list from 1 to n',
        'idx = 0',
        'while size > 1:',
        '  idx = (idx + k - 1) % size',
        '  people.remove(idx)',
        'return people[0]'
    ],
    inputs: [
        {
            id: 'n',
            label: 'Number of People (n)',
            type: 'integer' as const,
            defaultValue: 7,
            constraints: { min: 2, max: 12 }
        },
        {
            id: 'k',
            label: 'Step (k)',
            type: 'integer' as const,
            defaultValue: 3
        }
    ]
};

const run: AlgorithmBundle['run'] = function* (inputs) {
    const n = inputs['n'] as number;
    const k = inputs['k'] as number;
    
    // Internal state
    let writes = 0;
    let people = Array.from({ length: n }, (_, i) => i + 1);
    let eliminated: number[] = [];

    // Layout
    const getCirclePos = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        return { x: 400 + 150 * Math.cos(angle), y: 250 + 150 * Math.sin(angle) };
    };

    const makeState = (msg: string, line: number = 0): AlgoState => {
        const nodes: GraphNode[] = [];
        // Draw living people
        people.forEach((person, i) => {
            const {x, y} = getCirclePos(i, people.length);
            nodes.push({ id: String(person), val: person, label: String(person), x, y });
        });
        
        return {
            structures: { 
                'main': { type: 'graph', id: 'Circle', nodes, edges: [], isDirected: false }
            },
            context: { pseudocodeLine: line, variables: { n, k, remaining: people.length }, message: msg }
        };
    };

    yield { snapshot: makeState("Starting Josephus Problem", 1), events: [], metrics: { comparisons: 0, swaps: 0, writes: 0 } };

    let currentIdx = 0;
    while (people.length > 1) {
        
        yield { 
            snapshot: makeState(`Counting ${k} steps from index ${currentIdx}...`, 3), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Find next person to eliminate
        const steps = k - 1;
        for (let i = 0; i < steps; i++) {
             currentIdx = (currentIdx + 1) % people.length;
             yield { 
                snapshot: makeState(`Count ${i+1}... at ${people[currentIdx]}`, 3), 
                events: [{ type: 'visit', targetIds: ['main'], indices: [] }], // Highlight current
                metrics: { comparisons: 0, swaps: 0, writes: 0 } 
             };
        }

        const personToEliminate = people[currentIdx];
        
        yield { 
            snapshot: makeState(`Eliminating person ${personToEliminate}`, 4), 
            events: [{ type: 'compare', targetIds: ['main'], indices: [] }], // Red flash on target
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };

        // Remove from list
        people.splice(currentIdx, 1);
        eliminated.push(personToEliminate);
        writes++;
        
        // After removing, the next element is at the same index
        if (currentIdx >= people.length) {
            currentIdx = 0;
        }

        yield { 
            snapshot: makeState(`Person ${personToEliminate} removed. ${people.length} remain.`, 5), 
            events: [],
            metrics: { comparisons: 0, swaps: 0, writes: 0 } 
        };
    }

    const survivor = people[0];
    yield { 
        snapshot: makeState(`Survivor is ${survivor}!`, 6), 
        events: [{ type: 'lock', targetIds: ['main'], indices: [] }], 
        metrics: { comparisons: 0, swaps: 0, writes: 0 } 
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;