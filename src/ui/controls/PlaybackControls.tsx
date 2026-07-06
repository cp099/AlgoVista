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
    <div className="flex flex-col items-center gap-3 w-full font-sans">
      
      {/* Sleek, Thin Progress Bar */}
      <div 
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative group cursor-pointer hover:h-1.5 transition-all"
        title="Click to seek"
      >
        <div 
          className="h-full bg-[#0071e3] transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-white transition-all duration-300 ease-out"
          style={{ left: `calc(${progress * 100}% - 1px)` }}
        />
      </div>

      {/* Control Deck Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-1 gap-3 sm:gap-2 text-slate-700">
        
        {/* Left: Reset & Steps */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={onReset} 
            className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-md hover:bg-slate-50 active:scale-95" 
            title="Reset"
          >
            <RotateCcw size={15} />
          </button>
          
          <div className="w-px h-4 bg-slate-200" />
          
          <div className="text-[11px] font-mono text-slate-400 font-medium tracking-normal select-none">
            STEP {currentStep} <span className="opacity-40">/</span> {totalSteps}
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onPrev} 
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors p-1.5 rounded-lg active:scale-90"
            title="Previous Step"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={isPlaying ? onPause : onPlay}
            className="bg-slate-900 text-white w-9 h-9 rounded-full transition-colors active:scale-95 flex items-center justify-center hover:bg-slate-800"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button 
            onClick={onNext} 
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors p-1.5 rounded-lg active:scale-90"
            title="Next Step"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Right: Speed Control slider */}
        <div className="flex items-center gap-3">
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <span className="text-[9px] font-mono text-slate-400 font-bold tracking-tight">SPEED:</span>
            <input 
              type="range" 
              min="50" 
              max="1500" 
              step="50"
              value={1550 - speed} 
              onChange={(e) => onSpeedChange(1550 - parseInt(e.target.value))}
              className="w-16 md:w-20 h-[3px] bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#0071e3] outline-none"
              title="Change Speed"
            />
            <span className="text-[9px] font-mono text-slate-600 font-semibold w-10 text-right select-none">
              {opsPerSec} op/s
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};