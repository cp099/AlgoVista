// src/core/engine/AlgorithmEngine.ts

import type { AlgorithmBundle, AlgoStep } from '../types';

export type EngineStatus = 'IDLE' | 'COMPUTING' | 'READY' | 'RUNNING' | 'PAUSED' | 'FINISHED';

export class AlgorithmEngine {
    // Observable State
    public status: EngineStatus = 'IDLE';
    public currentStepIndex: number = 0;
    public totalSteps: number = 0;

    private history: AlgoStep[] = [];
    private playbackTimer: number | null = null;
    
    // Configuration
    private onStateChange: () => void; // Callback to notify UI to re-render

    constructor(onStateChange: () => void) {
        this.onStateChange = onStateChange;
    }

    // =========================================
    // 1. CORE LOGIC (Load & Compute)
    // =========================================

    public load(bundle: AlgorithmBundle, inputs: Record<string, any>) {
        this.stopPlayback();
        this.status = 'COMPUTING';
        this.history = [];
        this.notify();

        try {
            const generator = bundle.run(inputs);

            // Step 0: Validation
            const firstYield = generator.next();
            if (firstYield.done) {
                throw new Error("Algorithm generator finished without yielding Initial State.");
            }
            
            // Push Step 0 (Initial State)
            this.history.push(this.clone(firstYield.value));

            // Eager Execution: Run to completion (Limit 2000 steps for safety)
            let safetyCounter = 0;
            while (true) {
                const res = generator.next();
                if (res.done) break;
                
                this.history.push(this.clone(res.value));
                
                safetyCounter++;
                if (safetyCounter > 2000) {
                    console.warn("Algorithm exceeded 2000 steps. Truncating.");
                    break;
                }
            }

            this.totalSteps = this.history.length;
            this.currentStepIndex = 0;
            this.status = 'READY';
        } catch (error) {
            console.error("Engine Computation Error:", error);
            this.status = 'IDLE';
        }

        this.notify();
    }

    // =========================================
    // 2. TIME TRAVEL CONTROLS
    // =========================================

    public stepForward(): boolean {
        if (this.currentStepIndex >= this.totalSteps - 1) {
            this.status = 'FINISHED';
            this.notify();
            return false;
        }

        this.currentStepIndex++;
        
        if (this.currentStepIndex === this.totalSteps - 1) {
            this.status = 'FINISHED';
        }
        
        this.notify();
        return true;
    }

    public stepBackward(): boolean {
        if (this.currentStepIndex <= 0) {
            this.currentStepIndex = 0;
            this.status = 'READY';
            this.notify();
            return false;
        }

        this.currentStepIndex--;
        if (this.status === 'FINISHED') this.status = 'PAUSED';
        
        this.notify();
        return true;
    }

    public seek(index: number) {
        let target = Math.max(0, Math.min(index, this.totalSteps - 1));
        this.currentStepIndex = target;

        if (target === 0) this.status = 'READY';
        else if (target === this.totalSteps - 1) this.status = 'FINISHED';
        else this.status = 'PAUSED';

        this.notify();
    }

    public reset() {
        this.seek(0);
        this.status = 'READY';
        this.notify();
    }

    // =========================================
    // 3. PLAYBACK CONTROLS
    // =========================================

    public play(speedMs: number) {
        if (this.status === 'FINISHED') return;
        if (this.status === 'RUNNING') this.stopPlayback();

        this.status = 'RUNNING';
        this.notify();

        this.playbackTimer = window.setInterval(() => {
            const success = this.stepForward();
            if (!success) {
                this.stopPlayback();
            }
        }, speedMs);
    }

    public pause() {
        this.stopPlayback();
        if (this.status === 'RUNNING') {
            this.status = 'PAUSED';
        }
        this.notify();
    }

    private stopPlayback() {
        if (this.playbackTimer) {
            clearInterval(this.playbackTimer);
            this.playbackTimer = null;
        }
    }

    // =========================================
    // 4. DATA ACCESSORS
    // =========================================

    public getCurrentStep(): AlgoStep | null {
        if (this.history.length === 0) return null;
        return this.history[this.currentStepIndex];
    }

    public getProgress(): number {
        if (this.totalSteps <= 1) return 0;
        return this.currentStepIndex / (this.totalSteps - 1);
    }

    // =========================================
    // 5. UTILITIES
    // =========================================

    private notify() {
        this.onStateChange();
    }

    private clone<T>(obj: T): T {
        if (typeof structuredClone === 'function') {
            return structuredClone(obj);
        }
        return JSON.parse(JSON.stringify(obj));
    }
}