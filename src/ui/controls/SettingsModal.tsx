import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, RefreshCw, HelpCircle, X, Sun } from 'lucide-react';
import { useSettings, NodeStyle } from '@core/SettingsContext';
import { cn } from '@utils/cn';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'appearance' | 'defaults' | 'systems'>('appearance');

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in font-sans">
      {/* Dimmed backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose} />

      {/* Centered Modal Container */}
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl h-[70vh] flex flex-col shadow-2xl relative overflow-hidden z-10 animate-scale-up">
        
        {/* Header */}
        <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Preferences</h1>
            <p className="text-[10px] text-slate-400">Configure visualizer aesthetics and default behaviours</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={resetSettings}
              className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <RefreshCw size={11} />
              Reset Defaults
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition"
              title="Close Settings"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Workspace split */}
        <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden bg-white">
          
          {/* Left Column: Side Tabs */}
          <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors w-full shrink-0 md:shrink justify-center md:justify-start",
                activeTab === 'appearance' 
                  ? "bg-slate-200/60 text-slate-950 font-bold" 
                  : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
              )}
            >
              <Sun size={14} />
              General Aesthetics
            </button>
            
            <button
              onClick={() => setActiveTab('defaults')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors w-full shrink-0 md:shrink justify-center md:justify-start",
                activeTab === 'defaults' 
                  ? "bg-slate-200/60 text-slate-950 font-bold" 
                  : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
              )}
            >
              <Eye size={14} />
              Visualizer Defaults
            </button>

            <button
              onClick={() => setActiveTab('systems')}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors w-full shrink-0 md:shrink justify-center md:justify-start",
                activeTab === 'systems' 
                  ? "bg-slate-200/60 text-slate-950 font-bold" 
                  : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
              )}
            >
              <HelpCircle size={14} />
              Educational Modules
            </button>
          </aside>

          {/* Right Column: Tab Contents */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin">
            
            {activeTab === 'appearance' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Visualizer Node Styling</h2>
                  <p className="text-slate-400 mt-0.5">Customize visualizer node layout renders.</p>
                </div>

                <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4.5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-sm">
                      <h4 className="font-semibold text-slate-800">Node Layout Themes</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Neon applies glowing neon drop shadows; Slate uses a minimal flat theme; Contrast reinforces bold outlines for print contrast.
                      </p>
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                      {(['neon', 'slate', 'contrast'] as NodeStyle[]).map(style => (
                        <button
                          key={style}
                          onClick={() => updateSetting('nodeStyle', style)}
                          className={cn(
                            "px-3 py-1.5 text-[11px] font-semibold rounded-md capitalize transition",
                            settings.nodeStyle === style ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'defaults' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Visualizer Defaults</h2>
                  <p className="text-slate-400 mt-0.5">Set the initial properties when an algorithm playground is launched.</p>
                </div>

                <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4.5 space-y-4">
                  {/* Default Speed */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800">Default Execution Speed</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">Initial duration between steps in milliseconds.</p>
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                      {([200, 500, 1000] as number[]).map(speedVal => (
                        <button
                          key={speedVal}
                          onClick={() => updateSetting('defaultSpeed', speedVal)}
                          className={cn(
                            "px-3 py-1.5 text-[11px] font-semibold rounded-md transition",
                            settings.defaultSpeed === speedVal ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          {speedVal}ms
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default Grid Mode */}
                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800">Default Background Grid</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">Always enable the layout align alignment grid on visualizer startup.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('defaultGrid', !settings.defaultGrid)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition relative shrink-0",
                        settings.defaultGrid ? 'bg-[#34c759]' : 'bg-slate-200'
                      )}
                    >
                      <span className={cn(
                        "block w-4 h-4 rounded-full bg-white transition-all transform",
                        settings.defaultGrid ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'systems' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Educational Systems & Controls</h2>
                  <p className="text-slate-400 mt-0.5">Toggle sound cues and active interactive features.</p>
                </div>

                <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4.5 space-y-4">
                  {/* Socratic Quizzes */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800">Socratic Quiz Module</h4>
                      <p className="text-slate-400 text-[11px] max-w-md leading-relaxed">Interrupts playback at critical steps to ask conceptual prediction questions.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('quizzesEnabled', !settings.quizzesEnabled)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition relative shrink-0",
                        settings.quizzesEnabled ? 'bg-[#34c759]' : 'bg-slate-200'
                      )}
                    >
                      <span className={cn(
                        "block w-4 h-4 rounded-full bg-white transition-all transform",
                        settings.quizzesEnabled ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                  {/* Sound Indicators */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800">Sound Indicators</h4>
                      <p className="text-slate-400 text-[11px] max-w-md leading-relaxed">Generates real-time marimba-like notes mapped to data values using Web Audio synthesis.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition relative shrink-0",
                        settings.soundEnabled ? 'bg-[#34c759]' : 'bg-slate-200'
                      )}
                    >
                      <span className={cn(
                        "block w-4 h-4 rounded-full bg-white transition-all transform",
                        settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                  </div>

                  {/* Diagnostics Telemetry */}
                  <div className="flex items-center justify-between py-1">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-slate-800">Diagnostics Telemetry Monitor</h4>
                      <p className="text-slate-400 text-[11px] max-w-md leading-relaxed">Displays execution delay charts, active structural nodes list, and diagnostics timeline indices.</p>
                    </div>
                    <button
                      onClick={() => updateSetting('debugMode', !settings.debugMode)}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition relative shrink-0",
                        settings.debugMode ? 'bg-[#34c759]' : 'bg-slate-200'
                      )}
                    >
                      <span className={cn(
                        "block w-4 h-4 rounded-full bg-white transition-all transform",
                        settings.debugMode ? 'translate-x-4' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>,
    document.body
  );
};