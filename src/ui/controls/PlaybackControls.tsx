import React, { useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSeek: (stepIndex: number) => void;
  progress: number;
  totalSteps: number;
  currentStep: number;
  speed: number;
  onSpeedChange: (speedMs: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying, 
  onPlay, 
  onPause, 
  onNext, 
  onPrev, 
  onReset,
  onSeek,
  progress, 
  totalSteps, 
  currentStep,
  speed,
  onSpeedChange
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && totalSteps > 1) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const targetStep = Math.round(pct * (totalSteps - 1));
      onSeek(targetStep);
    }
  };

  // Convert speed in ms to operations per second
  const opsPerSec = (1000 / speed).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto">
      
      {/* Progress Bar Container */}
      <div 
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        className="w-full h-2 bg-algo-border/40 rounded-full overflow-hidden relative group cursor-pointer hover:h-2.5 transition-all duration-200"
        title="Click to seek"
      >
        <div 
          className="h-full bg-gradient-to-r from-algo-primary to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Glow point overlay */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] transition-all duration-300 ease-out"
          style={{ left: `calc(${progress * 100}% - 2px)` }}
        />
      </div>

      {/* Control Deck (Horizontal Pill layout) */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full px-6 py-3 bg-algo-surface/80 border border-algo-border rounded-2xl shadow-xl gap-4 sm:gap-2">
        
        {/* Left Side: Reset & Steps */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset} 
            className="text-algo-muted hover:text-algo-text transition-colors p-2 rounded-xl hover:bg-algo-surface-hover hover:scale-105 active:scale-95" 
            title="Reset to Step 1"
          >
            <RotateCcw size={16} />
          </button>
          
          <div className="w-px h-5 bg-algo-border" />
          
          <div className="text-xs font-mono text-algo-muted min-w-[70px] font-bold">
            STEP {currentStep} <span className="opacity-40">/</span> {totalSteps}
          </div>
        </div>

        {/* Center: Navigation Buttons */}
        <div className="flex items-center gap-3">
          {/* Step Back */}
          <button 
            onClick={onPrev} 
            className="text-algo-text hover:text-algo-primary hover:bg-algo-primary/10 transition-colors p-2 rounded-xl active:scale-90"
            title="Previous Step"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={isPlaying ? onPause : onPlay}
            className="bg-algo-primary hover:bg-algo-primary hover:opacity-90 text-white p-3 rounded-full transition-all duration-300 shadow-md shadow-algo-primary/20 hover:shadow-algo-primary/45 active:scale-95 flex items-center justify-center border-2 border-transparent"
            title={isPlaying ? "Pause Visualizer" : "Start Visualizer"}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Step Forward */}
          <button 
            onClick={onNext} 
            className="text-algo-text hover:text-algo-primary hover:bg-algo-primary/10 transition-colors p-2 rounded-xl active:scale-90"
            title="Next Step"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Right Side: Speed Control */}
        <div className="flex items-center gap-3">
          <div className="w-px h-5 bg-algo-border hidden sm:block" />
          
          <div className="flex items-center gap-2 bg-algo-surface/50 px-3 py-1.5 rounded-xl border border-algo-border/40">
            <span className="text-[10px] font-mono text-algo-muted font-bold">SPEED:</span>
            <input 
              type="range" 
              min="50" 
              max="1500" 
              step="50"
              value={1550 - speed} 
              onChange={(e) => onSpeedChange(1550 - parseInt(e.target.value))}
              className="w-20 h-1 bg-algo-border rounded-full appearance-none cursor-pointer accent-algo-primary outline-none"
              title="Drag to change speed"
            />
            <span className="text-[10px] font-mono text-algo-text font-extrabold w-12 text-right">
              {opsPerSec} op/s
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};