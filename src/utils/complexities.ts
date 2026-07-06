export interface ComplexityData {
  time: {
    best: string;
    average: string;
    worst: string;
  };
  space: string;
  keyConcepts: string[];
}

const COMPLEXITY_DB: Record<string, ComplexityData> = {
  // --- SORTING ---
  'bubble-sort': {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    keyConcepts: ['Stable Sorting', 'Comparison-Based', 'In-Place', 'Adjacent Swapping']
  },
  'selection-sort': {
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    keyConcepts: ['Unstable Sorting', 'Comparison-Based', 'In-Place', 'Minimum Selection']
  },
  'insertion-sort': {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    keyConcepts: ['Stable Sorting', 'Online Algorithm', 'In-Place', 'Adaptive']
  },
  'merge-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    keyConcepts: ['Stable Sorting', 'Divide & Conquer', 'Out-of-Place', 'Recursion']
  },
  'quick-sort-lomuto': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    keyConcepts: ['Unstable Sorting', 'Divide & Conquer', 'In-Place', 'Single Index Partitioning']
  },
  'quick-sort-hoare': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    keyConcepts: ['Unstable Sorting', 'Divide & Conquer', 'In-Place', 'Dual Pointer Partitioning']
  },
  'heap-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
    keyConcepts: ['Unstable Sorting', 'Binary Heap', 'In-Place', 'Comparison-Based']
  },
  'counting-sort': {
    time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
    space: 'O(k)',
    keyConcepts: ['Stable Sorting', 'Non-Comparison-Based', 'Integer Bounds', 'Frequency Array']
  },
  'radix-sort-lsd': {
    time: { best: 'O(d(n + k))', average: 'O(d(n + k))', worst: 'O(d(n + k))' },
    space: 'O(n + k)',
    keyConcepts: ['Stable Sorting', 'Digit-by-Digit (LSD)', 'Non-Comparison-Based', 'Bucket Distribution']
  },
  'radix-sort-msd': {
    time: { best: 'O(d(n + k))', average: 'O(d(n + k))', worst: 'O(d(n + k))' },
    space: 'O(n + k)',
    keyConcepts: ['Unstable Sorting', 'Digit-by-Digit (MSD)', 'Non-Comparison-Based', 'Recursive Sub-buckets']
  },
  'bucket-sort': {
    time: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n²)' },
    space: 'O(n + k)',
    keyConcepts: ['Stable Sorting', 'Scatter-Gather', 'Uniform Distribution', 'Insertion Sort Aux']
  },
  'shell-sort': {
    time: { best: 'O(n log n)', average: 'O(n^(3/2))', worst: 'O(n²)' },
    space: 'O(1)',
    keyConcepts: ['Unstable Sorting', 'Diminishing Increments', 'Gap-Based Insertion', 'In-Place']
  },
  'bogo-sort': {
    time: { best: 'O(n)', average: 'O(n · n!)', worst: 'O(∞)' },
    space: 'O(1)',
    keyConcepts: ['Las Vegas Algorithm', 'Random Permutations', 'Highly Inefficient', 'Joke Sort']
  },
  'tim-sort': {
    time: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    keyConcepts: ['Stable Sorting', 'Hybrid Sort (Merge + Insertion)', 'Runs Detection', 'Used in V8/Python']
  },
  'tree-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(n)',
    keyConcepts: ['Binary Search Tree', 'Inorder Traversal', 'Dynamic Tree Node Insertion']
  },

  // --- SEARCHING & STRINGS ---
  'linear-search': {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    keyConcepts: ['Sequential Scan', 'Unsorted Arrays', 'Simple Comparison']
  },
  'binary-search': {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    space: 'O(1)',
    keyConcepts: ['Sorted Array Constraint', 'Divide & Conquer', 'Logarithmic Halving']
  },
  'ternary-search': {
    time: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' },
    space: 'O(1)',
    keyConcepts: ['Sorted Array Constraint', 'Three-way Division', 'Bimodal Function Maxima']
  },
  'interpolation-search': {
    time: { best: 'O(1)', average: 'O(log(log n))', worst: 'O(n)' },
    space: 'O(1)',
    keyConcepts: ['Uniform Distribution Constraint', 'Proportional Estimation Formula', 'Faster than Binary Search']
  },
  'exponential-search': {
    time: { best: 'O(1)', average: 'O(log i)', worst: 'O(log i)' },
    space: 'O(1)',
    keyConcepts: ['Unbounded Array Search', 'Powers of 2 Ranges', 'Followed by Binary Search']
  },
  'fibonacci-search': {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    space: 'O(1)',
    keyConcepts: ['Fibonacci Number Offsets', 'Only Addition/Subtraction Math', 'Cache Friendly']
  },
  'jump-search': {
    time: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
    space: 'O(1)',
    keyConcepts: ['Block Merging', 'Optimal Block Size √n', 'Sorted Array Constraint']
  },
  'naive-string-search': {
    time: { best: 'O(n)', average: 'O(n · m)', worst: 'O(n · m)' },
    space: 'O(1)',
    keyConcepts: ['Pattern Matching', 'Brute Force', 'Character-by-character Sliding']
  },
  'kmp-search': {
    time: { best: 'O(n)', average: 'O(n + m)', worst: 'O(n + m)' },
    space: 'O(m)',
    keyConcepts: ['Knuth-Morris-Pratt', 'Partial Match Table (LPS)', 'No Character Backtracking']
  },
  'rabin-karp': {
    time: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n · m)' },
    space: 'O(m)',
    keyConcepts: ['Rolling Hash Function', 'Modulo Arithmetic', 'Multiple Pattern Matching']
  },
  'boyer-moore': {
    time: { best: 'O(n / m)', average: 'O(n + m)', worst: 'O(n · m)' },
    space: 'O(m)',
    keyConcepts: ['Right-to-Left Scanning', 'Bad Character Rule', 'Good Suffix Rule']
  },
  'levenshtein-distance': {
    time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
    space: 'O(n · m)',
    keyConcepts: ['Dynamic Programming Grid', 'Edit Operations (Insert/Delete/Replace)', 'Strings Similarity']
  },
  'lcs': {
    time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
    space: 'O(n · m)',
    keyConcepts: ['Longest Common Subsequence', 'Dynamic Programming Matrix', 'Subproblem Dependencies']
  },

  // --- GRAPHS ---
  'dfs': {
    time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    space: 'O(V)',
    keyConcepts: ['Adjacency List/Matrix', 'Backtracking Stack', 'Recursive Vertex Visit']
  },
  'bfs': {
    time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    space: 'O(V)',
    keyConcepts: ['Adjacency List/Matrix', 'Queue FIFO', 'Level-order Shortest Path']
  },
  'dijkstra': {
    time: { best: 'O(E log V)', average: 'O(E + V log V)', worst: 'O(V²)' },
    space: 'O(V)',
    keyConcepts: ['Single Source Shortest Path', 'Min-Priority Queue', 'Greedy Relaxations']
  },
  'bellman-ford': {
    time: { best: 'O(E)', average: 'O(V · E)', worst: 'O(V · E)' },
    space: 'O(V)',
    keyConcepts: ['Single Source Shortest Path', 'Negative Weight Edges', 'Negative Cycles Detection']
  },
  'floyd-warshall': {
    time: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)' },
    space: 'O(V²)',
    keyConcepts: ['All-Pairs Shortest Path', 'Dynamic Programming Table', 'Intermediate Paths Check']
  },
  'prims-algorithm': {
    time: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
    space: 'O(V)',
    keyConcepts: ['Minimum Spanning Tree', 'Greedy Selection', 'Vertex-centric Growth']
  },
  'kruskal-algorithm': {
    time: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
    space: 'O(V + E)',
    keyConcepts: ['Minimum Spanning Tree', 'Disjoint-Set Union (DSU)', 'Edge-centric Sorting']
  },
};

