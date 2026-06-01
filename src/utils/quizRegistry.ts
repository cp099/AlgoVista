export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  triggerStepIndex: number; // The step index in playback that triggers the quiz
}

export const quizRegistry: Record<string, QuizQuestion[]> = {
  'binary-search': [
    {
      id: 'bs_mid_calc',
      question: 'How is the middle index "mid" calculated in binary search to avoid integer overflow in languages like Java/C++?',
      options: [
        'mid = (low + high) / 2',
        'mid = low + (high - low) / 2',
        'mid = high - (high + low) / 2',
        'mid = (low * high) / 2'
      ],
      correctIndex: 1,
      explanation: 'Using low + (high - low) / 2 avoids overflow because it prevents adding two large integers directly.',
      triggerStepIndex: 3
    }
  ],
  'bubble-sort': [
    {
      id: 'bubble_worst_complexity',
      question: 'What is the worst-case time complexity of Bubble Sort?',
      options: [
        'O(N log N)',
        'O(N)',
        'O(N^2)',
        'O(1)'
      ],
      correctIndex: 2,
      explanation: 'In the worst case (reverse sorted array), Bubble Sort makes N passes comparing and swapping adjacent elements, leading to O(N^2) complexity.',
      triggerStepIndex: 4
    }
  ],
  'quick-sort-lomuto': [
    {
      id: 'quick_lomuto_pivot',
      question: 'Where does the Lomuto partition scheme typically choose the pivot element?',
      options: [
        'Always the first element',
        'Always the middle element',
        'Always the last element',
        'A random element'
      ],
      correctIndex: 2,
      explanation: 'The Lomuto partition scheme traditionally selects the last element of the array as the pivot.',
      triggerStepIndex: 5
    }
  ],
  'merge-sort': [
    {
      id: 'merge_sort_space',
      question: 'What is the auxiliary space complexity of standard Merge Sort on an array?',
      options: [
        'O(1)',
        'O(log N)',
        'O(N)',
        'O(N log N)'
      ],
      correctIndex: 2,
      explanation: 'Standard Merge Sort requires O(N) auxiliary space to merge the sub-arrays back together.',
      triggerStepIndex: 6
    }
  ],
  'dijkstra-shortest-path': [
    {
      id: 'dijkstra_negative_weights',
      question: 'Does Dijkstra\'s algorithm work correctly with negative edge weights?',
      options: [
        'Yes, always',
        'No, it can get stuck in infinite loops or yield incorrect paths',
        'Yes, but only if there are no directed edges',
        'Only if the graph is a tree'
      ],
      correctIndex: 1,
      explanation: 'Dijkstra\'s algorithm assumes edge weights are non-negative. Negative weights can violate the greedy choice assumption and yield incorrect shortest paths.',
      triggerStepIndex: 5
    }
  ],
  'floyd-warshall-all-pairs-shortest-path': [
    {
      id: 'floyd_warshall_dp',
      question: 'What type of algorithmic design paradigm does the Floyd-Warshall algorithm use?',
      options: [
        'Greedy Algorithm',
        'Divide and Conquer',
        'Dynamic Programming',
        'Backtracking'
      ],
      correctIndex: 2,
      explanation: 'Floyd-Warshall is a dynamic programming algorithm that builds solutions for shortest paths by considering intermediate vertices one by one.',
      triggerStepIndex: 6
    }
  ]
};

// Fallback generator for algorithms that do not have a hand-crafted quiz
export const getQuizForAlgorithm = (algoId: string): QuizQuestion[] => {
  const registered = quizRegistry[algoId];
  if (registered) return registered;

  // Generate generic algorithmic check questions for fallback
  return [
    {
      id: `${algoId}_generic_complexity`,
      question: `What is the primary educational goal when analyzing the "${algoId.replace(/-/g, ' ')}" algorithm?`,
      options: [
        'To optimize its execution time complexity and reduce memory utilization',
        'To understand its step-by-step structural transformations visually',
        'To verify correctness on extreme datasets and edge cases',
        'All of the above'
      ],
      correctIndex: 3,
      explanation: 'Learning an algorithm requires visual tracing, space/time optimization, and robustness verification.',
      triggerStepIndex: 5
    }
  ];
};
