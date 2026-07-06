import { AlgorithmBundle, AlgoState } from '@core/types';

// --- MANIFEST ---
const manifest = {
    id: 'voronoi-heuristic',
    name: 'Voronoi Diagram (Heuristic)',
    category: 'Mathematics & Computational Geometry',
    difficulty: 'Hard' as const,
    description: 'Generates a Voronoi diagram on a 2D grid by calculating the closest seed site for each pixel using Euclidean distance metrics.',
    pseudocode: [
        'function Voronoi(Sites, Grid):',
        '  for each pixel in Grid:',
        '    minDist = Infinity',
        '    for site in Sites:',
        '      dist = EuclideanDistance(pixel, site)',
        '      if dist < minDist:',
        '        minDist = dist',
        '        pixel.owner = site.id'
    ],
    inputs: [
        {
            id: 'siteCount',
            label: 'Seed Sites Count',
            type: 'integer' as const,
            defaultValue: 3,
            constraints: { min: 2, max: 4 }
        }
    ]
};

// --- LOGIC ---
const run: AlgorithmBundle['run'] = function* (inputs) {
    const size = inputs['siteCount'] as number;

    // Grid sizes: 5x5
    const dp: (string | number)[][] = Array.from({ length: 5 }, () => Array(5).fill('.'));

    // Seed sites
    const sites = [
        { id: 'A', r: 0, c: 0 },
        { id: 'B', r: 4, c: 4 },
        { id: 'C', r: 1, c: 3 },
        { id: 'D', r: 3, c: 1 }
    ].slice(0, size);

    // Initial site placements
    for (const site of sites) {
        dp[site.r][site.c] = site.id;
    }

    const rowHeaders = ['R0', 'R1', 'R2', 'R3', 'R4'];
    const colHeaders = ['C0', 'C1', 'C2', 'C3', 'C4'];

    const makeState = (activeCell: { r: number; c: number } | null, msg: string, line: number): AlgoState => {
        return {
            structures: {
                'voronoi_grid': {
                    type: 'matrix',
                    id: 'voronoi_grid',
                    data: dp.map(row => [...row]),
                    rowHeaders,
                    colHeaders
                }
            },
            context: {
                variables: {
                    seedSites: sites.map(s => `${s.id}:(${s.c}, ${s.r})`).join(', '),
                    activePixel: activeCell ? `(${activeCell.c}, ${activeCell.r})` : 'None'
                },
                pseudocodeLine: line,
                message: msg
            }
        };
    };

    yield {
        snapshot: makeState(null, "Initializing Voronoi grid and placing seed sites.", 1),
        events: [],
        metrics: { comparisons: 0, swaps: 0, writes: size }
    };

    let comparisons = 0;
    let writes = size;

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            // Check if cell itself is a site
            const isSite = sites.some(s => s.r === r && s.c === c);
            if (isSite) continue;

            comparisons++;
            let minDist = Infinity;
            let owner = '.';

            for (const s of sites) {
                comparisons++;
                const dist = Math.sqrt(Math.pow(r - s.r, 2) + Math.pow(c - s.c, 2));
                if (dist < minDist) {
                    minDist = dist;
                    owner = s.id.toLowerCase(); // Lowercase represents region cell
                }
            }

            dp[r][c] = owner;
            writes++;

            yield {
                snapshot: makeState({ r, c }, `Pixel (${c}, ${r}) assigned to site ${owner.toUpperCase()} (distance: ${minDist.toFixed(2)}).`, 8),
                events: [{ type: 'write', targetIds: ['voronoi_grid'], indices: [r * 5 + c] }],
                metrics: { comparisons, swaps: 0, writes }
            };
        }
    }

    yield {
        snapshot: makeState(null, "Voronoi partition cells mapping complete.", 8),
        events: [],
        metrics: { comparisons, swaps: 0, writes }
    };
};

const bundle: AlgorithmBundle = { manifest, run };
export default bundle;
