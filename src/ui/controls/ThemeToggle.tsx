import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@core/ThemeContext';
import { cn } from '@utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-xl border border-algo-border bg-algo-surface/80 hover:bg-algo-surface-hover text-algo-muted hover:text-algo-text shadow-sm transition-all duration-300 relative overflow-hidden group active:scale-95",
        className
      )}
      aria-label="Toggle dark/light theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon (Rotates and scales down when dark) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
            theme === 'dark' 
              ? 'opacity-0 scale-50 rotate-90 pointer-events-none' 
              : 'opacity-100 scale-100 rotate-0'
          )}
        >
          <Sun size={20} className="text-amber-500 animate-[spin_20s_linear_infinite]" />
        </div>
        
        {/* Moon Icon (Rotates and scales up when dark) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
            theme === 'light' 
              ? 'opacity-0 scale-50 -rotate-90 pointer-events-none' 
              : 'opacity-100 scale-100 rotate-0'
          )}
        >
          <Moon size={20} className="text-indigo-400" />
        </div>
      </div>
      
      {/* Background Hover Glow Effect */}
      <span className="absolute inset-0 bg-algo-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
};
