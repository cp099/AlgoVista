import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, PlayCircle, Code, Award, Cpu, Activity } from 'lucide-react';
import { cn } from '@utils/cn';

import { AlgorithmEngine } from '@core/engine/AlgorithmEngine';
import { getAlgorithm } from '@registry/index';
import { Stage } from '@renderer/Stage';
import { PlaybackControls } from '@ui/controls/PlaybackControls';
import { InputEditor } from '@ui/controls/InputEditor';
import { TheoryView } from '@ui/views/TheoryView';
import { AlgoState, AlgoEvent } from '@core/types';
import { useSettings } from '@core/SettingsContext';

export const AlgorithmPage = () => {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  
  // -- STATE --
  const [state, setState] = useState<AlgoState | null>(null);
  const [events, setEvents] = useState<AlgoEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [currentInputs, setCurrentInputs] = useState<Record<string, any>>({});
  const [speed, setSpeed] = useState(settings.defaultSpeed); // Initialized with default settings
  const [showGrid, setShowGrid] = useState(settings.defaultGrid); // Initialized with default settings
  
  // -- RESPONSIVE DIMENSIONS STATE --
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });

  const engineRef = useRef<AlgorithmEngine | null>(null);

  // Sync settings when they change globally
  useEffect(() => {
    setShowGrid(settings.defaultGrid);
  }, [settings.defaultGrid]);

  useEffect(() => {
    setSpeed(settings.defaultSpeed);
    if (isPlaying && engineRef.current) {
      engineRef.current.play(settings.defaultSpeed);
    }
  }, [settings.defaultSpeed]);

  // -- 1. INITIALIZE ENGINE --
  useEffect(() => {
    const engine = new AlgorithmEngine(() => {
      const step = engine.getCurrentStep();
      if (step) {
        setState(step.snapshot);
        setEvents(step.events);
      }
      setIsPlaying(engine.status === 'RUNNING');
    });
    engineRef.current = engine;
    return () => engine.pause();
  }, []);

  // -- 2. LOAD ALGORITHM --
  useEffect(() => {
    if (id && engineRef.current) {
      const algo = getAlgorithm(id);
      if (algo) {
        const defaults: Record<string, any> = {};
        algo.manifest.inputs.forEach(i => defaults[i.id] = i.defaultValue);
        
        // Reset local values
        setCurrentInputs(defaults);
        engineRef.current.load(algo, defaults);
      }
    }
  }, [id]);

  // -- 3. SPEED CONTROL CHANGE --
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && engineRef.current) {
      engineRef.current.play(newSpeed);
    }
  };

  const handlePlay = () => {
    engineRef.current?.play(speed);
  };

  const handleSeek = (index: number) => {
    engineRef.current?.seek(index);
  };

  // -- 4. HANDLE RESIZE --
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    // Add small delay to ensure rendering matches offset width
    const timeout = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateSize);
    };
  }, [state]); // Trigger on state updates too

  if (!id) return <div className="text-algo-muted p-8 text-center italic">Select an algorithm from the sidebar to begin.</div>;
  const algo = getAlgorithm(id);
  const algoManifest = algo?.manifest;
  const engine = engineRef.current;
  const currentStep = engine?.currentStepIndex || 0;
  const totalSteps = engine?.totalSteps || 1;

  if (!algoManifest) {
    return <div className="text-algo-muted p-8 text-center">Algorithm "{id}" not found in registry.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-algo-border/40 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-algo-text tracking-tight flex items-center gap-3">
            <Cpu className="text-algo-primary animate-pulse" size={32} />
            {algoManifest.name}
          </h1>
          <p className="text-algo-muted mt-2 flex items-center gap-2 font-medium">
            <span className="px-2.5 py-0.5 bg-algo-primary/10 border border-algo-primary/20 rounded-full text-xs font-semibold text-algo-primary">
              {algoManifest.difficulty}
            </span>
            <span className="opacity-40">•</span>
            <span className="text-sm">{algoManifest.category}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-algo-surface hover:bg-algo-surface-hover text-sm font-bold rounded-xl border border-algo-border transition-all duration-300 text-algo-text shadow-sm active:scale-[0.97]"
          >
            <Settings size={16} />
            Configure
          </button>
          <button 
            onClick={() => {
              handlePlay();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-algo-primary hover:bg-algo-primary/95 hover:opacity-95 text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg shadow-algo-primary/20 active:scale-[0.97]"
          >
            <PlayCircle size={16} />
            Run Visualization
          </button>
        </div>
      </div>

      {/* DASHBOARD SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: THE VISUALIZATION CANVAS (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-algo-surface border border-algo-border rounded-2xl shadow-xl flex flex-col h-[520px] relative overflow-hidden">
            
            {/* Status Pill (Floating at top showing live explanation) */}
            <div className="absolute top-4 left-4 right-4 text-center z-20 pointer-events-none">
              <div className="inline-block px-5 py-2 rounded-full border border-algo-border text-sm font-semibold text-algo-primary backdrop-blur-xl bg-algo-surface/85 shadow-md">
                {state?.context.message || "Ready to run"}
              </div>
            </div>
            
            {/* CANVAS AREA */}
            <div 
              ref={containerRef} 
              className={cn(
                "flex-1 overflow-hidden relative transition-all duration-500",
                showGrid 
                  ? "bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:20px_20px] bg-algo-bg/30"
                  : "bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]"
              )}
            >
              {/* Grid Toggle Floating Button */}
              <div className="absolute top-4 right-4 z-30">
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-md transition-all duration-300 active:scale-95 flex items-center gap-1.5 bg-algo-surface/90 border-algo-border/80 text-algo-muted hover:text-algo-text",
                    showGrid && "border-algo-primary/40 text-algo-primary bg-algo-primary/10 shadow-inner"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", showGrid ? "bg-algo-primary animate-pulse" : "bg-algo-muted/60")} />
                  GRID: {showGrid ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="absolute inset-0 p-8 pt-16 flex items-center justify-center">
                <Stage 
                  state={state} 
                  lastEvents={events} 
                  width={dimensions.width - 64} 
                  height={dimensions.height - 80} 
                />
              </div>
            </div>

            {/* INTEGRATED SCRUBBER / PLAYBACK CONTROLS */}
            <div className="border-t border-algo-border bg-algo-surface/90 backdrop-blur-md p-4 shrink-0">
              <PlaybackControls 
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={() => engineRef.current?.pause()}
                onNext={() => engineRef.current?.stepForward()}
                onPrev={() => engineRef.current?.stepBackward()}
                onReset={() => engineRef.current?.reset()}
                onSeek={handleSeek}
                progress={totalSteps > 1 ? currentStep / (totalSteps - 1) : 0}
                totalSteps={totalSteps}
                currentStep={currentStep + 1}
                speed={speed}
                onSpeedChange={handleSpeedChange}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PSEUDOCODE, VARIABLES & LIVE MEMORY (1/3 Width) */}
        <div className="space-y-6">
          
          {/* PSEUDOCODE TRACKER */}
          <div className="bg-algo-surface border border-algo-border rounded-2xl p-5 shadow-lg flex flex-col h-[320px]">
            <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Code size={14} className="text-algo-primary" />
              Pseudocode Line Execution
            </h3>
            
            <div className="flex-1 overflow-y-auto font-mono text-xs text-algo-text space-y-1 pr-2 scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
              {algoManifest.pseudocode.map((line, idx) => {
                const isActive = state?.context.pseudocodeLine === (idx + 1);
                return (
                  <div 
                    key={idx} 
                    className={`px-3 py-1.5 rounded-lg transition-all duration-150 border flex items-start gap-3 ${
                      isActive 
                        ? "bg-algo-primary/10 text-algo-primary border-algo-primary/30 shadow-sm" 
                        : "text-algo-muted border-transparent hover:text-algo-text"
                    }`}
                  >
                    <span className="w-6 text-algo-muted/40 select-none text-right font-bold text-[10px] pt-0.5">{idx + 1}</span>
                    <pre className="whitespace-pre-wrap font-mono font-medium">{line}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MEMORY VARIABLES CARD */}
          <div className="bg-algo-surface border border-algo-border rounded-2xl p-5 shadow-lg flex flex-col h-[175px]">
            <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Award size={14} className="text-algo-primary" />
              Runtime Variables (State)
            </h3>
            
            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-2 pr-2 scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
              {state?.context.variables && Object.keys(state.context.variables).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(state.context.variables).map(([k, v]) => (
                    <div key={k} className="bg-algo-bg/50 border border-algo-border/40 px-3 py-2 rounded-xl flex justify-between items-center">
                      <span className="text-algo-primary font-bold text-xs">{k}</span>
                      <span className="font-extrabold text-xs text-algo-text">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-algo-muted italic h-full flex items-center justify-center">
                  No active local variables
                </div>
              )}
            </div>
          </div>

          {/* DIAGNOSTICS TELEMETRY CARD */}
          {settings.debugMode && (
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-5 shadow-lg flex flex-col space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-algo-muted uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="text-algo-primary animate-pulse" />
                Diagnostics Telemetry
              </h3>
              <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px]">
                <div className="bg-algo-bg/50 border border-algo-border/40 p-2 rounded-xl">
                  <div className="text-algo-muted mb-0.5 font-semibold">Timeline Step</div>
                  <div className="font-extrabold text-algo-text">{currentStep + 1} / {totalSteps}</div>
                </div>
                <div className="bg-algo-bg/50 border border-algo-border/40 p-2 rounded-xl">
                  <div className="text-algo-muted mb-0.5 font-semibold">Speed Delay</div>
                  <div className="font-extrabold text-algo-text">{speed}ms</div>
                </div>
                <div className="bg-algo-bg/50 border border-algo-border/40 p-2 rounded-xl">
                  <div className="text-algo-muted mb-0.5 font-semibold">Engine Status</div>
                  <div className="font-extrabold text-algo-primary uppercase">{engine?.status || 'IDLE'}</div>
                </div>
                <div className="bg-algo-bg/50 border border-algo-border/40 p-2 rounded-xl">
                  <div className="text-algo-muted mb-0.5 font-semibold">Structures</div>
                  <div className="font-extrabold text-algo-text truncate">
                    {state ? Object.values(state.structures).map(s => s.id).join(', ') : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DETAILED EDUCATION THEORY & COMPLEXITIES */}
      <div className="border-t border-algo-border/30 pt-8">
        <TheoryView manifest={algoManifest} />
      </div>

      {/* PARAMETERS CONFIGURATION MODAL */}
      {showInput && (
        <InputEditor 
          inputs={algoManifest.inputs}
          currentValues={currentInputs}
          onClose={() => setShowInput(false)}
          onRun={(newVals) => { 
            setCurrentInputs(newVals); 
            setShowInput(false); 
            if (engineRef.current) {
              engineRef.current.load(algo, newVals);
            }
          }}
        />
      )}
    </div>
  );
};