export interface DetailedGuide {
  realWorldApp: string;
  invariant: string;
  walkthrough: string[];
}

const SPECIFIC_GUIDES: Record<string, DetailedGuide> = {
  // --- SORTING ---
  'bubble-sort': {
    realWorldApp: "Bubble sort is primarily used in computer science education to teach sorting fundamentals and stability. In hardware engineering, it is sometimes implemented in simple, low-power integrated circuits where memory is extremely constrained and data is nearly sorted.",
    invariant: "At the end of iteration i, the i-th largest element is placed in its final sorted position at the end of the array, and the subarray arr[n-i...n-1] is fully sorted.",
    walkthrough: [
      "Scan the array from index 0 to n-i-1, comparing adjacent elements.",
      "If a left element is larger than its right neighbor, swap them to push the larger element forward.",
      "Repeat the pass, locking the largest unsorted element in place with each iteration."
    ]
  },
  'selection-sort': {
    realWorldApp: "Used in low-memory microcontrollers where write operations are extremely costly (e.g. EEPROM/Flash memory writing), because Selection Sort performs a maximum of O(n) swaps.",
    invariant: "At the end of iteration i, the first i elements of the array are sorted and consist of the smallest i elements from the original unsorted array.",
    walkthrough: [
      "Divide the array into sorted (left) and unsorted (right) segments.",
      "Scan the unsorted segment to find the absolute minimum value.",
      "Swap this minimum value with the first element of the unsorted segment and advance the boundary."
    ]
  },
  'insertion-sort': {
    realWorldApp: "Powers the 'small array fallback' in production sorting libraries (e.g., Timsort in Python/V8, Introsort in C++ STL) for arrays under 16-32 elements, due to its low overhead and O(n) best-case performance.",
    invariant: "At the start of iteration i, the subarray arr[0...i-1] is sorted, containing the initial elements but reordered.",
    walkthrough: [
      "Select the next unsorted element (the key) to place in the sorted prefix.",
      "Shift all elements in the sorted prefix that are larger than the key one position to the right.",
      "Insert the key into its correct vacant position to extend the sorted subarray."
    ]
  },
  'merge-sort': {
    realWorldApp: "Used in external sorting (when sorting datasets too large to fit in RAM) and stable database joins, where sequential memory access is faster than random disk reads.",
    invariant: "The recursive split produces individual segments of length 1 which are sorted, and subsequent merge steps combine two sorted subarrays into a single sorted subarray.",
    walkthrough: [
      "Divide: Recursively split the array into halves until individual element segments remain.",
      "Conquer: Sort and merge the smaller subsegments using a temporary workspace.",
      "Reconstruct: Copy the merged, sorted elements back into the primary array boundary."
    ]
  },
  'quick-sort-lomuto': {
    realWorldApp: "Highly efficient general sorting method, widely used as the default CPU cache-friendly sort. Lomuto partitioning uses a single write index, making it simple to write and optimize in parallel registers.",
    invariant: "During partition, all elements from index low to i are less than or equal to the pivot, and all elements from i+1 to j-1 are greater than the pivot.",
    walkthrough: [
      "Choose the rightmost element as the pivot value.",
      "Scan the segment with pointer j, swapping elements smaller than the pivot to index i and incrementing i.",
      "Swap the pivot element with the element at index i+1, placing the pivot in its final position."
    ]
  },
  'quick-sort-hoare': {
    realWorldApp: "The standard partition method in production libraries. Hoare partitioning performs about three times fewer swaps on average than Lomuto, making it faster on physical hardware.",
    invariant: "During partition, all elements before index i are less than or equal to the pivot, and all elements after index j are greater than or equal to the pivot.",
    walkthrough: [
      "Initialize two pointers at opposite ends of the array segment.",
      "Advance pointer i forward until an element larger than the pivot is found, and pointer j backward until one smaller is found.",
      "Swap the elements at i and j, repeating until the pointers cross to partition the array."
    ]
  },
  'dijkstra': {
    realWorldApp: "Powers routing engines in network protocols (like OSPF), GPS satellite navigation maps (such as Google Maps/Apple Maps), and robot motion planning in automated warehouses.",
    invariant: "For each node v in the visited set, the recorded distance dist[v] is the absolute shortest possible distance from the source node to v.",
    walkthrough: [
      "Initialize all node distances to infinity, except the source node which is set to zero.",
      "Select the unvisited node with the smallest tentative distance and mark it as visited.",
      "Relax all outgoing edges from the active node, updating neighbor distances if a shorter path is discovered."
    ]
  },
  'binary-search': {
    realWorldApp: "Used in database search indexing (B-Trees), memory lookup registers, compiler assembly lookups, and numerical solvers finding mathematical roots of functions.",
    invariant: "If the target key exists in the array, it is guaranteed to be contained within the active search interval [low, high].",
    walkthrough: [
      "Calculate the midpoint index of the active search boundary.",
      "Compare the midpoint value against the search target.",
      "Halve the search space by shifting the lower bound up or the upper bound down depending on the comparison."
    ]
  },
  'kmp-search': {
    realWorldApp: "Used in text processing tools, bioinformatic DNA sequence matching, search engine indexing, and compiler lexers parsing source code files.",
    invariant: "The failure function (LPS table) stores the length of the longest proper prefix of the pattern that is also a suffix of the pattern ending at that point, preventing repeated scans.",
    walkthrough: [
      "Precompute the Longest Prefix Suffix (LPS) table for the search pattern.",
      "Align the pattern at the text start and compare characters from left to right.",
      "Upon mismatch, look up the LPS table to shift the pattern forward without backtracking the text cursor."
    ]
  }
};

