/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, Share2, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@utils/cn';

import { AlgorithmEngine } from '@core/engine/AlgorithmEngine';
import { getAlgorithm } from '@registry/index';
import { Stage } from '@renderer/Stage';
import { PlaybackControls } from '@ui/controls/PlaybackControls';
import { InputEditor } from '@ui/controls/InputEditor';
import { TheoryView } from '@ui/views/TheoryView';
import { CodePlayground } from '@ui/views/CodePlayground';
import { getQuizForAlgorithm, QuizQuestion } from '@utils/quizRegistry';
import { playTone } from '@utils/audio';
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
  const [currentInputs, setCurrentInputs] = useState<Record<string, unknown>>({});
  const [speed, setSpeed] = useState(settings.defaultSpeed);
  const [showGrid, setShowGrid] = useState(settings.defaultGrid);

  
  // -- ENGINE COPY STATES FOR LINT SAFETY --
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);
  const [engineStatus, setEngineStatus] = useState('IDLE');

  // -- PREMIUM FEATURE STATES --
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState<Record<string, boolean>>({});

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
      setEngineStatus(engineRef.current.status);
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
      setCurrentStep(engine.currentStepIndex);
      setTotalSteps(engine.totalSteps);
      setEngineStatus(engine.status);
    });
    engineRef.current = engine;
    return () => engine.pause();
  }, []);

  // -- 2. LOAD ALGORITHM, SYNCHRONIZE INPUTS & ENGINE --
  const prevIdRef = useRef('');
  useEffect(() => {
    if (id && engineRef.current) {
      const algo = getAlgorithm(id);
      if (algo) {
        const defaults: Record<string, unknown> = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        algo.manifest.inputs.forEach(i => {
          let paramValue: unknown = null;
          const rawParam = searchParams.get(i.id);
          const rawBase64 = searchParams.get(`${i.id}_b64`);
          
          if (rawBase64) {
            try {
              paramValue = JSON.parse(atob(rawBase64));
            } catch (e) {
              console.error('Failed to serialize input parameter:', e);
            }
          } else if (rawParam) {
            if (i.type === 'array') {
              paramValue = rawParam.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
            } else if (i.type === 'integer') {
              paramValue = parseInt(rawParam) || 0;
            } else {
              paramValue = rawParam;
            }
          }
          
          defaults[i.id] = paramValue !== null ? paramValue : i.defaultValue;
        });

        const hasLoadedInputs = Object.keys(currentInputs).length > 0;
        const inputsToLoad = hasLoadedInputs ? currentInputs : defaults;

        if (!hasLoadedInputs) {
          setCurrentInputs(defaults);
        }

        if (prevIdRef.current !== id) {
          setTriggeredQuizzes({});
          setActiveQuiz(null);
          prevIdRef.current = id;
        }

        engineRef.current.load(algo, inputsToLoad);
        
        // Sync playback states
        const step = engineRef.current.getCurrentStep();
        if (step) {
          setState(step.snapshot);
          setEvents(step.events);
        }
        setCurrentStep(engineRef.current.currentStepIndex);
        setTotalSteps(engineRef.current.totalSteps);
        setEngineStatus(engineRef.current.status);
      }
    }
  }, [id, currentInputs]);

  // -- 3. SOUND SYNTHESIZER SYNC --
  useEffect(() => {
    if (state && settings.soundEnabled && events.length > 0) {
      const primaryEvent = events[0];
      const mainStruct = state.structures['main'] || Object.values(state.structures)[0];
      let val = 50;

      if (mainStruct && mainStruct.type === 'array' && primaryEvent.indices && primaryEvent.indices.length > 0) {
        const item = mainStruct.data[primaryEvent.indices[0]];
        if (typeof item === 'number') val = item;
      }
      playTone(val, primaryEvent.type);
    } else if (state && settings.soundEnabled && (state.context.message.toLowerCase().includes('complete') || state.context.message.toLowerCase().includes('finished'))) {
      playTone(100, 'success');
    }
  }, [state, events, settings.soundEnabled]);

  // -- 4. ACTIVE SOCRATIC QUIZ CHECKER --
  useEffect(() => {
    if (!id || !engineRef.current || !settings.quizzesEnabled) return;
    
    const quizzes = getQuizForAlgorithm(id);
    const currentStepIndex = engineRef.current.currentStepIndex;
    
    if (isPlaying && quizzes.length > 0) {
      const quiz = quizzes.find(q => q.triggerStepIndex === currentStepIndex && !triggeredQuizzes[q.id]);
      if (quiz) {
        engineRef.current.pause();
        setIsPlaying(false);
        setEngineStatus(engineRef.current.status);
        setActiveQuiz(quiz);
        setTriggeredQuizzes(prev => ({ ...prev, [quiz.id]: true }));
      }
    }
  }, [state, isPlaying, id, triggeredQuizzes, settings.quizzesEnabled]);

  // -- 5. PLAYBACK CONTROLS --
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying && engineRef.current) {
      engineRef.current.play(newSpeed);
      setEngineStatus(engineRef.current.status);
    }
  };

  const handlePlay = () => {
    if (engineRef.current) {
      engineRef.current.play(speed);
      setEngineStatus(engineRef.current.status);
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setEngineStatus(engineRef.current.status);
    }
  };

  const handleStepForward = () => {
    if (engineRef.current) {
      engineRef.current.stepForward();
      setCurrentStep(engineRef.current.currentStepIndex);
    }
  };

  const handleStepBackward = () => {
    if (engineRef.current) {
      engineRef.current.stepBackward();
      setCurrentStep(engineRef.current.currentStepIndex);
    }
  };

  const handleSeek = (index: number) => {
    if (engineRef.current) {
      engineRef.current.seek(index);
      setCurrentStep(engineRef.current.currentStepIndex);
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setTriggeredQuizzes({});
      setActiveQuiz(null);
      setCurrentStep(engineRef.current.currentStepIndex);
      setTotalSteps(engineRef.current.totalSteps);
      setEngineStatus(engineRef.current.status);
    }
  };

  // -- 6. COPY LINK --
  const handleShareConfig = () => {
    const params = new URLSearchParams();
    Object.entries(currentInputs).forEach(([k, v]) => {
      try {
        const b64 = btoa(JSON.stringify(v));
        params.set(`${k}_b64`, b64);
      } catch (e) {
        console.error('Failed to serialize input:', e);
      }
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setIsShareCopied(true);
    setTimeout(() => setIsShareCopied(false), 2000);
  };

  // -- 7. RESIZE --
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
    const timeout = setTimeout(updateSize, 120);
    window.addEventListener('resize', updateSize);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateSize);
    };
  }, [state]);

  if (!id) return <div className="text-slate-400 p-8 text-center italic font-sans text-xs">Select an algorithm to begin.</div>;
  const algo = getAlgorithm(id);
  const algoManifest = algo?.manifest;

  if (!algoManifest) {
    return <div className="text-slate-400 p-8 text-center font-sans text-xs">Algorithm "{id}" not found.</div>;
  }



  return (
    <div className="space-y-6 pb-12 font-sans animate-fade-in text-slate-800">
      
      {/* Category Link Breadcrumb */}
      <div className="flex items-center">
        <Link 
          to={`/category/${algoManifest.category.toLowerCase()}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={13} />
          {algoManifest.category} Suite
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            {algoManifest.name}
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              {algoManifest.difficulty}
            </span>
            <span>•</span>
            <span>{algoManifest.category.toUpperCase()}</span>
          </div>
        </div>
        
        {/* Right side global actions */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <button 
            onClick={handleShareConfig}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95",
              isShareCopied && "border-[#34c759]/50 text-[#34c759] bg-[#34c759]/5"
            )}
          >
            {isShareCopied ? <Check size={14} /> : <Share2 size={14} />}
            {isShareCopied ? 'Copied' : 'Share'}
          </button>

          {algoManifest.inputs && algoManifest.inputs.length > 0 && (
            <button 
              onClick={() => setShowInput(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95"
            >
              <Settings size={14} />
              Configure Inputs
            </button>
          )}
        </div>
      </div>

      {/* Main Single Page Workspace Grid: 2-Column top panel stack */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Left Column: Visualizer Stage Container */}
        <div className="w-full lg:w-2/3 space-y-4 shrink-0">
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] flex flex-col h-[500px] relative overflow-hidden">
            
            {/* Overlay context message */}
            <div className="absolute top-4 left-4 right-4 text-center z-10 pointer-events-none">
              <div className="inline-block px-4 py-1.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-700 bg-white/95 shadow-sm max-w-[85%] truncate">
                {state?.context.message || "Ready to run"}
              </div>
            </div>
            
            {/* Stage Canvas */}
            <div 
              ref={containerRef} 
              className={cn(
                "flex-1 overflow-hidden relative transition-colors",
                showGrid 
                  ? "bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px]"
                  : "bg-slate-50/20"
              )}
            >
              {/* Floating grid toggler */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setShowGrid(!showGrid)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-semibold shadow-xs transition active:scale-95 bg-white border-slate-200 text-slate-500 hover:text-slate-800",
                    showGrid && "border-slate-350 text-slate-800 bg-slate-50"
                  )}
                >
                  GRID: {showGrid ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Concept Quiz Overlay */}
              {activeQuiz && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-30 flex items-center justify-center p-6">
                  <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-6 max-w-md space-y-4">
                    <h3 className="font-semibold text-sm text-slate-800">Concept Quiz</h3>
                    <p className="text-xs text-slate-500">{activeQuiz.question}</p>
                    <div className="space-y-1.5">
                      {activeQuiz.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (i === activeQuiz.correctIndex) {
                              setActiveQuiz(null);
                              setTimeout(() => {
                                handlePlay();
                              }, 50);
                            } else {
                              alert("Incorrect option. Try again!");
                            }
                          }}
                          className="w-full text-left p-2.5 text-xs border border-slate-100 hover:bg-slate-50 rounded-lg transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Canvas Renderer */}
              <div className="absolute inset-0 p-8 pt-16 flex items-center justify-center">
                <Stage 
                  state={state} 
                  lastEvents={events} 
                  width={dimensions.width - 64} 
                  height={dimensions.height - 80} 
                  algoId={id}
                  category={algoManifest.category}
                />
              </div>
            </div>

            {/* Playback Controls Footer */}
            <div className="border-t border-slate-100 p-4 shrink-0 bg-white">
              <PlaybackControls 
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onNext={handleStepForward}
                onPrev={handleStepBackward}
                onReset={handleReset}
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

        {/* Right Column: Code companion & Variables stacked vertically */}
        <div className="w-full lg:w-1/3 space-y-5 shrink-0 flex flex-col justify-between">
          
          {/* Multi-language Code Playground */}
          <CodePlayground 
            pseudocode={algoManifest.pseudocode}
            activeLine={state?.context.pseudocodeLine}
            onCodeMutation={(mutated) => {
              console.log("Hot-reloaded code mutation:", mutated);
              handleReset();
            }}
          />

          {/* Live Variables Tracker */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] flex flex-col h-[180px]">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5 shrink-0">
              Runtime Variables
            </h3>
            
            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 scrollbar-thin">
              {state?.context.variables && Object.keys(state.context.variables).length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(state.context.variables).map(([k, v]) => (
                    <div key={k} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex justify-between items-center">
                      <span className="text-[#0071e3] font-semibold">{k}</span>
                      <span className="font-semibold text-slate-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic h-full flex items-center justify-center">
                  No active local variables
                </div>
              )}
            </div>
          </div>

          {/* Diagnostics Telemetry */}
          {settings.debugMode && (
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.015),0_6px_16px_rgba(0,0,0,0.015)] flex flex-col space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Diagnostics Telemetry
              </h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-slate-600">
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <div className="text-slate-400 mb-0.5 font-semibold">Step Index</div>
                  <div className="font-bold text-slate-800">{currentStep + 1} / {totalSteps}</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <div className="text-slate-400 mb-0.5 font-semibold">Step Delay</div>
                  <div className="font-bold text-slate-800">{speed}ms</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <div className="text-slate-400 mb-0.5 font-semibold">Engine Status</div>
                  <div className="font-bold text-slate-800 uppercase">{engineStatus}</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <div className="text-slate-400 mb-0.5 font-semibold">Structure ID</div>
                  <div className="font-bold text-slate-800 truncate">
                    {state ? Object.values(state.structures).map(s => s.id).join(', ') : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reworked Theory & Complexity Docs - Full-width at the bottom */}
      <div className="border-t border-slate-100 pt-8 mt-4">
        <TheoryView manifest={algoManifest} />
      </div>

      {/* Dynamic Input Editor modal overlay */}
      {showInput && (
        <InputEditor 
          inputs={algoManifest.inputs}
          currentValues={currentInputs as Record<string, any>}
          onClose={() => setShowInput(false)}
          onRun={(newVals) => { 
            setCurrentInputs(newVals as Record<string, unknown>); 
            setShowInput(false); 
            if (engineRef.current) {
              engineRef.current.load(algo, newVals as Record<string, any>);
              setCurrentStep(engineRef.current.currentStepIndex);
              setTotalSteps(engineRef.current.totalSteps);
              setEngineStatus(engineRef.current.status);
            }
          }}
        />
      )}

    </div>
  );
};