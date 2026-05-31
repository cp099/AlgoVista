import { AlgorithmBundle } from '@core/types';
import { getComplexityData } from '@utils/complexities';

// 1. AUTO-DISCOVERY MAGIC (UPDATED)
// Now we look for any .ts file inside a category folder.
// We exclude 'index.ts' (this file) so it doesn't load itself.
const modules = import.meta.glob<any>('./*/*.ts', { eager: true });

export const registry: Record<string, AlgorithmBundle> = {};

// 2. BUILD THE REGISTRY
for (const path in modules) {
    const module = modules[path];
    
    // Check if it exports a valid bundle (default export)
    if (module.default && module.default.manifest && module.default.run) {
        // Clone the bundle to avoid mutating module cache directly
        const bundle = { ...module.default } as AlgorithmBundle;
        const complexity = getComplexityData(bundle.manifest.id);
        
        // Dynamically inject complexities
        bundle.manifest = {
            ...bundle.manifest,
            timeComplexity: bundle.manifest.timeComplexity || {
                best: complexity.time.best,
                average: complexity.time.average,
                worst: complexity.time.worst
            },
            spaceComplexity: bundle.manifest.spaceComplexity || complexity.space
        };

        registry[bundle.manifest.id] = bundle;
    } 
}

export const getAlgorithm = (id: string) => registry[id];
export const getAllAlgorithms = () => Object.values(registry).map(b => b.manifest);

export const getCategories = () => {
    const algos = getAllAlgorithms();
    const categories = new Set(algos.map(a => a.category));
    return Array.from(categories);
};

export const getAlgorithmsByCategory = (category: string) => {
    return getAllAlgorithms().filter(a => a.category.toLowerCase() === category.toLowerCase());
};