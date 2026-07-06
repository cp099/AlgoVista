/* eslint-disable @typescript-eslint/no-explicit-any */
// src/core/types.ts

// =========================================
// 1. DATA STRUCTURES (The Memory)
// =========================================

export interface GraphNode {
    id: string;
    val: number;
    label?: string;
    x?: number;
    y?: number;
    state?: 'default' | 'active' | 'visited' | 'lock';
}

export interface GraphEdge {
    source: string;
    target: string;
    weight?: number;
    isMST?: boolean;
    label?: string;
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
    | { 
        type: 'matrix'; 
        id: string; 
        data: (number | string)[][]; 
        baseColor?: string;
        rowHeaders?: string[];
        colHeaders?: string[];
        tracebackPaths?: { r: number; c: number }[];
      }
    | { 
        type: 'graph'; 
        id: string; 
        nodes: GraphNode[]; 
        edges: GraphEdge[]; 
        isDirected: boolean;
        layout?: 'tree' | 'graph';
      }
    | { type: 'stack'; id: string; data: any[]; baseColor?: string }
    | { type: 'queue'; id: string; data: any[]; baseColor?: string }
    | {
        type: 'plot';
        id: string;
        points: { x: number; y: number; label?: string; id?: string; state?: 'default' | 'active' | 'hull' | 'visited' }[];
        lines?: { p1: { x: number; y: number }; p2: { x: number; y: number }; color?: string; dashed?: boolean }[];
        hullPath?: { x: number; y: number }[];
        curves?: { x: number; y: number }[][];
        shadedAreas?: { x: number; y: number }[][];
      }
    | {
        type: 'geomap';
        id: string;
        cities: { id: string; name: string; lat: number; lon: number; state?: 'default' | 'active' | 'visited' | 'lock' }[];
        routes?: { source: string; target: string; color?: string; dashed?: boolean }[];
        polygonBoundaries?: { lat: number; lon: number }[][];
        circles?: { lat: number; lon: number; radiusKm: number; color?: string }[];
      };

// =========================================
// 2. STATE & EVENTS (The Timeline)
// =========================================

export interface AlgoState {
    structures: Record<string, DataStructure>;
    context: {
        variables: Record<string, any>;
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
    type: 'array' | 'integer' | 'string' | 'graph_adj_matrix' | 'float'; 
    constraints?: {
        min?: number;
        max?: number;
        maxLength?: number;
        minLength?: number;
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