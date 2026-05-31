// src/core/types.ts

// =========================================
// 1. DATA STRUCTURES (The Memory)
// =========================================

export interface GraphNode {
    id: string;
    val: number; // <--- This was missing!
    label?: string;
    x?: number;
    y?: number;
}

export interface GraphEdge {
    source: string;
    target: string;
    weight?: number;
}

export type DataStructure = 
    | { 
        type: 'array'; 
        id: string; 
        data: (number | string)[]; 
        orientation?: 'horizontal' | 'vertical';
        visualMode?: 'bar' | 'box';
        baseColor?: string;
      }
    | { type: 'matrix'; id: string; data: (number | string)[][]; baseColor?: string }
    | { 
        type: 'graph'; 
        id: string; 
        nodes: GraphNode[]; 
        edges: GraphEdge[]; 
        isDirected: boolean 
      }
    | { type: 'stack'; id: string; data: any[]; baseColor?: string }
    | { type: 'queue'; id: string; data: any[]; baseColor?: string };

// =========================================
// 2. STATE & EVENTS (The Timeline)
// =========================================

export interface AlgoState {
    structures: Record<string, DataStructure>;
    context: {
        variables: Record<string, string | number | boolean>;
        pseudocodeLine?: number;
        message: string;
    };
}

export interface AlgoEvent {
    type: 'compare' | 'swap' | 'write' | 'visit' | 'lock';
    targetIds: string[];
    indices?: number[];
    metadata?: { color?: string };
}

export interface AlgoStep {
    snapshot: AlgoState;
    events: AlgoEvent[];
    metrics: {
        comparisons: number;
        swaps: number;
        writes: number;
    };
}

// =========================================
// 3. REGISTRY INTERFACES (The Content)
// =========================================

export interface InputDefinition {
    id: string;
    label: string;
    type: 'array' | 'integer' | 'string' | 'graph_adj_matrix'; 
    constraints?: {
        min?: number;
        max?: number;
        maxLength?: number;
    };
    defaultValue: any;
}

export interface AlgorithmManifest {
    id: string;
    name: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced';
    description: string;
    pseudocode: string[];
    inputs: InputDefinition[];
    timeComplexity?: {
        best: string;
        average: string;
        worst: string;
    };
    spaceComplexity?: string;
}

export interface AlgorithmBundle {
    manifest: AlgorithmManifest;
    run: (inputs: Record<string, any>) => Generator<AlgoStep>;
}