import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Plus, Trash2, Clock, Zap } from 'lucide-react';
import { getAllAlgorithms, getAlgorithm } from '@registry/index';
import { Stage } from '@renderer/Stage';
import { cn } from '@utils/cn';
import { AlgoState, AlgoEvent, AlgoStep } from '@core/types';

interface RunnerState {
  algoId: string;
  name: string;
  generator: Generator<AlgoStep> | null;
  state: AlgoState | null;
  events: AlgoEvent[];
  comparisons: number;
  swaps: number;
  writes: number;
  finished: boolean;
  totalSteps: number;
  currentStep: number;
}

type DistributionType = 'random' | 'reversed' | 'sorted' | 'unique';

export const ComparisonRace: React.FC = () => {
  // Get all sorting algorithm manifests
  const sortingManifests = getAllAlgorithms().filter(
    a => a.category.toLowerCase() === 'sorting'
  );

  // States
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'bubble-sort',
    'selection-sort',
    'merge-sort'
  ]);
  const [arraySize, setArraySize] = useState<number>(15);
  const [presetType, setPresetType] = useState<DistributionType>('random');
  const [sharedArray, setSharedArray] = useState<number[]>([]);
  const [runners, setRunners] = useState<RunnerState[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(300); // delay in ms
  const [finishOrder, setFinishOrder] = useState<string[]>([]); // Track finish sequence (podium)

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Generate new array based on distribution type
  const generateNewArray = () => {
    let arr: number[] = [];
    if (presetType === 'random') {
      arr = Array.from({ length: arraySize }, () =>
        Math.floor(Math.random() * 85) + 10
      );
    } else if (presetType === 'reversed') {
      arr = Array.from({ length: arraySize }, (_, i) =>
        Math.floor(10 + ((arraySize - 1 - i) / arraySize) * 85)
      );
    } else if (presetType === 'sorted') {
      // 90% sorted, with a few swapped elements
      arr = Array.from({ length: arraySize }, (_, i) =>
        Math.floor(10 + (i / arraySize) * 85)
      );
      if (arr.length > 4) {
        // Swap elements near the start and end to create local disorder
        const temp1 = arr[1]; arr[1] = arr[2]; arr[2] = temp1;
        const lastIdx = arr.length - 1;
        const temp2 = arr[lastIdx]; arr[lastIdx] = arr[lastIdx - 1]; arr[lastIdx - 1] = temp2;
      }
    } else if (presetType === 'unique') {
      const pool = [20, 48, 75];
      arr = Array.from({ length: arraySize }, () =>
        pool[Math.floor(Math.random() * pool.length)]
      );
    }

    setSharedArray(arr);
    setIsPlaying(false);
    setFinishOrder([]); // reset podium
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Generate array on mount or size/preset change
  useEffect(() => {
    generateNewArray();
  }, [arraySize, presetType]);

  // 2. Initialize runners
  const initRunners = () => {
    if (sharedArray.length === 0) return;

    setFinishOrder([]); // Clear podium rankings

    const newRunners: RunnerState[] = selectedAlgos.map(id => {
      const bundle = getAlgorithm(id);
      if (!bundle) {
        return {
          algoId: id,
          name: id,
          generator: null,
          state: null,
          events: [],
          comparisons: 0,
          swaps: 0,
          writes: 0,
          finished: true,
          totalSteps: 1,
          currentStep: 0
        };
      }

      const generator = bundle.run({ arr: [...sharedArray] });
      const first = generator.next();
      let initialState: AlgoState | null = null;
      let initialEvents: AlgoEvent[] = [];

      if (!first.done && first.value) {
        initialState = first.value.snapshot;
        initialEvents = first.value.events;
      }

      return {
        algoId: id,
        name: bundle.manifest.name,
        generator,
        state: initialState,
        events: initialEvents,
        comparisons: 0,
        swaps: 0,
        writes: 0,
        finished: false,
        totalSteps: 1,
        currentStep: 1
      };
    });

    setRunners(newRunners);
    setIsPlaying(false);
  };

  // Initialize whenever shared array or selected algorithms change
  useEffect(() => {
    initRunners();
  }, [sharedArray, selectedAlgos]);

  // 3. Step forward all runners by one step
  const stepAll = () => {
    setRunners(prevRunners => {
      let anyActive = false;
      const justFinished: string[] = [];

      const updated = prevRunners.map(runner => {
        if (runner.finished || !runner.generator) return runner;

        const res = runner.generator.next();
        if (res.done) {
          justFinished.push(runner.algoId);
          return { ...runner, finished: true };
        } else {
          anyActive = true;
          const step = res.value;
          return {
            ...runner,
            state: step.snapshot,
            events: step.events,
            comparisons: step.metrics.comparisons,
            swaps: step.metrics.swaps,
            writes: step.metrics.writes,
            currentStep: runner.currentStep + 1
          };
        }
      });

      // Append newly finished runner IDs to podium list in order of finish
      if (justFinished.length > 0) {
        setFinishOrder(prev => {
          const next = [...prev];
          justFinished.forEach(id => {
            if (!next.includes(id)) next.push(id);
          });
          return next;
        });
      }

      if (!anyActive) {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      return updated;
    });
  };

  // Play / Pause timer effect
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(stepAll, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  const handlePlayToggle = () => {
    if (runners.every(r => r.finished)) {
      initRunners();
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    initRunners();
  };

  const handleAlgoSelect = (index: number, newId: string) => {
    setSelectedAlgos(prev => {
      const copy = [...prev];
      copy[index] = newId;
      return copy;
    });
  };

  const addAlgoTrack = () => {
    if (selectedAlgos.length >= 3) return; // Cap at 3 for visual spacing
    const remaining = sortingManifests.find(m => !selectedAlgos.includes(m.id));
    if (remaining) {
      setSelectedAlgos(prev => [...prev, remaining.id]);
    }
  };

  const removeAlgoTrack = (index: number) => {
    if (selectedAlgos.length <= 1) return;
    setSelectedAlgos(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to render podium badges
  const getPodiumBadge = (algoId: string) => {
    const rank = finishOrder.indexOf(algoId);
    if (rank === -1) return null;

    if (rank === 0) {
      return (
        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/35 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-sm shadow-amber-500/5">
          🥇 1st place (Gold)
        </div>
      );
    }

    if (rank === 1) {
      return (
        <div className="flex items-center gap-1 bg-slate-400/20 border border-slate-400/35 text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm shadow-slate-400/5">
          🥈 2nd place (Silver)
        </div>
      );
    }

    if (rank === 2) {
      return (
        <div className="flex items-center gap-1 bg-amber-700/25 border border-amber-700/35 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm shadow-amber-700/5">
          🥉 3rd place (Bronze)
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-algo-border/40 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-algo-text tracking-tight flex items-center gap-3">
            <Zap className="text-algo-accent animate-pulse" size={32} />
            Sorting Algorithm Duel
          </h1>
          <p className="text-algo-muted mt-2 text-sm font-medium">
            Run sorting algorithms concurrently on the same dataset to visually race their time complexity bounds in real-time.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-algo-surface/60 backdrop-blur-md p-2 rounded-2xl border border-algo-border/60 shadow-lg">
          
          {/* Preset Selector */}
          <div className="flex items-center gap-2 px-3 border-r border-algo-border/40">
            <span className="text-[10px] font-bold text-algo-muted uppercase tracking-wider">Array:</span>
            <select
              value={presetType}
              onChange={(e) => setPresetType(e.target.value as DistributionType)}
              className="bg-transparent text-xs font-bold text-algo-text outline-none cursor-pointer"
            >
              <option value="random">Random Mix</option>
              <option value="reversed">Reversed (Worst)</option>
              <option value="sorted">Nearly Sorted</option>
              <option value="unique">Few Uniques</option>
            </select>
          </div>

          {/* Size Slider */}
          <div className="flex items-center gap-2 px-3 border-r border-algo-border/40">
            <span className="text-[10px] font-bold text-algo-muted uppercase tracking-wider">Size: {arraySize}</span>
            <input 
              type="range" 
              min={8} 
              max={25} 
              value={arraySize}
              onChange={(e) => setArraySize(parseInt(e.target.value))}
              className="w-16 accent-algo-primary h-1 bg-algo-border rounded-lg cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 px-3 border-r border-algo-border/40">
            <Clock size={14} className="text-algo-muted" />
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="bg-transparent text-xs font-bold text-algo-text outline-none cursor-pointer"
            >
              <option value="600">Slow</option>
              <option value="300">Normal</option>
              <option value="150">Fast</option>
              <option value="50">Turbo</option>
            </select>
          </div>

          {/* Play/Pause Buttons */}
          <button 
            onClick={generateNewArray}
            className="p-2 hover:bg-algo-surface-hover rounded-xl text-algo-muted hover:text-algo-text transition active:scale-95"
            title="Generate New Shared Array"
          >
            <Shuffle size={16} />
          </button>
          
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-algo-surface-hover rounded-xl text-algo-muted hover:text-algo-text transition active:scale-95"
            title="Reset Race Tracks"
          >
            <RotateCcw size={16} />
          </button>
          
          <button 
            onClick={handlePlayToggle}
            className="flex items-center gap-1.5 px-4 py-2 bg-algo-primary hover:bg-algo-primary/95 text-white font-bold text-xs rounded-xl shadow-md shadow-algo-primary/10 transition active:scale-[0.97]"
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Start Duel'}
          </button>
        </div>
      </div>

      {/* TRACK BUILDER SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {selectedAlgos.map((algoId, idx) => (
          <div key={idx} className="glass-panel rounded-xl p-3.5 flex items-center justify-between border border-algo-border/60">
            <div className="flex items-center gap-2.5 w-full">
              <span className="text-[10px] font-mono font-black text-white bg-algo-primary/80 px-2 py-1 rounded-lg">
                TRACK {idx + 1}
              </span>
              <select
                value={algoId}
                onChange={(e) => handleAlgoSelect(idx, e.target.value)}
                className="bg-transparent text-sm font-bold text-algo-text outline-none cursor-pointer w-full"
              >
                {sortingManifests.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            {selectedAlgos.length > 1 && (
              <button 
                onClick={() => removeAlgoTrack(idx)}
                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {selectedAlgos.length < 3 && (
          <button
            onClick={addAlgoTrack}
            className="border-2 border-dashed border-algo-border/60 hover:border-algo-primary/50 text-algo-muted hover:text-algo-primary py-3.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition duration-300 active:scale-98"
          >
            <Plus size={14} />
            Add Racer Track
          </button>
        )}
      </div>

      {/* DUEL CANVA RACE TRACKS */}
      <div className={cn(
        "grid gap-6 items-start",
        selectedAlgos.length === 1 && "grid-cols-1",
        selectedAlgos.length === 2 && "grid-cols-1 lg:grid-cols-2",
        selectedAlgos.length === 3 && "grid-cols-1 lg:grid-cols-3"
      )}>
        {runners.map((runner, idx) => {
          const hasFinished = finishOrder.includes(runner.algoId);

          return (
            <div 
              key={idx} 
              className={cn(
                "glass-panel rounded-2xl border flex flex-col h-[400px] overflow-hidden transition-all duration-500 relative",
                runner.finished ? "border-algo-success/30 shadow-algo-success/5" : "border-algo-border"
              )}
            >
              {/* Runner Title Header */}
              <div className="px-5 py-4 border-b border-algo-border/40 bg-algo-surface/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-algo-text flex items-center gap-2">
                    {runner.name}
                  </h3>
                  <span className="text-[10px] font-mono text-algo-muted uppercase tracking-wider">
                    {runner.finished ? '🏁 Finished' : '🏃 Sorting...'}
                  </span>
                </div>
                {hasFinished ? (
                  getPodiumBadge(runner.algoId)
                ) : (
                  runner.finished && (
                    <div className="text-[10px] font-mono text-algo-muted">Finished</div>
                  )
                )}
              </div>

              {/* Visualization Stage Container */}
              <div className="flex-1 overflow-hidden p-6 relative flex items-center justify-center min-h-[220px]">
                {runner.state ? (
                  <Stage 
                    state={runner.state} 
                    lastEvents={runner.events} 
                    width={380} 
                    height={180} 
                  />
                ) : (
                  <div className="text-xs text-algo-muted italic">Waiting to start...</div>
                )}
              </div>

              {/* Statistics Footer */}
              <div className="bg-algo-surface/40 border-t border-algo-border/40 p-4 grid grid-cols-3 gap-2 text-center text-xs shrink-0 font-mono">
                <div className="bg-algo-bg/50 border border-algo-border/30 p-2 rounded-xl">
                  <div className="text-[10px] text-algo-muted mb-0.5">Comparisons</div>
                  <div className="font-extrabold text-algo-text">{runner.comparisons}</div>
                </div>
                <div className="bg-algo-bg/50 border border-algo-border/30 p-2 rounded-xl">
                  <div className="text-[10px] text-algo-muted mb-0.5">Swaps</div>
                  <div className="font-extrabold text-algo-text">{runner.swaps}</div>
                </div>
                <div className="bg-algo-bg/50 border border-algo-border/30 p-2 rounded-xl">
                  <div className="text-[10px] text-algo-muted mb-0.5">Writes</div>
                  <div className="font-extrabold text-algo-text">{runner.writes}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
