import React, { useState, useEffect } from 'react';
import { InputDefinition } from '@core/types';
import { X, RefreshCw, Play } from 'lucide-react';

interface InputEditorProps {
  inputs: InputDefinition[];
  currentValues: Record<string, any>;
  onRun: (newValues: Record<string, any>) => void;
  onClose: () => void;
}

export const InputEditor: React.FC<InputEditorProps> = ({ inputs, currentValues, onRun, onClose }) => {
  // Local state stores STRINGS for editing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Initialize: Convert incoming values -> Strings
  useEffect(() => {
    const initStrings: Record<string, string> = {};
    inputs.forEach(def => {
        const val = currentValues[def.id];
        if (Array.isArray(val)) {
            // Check if it's an array of strings (chars) or numbers
            // If strings, join simply. If numbers, join with comma
            initStrings[def.id] = val.join(typeof val[0] === 'string' ? '' : ', ');
        } else {
            initStrings[def.id] = String(val !== undefined ? val : (def.defaultValue || ''));
        }
    });
    setFormValues(initStrings);
  }, [inputs, currentValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalValues: Record<string, any> = {};
    
    inputs.forEach(def => {
        const raw = formValues[def.id] || '';
        
        if (def.type === 'array') {
            finalValues[def.id] = raw
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
                .map(s => parseInt(s))
                .filter(n => !isNaN(n));
        } else if (def.type === 'integer') {
            finalValues[def.id] = parseInt(raw) || 0;
        } else if (def.type === 'string') {
            finalValues[def.id] = raw;
        } else {
            finalValues[def.id] = raw;
        }
    });

    onRun(finalValues);
  };

  const handleRandomize = (def: InputDefinition) => {
    // Case 1: Random Number Array
    if (def.type === 'array') {
      const min = def.constraints?.min !== undefined ? def.constraints.min : 1;
      const max = def.constraints?.max !== undefined ? def.constraints.max : 99;
      const maxLength = def.constraints?.maxLength || 10;
      // Generate a random length between 5 and maxLength (bounded between 3 and maxLength)
      const len = Math.max(3, Math.floor(Math.random() * (maxLength - 5 + 1)) + 5);
      const randomArr = Array.from(
        { length: Math.min(maxLength, len) }, 
        () => Math.floor(Math.random() * (max - min + 1)) + min
      );
      
      setFormValues(prev => ({
          ...prev,
          [def.id]: randomArr.join(', ')
      }));
    }
    
    // Case 2: Random Integer (Target)
    if (def.type === 'integer') {
       const min = def.constraints?.min !== undefined ? def.constraints.min : 1;
       const max = def.constraints?.max !== undefined ? def.constraints.max : 100;
       const val = Math.floor(Math.random() * (max - min + 1)) + min;
       setFormValues(prev => ({ ...prev, [def.id]: String(val) }));
    }

    // Case 3: Random String (for String Search)
    if (def.type === 'string') {
        // Generate random string A-D for simplicity in visualizer
        const chars = "ABCD";
        const maxLength = def.constraints?.maxLength || 10;
        const len = Math.max(3, Math.floor(Math.random() * (maxLength - 5 + 1)) + 5);
        let str = "";
        const finalLen = Math.min(maxLength, len);
        for(let i=0; i<finalLen; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormValues(prev => ({ ...prev, [def.id]: str }));
    }
  };

  const handleChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-algo-surface border border-algo-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-algo-border bg-algo-bg/50">
          <h2 className="text-lg font-bold text-algo-text">Configure Input</h2>
          <button onClick={onClose} className="text-algo-muted hover:text-algo-text">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {inputs.map((def) => (
            <div key={def.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-algo-muted">{def.label}</label>
                <button 
                  type="button"
                  onClick={() => handleRandomize(def)}
                  className="text-xs flex items-center gap-1 text-algo-primary hover:underline"
                >
                  <RefreshCw size={12} /> Randomize
                </button>
              </div>
              
              {/* RENDER ARRAY INPUT */}
              {def.type === 'array' && (
                <div className="relative">
                  <input
                    type="text"
                    value={formValues[def.id] || ''}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="w-full bg-algo-bg border border-algo-border rounded-lg px-4 py-3 text-algo-text font-mono text-sm focus:ring-2 focus:ring-algo-primary outline-none transition-all"
                    placeholder="e.g. 5, 12, 8, 1"
                    autoFocus={def.id === 'arr'} 
                  />
                  <div className="mt-1 text-xs text-algo-muted">
                    Separate numbers with commas.
                  </div>
                </div>
              )}

              {/* RENDER INTEGER INPUT */}
              {def.type === 'integer' && (
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[def.id] || ''}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="w-full bg-algo-bg border border-algo-border rounded-lg px-4 py-3 text-algo-text font-mono text-sm focus:ring-2 focus:ring-algo-primary outline-none transition-all"
                    placeholder="e.g. 42"
                  />
                </div>
              )}

              {/* RENDER STRING INPUT */}
              {def.type === 'string' && (
                <div className="relative">
                  <input
                    type="text"
                    value={formValues[def.id] || ''}
                    onChange={(e) => handleChange(def.id, e.target.value)}
                    className="w-full bg-algo-bg border border-algo-border rounded-lg px-4 py-3 text-algo-text font-mono text-sm focus:ring-2 focus:ring-algo-primary outline-none transition-all"
                    placeholder="Enter text..."
                  />
                </div>
              )}

            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-algo-border">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm text-algo-muted hover:text-algo-text transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-algo-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 transition"
            >
              <Play size={16} fill="currentColor" />
              Load & Run
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};