export const getDetailedGuide = (id: string): DetailedGuide => {
  const normId = id.toLowerCase().replace(/_/g, '-');
  
  if (SPECIFIC_GUIDES[normId]) {
    return SPECIFIC_GUIDES[normId];
  }

  // --- CATEGORY FALLBACK GENERATORS (Rich templates for all 82 algorithms) ---
  if (normId.includes('sort')) {
    return {
      realWorldApp: "Sorting and sequence reordering algorithms are fundamental to numerical analysis, database performance (SQL indexes), data alignment in data science, and pipeline schedulers.",
      invariant: "Throughout sorting passes, the array moves from a higher state of entropy (unsorted) to a lower state, gradually satisfying the order relation arr[a] <= arr[b] for all indices a < b.",
      walkthrough: [
        "Initialize boundary conditions and scan pointers.",
        "Compare adjacent or indexed values depending on the specific sorting pattern.",
        "Rearrange elements in-place or out-of-place to resolve sorting constraints."
      ]
    };
  }

  if (normId.includes('search') || normId.includes('kmp') || normId.includes('rabin') || normId.includes('boyer') || normId.includes('levenshtein') || normId.includes('match') || normId.includes('check') || normId.includes('prefix') || normId.includes('palindrome')) {
    return {
      realWorldApp: "Searching and text matching algorithms are extensively used in search query parsers, database lookup indexes, spellcheckers, genomic sequence alignment (DNA/RNA matching), and data compression pipelines.",
      invariant: "The scan pointer maintains bounds to ensure that every potential match candidate before the active window has been checked, narrowing the candidate range to log or linear steps.",
      walkthrough: [
        "Align pattern cursors or target indices with the input collection.",
        "Compare active characters or elements against targets, tracking lookup state or offsets.",
        "Shift indexes based on matching heuristics or skip rules to narrow search bounds."
      ]
    };
  }

  if (normId.includes('graph') || normId.includes('bfs') || normId.includes('dfs') || normId.includes('dijkstra') || normId.includes('bellman') || normId.includes('floyd') || normId.includes('prims') || normId.includes('kruskal') || normId.includes('connected')) {
    return {
      realWorldApp: "Graph theory algorithms are utilized in navigation routing, computer networks (packet routing), electrical circuit design, social networks (friend recommendations), and logistical supply chain optimization.",
      invariant: "For visited vertices or completed edges, topological invariants (like shortest path bounds, spanning tree connectivity, or traversal trees) are strictly preserved.",
      walkthrough: [
        "Initialize traversal queue, stack, or priority buffer starting from the root or source vertex.",
        "De-queue or pop the next vertex and mark it as visited to prevent circular loops.",
        "Evaluate neighboring nodes and relax edge weights or push unvisited nodes to the buffer."
      ]
    };
  }

  if (normId.includes('linked-list') || normId.includes('list') || normId.includes('stack') || normId.includes('queue') || normId.includes('deque') || normId.includes('lru') || normId.includes('matrix')) {
    return {
      realWorldApp: "Linear structures and workflows manage sequential computational buffers, operating system scheduler tasks, thread pools, nested undo/redo actions, and matrix representations of multi-dimensional spaces.",
      invariant: "Elements follow strict data access constraints (e.g. LIFO for stacks, FIFO for queues, sequential links for linked lists) preserving sequential integrity.",
      walkthrough: [
        "Align head, tail, or pointer cursors with the structure's current state.",
        "Insert or remove elements at designated boundaries, updating adjacent pointer references.",
        "Verify state variables (such as top, front, rear, or node links) to reflect structural updates."
      ]
    };
  }

  // General Educational Fallback
  return {
    realWorldApp: "General workflow optimization algorithms are applied in scientific models, nature-inspired optimization processes, resource management, and educational simulators.",
    invariant: "The state machine advances through deterministic transitions, ensuring each operation moves the system closer to the target end condition.",
    walkthrough: [
      "Read active parameters and initialize the computation sandbox.",
      "Run iterative steps, updating variables and tracking comparative conditions.",
      "Conclude computation and render the final state on the visualization canvas."
    ]
  };
};
