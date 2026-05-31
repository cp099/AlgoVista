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

  // Fallback defaults based on id matching
  if (normId.includes('sort')) {
    return {
      time: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)' },
      space: 'O(1)',
      keyConcepts: ['Comparison Sort', 'Element Reordering']
    };
  }
  if (normId.includes('search') || normId.includes('check')) {
    return {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(1)',
      keyConcepts: ['Data Querying', 'Scan Pattern']
    };
  }
  if (normId.includes('linked-list') || normId.includes('list') || normId.includes('stack') || normId.includes('queue')) {
    return {
      time: { best: 'O(1)', average: 'O(1) / O(n)', worst: 'O(n)' },
      space: 'O(n)',
      keyConcepts: ['Linear Node References', 'Dynamic Memory Management']
    };
  }

  // General CS Default
  return {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    keyConcepts: ['Algorithmic Evaluation', 'Step-by-step Execution']
  };
};