export const getComplexityData = (id: string): ComplexityData => {
  const normId = id.toLowerCase().replace(/_/g, '-');
  
  if (COMPLEXITY_DB[normId]) {
    return COMPLEXITY_DB[normId];
  }

  // --- DYNAMIC RESOLVER FOR MISSING ALGORITHMS (TRUE VALUES) ---

  // 1. Specific Sorting matches
  if (normId.includes('bitonic')) {
    return {
      time: { best: 'O(n log² n)', average: 'O(n log² n)', worst: 'O(n log² n)' },
      space: 'O(n)',
      keyConcepts: ['Parallel Sorting Network', 'Static Comparisons', 'In-Place', 'Bitonic Merging']
    };
  }
  if (normId.includes('cocktail') || normId.includes('shaker') || normId.includes('odd-even') || normId.includes('gnome') || normId.includes('stooge')) {
    const isStooge = normId.includes('stooge');
    return {
      time: { 
        best: isStooge ? 'O(n^2.709)' : 'O(n)', 
        average: isStooge ? 'O(n^2.709)' : 'O(n²)', 
        worst: isStooge ? 'O(n^2.709)' : 'O(n²)' 
      },
      space: isStooge ? 'O(n)' : 'O(1)',
      keyConcepts: isStooge 
        ? ['Stooge Sort', 'Highly Inefficient', 'Recursive Fractional Sorting']
        : ['Bubble Sort Variant', 'Adjacent Swaps', 'Stable Sorting', 'In-Place']
    };
  }
  if (normId.includes('comb')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n² / 2^p)', worst: 'O(n²)' },
      space: 'O(1)',
      keyConcepts: ['Comb Sort', 'Shrink Factor Gap', 'Unstable Sorting', 'In-Place']
    };
  }
  if (normId.includes('cycle')) {
    return {
      time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      keyConcepts: ['Cycle Sort', 'Minimal Writes', 'Optimal Swap Bounds', 'In-Place']
    };
  }
  if (normId.includes('pancake')) {
    return {
      time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      keyConcepts: ['Prefix Reversals', 'Spatula Flipping', 'Unstable Sorting', 'In-Place']
    };
  }
  if (normId.includes('intro')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(log n)',
      keyConcepts: ['Hybrid Sort (Quick + Heap + Insertion)', 'Recursion Depth Watcher', 'C++ STL Default']
    };
  }
  if (normId.includes('pigeonhole')) {
    return {
      time: { best: 'O(n + N)', average: 'O(n + N)', worst: 'O(n + N)' },
      space: 'O(n + N)',
      keyConcepts: ['Pigeonhole Principle', 'Non-Comparison-Based', 'Key Range N Bounds']
    };
  }
  if (normId.includes('sort')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      keyConcepts: ['Comparison Sort', 'Element Reordering']
    };
  }

  // 2. Specific Linear Data Structure matches (LRU, queues, stacks, linked lists)
  if (normId.includes('lru')) {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(capacity)',
      keyConcepts: ['Eviction Policy', 'HashMap Hash Map', 'Doubly Linked List', 'O(1) Access']
    };
  }
  if (normId.includes('linked-list') || normId.includes('list') || normId.includes('floyd') || normId.includes('josephus')) {
    const isDelete = normId.includes('delete');
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
      keyConcepts: isDelete 
        ? ['Linked Nodes Ref', 'Element Deletion', 'Freeing Memory', 'Pointer Redirection']
        : ['Sequential Traversal', 'Pointer References Chain', 'Dynamic Memory Alloc']
    };
  }
  if (normId.includes('stack') || normId.includes('postfix') || normId.includes('infix') || normId.includes('parentheses')) {
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['LIFO Order', 'Push Pop Telemetry', 'Balanced Nesting', 'Last-In First-Out']
    };
  }
  if (normId.includes('queue') || normId.includes('deque') || normId.includes('sliding-window')) {
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['FIFO Order', 'Enqueue Dequeue Operations', 'Circular Buffer Wrap', 'Double-Ended Buffer']
    };
  }
  if (normId.includes('trapping') || normId.includes('span') || normId.includes('greater')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Monotonic Stack', 'Prefix Arrays', 'Linear Scanning']
    };
  }

  // 2.5. Specific New Category Matches (BST, Knapsack, Convex Hull, Needleman-Wunsch)
  if (normId.includes('binary-search-tree')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Hierarchical BST', 'Divide & Conquer', 'Sorted Keys Constraint', 'Logarithmic Search']
    };
  }
  if (normId.includes('avl-tree')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Self-Balancing BST', 'Balance factors rebalancing', 'Left/Right single double rotations']
    };
  }
  if (normId.includes('red-black-tree')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Red-Black node recoloring', 'Uncle node coloring checks', 'Black-height invariants']
    };
  }
  if (normId.includes('splay-tree')) {
    return {
      time: { best: 'O(1)', average: 'O(log n) amortized', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Accessed root splaying', 'Zig-Zig and Zig-Zag rotations', 'Amortized cost optimizers']
    };
  }
  if (normId.includes('b-tree-search')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Multi-key block nodes', 'B-Tree interval child branches', 'Database indexing structures']
    };
  }
  if (normId.includes('trie-prefix')) {
    return {
      time: { best: 'O(L)', average: 'O(L)', worst: 'O(L)' },
      space: 'O(words · L)',
      keyConcepts: ['Character prefix walking', 'Trie retrieval trees', 'String prefix matching']
    };
  }
  if (normId.includes('segment-tree-query')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Interval range queries', 'Subsegment summation trees', 'Logarithmic range query']
    };
  }
  if (normId.includes('fenwick-tree')) {
    return {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Prefix sum trees', 'Least Significant Bit clearing', 'Binary Indexed Trees updates']
    };
  }
  if (normId.includes('kd-tree-search')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Alternating axis splits', 'K-D spatial search partitioning', 'Multi-dimensional coordinates']
    };
  }
  if (normId.includes('treap-insert')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['BST Key order constraint', 'Heap randomized priorities', 'Treap balanced rotations']
    };
  }
  if (normId.includes('cartesian-tree')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Spine heap adjustments', 'Cartesian sequence traversals', 'Root minimum values']
    };
  }
  if (normId.includes('min-heap-bubble')) {
    return {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Min-Heap parent comparisons', 'Priority Queue insert bubbles', 'Binary heap invariants']
    };
  }
  if (normId.includes('max-heapify')) {
    return {
      time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
      space: 'O(n)',
      keyConcepts: ['Max-Heapify down recursion', 'Bubbling down max elements', 'Largest child swaps']
    };
  }
  if (normId.includes('binary-tree-traversals')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
      keyConcepts: ['Depth-First Search recursion', 'In/Pre/Post-order visits sequence', 'Binary Tree DFS sweeps']
    };
  }
  if (normId.includes('nary-tree-traversals')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
      keyConcepts: ['Multi-child tree walks', 'N-ary depth sequences', 'Children array iterations']
    };
  }
  if (normId.includes('lowest-common-ancestor')) {
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
      keyConcepts: ['Lowest Common Ancestor node', 'Recursive left-right search paths', 'Common parent intersections']
    };
  }
  if (normId.includes('tree-diameter')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
      keyConcepts: ['Longest leaf-to-leaf paths', 'Subtree height calculations', 'Recursive tree diameters']
    };
  }
  if (normId.includes('expression-tree-eval')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(h)',
      keyConcepts: ['Post-order equation solvers', 'Operator node computations', 'Recursive subexpression evaluations']
    };
  }
  if (normId.includes('huffman-tree-builder')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Alphabet frequency queues', 'Variable-length prefix trees', 'Data Compression encoding']
    };
  }
  if (normId.includes('disjoint-set')) {
    return {
      time: { best: 'O(1)', average: 'O(alpha(n))', worst: 'O(alpha(n))' },
      space: 'O(n)',
      keyConcepts: ['Union-Find tree partitions', 'Path Compression roots updates', 'Inverse Ackermann ranks']
    };
  }
  if (normId.includes('dijkstra-route')) {
    return {
      time: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
      space: 'O(V)',
      keyConcepts: ['Priority Queue relaxation', 'Shortest road route', 'European road network']
    };
  }
  if (normId.includes('astar-terrain')) {
    return {
      time: { best: 'O(1)', average: 'O(E log V)', worst: 'O(V log V)' },
      space: 'O(V)',
      keyConcepts: ['Admissible heuristic check', 'Haversine spherical distance', 'Geographic path route']
    };
  }
  if (normId.includes('bidirectional-route')) {
    return {
      time: { best: 'O(1)', average: 'O(E log V)', worst: 'O(V log V)' },
      space: 'O(V)',
      keyConcepts: ['Dual front search', 'Meeting in the middle', 'Frontier search overlap']
    };
  }
  if (normId.includes('contraction-hierarchies')) {
    return {
      time: { best: 'O(1)', average: 'O(log V)', worst: 'O(E + V log V)' },
      space: 'O(V + E)',
      keyConcepts: ['Highway shortcut edges', 'Importance node contraction', 'Bidirectional Dijkstra search']
    };
  }
  if (normId.includes('hpa-route')) {
    return {
      time: { best: 'O(1)', average: 'O(M log M)', worst: 'O(M^2)' },
      space: 'O(V)',
      keyConcepts: ['Macro cluster grids', 'Micro coordinate refinement', 'Hierarchical abstract map']
    };
  }
  if (normId.includes('floyd-warshall-city')) {
    return {
      time: { best: 'O(V^3)', average: 'O(V^3)', worst: 'O(V^3)' },
      space: 'O(V^2)',
      keyConcepts: ['All-pairs shortest paths', 'Dynamic Programming grid', 'Transitive closure paths']
    };
  }
  if (normId.includes('geofence-raycast')) {
    return {
      time: { best: 'O(1)', average: 'O(N)', worst: 'O(N)' },
      space: 'O(1)',
      keyConcepts: ['Containment checking ray', 'Horizontal crossing count', 'Geofencing borders']
    };
  }
  if (normId.includes('douglas-peucker')) {
    return {
      time: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N^2)' },
      space: 'O(N)',
      keyConcepts: ['GPS track simplification', 'Perpendicular distance check', 'Threshold tolerance epsilon']
    };
  }
  if (normId.includes('knn-locations')) {
    return {
      time: { best: 'O(N)', average: 'O(N log K)', worst: 'O(N log N)' },
      space: 'O(K)',
      keyConcepts: ['K closest EV stations', 'Haversine distance scan', 'Priority search heap']
    };
  }
  if (normId.includes('rtree-range')) {
    return {
      time: { best: 'O(log N)', average: 'O(log N)', worst: 'O(N)' },
      space: 'O(log N)',
      keyConcepts: ['Bounding box overlap', 'Hierarchical spatial query', 'Region intersection bounds']
    };
  }
  if (normId.includes('quadtree-partition')) {
    return {
      time: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N^2)' },
      space: 'O(N)',
      keyConcepts: ['Subdivision quadrant split', 'Density threshold capacity', '2D coordinate spatial grid']
    };
  }
  if (normId.includes('kmeans-clustering')) {
    return {
      time: { best: 'O(N · K · I)', average: 'O(N · K · I)', worst: 'O(N · K · I)' },
      space: 'O(N + K)',
      keyConcepts: ['Centroid mean update', 'Euclidean delivery cluster', 'Lloyd iteration loop']
    };
  }
  if (normId.includes('voronoi-territory')) {
    return {
      time: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)' },
      space: 'O(N)',
      keyConcepts: ['Bisector half-planes', 'Convex cell boundaries', 'Territory service mapping']
    };
  }
  if (normId.includes('delaunay-triangulation')) {
    return {
      time: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N^2)' },
      space: 'O(N)',
      keyConcepts: ['Circumcircle empty rule', 'Mesh retriangulation', 'City coordinate edges']
    };
  }
  if (normId.includes('convex-envelope')) {
    return {
      time: { best: 'O(N log N)', average: 'O(N log N)', worst: 'O(N log N)' },
      space: 'O(N)',
      keyConcepts: ['Graham scan vertices', 'Polar angle sorting', 'Enclosing airport hulls']
    };
  }
  if (normId.includes('haversine-distance')) {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(1)',
      keyConcepts: ['Spherical Earth math', 'Great-circle route', 'Trigonometric coordinate radians']
    };
  }
  if (normId.includes('vincenty-distance')) {
    return {
      time: { best: 'O(1)', average: 'O(I)', worst: 'O(I)' },
      space: 'O(1)',
      keyConcepts: ['Ellipsoidal Earth geodesics', 'Inverse Vincenty equations', 'Flattening parameter convergence']
    };
  }
  if (normId.includes('hmm-snapping')) {
    return {
      time: { best: 'O(N · S^2)', average: 'O(N · S^2)', worst: 'O(N · S^2)' },
      space: 'O(N · S)',
      keyConcepts: ['Emission probability model', 'Transition road distance', 'Viterbi path tracking']
    };
  }
  if (normId.includes('prim-fiber')) {
    return {
      time: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(V^2)' },
      space: 'O(V + E)',
      keyConcepts: ['Minimum spanning fiber', 'Priority node selection', 'Geographic network connection']
    };
  }
  if (normId.includes('tsp-delivery')) {
    return {
      time: { best: 'O(N^2)', average: 'O(2^N · N^2)', worst: 'O(N!)' },
      space: 'O(N)',
      keyConcepts: ['Simulated Annealing loop', 'Tour swap cooling', 'Round-trip delivery path']
    };
  }
  if (normId.includes('knapsack')) {
    return {
      time: { best: 'O(n · W)', average: 'O(n · W)', worst: 'O(n · W)' },
      space: 'O(n · W)',
      keyConcepts: ['Dynamic Programming', 'Optimal Substructure', 'Overlap Subproblems', 'Traceback Path Vector']
    };
  }
  if (normId.includes('fibonacci-dp')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Fibonacci Tabulation', 'Recursive Memoization', 'Subproblem Dependency']
    };
  }
  if (normId.includes('lcs-dp')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Subsequence Alignment', 'Longest Common Subsequence', 'Traceback Matrix']
    };
  }
  if (normId.includes('lis-dp')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(n)',
      keyConcepts: ['Longest Increasing Subsequence', 'Subproblem Caching', 'Array Scanning']
    };
  }
  if (normId.includes('matrix-chain-dp')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['Parenthesization Cost', 'Interval DP', 'Matrix Chain Multiplication']
    };
  }
  if (normId.includes('coin-change-min')) {
    return {
      time: { best: 'O(n · c)', average: 'O(n · c)', worst: 'O(n · c)' },
      space: 'O(n)',
      keyConcepts: ['Minimum Coins Count', 'Tabulation Array', 'Coin Change minimization']
    };
  }
  if (normId.includes('coin-change-ways')) {
    return {
      time: { best: 'O(n · c)', average: 'O(n · c)', worst: 'O(n · c)' },
      space: 'O(n)',
      keyConcepts: ['Combinations Ways Count', 'Subset Additions', 'Coin Change ways']
    };
  }
  if (normId.includes('edit-distance-dp')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Levenshtein Distance', 'String Transformations', 'Cell Min Operations']
    };
  }
  if (normId.includes('floyd-warshall-dp')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['All-Pairs Shortest Path', 'Distance Adjacency Matrix', 'Intermediate Relaxation']
    };
  }
  if (normId.includes('subset-sum-dp')) {
    return {
      time: { best: 'O(n · sum)', average: 'O(n · sum)', worst: 'O(n · sum)' },
      space: 'O(n · sum)',
      keyConcepts: ['Subset Sum Match', 'Partition Equal Halves', 'Boolean Feasibility matrix']
    };
  }
  if (normId.includes('rod-cutting-dp')) {
    return {
      time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(n)',
      keyConcepts: ['Optimal Cutting splits', 'Revenue Maximization', 'Rod length partitions']
    };
  }
  if (normId.includes('wildcard-matching-dp')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Wildcard Character Match', 'Pattern matching grid', 'State Transition rules']
    };
  }
  if (normId.includes('optimal-bst-dp')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['Search Frequency Cost', 'Subtree splits optimization', 'Optimal BST structures']
    };
  }
  if (normId.includes('fractional-knapsack-greedy')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Density Ratio Sorting', 'Fractional item breaks', 'Greedy Selection pool']
    };
  }
  if (normId.includes('activity-selection-greedy')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Earliest Finish first', 'Interval Task scheduler', 'Compatible activities']
    };
  }
  if (normId.includes('job-sequencing-greedy')) {
    return {
      time: { best: 'O(n log n + n · d)', average: 'O(n log n + n · d)', worst: 'O(n log n + n · d)' },
      space: 'O(d)',
      keyConcepts: ['Profit-maximizing deadlines', 'Time slot schedules', 'Deadlines limit checks']
    };
  }
  if (normId.includes('kruskal-greedy')) {
    return {
      time: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
      space: 'O(V + E)',
      keyConcepts: ['Cheapest edge selection', 'Cycle checks with DSU', 'Minimum Spanning Trees']
    };
  }
  if (normId.includes('prim-greedy')) {
    return {
      time: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      space: 'O(V + E)',
      keyConcepts: ['Cut frontier expansions', 'Adjacent node selections', 'Minimum Spanning Trees']
    };
  }
  if (normId.includes('huffman-greedy')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Alphabet frequency queues', 'Variable-length prefix trees', 'Data Compression encoding']
    };
  }
  if (normId.includes('dijkstra-greedy')) {
    return {
      time: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)' },
      space: 'O(V + E)',
      keyConcepts: ['Single-Source Shortest Paths', 'Vertex distance relaxations', 'Frontier node updates']
    };
  }
  if (normId.includes('convex-hull')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Graham Scan', 'Polar Angle Sort', 'Stack Backtracking', 'Counter-Clockwise Check']
    };
  }
  if (normId.includes('newton-raphson')) {
    return {
      time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(iter)' },
      space: 'O(1)',
      keyConcepts: ['Root Approximation', 'Tangent intersections', 'Laplace derivatives']
    };
  }
  if (normId.includes('riemann-sum')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Definite Integrals', 'Numeric Integration slices', 'Riemann Sum limits']
    };
  }
  if (normId.includes('gradient-descent')) {
    return {
      time: { best: 'O(iter)', average: 'O(iter)', worst: 'O(iter)' },
      space: 'O(1)',
      keyConcepts: ['Optimization minimization', 'Gradient vectors', 'Learning Rates updates']
    };
  }
  if (normId.includes('bezier-curve')) {
    return {
      time: { best: 'O(steps)', average: 'O(steps)', worst: 'O(steps)' },
      space: 'O(steps)',
      keyConcepts: ['Smooth Bernstein curves', 'Bezier Control points', 'Quadratic cubic splines']
    };
  }
  if (normId.includes('fft-divide-conquer')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Signal decomposition', 'Cooley-Tukey butterfly operations', 'Twiddle factors']
    };
  }
  if (normId.includes('collatz-sequence')) {
    return {
      time: { best: 'O(log n)', average: 'O(steps)', worst: 'O(steps)' },
      space: 'O(steps)',
      keyConcepts: ['Collatz 3n+1 sequence', 'Orbit path trajectories', 'Trajectories loops']
    };
  }
  if (normId.includes('euclidean-gcd')) {
    return {
      time: { best: 'O(1)', average: 'O(log min(a,b))', worst: 'O(log min(a,b))' },
      space: 'O(1)',
      keyConcepts: ['Greatest Common Divisor', 'Euclidean remainder shifts', 'Division algorithms']
    };
  }
  if (normId.includes('sieve-eratosthenes')) {
    return {
      time: { best: 'O(n log log n)', average: 'O(n log log n)', worst: 'O(n log log n)' },
      space: 'O(n)',
      keyConcepts: ['Sieve prime filters', 'Composite index marks', 'Prime search lists']
    };
  }
  if (normId.includes('matrix-determinant')) {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(1)',
      keyConcepts: ['LU matrix determinant', 'Laplace determinant expansions', 'Expansion coefficients']
    };
  }
  if (normId.includes('vector-cross-product')) {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(1)',
      keyConcepts: ['Vector Cross Product', 'Perpendicular vector coordinates', 'Determinant expansions']
    };
  }
  if (normId.includes('jarvis-march')) {
    return {
      time: { best: 'O(n)', average: 'O(n · h)', worst: 'O(n · h)' },
      space: 'O(h)',
      keyConcepts: ['Leftmost vertex wrap', 'Gift wrapping hulls', 'Dihedral orientation checks']
    };
  }
  if (normId.includes('segment-intersection')) {
    return {
      time: { best: 'O((n + k) log n)', average: 'O((n + k) log n)', worst: 'O((n + k) log n)' },
      space: 'O(n)',
      keyConcepts: ['Sweep-line intersections', 'Segment search trees', 'Endpoint event sweeps']
    };
  }
  if (normId.includes('point-in-polygon')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
      keyConcepts: ['Ray Casting checks', 'Even odd intersections count', 'Polygon bound boundaries']
    };
  }
  if (normId.includes('monte-carlo-pi')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
      keyConcepts: ['Random area estimates', 'Quadrance circle limits', 'Monte Carlo Pi formulas']
    };
  }
  if (normId.includes('bresenham-line')) {
    return {
      time: { best: 'O(dx)', average: 'O(dx)', worst: 'O(dx)' },
      space: 'O(dx)',
      keyConcepts: ['Pixel raster grid lines', 'Integer parameter decisions', 'Step coordinate plots']
    };
  }
  if (normId.includes('bezier-spline-interpolation')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Smooth joint junctions', 'Bezier splines matching', 'Interpolation curves']
    };
  }
  if (normId.includes('voronoi-heuristic')) {
    return {
      time: { best: 'O(w · h · s)', average: 'O(w · h · s)', worst: 'O(w · h · s)' },
      space: 'O(w · h)',
      keyConcepts: ['Euclidean region mappings', 'Voronoi partition cells', 'Site distance relaxations']
    };
  }
  if (normId.includes('jarvis-march-3d')) {
    return {
      time: { best: 'O(n · f)', average: 'O(n · f)', worst: 'O(n · f)' },
      space: 'O(f)',
      keyConcepts: ['3D coplanar wraps', 'Convex Hull envelopes', 'Dihedral wrap calculations']
    };
  }
  if (normId.includes('fibonacci-spiral')) {
    return {
      time: { best: 'O(steps)', average: 'O(steps)', worst: 'O(steps)' },
      space: 'O(steps)',
      keyConcepts: ['Golden Spiral coordinates', 'Fibonacci square dimensions', 'Trigonometric arc curves']
    };
  }
  if (normId.includes('needleman-wunsch')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Bioinformatics Alignment', 'Scoring Cell Grid Matrix', 'Gap Penalty', 'Sequence Match Traceback']
    };
  }
  if (normId.includes('smith-waterman')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Local Alignment', 'Dynamic Programming', 'Clamp to Zero', 'Traceback Pointers']
    };
  }
  if (normId.includes('banded-alignment')) {
    return {
      time: { best: 'O(k · n)', average: 'O(k · n)', worst: 'O(k · n)' },
      space: 'O(k · n)',
      keyConcepts: ['Banded Optimization', 'Global Alignment', 'Diagonals constraint']
    };
  }
  if (normId.includes('nussinov')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['RNA Secondary Structure', 'Interval DP', 'Base-pair Maximization']
    };
  }
  if (normId.includes('zuker-folding')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['Thermodynamic Folding', 'Free Energy Minimization', 'RNA Secondary Structure']
    };
  }
  if (normId.includes('bwt-transform')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
      space: 'O(n)',
      keyConcepts: ['Burrows-Wheeler Transform', 'Cyclic Rotations', 'Genome Index Preparation']
    };
  }
  if (normId.includes('fm-index')) {
    return {
      time: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
      space: 'O(n)',
      keyConcepts: ['FM-Index', 'Exact Substring Query', 'LF-Mapping Tracker']
    };
  }
  if (normId.includes('lf-mapping')) {
    return {
      time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
      space: 'O(n)',
      keyConcepts: ['Last-to-First mapping', 'BWT Ranking Tracker', 'Suffix Traversal']
    };
  }
  if (normId.includes('blast-search')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Seed-and-Extend Heuristic', 'High-Scoring Segment Pairs', 'Homology database search']
    };
  }
  if (normId.includes('karp-rabin-dna')) {
    return {
      time: { best: 'O(n + m)', average: 'O(n + m)', worst: 'O(n + m)' },
      space: 'O(1)',
      keyConcepts: ['Rolling Hash', 'Spurious Hit Check', 'DNA Motif Matching']
    };
  }
  if (normId.includes('suffix-tree')) {
    return {
      time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Suffix Indexing', 'Substring Lookup', 'Prefix Trie Tree']
    };
  }
  if (normId.includes('neighbor-joining')) {
    return {
      time: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
      space: 'O(n²)',
      keyConcepts: ['Phylogenetic Clustering', 'Distance Matrix Reduction', 'Net Divergence']
    };
  }
  if (normId.includes('upgma')) {
    return {
      time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(n²)',
      keyConcepts: ['Rooted Dendrogram', 'Hierarchical Clustering', 'Evolutionary Heights']
    };
  }
  if (normId.includes('fitch-parsimony')) {
    return {
      time: { best: 'O(n · k)', average: 'O(n · k)', worst: 'O(n · k)' },
      space: 'O(n)',
      keyConcepts: ['Fitch Parsimony', 'Set Intersection Union', 'Mutation Count Reconstruction']
    };
  }
  if (normId.includes('sankoff-parsimony')) {
    return {
      time: { best: 'O(n · a²)', average: 'O(n · a²)', worst: 'O(n · a²)' },
      space: 'O(n)',
      keyConcepts: ['Weighted Transition Parsimony', 'DP on Trees', 'Mutation Cost Matrix']
    };
  }
  if (normId.includes('viterbi-hmm')) {
    return {
      time: { best: 'O(n · s²)', average: 'O(n · s²)', worst: 'O(n · s²)' },
      space: 'O(n · s)',
      keyConcepts: ['Exon Boundary Parsing', 'Trellis DP Path', 'Likelihood Maximization']
    };
  }
  if (normId.includes('forward-backward')) {
    return {
      time: { best: 'O(n · s²)', average: 'O(n · s²)', worst: 'O(n · s²)' },
      space: 'O(n · s)',
      keyConcepts: ['State Posterior Probability', 'Forward-Backward passes', 'Transition Emissions modeling']
    };
  }
  if (normId.includes('eulerian-assembly')) {
    return {
      time: { best: 'O(E)', average: 'O(E)', worst: 'O(E)' },
      space: 'O(V + E)',
      keyConcepts: ['De Bruijn Graph', 'k-mer overlap networks', 'Eulerian Path traversal']
    };
  }
  if (normId.includes('hamiltonian-assembly')) {
    return {
      time: { best: 'O(2^V · V²)', average: 'O(2^V · V²)', worst: 'O(2^V · V²)' },
      space: 'O(V + E)',
      keyConcepts: ['Overlap-Layout-Consensus', 'Read overlaps weights', 'Hamiltonian Path layout']
    };
  }
  if (normId.includes('dynamic-time-warping')) {
    return {
      time: { best: 'O(n · m)', average: 'O(n · m)', worst: 'O(n · m)' },
      space: 'O(n · m)',
      keyConcepts: ['Signal warping matching', 'Nanopore current traces', 'Distance warping matrix']
    };
  }
  if (normId.includes('tandem-repeat-finder')) {
    return {
      time: { best: 'O(n · p)', average: 'O(n · p)', worst: 'O(n · p)' },
      space: 'O(1)',
      keyConcepts: ['Microsatellite DNA repeats', 'Period length scans', 'Tandem occurrences finder']
    };
  }

  // 3. Specific Searching & String matches
  if (normId.includes('search')) {
    if (normId.includes('jump')) {
      return {
        time: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
        space: 'O(1)',
        keyConcepts: ['Jump Step Block', 'Optimal Jump √n', 'Linear Step Scan']
      };
    }
    if (normId.includes('interpolation')) {
      return {
        time: { best: 'O(1)', average: 'O(log(log n))', worst: 'O(n)' },
        space: 'O(1)',
        keyConcepts: ['Proportional Index Guess', 'Uniform Value Distribution', 'Formula Probe']
      };
    }
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
      keyConcepts: ['Data Querying', 'Scan Pattern']
    };
  }

  // General CS Default
  return {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    keyConcepts: ['Algorithmic Evaluation', 'Step-by-step Execution']
  };
};
