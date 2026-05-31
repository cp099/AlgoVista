import React from 'react';
import { X, Moon, Sun, Sliders, Volume2, Activity, Eye, RefreshCw } from 'lucide-react';
import { useTheme } from '@core/ThemeContext';
import { useSettings, NodeStyle } from '@core/SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-algo-surface border border-algo-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[520px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-algo-border bg-algo-surface">
          <h2 className="text-lg font-extrabold text-algo-text flex items-center gap-2">
            <Sliders size={20} className="text-algo-primary" />
            Preferences Dashboard
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-algo-muted hover:text-algo-text hover:bg-algo-surface-hover transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
          
          {/* Theme Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-algo-muted uppercase tracking-widest block">Appearance</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-algo-primary text-white border-algo-primary shadow-lg shadow-algo-primary/20' 
                    : 'bg-algo-surface text-algo-text border-algo-border hover:border-algo-muted'
                }`}
              >
                <Sun size={16} /> Light Mode
              </button>

              <button 
                onClick={() => theme === 'light' && toggleTheme()}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-algo-primary text-white border-algo-primary shadow-lg shadow-algo-primary/20' 
                    : 'bg-algo-surface text-algo-text border-algo-border hover:border-algo-muted'
                }`}
              >
                <Moon size={16} /> Dark Mode
              </button>
            </div>
          </div>

          {/* Node Theme Style */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-algo-muted uppercase tracking-widest block">Visualizer Node Styling</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['neon', 'slate', 'contrast'] as NodeStyle[]).map(style => (
                <button
                  key={style}
                  onClick={() => updateSetting('nodeStyle', style)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 capitalize ${
                    settings.nodeStyle === style
                      ? 'bg-algo-primary/10 border-algo-primary text-algo-primary shadow-inner'
                      : 'bg-algo-bg/45 border-algo-border text-algo-muted hover:border-algo-muted hover:text-algo-text'
                  }`}
                >
                  {style === 'neon' && <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-md shadow-indigo-500/50" />}
                  {style === 'slate' && <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />}
                  {style === 'contrast' && <span className="w-2.5 h-2.5 rounded-full bg-transparent border-2 border-current" />}
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Default Playback Configs */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-algo-muted uppercase tracking-widest block">Visualizer Defaults</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Default Gridlines */}
              <div className="bg-algo-surface border border-algo-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-algo-primary/10 rounded-lg text-algo-primary">
                    <Eye size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-algo-text">Show Gridlines</h4>
                    <p className="text-[10px] text-algo-muted">Show backdrop grid by default</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('defaultGrid', !settings.defaultGrid)}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 relative ${
                    settings.defaultGrid ? 'bg-algo-primary' : 'bg-algo-surface border border-algo-border'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${
                    settings.defaultGrid ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Default Delay Speed */}
              <div className="bg-algo-surface border border-algo-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-algo-primary/10 rounded-lg text-algo-primary">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-algo-text">Default Delay</h4>
                    <p className="text-[10px] text-algo-muted">Playback delay in ms</p>
                  </div>
                </div>
                <select
                  value={settings.defaultSpeed}
                  onChange={(e) => updateSetting('defaultSpeed', parseInt(e.target.value))}
                  className="bg-algo-surface border border-algo-border rounded-lg text-xs font-bold py-1 px-2 text-algo-text outline-none focus:border-algo-primary cursor-pointer"
                >
                  <option value="100">100ms (Fast)</option>
                  <option value="300">300ms (Normal)</option>
                  <option value="600">600ms (Slow)</option>
                  <option value="1000">1000ms (Lagged)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Accessibility & Debug */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-algo-muted uppercase tracking-widest block">System Features</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sound Indicators */}
              <div className="bg-algo-surface border border-algo-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-algo-primary/10 rounded-lg text-algo-primary">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-algo-text">Sound Indicators</h4>
                    <p className="text-[10px] text-algo-muted">Mock comparison triggers</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 relative ${
                    settings.soundEnabled ? 'bg-algo-primary' : 'bg-algo-surface border border-algo-border'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Debug Monitor Mode */}
              <div className="bg-algo-surface border border-algo-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-algo-primary/10 rounded-lg text-algo-primary">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-algo-text">Diagnostics Mode</h4>
                    <p className="text-[10px] text-algo-muted">Show telemetry on visualizer</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('debugMode', !settings.debugMode)}
                  className={`w-11 h-6 rounded-full p-1 transition-all duration-300 relative ${
                    settings.debugMode ? 'bg-algo-primary' : 'bg-algo-surface border border-algo-border'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${
                    settings.debugMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-algo-border bg-algo-surface flex justify-between items-center shrink-0">
          <button 
            onClick={resetSettings}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-algo-surface border border-transparent hover:border-algo-border rounded-xl text-xs font-bold text-algo-muted hover:text-algo-text transition duration-300"
          >
            <RefreshCw size={12} />
            Reset Defaults
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-algo-primary hover:bg-algo-primary/95 text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-algo-primary/10 active:scale-[0.98]"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};