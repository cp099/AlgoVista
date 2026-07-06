import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'job-sequencing-greedy',
    name: 'Job Sequencing with Deadlines',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Finds the optimal sequencing of jobs to maximize total profit under deadline constraints by scheduling the highest profit jobs first.',
    pseudocode: [
        'function JobSequencing(Jobs):',
        '  Sort Jobs descending by profit',
        '  Slots = Array of size maxDeadline filled with empty',
        '  for job in Jobs:',
        '    for t from min(maxDeadline, job.deadline)-1 down to 0:',
        '      if Slots[t] is empty:',
        '        Slots[t] = job',
        '        break'
    ],
    inputs: [
        {
            id: 'slotsCount',
            label: 'Deadline Slots Limit',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const maxDeadline = inputs['slotsCount'] as number;

    const jobs = [
        { id: 'Job A', deadline: 2, profit: 100 },
        { id: 'Job B', deadline: 1, profit: 50 },
        { id: 'Job C', deadline: 2, profit: 10 },
        { id: 'Job D', deadline: 1, profit: 20 },
        { id: 'Job E', deadline: 3, profit: 30 }
    ];

    // Sort jobs by profit descending
    jobs.sort((a, b) => b.profit - a.profit);

    const slots: (string | number)[] = Array(maxDeadline).fill('Empty');
    const data: (number | string)[] = jobs.map(j => `${j.id} (p:$${j.profit}, d:${j.deadline})`);

    const makeState = (activeIdx: number | null, activeSlot: number | null, totalProfit: number, msg: string, line: number): AlgoState => {
        const greedyCandidates = jobs.map((j, idx) => {
            let state: 'default' | 'active' | 'chosen' = 'default';
            if (idx === activeIdx) state = 'active';
            else if (activeIdx !== null && idx < activeIdx) state = 'chosen';
            return {
                id: j.id,
                ratio: `Profit:$${j.profit}`,
                state
            };
        });

        return {
            structures: {
                'jobs_list': { type: 'array', id: 'Jobs sorted by Profit', data: [...data] },
                'slots_list': { type: 'array', id: 'Deadline Schedule Slots', data: [...slots] }
            },
            context: {
                variables: {
                    totalProfit: `$${totalProfit}`,
                    activeSlotIndex: activeSlot !== null ? activeSlot : 'None',
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, null, 0, "Sorting jobs descending by profit margin.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    let totalProfit = 0;

    for (let i = 0; i < jobs.length; i++) {
        comparisons++;
        const job = jobs[i];

        yield {
            snapshot: makeState(i, null, totalProfit, `Evaluating job "${job.id}" (profit: $${job.profit}, deadline: ${job.deadline}).`, 4),
            events: [{ type: 'compare', targetIds: ['jobs_list'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        const limit = Math.min(maxDeadline, job.deadline);
        let scheduled = false;

        for (let t = limit - 1; t >= 0; t--) {
            comparisons++;
            if (slots[t] === 'Empty') {
                slots[t] = job.id;
                totalProfit += job.profit;
                writes++;
                scheduled = true;

                yield {
                    snapshot: makeState(i, t, totalProfit, `Job "${job.id}" scheduled into slot ${t}. Total profit: $${totalProfit}`, 7),
                    events: [{ type: 'write', targetIds: ['slots_list'], indices: [t] }],
                    metrics: { comparisons, swaps: 0, writes }
                };
                break;
            }
        }

        if (!scheduled) {
            yield {
                snapshot: makeState(i, null, totalProfit, `Job "${job.id}" could not be scheduled. All compatible slots before deadline are full.`, 5),
                events: [{ type: 'compare', targetIds: ['slots_list'], indices: [] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, null, totalProfit, `Job Sequencing complete. Scheduled profit maximized to $${totalProfit}.`, 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
