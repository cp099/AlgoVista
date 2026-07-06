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

  // --- DYNAMIC RESOLVER FOR CUSTOM ALGORITHMS (TRUE GUIDES & PILLARS) ---

  // 1. Bitonic Sort
  if (normId.includes('bitonic')) {
    return {
      realWorldApp: "Bitonic Sort is widely used in parallel GPU frameworks (such as CUDA and OpenCL) because its comparison network is completely static and independent of input data, rendering it perfect for parallel execution channels.",
      invariant: "At the end of k-sized recursive merges, the sequence of length k is a sorted bitonic sequence that can be split and merged into fully ordered blocks.",
      walkthrough: [
        "Construct a bitonic sequence where the first half is sorted ascending and the second half descending.",
        "Compare and swap elements across the predefined stride gap of the bitonic network.",
        "Recursively merge halves of the array until the entire collection of blocks is fully sorted."
      ]
    };
  }

  // 2. Cocktail Shaker Sort
  if (normId.includes('cocktail') || normId.includes('shaker')) {
    return {
      realWorldApp: "Used in bi-directional array traversals. It resolves the 'turtle' problem in standard bubble sort, where small values located at the end of the array move to the beginning extremely slowly.",
      invariant: "At the end of each forward-backward pass, both the largest and smallest unsorted values are locked at opposite boundaries.",
      walkthrough: [
        "Perform a forward pass, swapping adjacent elements to push the largest value to the end.",
        "Perform a backward pass from the end, pulling the smallest value to the start.",
        "Shrink the active sorting window pointers from both sides and repeat."
      ]
    };
  }

  // 3. Stooge Sort
  if (normId.includes('stooge')) {
    return {
      realWorldApp: "An educational example of fractional recursion. It is a highly inefficient algorithm used in complexity research to demonstrate sorting bounds and recursion tree analysis.",
      invariant: "A stooge call guarantees that after three fractional sort passes, the maximum elements are positioned in the correct subsegment.",
      walkthrough: [
        "If the value at start is greater than at end, swap them.",
        "If there are 3 or more elements, recursively Stooge Sort the first 2/3, then the last 2/3.",
        "Stooge Sort the first 2/3 again to ensure complete order resolution."
      ]
    };
  }

  // 4. Comb Sort
  if (normId.includes('comb')) {
    return {
      realWorldApp: "Comb Sort improves on bubble sort by using a shrink factor gap (typically 1.3), allowing values to jump large strides early to eliminate small 'turtle' elements quickly.",
      invariant: "With a shrink gap of g, the array is g-sorted at each step, progressively narrowing the gap to 1 (which collapses into a final bubble sort pass).",
      walkthrough: [
        "Initialize the stride gap to the array size and divide it by the shrink factor of 1.3.",
        "Scan the array comparing elements separated by the current stride gap, swapping if out of order.",
        "Repeat passes, reducing the gap each time until the gap is 1 and no swaps occur."
      ]
    };
  }

  // 5. Gnome Sort
  if (normId.includes('gnome')) {
    return {
      realWorldApp: "Known as the 'garden gnome' sort. Used in simple single-loop code segments where brevity is prioritized over efficiency, requiring only a single pointer cursor.",
      invariant: "At any point, the gnome pointer has sorted all elements to its left, backtracking only when an out-of-order element is discovered.",
      walkthrough: [
        "Compare the element at the current pointer against its left neighbor.",
        "If they are in order, move the pointer forward; if not, swap them and step the pointer backward.",
        "Repeat until the pointer reaches the end of the array."
      ]
    };
  }

  // 6. Odd-Even Sort
  if (normId.includes('odd-even')) {
    return {
      realWorldApp: "Used in parallel processing architectures (such as transputers or array processors) because odd and even index comparisons are independent and can run simultaneously.",
      invariant: "Alternating odd and even passes progressively bubble values to their correct positions, resolving all inversions in a maximum of n steps.",
      walkthrough: [
        "Perform an odd pass, comparing and swapping adjacent pairs at odd indices (1-2, 3-4, etc.).",
        "Perform an even pass, comparing and swapping adjacent pairs at even indices (0-1, 2-3, etc.).",
        "Repeat alternating odd and even passes until a full cycle yields no swaps."
      ]
    };
  }

  // 7. Pancake Sort
  if (normId.includes('pancake')) {
    return {
      realWorldApp: "Pancake Sort is a mathematical puzzle and routing model. It translates to packet-routing configurations in network topologies where nodes can only reverse prefix sequences.",
      invariant: "At the end of step i, the i-th largest pancake is flipped to the top, then flipped to its correct bottom index position.",
      walkthrough: [
        "Scan the array to find the index of the maximum unsorted element.",
        "Perform a prefix flip to bring the maximum element to the start index (position 0).",
        "Perform a second flip to rotate the maximum element to its correct bottom position."
      ]
    };
  }

  // 8. Cycle Sort
  if (normId.includes('cycle')) {
    return {
      realWorldApp: "Used in systems where writing to memory is highly destructive or expensive (e.g. Flash memory/EEPROM cells), since it is mathematically proven to perform the minimum number of writes to sort an array.",
      invariant: "For every element processed, it is written directly to its final target position, completing rotation cycles without auxiliary buffers.",
      walkthrough: [
        "Select the next element and count how many elements in the array are smaller than it.",
        "Place the element directly into its correct index, displacing the element currently there.",
        "Follow the displaced element, repeating the displacement cycle until the rotation returns to the start."
      ]
    };
  }

  // 9. Intro Sort
  if (normId.includes('intro')) {
    return {
      realWorldApp: "Powers the standard library sort in C++ (std::sort). It acts as the industry benchmark for CPU-bound sorting, combining Quick Sort's speed with Heap Sort's worst-case guarantees.",
      invariant: "The recursion depth is monitored; if it exceeds log(n), the recursion halts and switches to Heap Sort to prevent O(n²) worst-case limits.",
      walkthrough: [
        "Begin sorting the array using Quick Sort with Hoare partitioning.",
        "Track recursion depth; if it exceeds 2 * log(n), switch the active segment to Heap Sort.",
        "When subsegments become smaller than 16 elements, execute a fast final Insertion Sort pass."
      ]
    };
  }

  // 10. Pigeonhole Sort
  if (normId.includes('pigeonhole')) {
    return {
      realWorldApp: "Used to sort items where the range of keys (N) is similar in size to the number of items (n). It is highly efficient for sorting small integer keys in dense ranges.",
      invariant: "Each key is distributed into its corresponding pigeonhole bucket, preserving stable relative order for duplicate elements.",
      walkthrough: [
        "Find the minimum and maximum values in the array to compute the key range.",
        "Create an array of empty 'pigeonhole' buckets for each value in the range.",
        "Iterate through the array, placing each element in its bucket, then gather them in order."
      ]
    };
  }

  // 11. Stacks & Evaluators (Parentheses, Infix-Postfix)
  if (normId.includes('stack') || normId.includes('postfix') || normId.includes('infix') || normId.includes('parentheses')) {
    return {
      realWorldApp: "Stacks power compiler parsing, reverse Polish notation (RPN) calculators, nested function call stacks, database transaction rolls, and editor undo/redo managers.",
      invariant: "Elements follow strict Last-In, First-Out (LIFO) order; only the top item is visible and modifiable at any time.",
      walkthrough: [
        "Analyze the incoming token sequence or bracket characters.",
        "Push operands or opening brackets onto the stack top.",
        "Pop and evaluate operators or verify matches when encountering closing tokens."
      ]
    };
  }

  // 12. Queues & Ring Buffers (Circular Queue, Deque, Sliding Window)
  if (normId.includes('queue') || normId.includes('deque') || normId.includes('sliding-window')) {
    return {
      realWorldApp: "Queues power packet transmission buffers in network routers, OS scheduler task rings, print spoolers, web server request buffers, and sliding window telemetry.",
      invariant: "Circular indexes wrap using modulo arithmetic, and double-ended queues allow O(1) inserts/deletes at both head and tail.",
      walkthrough: [
        "Advance the enqueue rear pointer or dequeue front pointer.",
        "Perform modulo wrap operations to keep indices within buffer capacity.",
        "Insert or remove elements at boundaries, tracking current size and capacity states."
      ]
    };
  }

  // 13. Linked Lists
  if (normId.includes('linked-list') || normId.includes('list') || normId.includes('floyd') || normId.includes('josephus')) {
    return {
      realWorldApp: "Linked lists power file-system fat chains, blockchain block links, hash map collision resolving, music playlist tracks, and memory heap allocator blocks.",
      invariant: "Each node maintains explicit reference pointers (next/prev) to its neighbors, allowing O(1) insertions/deletions without contiguous memory constraints.",
      walkthrough: [
        "Traverse the node chain using the cursor pointers.",
        "Redirect node reference links (next/prev) to bypass or insert nodes.",
        "Update HEAD/TAIL markers and clean up orphaned node references."
      ]
    };
  }

  // 14. LRU Cache
  if (normId.includes('lru')) {
    return {
      realWorldApp: "LRU Caching is critical in CPU cache architectures, CDN edge servers, database query cache layers, and web browser image asset loading pipelines.",
      invariant: "Maintains cache items in access order; the head of the list represents the most recently used, and the tail is evicted when capacity is reached.",
      walkthrough: [
        "Look up the key in the fast hash-map to achieve O(1) retrieval.",
        "On cache hit, decouple the node from the doubly linked list and move it to the HEAD.",
        "On insert when full, evict the TAIL node, delete it from the hash-map, and prepend the new node."
      ]
    };
  }

  // --- NEW CATEGORIES DETAILED GUIDES ---
  if (normId.includes('binary-search-tree')) {
    return {
      realWorldApp: "Powers database index structures, file directory mapping systems, memory tree collections, and IP routing tables.",
      invariant: "For any node N, all values in N's left subtree are strictly less than N's value, and all values in N's right subtree are strictly greater.",
      walkthrough: [
        "Examine the key value at the current tree node.",
        "If the target matches the key, return the node (search succeeds).",
        "Branch left if target is smaller, or branch right if target is larger, repeating recursively."
      ]
    };
  }
  if (normId.includes('avl-tree')) {
    return {
      realWorldApp: "Used in memory allocation indexes, real-time database query optimizations, and spell checkers.",
      invariant: "The height of left and right subtrees of any node differs by at most 1 (|BalanceFactor| <= 1).",
      walkthrough: [
        "Perform a standard recursive Binary Search Tree insertion.",
        "Compute subtree heights and evaluate balance factors at each ancestor.",
        "Perform single or double rotations at the lowest unbalanced node to restore balance."
      ]
    };
  }
  if (normId.includes('red-black-tree')) {
    return {
      realWorldApp: "Powers C++ STL maps/sets (`std::map`), Java's `TreeMap`, and Linux completely fair scheduler (CFS) tasks.",
      invariant: "Every node is either RED or BLACK, the root is BLACK, and no two RED nodes are parent-child adjacent.",
      walkthrough: [
        "Insert the new node as RED at its BST position.",
        "Check parent color; if parent is RED, identify the uncle node's color.",
        "Recolor parent and uncle to BLACK and grandparent to RED, or perform rotations to fix violations."
      ]
    };
  }
  if (normId.includes('splay-tree')) {
    return {
      realWorldApp: "Used in caching lookups, data compression codecs (like Huffman trees), and network routers routing caches.",
      invariant: "Recently accessed elements are located close to the root, guaranteeing O(log n) amortized access cost.",
      walkthrough: [
        "Traverse the tree to locate or insert the key.",
        "Perform a sequence of Zig, Zig-Zig, or Zig-Zag rotations depending on node relationship.",
        "Splay the target node up step-by-step until it becomes the root."
      ]
    };
  }
  if (normId.includes('b-tree-search')) {
    return {
      realWorldApp: "Powers relational databases (MySQL, PostgreSQL B+Tree indexes) and file storage systems (NTFS, ext4).",
      invariant: "All leaf nodes reside at the exact same depth level, and nodes contain between t-1 and 2t-1 sorted keys.",
      walkthrough: [
        "Examine keys sorted in the current node block.",
        "Find the first key greater than or equal to the target.",
        "If key matches, return success; else, branch to the corresponding child interval node."
      ]
    };
  }
  if (normId.includes('trie-prefix')) {
    return {
      realWorldApp: "Used in search engine autocomplete suggestions, IP routing table prefixes, and dictionary spell-checking.",
      invariant: "Every node path represents a unique character prefix, with full words marked at specific leaf markers.",
      walkthrough: [
        "Initialize the search at the Trie root node.",
        "For each character in the query word, check for a matching child branch.",
        "Follow branches sequentially; if any child is missing, prefix does not exist."
      ]
    };
  }
  if (normId.includes('segment-tree-query')) {
    return {
      realWorldApp: "Used in coordinate range search queries, image pixel range modifications, and computational geometry sweep checks.",
      invariant: "A node represents the summary statistic (e.g. range sum) of a specific index segment [L, R].",
      walkthrough: [
        "Compare query range with the current node segment interval.",
        "If node interval is completely inside query bounds, return its stored sum value.",
        "Else, split recursively to left and right child segments, summing overlapping results."
      ]
    };
  }
  if (normId.includes('fenwick-tree')) {
    return {
      realWorldApp: "Used in fast dynamic cumulative frequency tables, inversion counts sorting, and running prefix statistics.",
      invariant: "Each index stores cumulative sums covering a range defined by its binary least significant bit (LSB).",
      walkthrough: [
        "Set the current index to the requested prefix sum bound.",
        "Accumulate the array value at the index to the running sum.",
        "Clear the least significant bit (index = index - (index & -index)) and repeat until index is 0."
      ]
    };
  }
  if (normId.includes('kd-tree-search')) {
    return {
      realWorldApp: "Used in nearest-neighbor search, spatial databases, lidar point cloud analysis, and ray tracing in games.",
      invariant: "Alternates the splitting axis (X-axis, Y-axis) at successive depths to partition space grid.",
      walkthrough: [
        "Start search at the root node.",
        "Determine split axis for the current depth (depth % 2).",
        "Compare search coordinate on that axis; branch left if smaller, right if larger."
      ]
    };
  }
  if (normId.includes('treap-insert')) {
    return {
      realWorldApp: "Used in randomized search trees, IP routers routing tables, and priority treap collections.",
      invariant: "Binary Search Tree properties are maintained on keys, while Heap properties are maintained on random priorities.",
      walkthrough: [
        "Insert the new key at its correct BST position.",
        "Assign a randomized priority value to the new node.",
        "Rotate the node upward if its priority is higher than its parent node's priority."
      ]
    };
  }
  if (normId.includes('cartesian-tree')) {
    return {
      realWorldApp: "Used in range minimum query (RMQ) preprocessing, suffix tree construction, and range minimum indices.",
      invariant: "A binary tree built from a sequence where in-order traversal recovers sequence, and parent is smaller than children.",
      walkthrough: [
        "Process sequence elements from left to right.",
        "Walk up the right spine of the tree to find the correct insertion spot.",
        "Maintain min-heap order by shifting larger elements to become left children of the new node."
      ]
    };
  }
  if (normId.includes('min-heap-bubble')) {
    return {
      realWorldApp: "Used in Dijkstra's shortest path priority queue, heap sort, and scheduler task allocations.",
      invariant: "The value of each parent node is less than or equal to the values of its children.",
      walkthrough: [
        "Append the new element at the end of the heap array (bottom-right leaf).",
        "Compare the element with its parent node value.",
        "Swap them if element is smaller than parent, repeating up the tree structure."
      ]
    };
  }
  if (normId.includes('max-heapify')) {
    return {
      realWorldApp: "Used in heapsort, priority queues, and top-K frequent elements heap collections.",
      invariant: "The value of each parent node is greater than or equal to the values of its children.",
      walkthrough: [
        "Examine parent node and its left and right child nodes.",
        "Find the maximum value among the three nodes.",
        "If child is larger, swap it with parent and recursively bubble down."
      ]
    };
  }
  if (normId.includes('binary-tree-traversals')) {
    return {
      realWorldApp: "Used in expression parsing, code compilation trees, serialization, and tree clone copies.",
      invariant: "Visits every single node in the binary tree exactly once during DFS traversal.",
      walkthrough: [
        "Pre-order: Visit node, then recurse left and right subtrees.",
        "In-order: Recurse left, visit node, then recurse right.",
        "Post-order: Recurse left and right, then visit node."
      ]
    };
  }
  if (normId.includes('nary-tree-traversals')) {
    return {
      realWorldApp: "Used in file systems directory traversals, XML/HTML DOM parsing, and organization hierarchies.",
      invariant: "Visits every node in a multi-way tree structure systematically.",
      walkthrough: [
        "Visit the parent node.",
        "Loop through the list of child nodes from left to right.",
        "Recursively call traversal function on each child node."
      ]
    };
  }
  if (normId.includes('lowest-common-ancestor')) {
    return {
      realWorldApp: "Used in inheritance chains analysis, routing path intersections, and phylogenetic evolutionary tracing.",
      invariant: "The LCA of p and q is the deepest node in the tree that has both p and q as descendants.",
      walkthrough: [
        "Recurse down left and right subtrees searching for target nodes.",
        "If current node matches p or q, return current node.",
        "If both left and right recursions return non-null, current node is the LCA."
      ]
    };
  }
  if (normId.includes('tree-diameter')) {
    return {
      realWorldApp: "Used in network backbone routing planning, tree structural span analysis, and molecule structural diameters.",
      invariant: "The diameter is the maximum path distance, which may or may not pass through the root node.",
      walkthrough: [
        "Compute the maximum height of left and right subtrees.",
        "Add heights together to find the path crossing the root node.",
        "Recursively find diameters of left and right subtrees, returning the overall maximum."
      ]
    };
  }
  if (normId.includes('expression-tree-eval')) {
    return {
      realWorldApp: "Used in compiler expression evaluation, arithmetic calculation engines, and spreadsheet cells formulas.",
      invariant: "Leaf nodes are numbers (operands) and internal nodes are operators (+, -, *, /).",
      walkthrough: [
        "Check if current node is a leaf; if so, return its value.",
        "Evaluate the left subtree recursively.",
        "Evaluate the right subtree recursively, then apply operator to left and right results."
      ]
    };
  }
  if (normId.includes('huffman-tree-builder')) {
    return {
      realWorldApp: "Used in lossless data compression algorithms (GZIP, PKZIP), JPEG image compression, and MP3 audio encoding.",
      invariant: "The two nodes with the lowest frequencies are always merged first at the bottom of the tree.",
      walkthrough: [
        "Insert all character leaf nodes into a frequency priority queue.",
        "Pop the two nodes with the smallest frequencies.",
        "Create a parent node with sum frequency, link to children, and push parent back."
      ]
    };
  }
  if (normId.includes('disjoint-set')) {
    return {
      realWorldApp: "Used in Kruskal's minimum spanning tree algorithm, graph cycle detection, and social network friend group connection checks.",
      invariant: "Uses parent pointer trees where path compression links all visited elements directly to the root representative.",
      walkthrough: [
        "Find: follow parent links to the root representative, updating paths to point directly to the root.",
        "Union: check if roots differ; link root with lower rank to root with higher rank."
      ]
    };
  }
  if (normId.includes('dijkstra-route')) {
    return {
      realWorldApp: "Used in Google Maps routing, ride-sharing pickup assignments, and package delivery optimization.",
      invariant: "At each step, the selected node has the absolute shortest path distance from the origin among all unvisited nodes.",
      walkthrough: [
        "Initialize all city distances to Infinity and the starting city to 0.",
        "Extract the unvisited city with the minimum distance.",
        "Relax all neighbor road distances, updating parent pointers and queue values."
      ]
    };
  }
  if (normId.includes('astar-terrain')) {
    return {
      realWorldApp: "Used in video game pathfinding, dynamic vehicle route calculations, and satellite terrain navigation.",
      invariant: "F-Score (g + h) is guaranteed to be monotonic and lower-bounded if the heuristic is admissible (never overestimates distance).",
      walkthrough: [
        "Compute the direct line-of-sight Haversine distance heuristic to target.",
        "Select nodes based on the minimum combined actual distance and heuristic cost.",
        "Terminate as soon as the target city is extracted from the priority queue."
      ]
    };
  }
  if (normId.includes('bidirectional-route')) {
    return {
      realWorldApp: "Used in high-performance web routing engines, web map route planning backends, and public transit planner networks.",
      invariant: "Halves the search space size by expanding search circles from both ends until they intersect.",
      walkthrough: [
        "Queue up a forward BFS from start city, and a backward BFS from destination city.",
        "Alternate expanding steps from both frontiers.",
        "Halt immediately when any node is visited by both search sweeps, tracing the joined paths."
      ]
    };
  }
  if (normId.includes('contraction-hierarchies')) {
    return {
      realWorldApp: "Powers rapid server-side routing engines, GPS navigation chips, and continental routing backends.",
      invariant: "Bypasses low-importance local road networks by adding transit highway shortcut edges.",
      walkthrough: [
        "Order all network nodes by geographic routing importance.",
        "Contract nodes one-by-one, calculating paths to bypass them and adding shortcuts.",
        "Perform high-speed bidirectional routing using only shortcut highways."
      ]
    };
  }
  if (normId.includes('hpa-route')) {
    return {
      realWorldApp: "Used in RTS games (StarCraft movement), massive city grid pathfinders, and flight connection routings.",
      invariant: "Partitions a global map into sub-grids, routing via cluster entrance portals before refining local paths.",
      walkthrough: [
        "Partition the map grid into high-level macro clusters.",
        "Detect and connect cluster entrance nodes.",
        "Find the macro-path across clusters, then refine coordinates inside each cluster locally."
      ]
    };
  }
  if (normId.includes('floyd-warshall-city')) {
    return {
      realWorldApp: "Used in global logistics network analysis, airline distance matrices, and traffic density estimation.",
      invariant: "Computes all-pairs shortest paths iteratively by considering all intermediate cities.",
      walkthrough: [
        "Initialize a 2D distance matrix with direct roads lengths.",
        "Loop through each intermediate city K.",
        "Update distance between I and J if traveling via K is shorter."
      ]
    };
  }
  if (normId.includes('geofence-raycast')) {
    return {
      realWorldApp: "Used in delivery zone containment, ride-share location tracking, and mobile push notification geofencing.",
      invariant: "A point is inside a polygon if a horizontal ray cast from it intersects the polygon boundary edges an odd number of times.",
      walkthrough: [
        "Define target coordinate lat/lon and geofence boundary polygon vertices.",
        "Cast a horizontal ray eastward to infinity.",
        "Count intersections with polygon boundary segments; containment is true if count is odd."
      ]
    };
  }
  if (normId.includes('douglas-peucker')) {
    return {
      realWorldApp: "Used in GPS tracking compression, vector map visualization scaling, and geo-data bandwidth reduction.",
      invariant: "Recursive line simplification keeping points that drift from the chord line by more than epsilon threshold.",
      walkthrough: [
        "Draw a line connecting the start and end of the GPS track.",
        "Find the intermediate coordinate point furthest from this line.",
        "If distance is greater than epsilon, keep point and split recursive simplification; else discard it."
      ]
    };
  }
  if (normId.includes('knn-locations')) {
    return {
      realWorldApp: "Used in location-based services (find nearest restaurants, gas stations, charging points).",
      invariant: "Returns the K items with the smallest calculated geographic distances to query location.",
      walkthrough: [
        "Define user location and EV charging candidate coordinates.",
        "Calculate distance from user to all candidates using the Haversine formula.",
        "Sort candidates ascending by distance and return the top K nearest nodes."
      ]
    };
  }
  if (normId.includes('rtree-range')) {
    return {
      realWorldApp: "Used in geospatial query databases (PostGIS, MongoDB 2dsphere indexes) and map searches.",
      invariant: "Hierarchically discards bounding box subtrees that do not overlap with the search radius window.",
      walkthrough: [
        "Define search query coordinate and radius boundary circle.",
        "Check if leaf node bounding box intersects the search circle.",
        "Recursively inspect child points inside overlapping blocks, discarding non-overlapping subtrees."
      ]
    };
  }
  if (normId.includes('quadtree-partition')) {
    return {
      realWorldApp: "Used in pixel rendering zoom layers, collision detection, and spatial coordinates density indexes.",
      invariant: "Subdivides a 2D space node into exactly four child quadrants when node point count exceeds capacity.",
      walkthrough: [
        "Define boundary area and point capacity threshold.",
        "Insert points into boundaries.",
        "Once capacity is exceeded, split region into NW, NE, SW, and SE quadrants, distributing points among them."
      ]
    };
  }
  if (normId.includes('kmeans-clustering')) {
    return {
      realWorldApp: "Used in delivery depot location planning, warehouse positioning, and coordinate customer segmentation.",
      invariant: "Minimizes the sum of squared distances between points and their assigned cluster centroid.",
      walkthrough: [
        "Initialize K starting hub coordinates randomly.",
        "Assign each delivery point to its nearest hub.",
        "Move hub coordinates to the mean coordinates of its assigned cluster, repeating until stable."
      ]
    };
  }
  if (normId.includes('voronoi-territory')) {
    return {
      realWorldApp: "Used in municipal zoning, cellular tower coverage maps, and market area mapping.",
      invariant: "Each hub territory boundary is composed of perpendicular bisectors with its neighboring hubs.",
      walkthrough: [
        "Define locations of multiple central hubs.",
        "Compute perpendicular bisectors between all adjacent hubs.",
        "Intersect bisecting planes to construct closed polygon cell boundaries around each hub."
      ]
    };
  }
  if (normId.includes('delaunay-triangulation')) {
    return {
      realWorldApp: "Used in terrain mesh generation, finite element analysis, and geographic network mapping.",
      invariant: "No point in the coordinate set lies inside the circumcircle of any triangle in the mesh.",
      walkthrough: [
        "Initialize a large super-triangle encompassing all coordinate points.",
        "Insert points one-by-one, removing triangles whose circumcircles are violated.",
        "Re-triangulate the resulting polygonal cavity with the new point."
      ]
    };
  }
  if (normId.includes('convex-envelope')) {
    return {
      realWorldApp: "Used in wildfire boundary mapping, animal migration territory boundaries, and spatial envelopes.",
      invariant: "The smallest convex polygon that contains all coordinate points in the set.",
      walkthrough: [
        "Find the bottom-most, left-most point as origin.",
        "Sort all other coordinate points by polar angle relative to origin.",
        "Scan points counter-clockwise, keeping those that make left turns and discarding right turns."
      ]
    };
  }
  if (normId.includes('haversine-distance')) {
    return {
      realWorldApp: "Used in flight path distance calculations, travel fare estimates, and geographic distance filters.",
      invariant: "Great-circle distance calculations assuming Earth is a perfect sphere of radius R.",
      walkthrough: [
        "Convert latitude and longitude coordinates from degrees to radians.",
        "Apply the Haversine trigonometric formula to calculate angular difference 'a'.",
        "Multiply by Earth's mean radius (6371km) to get the distance."
      ]
    };
  }
  if (normId.includes('vincenty-distance')) {
    return {
      realWorldApp: "Used in high-accuracy GIS surveys, defense mapping agencies, and marine navigation lines.",
      invariant: "Geodesic calculation modeled on an oblate ellipsoid, accurate to within 0.5 millimeters on Earth.",
      walkthrough: [
        "Define ellipsoidal flattening parameters (WGS-84 standard).",
        "Iterate to solve angular difference lambda until convergence difference is negligible.",
        "Calculate final geodesic distance using ellipsoidal parameters."
      ]
    };
  }
  if (normId.includes('hmm-snapping')) {
    return {
      realWorldApp: "Used in GPS track cleaning on road networks, ride-sharing trip routing, and speed camera matching.",
      invariant: "Finds the most likely sequence of road segments by maximizing emissions and transition route probabilities.",
      walkthrough: [
        "Find candidate road segments close to each noisy GPS point.",
        "Compute emission probabilities based on coordinate distances.",
        "Apply Viterbi dynamic programming to select the most probable sequential road path route."
      ]
    };
  }
  if (normId.includes('prim-fiber')) {
    return {
      realWorldApp: "Used in fiber optic line mapping, regional train rail planning, and infrastructure network pipelines.",
      invariant: "Connects all cities using the minimum total road/rail line length without cycles.",
      walkthrough: [
        "Select an initial starting city to join the connected set.",
        "Find the shortest road connecting any city in the set to any city outside the set.",
        "Add this road to the network, add the city to the set, and repeat until all cities are connected."
      ]
    };
  }
  if (normId.includes('tsp-delivery')) {
    return {
      realWorldApp: "Used in mail delivery scheduling, printed circuit board drilling, and school bus routes.",
      invariant: "The shortest possible round-trip path that visits each city node exactly once.",
      walkthrough: [
        "Generate an initial random round-trip route visiting all cities.",
        "Perturb the route by swapping two cities.",
        "Accept the swap if it reduces tour distance, or with a temperature-dependent probability to escape local minima."
      ]
    };
  }
  if (normId.includes('knapsack')) {
    return {
      realWorldApp: "Used in financial resource allocations, cargo loading optimizations, server budget limits, and cryptography knapsack cryptosystems.",
      invariant: "The cell DP[i][w] holds the maximum value possible choosing a subset of items from the first i elements under weight capacity w.",
      walkthrough: [
        "Initialize a 2D dynamic programming grid with 0 values.",
        "Fill the grid cell-by-cell: if the item weight fits, set the cell value to the maximum of selecting the item versus omitting it.",
        "Trace back from the bottom-right cell to identify the items that compose the optimal choice vector."
      ]
    };
  }
  if (normId.includes('fibonacci-dp')) {
    return {
      realWorldApp: "Used in modeling recursive tree structures, mathematical scaling, and resource allocation dependencies.",
      invariant: "F[i] is always the exact sum of the two preceding Fibonacci values: F[i-1] and F[i-2].",
      walkthrough: [
        "Set base cases F[0] = 0 and F[1] = 1.",
        "Iterate from index 2 up to n, summing the previous two cells.",
        "Save the result to the tabulation array for constant-time lookups."
      ]
    };
  }
  if (normId.includes('lcs-dp')) {
    return {
      realWorldApp: "Used in diff tools (like git diff), plagiarism detection, version control history, and DNA alignment.",
      invariant: "DP[i][j] holds the exact length of the longest common subsequence of prefixes X[0...i-1] and Y[0...j-1].",
      walkthrough: [
        "Initialize a 2D table filled with 0s.",
        "If characters at indices match, set cell to diagonal-left cell + 1.",
        "If characters mismatch, set cell to maximum of top cell and left cell."
      ]
    };
  }
  if (normId.includes('lis-dp')) {
    return {
      realWorldApp: "Used in card sorting algorithms, package delivery sequencing, and data packet routing optimizations.",
      invariant: "LIS[i] represents the length of the longest increasing subsequence ending exactly at index i.",
      walkthrough: [
        "Initialize the LIS array with 1 at each index.",
        "Iterate forward and compare current element with all preceding elements.",
        "If current is greater than antecedent, update LIS to match max(LIS[i], LIS[j] + 1)."
      ]
    };
  }
  if (normId.includes('matrix-chain-dp')) {
    return {
      realWorldApp: "Used in database query optimizations, compiler code generators, and parallel graphics rendering pipelines.",
      invariant: "cost[i][j] stores the minimum scalar multiplications needed to compute the matrix product A_i ... A_j.",
      walkthrough: [
        "Initialize diagonal cells with cost 0 (single matrices).",
        "Scan in increasing chain lengths from 2 to n.",
        "For each partition point k, calculate multiplication costs and select the minimal option."
      ]
    };
  }
  if (normId.includes('coin-change-min')) {
    return {
      realWorldApp: "Used in cash registers, vending machines, and financial payment processing systems.",
      invariant: "dp[i] stores the minimum number of coins needed to sum up to exactly value i.",
      walkthrough: [
        "Initialize dp table with infinity, setting base case dp[0] = 0.",
        "Iterate over all values from 1 to target.",
        "For each coin denomination, check if it can minimize the coin count for the current value."
      ]
    };
  }
  if (normId.includes('coin-change-ways')) {
    return {
      realWorldApp: "Used in combinatorics, statistical physics partitions, and currency transaction analysis.",
      invariant: "dp[i] stores the number of unique coin combinations that sum up to exactly value i.",
      walkthrough: [
        "Initialize dp table with 0s, and base case dp[0] = 1.",
        "Loop through each coin denomination.",
        "Add combinations count of remaining sums to current values iteratively."
      ]
    };
  }
  if (normId.includes('edit-distance-dp')) {
    return {
      realWorldApp: "Powers autocorrect recommendations, speech recognition systems, and search engine query spelling corrections.",
      invariant: "dp[i][j] stores the Levenshtein distance between prefix Word1[0...i-1] and Word2[0...j-1].",
      walkthrough: [
        "Initialize base borders with index increments representing deletions/insertions.",
        "Iterate through cells. If characters match, copy the diagonal cell cost.",
        "If characters mismatch, add 1 to the minimum of insertion, deletion, and substitution cells."
      ]
    };
  }
  if (normId.includes('floyd-warshall-dp')) {
    return {
      realWorldApp: "Powers network router routing protocols, flight connection cost lookups, and pathfinders in maps.",
      invariant: "D[i][j] stores the shortest path weight between vertex i and vertex j using a subset of intermediate nodes {0...k}.",
      walkthrough: [
        "Initialize distance matrix with direct edge weights and 0 on diagonals.",
        "Loop through intermediate vertices k from 0 to V-1.",
        "Relax paths between all pairs (i, j) by checking if routing through k is cheaper."
      ]
    };
  }
  if (normId.includes('subset-sum-dp')) {
    return {
      realWorldApp: "Used in cryptography (subset sum cryptosystems), knapsack variations, and load balancing decisions.",
      invariant: "dp[i][j] is true if a subset of the first i elements can sum up to exactly value j.",
      walkthrough: [
        "Initialize sum column 0 as true, all other cells as false.",
        "Iterate over all elements and target sums.",
        "Set cell to true if sum is achievable with or without including the current element."
      ]
    };
  }
  if (normId.includes('rod-cutting-dp')) {
    return {
      realWorldApp: "Used in manufacturing cutting plans (steel, wood), inventory cutting optimization, and waste minimization.",
      invariant: "dp[i] represents the maximum revenue obtainable for a rod of length i.",
      walkthrough: [
        "Initialize dp array of size n+1 with 0.",
        "Iterate rod lengths from 1 to n.",
        "Evaluate all possible piece cuts, selecting the split that yields maximum price revenue."
      ]
    };
  }
  if (normId.includes('wildcard-matching-dp')) {
    return {
      realWorldApp: "Used in shell globbing commands, database pattern searches, and text parsing compilers.",
      invariant: "dp[i][j] is true if text prefix [0...i-1] matches pattern prefix [0...j-1].",
      walkthrough: [
        "Set base case dp[0][0] as true.",
        "Initialize star patterns in the first row.",
        "Iterate cells: propagate matching conditions for characters, wildcards '?', and '*' symbols."
      ]
    };
  }
  if (normId.includes('optimal-bst-dp')) {
    return {
      realWorldApp: "Used in text searching optimizations, localized index files, and high-frequency key retrievals.",
      invariant: "cost[i][j] holds the minimum expected search cost for keys K_i through K_j.",
      walkthrough: [
        "Initialize single keys with search frequency base values.",
        "Iterate through key sequence spans.",
        "Evaluate search costs placing each key as root, keeping the minimum configuration."
      ]
    };
  }
  if (normId.includes('fractional-knapsack-greedy')) {
    return {
      realWorldApp: "Used in resource allocation, fractional asset trading, and materials mixing optimizations.",
      invariant: "Items are selected in strictly decreasing order of value-to-weight ratio.",
      walkthrough: [
        "Sort items descending by value-to-weight ratio.",
        "Take whole items as long as capacity permits.",
        "Fill remaining space by taking a fraction of the next densest item."
      ]
    };
  }
  if (normId.includes('activity-selection-greedy')) {
    return {
      realWorldApp: "Used in CPU task scheduling, meeting room booking software, and resource allocation schedulers.",
      invariant: "Activities are selected in increasing order of their finish times.",
      walkthrough: [
        "Sort all activities by finish times.",
        "Select the first activity that finishes earliest.",
        "For remaining activities, select the next task whose start time is greater than the last finish time."
      ]
    };
  }
  if (normId.includes('job-sequencing-greedy')) {
    return {
      realWorldApp: "Used in manufacturing assembly line scheduling, contract task execution, and high-priority packet transmissions.",
      invariant: "Jobs are processed in decreasing order of profit, filling the latest possible free deadline slot.",
      walkthrough: [
        "Sort all jobs descending by profit margin.",
        "Find the latest free schedule slot before the job's deadline.",
        "If a slot is free, schedule the job and add its profit to the total."
      ]
    };
  }
  if (normId.includes('kruskal-greedy')) {
    return {
      realWorldApp: "Powers electrical cable layouts, computer networking topology designs, and pipeline routes.",
      invariant: "The MST contains no cycles, and edges are evaluated in strictly non-decreasing order of weight.",
      walkthrough: [
        "Sort all graph edges by weight ascending.",
        "Iterate edges and check if endpoints belong to different disjoint sets.",
        "Union sets and add the edge to the MST if no cycle is formed."
      ]
    };
  }
  if (normId.includes('prim-greedy')) {
    return {
      realWorldApp: "Used in fiber-optic routing layouts, road map connecting hubs, and clustering algorithms.",
      invariant: "The growing tree connects a subset of vertices using the cheapest possible edge connecting to the remaining frontier.",
      walkthrough: [
        "Select an arbitrary starting node to begin the tree.",
        "Examine all frontier edges connecting the tree to unvisited vertices.",
        "Select the edge with minimum weight, add it to the tree, and mark its destination as visited."
      ]
    };
  }
  if (normId.includes('huffman-greedy')) {
    return {
      realWorldApp: "Used in file compression (ZIP, GZIP), image storage formats (JPEG), and network packet encodings.",
      invariant: "The tree is built bottom-up by repeatedly merging the two lowest-frequency nodes in the active set.",
      walkthrough: [
        "Create leaf nodes for each character and insert them into a priority queue.",
        "Extract the two nodes with the lowest frequencies.",
        "Merge them into a new parent node with combined frequency, and push it back to the queue."
      ]
    };
  }
  if (normId.includes('dijkstra-greedy')) {
    return {
      realWorldApp: "Powers Google Maps navigation routing, network packet routing protocols (OSPF), and robot pathfinders.",
      invariant: "The distance to a visited node is the shortest possible path distance from the source.",
      walkthrough: [
        "Set all node distances to infinity, and source node to 0.",
        "Extract the unvisited node with minimum distance from the frontier queue.",
        "For all its unvisited neighbors, recalculate distance and update if a shorter path is found."
      ]
    };
  }
  if (normId.includes('convex-hull')) {
    return {
      realWorldApp: "Used in computational geometry, pattern recognition, collision detection, geographic information systems, and cluster boundary approximations.",
      invariant: "The stack contains vertices of the convex hull of points scanned so far, ordered counterclockwise along the boundary.",
      walkthrough: [
        "Identify the bottom-most point as the starting pivot.",
        "Sort all other points by their polar angle relative to the pivot.",
        "Traverse points sequentially, popping internal nodes from the stack if they form a right turn."
      ]
    };
  }
  if (normId.includes('newton-raphson')) {
    return {
      realWorldApp: "Used in numeric solvers, optimization routines, physical physics simulations, and engine calibration solvers.",
      invariant: "Each iteration x_{n+1} is the exact X-intercept of the tangent line drawn to the function curve at x_n.",
      walkthrough: [
        "Select an initial guess x0 close to the expected root.",
        "Calculate the function value f(x) and derivative slope f'(x).",
        "Follow the tangent slope line down to intersect the X-axis for the next estimate."
      ]
    };
  }
  if (normId.includes('riemann-sum')) {
    return {
      realWorldApp: "Used in structural engineering volume estimates, signal processing integrations, and numerical calculus tools.",
      invariant: "The total area sum approaches the exact definite integral value as the number of rectangular slices n increases towards infinity.",
      walkthrough: [
        "Partition the interval [a, b] into n sub-intervals of width dx.",
        "For each slice, calculate the function height at the left endpoint.",
        "Multiply height by width to find slice area, and accumulate to the running sum."
      ]
    };
  }
  if (normId.includes('gradient-descent')) {
    return {
      realWorldApp: "Powers neural network model trainings, machine learning optimization algorithms, and logistic regressions.",
      invariant: "Each step slides downward along the function curve in the direction that decreases the coordinate value steepest.",
      walkthrough: [
        "Initialize the starting coordinate x.",
        "Calculate the gradient (derivative) of the function at the active point.",
        "Step in the opposite direction of the gradient scaled by the learning rate parameter."
      ]
    };
  }
  if (normId.includes('bezier-curve')) {
    return {
      realWorldApp: "Used in vector graphics tools (like Adobe Illustrator), computer font designs (TrueType), and animation paths.",
      invariant: "The generated curve is contained within the convex hull of its control points (convex hull property).",
      walkthrough: [
        "Set the start point, end point, and intermediate control points.",
        "Increment parameter t from 0 to 1 along the curve resolution.",
        "Compute Bernstein polynomial weights at step t to find the curve coordinates."
      ]
    };
  }
  if (normId.includes('fft-divide-conquer')) {
    return {
      realWorldApp: "Powers audio compression formats (MP3), image filtering (JPEG), wireless communication systems (OFDM), and radar signal processing.",
      invariant: "Decomposes a DFT of size n recursively into two DFTs of size n/2, dividing calculations by half.",
      walkthrough: [
        "Check base case: if length is 1, return the signal.",
        "Split signal elements into even-indexed and odd-indexed sub-channels.",
        "Solve recursively, then combine outputs using butterfly addition/subtraction passes."
      ]
    };
  }
  if (normId.includes('collatz-sequence')) {
    return {
      realWorldApp: "Used in number theory studies, pseudo-random number generator tests, and computing orbits.",
      invariant: "Every tested positive integer orbit eventually drops into the repeating 4-2-1 cycle (unproven conjecture).",
      walkthrough: [
        "Start with an integer n.",
        "If n is even, divide by 2; if n is odd, multiply by 3 and add 1.",
        "Store the updated values in the orbit array and repeat until n reaches 1."
      ]
    };
  }
  if (normId.includes('euclidean-gcd')) {
    return {
      realWorldApp: "Used in public-key cryptography (RSA key generations), rational number simplifications, and cyclic scheduling.",
      invariant: "The GCD of two numbers also divides their remainder: GCD(a, b) = GCD(b, a % b).",
      walkthrough: [
        "Check if the divisor b is 0. If yes, return a as the GCD.",
        "Divide a by b to find the remainder.",
        "Replace a with b, and b with the remainder, repeating until b is 0."
      ]
    };
  }
  if (normId.includes('sieve-eratosthenes')) {
    return {
      realWorldApp: "Used in primality test benchmarks, cryptography algorithms, and number theory checks.",
      invariant: "A number remains marked as prime if and only if it has no prime factors smaller than or equal to its square root.",
      walkthrough: [
        "Create an array filled with true values representing prime flags.",
        "Iterate from 2 up to the square root of n.",
        "For each prime found, mark all of its multiples as composite (false)."
      ]
    };
  }
  if (normId.includes('matrix-determinant')) {
    return {
      realWorldApp: "Used in coordinate space scaling calculations, systems of linear equations (Cramer's rule), and 3D projection rendering.",
      invariant: "The determinant measures the scaling factor of the linear transformation mapped by the matrix.",
      walkthrough: [
        "Examine the first row elements of the 3x3 matrix.",
        "For each element, define its sub-matrix by removing its row and column.",
        "Calculate 2x2 determinants, scale by row values, and combine using alternating signs (+, -, +)."
      ]
    };
  }
  if (normId.includes('vector-cross-product')) {
    return {
      realWorldApp: "Used in 3D physics collision physics, computer graphics lighting shaders (normal vectors), and torque dynamics.",
      invariant: "The resulting vector is strictly perpendicular to both input vectors, with magnitude matching their parallelogram area.",
      walkthrough: [
        "Set input vector coordinates A and B.",
        "Multiply corresponding Y and Z coordinates to find the X cross component.",
        "Perform cross-multiplications for Y and Z components, storing the result vector."
      ]
    };
  }
  if (normId.includes('jarvis-march')) {
    return {
      realWorldApp: "Used in layout boundary mappings, pattern recognition, and minimum area enclosing box models.",
      invariant: "The active vertex is chosen by finding the point that maximizes the counter-clockwise wrap angle from the previous hull edge.",
      walkthrough: [
        "Find the leftmost point in the set as the starting vertex.",
        "Scan all other points to find the vertex with the most counter-clockwise orientation.",
        "Set the found vertex as the next hull point and repeat until returning to the start."
      ]
    };
  }
  if (normId.includes('segment-intersection')) {
    return {
      realWorldApp: "Used in geographic information systems (GIS), map overlays, collision detection in games, and CAD tools.",
      invariant: "Only adjacent segments along the vertical sweep line can intersect, reducing checking pairs significantly.",
      walkthrough: [
        "Sort all segment endpoints from left to right to build event lists.",
        "Move a sweep line across the plane.",
        "Insert segments to the active tree list when left endpoint is hit, and check intersections."
      ]
    };
  }
  if (normId.includes('point-in-polygon')) {
    return {
      realWorldApp: "Powers geofencing alerts, interactive maps, graphic design vector selections, and hit detection in video games.",
      invariant: "A point is inside a polygon if and only if any ray cast from it intersects the polygon boundary an odd number of times.",
      walkthrough: [
        "Define the test point and polygon vertices.",
        "Cast a horizontal ray from the test point extending to infinity.",
        "Count how many times the ray crosses the polygon edges to determine containment."
      ]
    };
  }
  if (normId.includes('monte-carlo-pi')) {
    return {
      realWorldApp: "Used in financial derivatives pricing, integration of complex shapes, and statistical physics simulations.",
      invariant: "The ratio of points falling inside the unit quadrant circle to total scattered points approaches Pi/4.",
      walkthrough: [
        "Scatter random coordinate points inside a unit square boundaries.",
        "Check if each point falls within the unit circle radius ($x^2 + y^2 \\le 1$).",
        "Calculate the ratio of points inside to total points, and scale by 4 to estimate Pi."
      ]
    };
  }
  if (normId.includes('bresenham-line')) {
    return {
      realWorldApp: "Used in pixel screen controllers, vector drawing libraries, and laser printer rasterization pathfinders.",
      invariant: "Uses only fast integer addition, subtraction, and bit shifting to select optimal grid cells without division.",
      walkthrough: [
        "Compute horizontal delta dx and vertical delta dy.",
        "Initialize decision parameter D = 2*dy - dx.",
        "Step along X coordinates: plot the pixel and update D, stepping Y whenever D is positive."
      ]
    };
  }
  if (normId.includes('bezier-spline-interpolation')) {
    return {
      realWorldApp: "Used in camera path animations, smooth vector curves, and numeric modeling interpolators.",
      invariant: "The spline curve is twice-differentiable ($C^2$ continuity) at joint junctions, preventing sharp corners.",
      walkthrough: [
        "Place coordinate joints that need smooth connections.",
        "Compute optimal intermediate control points for each segment to match tangent slopes.",
        "Generate cubic Bezier curves for each segment interval sequentially."
      ]
    };
  }
  if (normId.includes('voronoi-heuristic')) {
    return {
      realWorldApp: "Used in cell tower coverage models, logistics warehouse placements, and neighborhood boundary zoning.",
      invariant: "Every coordinate cell in a site's Voronoi region is closer to that site than to any other site.",
      walkthrough: [
        "Place seed sites on the coordinate grid plane.",
        "For each cell pixel, calculate distance to all seed sites.",
        "Assign the cell to the region of its nearest site to partition the grid."
      ]
    };
  }
  if (normId.includes('jarvis-march-3d')) {
    return {
      realWorldApp: "Used in 3D scanning envelope reconstructions, CAD structural shells, and spatial bounding boxes.",
      invariant: "Maintains a frontier of active edges, wrapping new faces around edges using maximum dihedral angles.",
      walkthrough: [
        "Find an initial extreme point and construct the first triangular face.",
        "Identify active frontier boundary edges of the hull.",
        "Wrap face triangles around edges by finding points maximizing dihedral angles."
      ]
    };
  }
  if (normId.includes('fibonacci-spiral')) {
    return {
      realWorldApp: "Used in modeling natural patterns (sunflowers, shells), golden ratio designs, and aesthetic layouts.",
      invariant: "The radius of each successive 90-degree arc matches the corresponding value in the Fibonacci sequence.",
      walkthrough: [
        "Set the initial coordinate spiral origin center.",
        "Loop through Fibonacci sequence values to define arc radii.",
        "Plot circular arc curves quadrant-by-quadrant sequentially."
      ]
    };
  }
  if (normId.includes('needleman-wunsch')) {
    return {
      realWorldApp: "Used in bioinformatics global DNA/RNA sequence alignments, spelling checks, diff comparisons, and molecular structure alignments.",
      invariant: "The cell DP[i][j] stores the optimal global alignment score between prefix Seq1[0...i-1] and Seq2[0...j-1].",
      walkthrough: [
        "Initialize the scoring grid with cumulative gap penalties.",
        "Populate cell values by selecting the maximum score among matching, deletion, and insertion choices.",
        "Backtrack from the bottom-right cell to construct the aligned nucleotide strings."
      ]
    };
  }

  // Fallback Sorting template
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

  // Fallback Searching & Strings
  if (normId.includes('search') || normId.includes('kmp') || normId.includes('rabin') || normId.includes('boyer') || normId.includes('levenshtein') || normId.includes('match') || normId.includes('check') || normId.includes('prefix') || normId.includes('palindrome') || normId.includes('lcs')) {
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

  // Fallback Graphs
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

  // Fallback Linear Data Structures
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
