import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle, Plus, X, Clock } from 'lucide-react';
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
  const sortingManifests = getAllAlgorithms().filter(
    a => a.category.toLowerCase() === 'sorting'
  );

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
  const [speed, setSpeed] = useState<number>(300);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewArray = useCallback(() => {
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
      arr = Array.from({ length: arraySize }, (_, i) =>
        Math.floor(10 + (i / arraySize) * 85)
      );
      if (arr.length > 4) {
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
    setFinishOrder([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [arraySize, presetType]);

  useEffect(() => {
    generateNewArray();
  }, [generateNewArray]);

  const initRunners = useCallback(() => {
    if (sharedArray.length === 0) return;

    setFinishOrder([]);

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
        currentStep: 0
      };
    });

    setRunners(newRunners);
  }, [sharedArray, selectedAlgos]);

  useEffect(() => {
    initRunners();
  }, [initRunners]);

  const stepRunners = useCallback(() => {
    let allFinished = true;
    const newFinishOrder = [...finishOrder];

    const updatedRunners = runners.map(runner => {
      if (runner.finished || !runner.generator) {
        return runner;
      }

      allFinished = false;
      const nextStep = runner.generator.next();

      if (nextStep.done) {
        if (!newFinishOrder.includes(runner.algoId)) {
          newFinishOrder.push(runner.algoId);
        }
        return { ...runner, finished: true };
      }

      const stepVal = nextStep.value;
      let comparisons = runner.comparisons;
      let swaps = runner.swaps;
      let writes = runner.writes;

      stepVal.events.forEach(evt => {
        if (evt.type === 'compare') comparisons++;
        if (evt.type === 'swap') swaps++;
        if (evt.type === 'write') writes++;
      });

      return {
        ...runner,
        state: stepVal.snapshot,
        events: stepVal.events,
        comparisons,
        swaps,
        writes,
        currentStep: runner.currentStep + 1
      };
    });

    setRunners(updatedRunners);
    setFinishOrder(newFinishOrder);

    if (allFinished) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [runners, finishOrder]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        stepRunners();
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, stepRunners, speed]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    initRunners();
  };

  const handleAlgoSelect = (index: number, algoId: string) => {
    setSelectedAlgos(prev => {
      const copy = [...prev];
      copy[index] = algoId;
      return copy;
    });
  };

  const addAlgoTrack = () => {
    if (selectedAlgos.length >= 3) return;
    const available = sortingManifests.find(m => !selectedAlgos.includes(m.id));
    if (available) {
      setSelectedAlgos(prev => [...prev, available.id]);
    } else {
      setSelectedAlgos(prev => [...prev, sortingManifests[0].id]);
    }
  };

  const removeAlgoTrack = (index: number) => {
    if (selectedAlgos.length <= 1) return;
    setSelectedAlgos(prev => prev.filter((_, i) => i !== index));
  };

  const getPodiumBadge = (algoId: string) => {
    const rank = finishOrder.indexOf(algoId);
    if (rank === -1) return null;

    if (rank === 0) {
      return (
        <span className="bg-amber-500/15 border border-amber-500/35 text-amber-500 px-2 py-0.5 rounded text-[8px] font-bold tracking-tight shrink-0 uppercase">
          🥇 1st place
        </span>
      );
    }

    if (rank === 1) {
      return (
        <span className="bg-slate-700 border border-slate-650 text-slate-350 px-2 py-0.5 rounded text-[8px] font-bold tracking-tight shrink-0 uppercase">
          🥈 2nd place
        </span>
      );
    }

    if (rank === 2) {
      return (
        <span className="bg-orange-500/15 border border-orange-500/35 text-orange-500 px-2 py-0.5 rounded text-[8px] font-bold tracking-tight shrink-0 uppercase">
          🥉 3rd place
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 pb-12 font-sans max-w-5xl mx-auto animate-fade-in text-slate-800">
      
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
          Sorting Algorithm Duel
        </h1>
        <p className="text-slate-500 text-xs font-normal">
          A high-fidelity telemetry race track. Analyze time complexity dynamics by running sorting duels on stacked horizontal lanes.
        </p>
      </div>

      {/* Control Console */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        
        {/* Dataset Group */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Array Preset</span>
            <select
              value={presetType}
              onChange={(e) => setPresetType(e.target.value as DistributionType)}
              className="bg-slate-50 border border-slate-200 text-slate-800 outline-none cursor-pointer font-bold text-xs px-3 py-2 rounded-lg transition hover:bg-slate-100"
            >
              <option value="random">Random Mix</option>
              <option value="reversed">Reversed (Worst)</option>
              <option value="sorted">Nearly Sorted</option>
              <option value="unique">Few Uniques</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Array Size: {arraySize}</span>
            <div className="flex items-center h-8">
              <input 
                type="range" 
                min={8} 
                max={25} 
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                className="w-32 accent-[#4f46e5] h-2 bg-slate-200 border border-slate-350/50 rounded-lg cursor-pointer appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Speed Group */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Racer Speed</span>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-850 px-3 py-2 rounded-lg text-xs font-bold">
            <Clock size={13} className="text-slate-400" />
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="bg-transparent outline-none cursor-pointer font-bold text-xs"
            >
              <option value="600">Slow (600ms)</option>
              <option value="300">Normal (300ms)</option>
              <option value="150">Fast (150ms)</option>
              <option value="50">Turbo (50ms)</option>
            </select>
          </div>
        </div>

        {/* Simulation Actions Group */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs font-bold">
          <button 
            onClick={generateNewArray}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition"
            title="Generate New Dataset"
          >
            <Shuffle size={14} />
          </button>
          
          <button 
            onClick={handleReset}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition"
            title="Reset Duel"
          >
            <RotateCcw size={14} />
          </button>
          
          <button 
            onClick={handlePlayToggle}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white font-semibold text-xs rounded-lg transition active:scale-95 shadow-sm shadow-[#4f46e5]/10"
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            {isPlaying ? 'Pause Duel' : 'Start Duel'}
          </button>
        </div>

      </div>

      {/* HORIZONTAL DUEL RACE LANES */}
      <div className="space-y-6">
        {runners.map((runner, idx) => {
          const hasFinished = finishOrder.includes(runner.algoId);

          return (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col md:flex-row rounded-xl overflow-hidden border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] hover:shadow-md h-auto md:h-[160px]",
                runner.finished ? "border-[#34c759]/40" : "border-slate-200/60"
              )}
            >
              
              {/* Telemetry panel (left side, 260px wide, dark technical slate) */}
              <div className="w-full md:w-[260px] bg-slate-900 text-white p-5 flex flex-col justify-between shrink-0 border-r border-slate-800 relative">
                
                {/* Header: Track Indicator & Algo Dropdown */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <select
                      value={runner.algoId}
                      onChange={(e) => handleAlgoSelect(idx, e.target.value)}
                      className="bg-transparent text-white outline-none cursor-pointer font-bold text-sm hover:text-indigo-200 transition max-w-[150px] truncate"
                    >
                      {sortingManifests.map(m => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-white">{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedAlgos.length > 1 && (
                    <button 
                      onClick={() => removeAlgoTrack(idx)}
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded transition shrink-0"
                      title="Remove Track"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Telemetry statistics (Compare, Swap, Write) */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3.5 mt-3 md:mt-0">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">COMP</span>
                    <span className="text-lg font-bold font-mono text-white">{runner.comparisons}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">SWAP</span>
                    <span className="text-lg font-bold font-mono text-white">{runner.swaps}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">WRITE</span>
                    <span className="text-lg font-bold font-mono text-white">{runner.writes}</span>
                  </div>
                </div>

              </div>

              {/* Horizontal Visualizer Track (right side, flexible width, white/slate lane) */}
              <div className="flex-1 bg-white/70 backdrop-blur-md p-4 flex items-center justify-center overflow-hidden min-h-[140px] md:min-h-0 relative">
                
                {/* Float Podium Badge in Finish Area */}
                {hasFinished && (
                  <div className="absolute top-3 right-3 z-10 animate-fade-in">
                    {getPodiumBadge(runner.algoId)}
                  </div>
                )}

                {runner.state ? (
                  <Stage 
                    state={runner.state} 
                    lastEvents={runner.events} 
                    width={580} 
                    height={110} 
                  />
                ) : (
                  <div className="text-xs text-slate-400 italic font-medium">Waiting...</div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Track Button (if < 3 tracks) */}
      {selectedAlgos.length < 3 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={addAlgoTrack}
            className="border border-dashed border-slate-350 hover:border-slate-500 hover:bg-slate-50 text-slate-500 hover:text-slate-800 px-6 py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs transition duration-200"
          >
            <Plus size={13} />
            Add Race Track Lane
          </button>
        </div>
      )}

    </div>
  );
};
