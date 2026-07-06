import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'activity-selection-greedy',
    name: 'Activity Selection Problem',
    category: 'Dynamic Programming & Greedy',
    difficulty: 'Medium' as const,
    description: 'Selects the maximum number of mutually compatible activities that can be performed by a single person, sorted by finish times.',
    pseudocode: [
        'function SelectActivities(Start, Finish):',
        '  Sort activities by finish times',
        '  Selected = [Activity[0]]',
        '  lastFinish = Activity[0].finish',
        '  for i from 1 to n-1:',
        '    if Activity[i].start >= lastFinish:',
        '      Selected.push(Activity[i])',
        '      lastFinish = Activity[i].finish',
        '  return Selected'
    ],
    inputs: [
        {
            id: 'activitiesCount',
            label: 'Activities Pool',
            type: 'integer' as const,
            defaultValue: 4,
            constraints: { min: 2, max: 5 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['activitiesCount'] as number;

    const activities = [
        { id: 'Act A', start: 1, finish: 3 },
        { id: 'Act B', start: 2, finish: 5 },
        { id: 'Act C', start: 4, finish: 6 },
        { id: 'Act D', start: 6, finish: 8 },
        { id: 'Act E', start: 5, finish: 9 }
    ].slice(0, size);

    const data: (number | string)[] = activities.map(act => `${act.id} [${act.start} - ${act.finish}]`);

    const makeState = (activeIdx: number | null, chosenIdxs: number[], lastFinish: number, msg: string, line: number): AlgoState => {
        const greedyCandidates = activities.map((act, idx) => {
            let state: 'default' | 'active' | 'chosen' = 'default';
            if (idx === activeIdx) state = 'active';
            else if (chosenIdxs.includes(idx)) state = 'chosen';
            return {
                id: act.id,
                ratio: `Ends:${act.finish}`,
                state
            };
        });

        return {
            structures: {
                'activities_list': { type: 'array', id: 'Sorted Activities (By Finish Time)', data: [...data] }
            },
            context: {
                variables: {
                    lastFinishTime: lastFinish,
                    selectedCount: chosenIdxs.length,
                    greedyCandidates
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, [], 0, "Sorting activities by finish times ascending.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: 0 }
    };

    let comparisons = 0;
    let writes = 0;
    const chosen: number[] = [0];
    let lastFinish = activities[0].finish;

    yield {
        snapshot: makeState(0, [0], lastFinish, `Select first activity "${activities[0].id}" as it finishes earliest.`, 2),
        events: [{ type: 'lock', targetIds: ['activities_list'], indices: [0] }],
        metrics: { comparisons, swaps: 0, writes: 1 }
    };

    for (let i = 1; i < activities.length; i++) {
        comparisons++;
        const act = activities[i];

        yield {
            snapshot: makeState(i, [...chosen], lastFinish, `Evaluating activity "${act.id}" starting at ${act.start}. Last finish: ${lastFinish}.`, 5),
            events: [{ type: 'compare', targetIds: ['activities_list'], indices: [i] }],
            metrics: { comparisons, swaps: 0, writes }
        };

        if (act.start >= lastFinish) {
            chosen.push(i);
            lastFinish = act.finish;
            writes++;

            yield {
                snapshot: makeState(i, [...chosen], lastFinish, `Activity "${act.id}" is compatible! Added to schedule schedule pool.`, 6),
                events: [{ type: 'lock', targetIds: ['activities_list'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        } else {
            yield {
                snapshot: makeState(i, [...chosen], lastFinish, `Activity "${act.id}" overlaps with ongoing scheduled events. Rejected.`, 5),
                events: [{ type: 'compare', targetIds: ['activities_list'], indices: [i] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, [...chosen], lastFinish, `Activity Selection finished. Scheduled ${chosen.length} compatible activities.`, 9),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
