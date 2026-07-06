/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/purity */
import React, { useState, useEffect } from 'react';
import { InputDefinition } from '@core/types';
import { X, RefreshCw, Play } from 'lucide-react';
import { cn } from '@utils/cn';

interface InputEditorProps {
  inputs: InputDefinition[];
  currentValues: Record<string, any>;
  onRun: (newValues: Record<string, any>) => void;
  onClose: () => void;
}

export const InputEditor: React.FC<InputEditorProps> = ({ inputs, currentValues, onRun, onClose }) => {
  // Local state stores strings for editing
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form fields on mount/update
  useEffect(() => {
    const initStrings: Record<string, string> = {};
    inputs.forEach(def => {
      const val = currentValues[def.id];
      if (Array.isArray(val)) {
        initStrings[def.id] = val.join(typeof val[0] === 'string' ? '' : ', ');
      } else {
        initStrings[def.id] = String(val !== undefined ? val : (def.defaultValue || ''));
      }
    });
    setFormValues(initStrings);
    setErrors({});
  }, [inputs, currentValues]);

  // -- INDIVIDUAL FIELD VALIDATION --
  const validateField = (def: InputDefinition, valueStr: string): string | null => {
    const trimmed = valueStr.trim();
    if (!trimmed) {
      return `${def.label} is required.`;
    }

    if (def.type === 'array') {
      const parts = trimmed.split(',').map(s => s.trim()).filter(s => s !== '');
      if (parts.length === 0) {
        return "Must contain at least one element.";
      }

      // Check array bounds
      const minLength = def.constraints?.minLength ?? 3;
      const maxLength = def.constraints?.maxLength ?? 12;
      if (parts.length < minLength) {
        return `Minimum length is ${minLength} elements.`;
      }
      if (parts.length > maxLength) {
        return `Maximum length is ${maxLength} elements.`;
      }

      // Check if it should be numbers based on default values type
      const isNumberArray = Array.isArray(def.defaultValue) && typeof def.defaultValue[0] === 'number';
      if (isNumberArray) {
        for (const item of parts) {
          const num = Number(item);
          if (isNaN(num)) {
            return "Must contain only integers separated by commas.";
          }
          if (!Number.isInteger(num)) {
            return "Floating point numbers are not supported.";
          }

          // Check individual number constraints
          const min = def.constraints?.min ?? 1;
          const max = def.constraints?.max ?? 99;
          if (num < min) {
            return `Numbers must be at least ${min}.`;
          }
          if (num > max) {
            return `Numbers must be at most ${max}.`;
          }
        }
      } else {
        // String/Character Array validations
        for (const item of parts) {
          if (item.length > 2) {
            return "Elements must be single characters or short strings.";
          }
        }
      }
    }

    if (def.type === 'integer') {
      const num = Number(trimmed);
      if (isNaN(num) || !Number.isInteger(num)) {
        return "Must be a valid integer.";
      }

      const min = def.constraints?.min ?? 1;
      const max = def.constraints?.max ?? 100;
      if (num < min) {
        return `Value must be at least ${min}.`;
      }
      if (num > max) {
        return `Value must be at most ${max}.`;
      }
    }

    if (def.type === 'string') {
      const minLength = def.constraints?.minLength ?? 3;
      const maxLength = def.constraints?.maxLength ?? 20;

      if (trimmed.length < minLength) {
        return `Must be at least ${minLength} characters.`;
      }
      if (trimmed.length > maxLength) {
        return `Must be at most ${maxLength} characters.`;
      }
    }

    return null;
  };

  // Handle changes on input fields, clearing error immediately
  const handleChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // Submit and run validations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    const finalValues: Record<string, any> = {};

    inputs.forEach(def => {
      const raw = formValues[def.id] || '';
      const err = validateField(def, raw);
      
      if (err) {
        newErrors[def.id] = err;
      } else {
        // Parsing values
        if (def.type === 'array') {
          const isNumberArray = Array.isArray(def.defaultValue) && typeof def.defaultValue[0] === 'number';
          finalValues[def.id] = raw
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(s => isNumberArray ? parseInt(s, 10) : s);
        } else if (def.type === 'integer') {
          finalValues[def.id] = parseInt(raw.trim(), 10);
        } else {
          finalValues[def.id] = raw.trim();
        }
      }
    });

    // Cross-validate (e.g. pattern length vs text length in string match)
    if (finalValues['text'] && finalValues['pattern']) {
      const tLen = String(finalValues['text']).length;
      const pLen = String(finalValues['pattern']).length;
      if (pLen > tLen) {
        newErrors['pattern'] = "Pattern cannot be longer than the Text.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRun(finalValues);
  };

  // -- SMART RANDOMIZER BASED ON PARAMETER RULES --
  const handleRandomize = (def: InputDefinition) => {
    if (errors[def.id]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[def.id];
        return copy;
      });
    }

    if (def.type === 'array') {
      const min = def.constraints?.min ?? 1;
      const max = def.constraints?.max ?? 99;
      const minLength = def.constraints?.minLength ?? 4;
      const maxLength = def.constraints?.maxLength ?? 10;
      
      const len = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      const isNumberArray = Array.isArray(def.defaultValue) && typeof def.defaultValue[0] === 'number';

      if (isNumberArray) {
        const arr = Array.from(
          { length: len }, 
          () => Math.floor(Math.random() * (max - min + 1)) + min
        );
        setFormValues(prev => ({ ...prev, [def.id]: arr.join(', ') }));
      } else {
        // String/char array (e.g. for operations)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const arr = Array.from(
          { length: len }, 
          () => chars.charAt(Math.floor(Math.random() * chars.length))
        );
        setFormValues(prev => ({ ...prev, [def.id]: arr.join(', ') }));
      }
    }
    
    if (def.type === 'integer') {
      const min = def.constraints?.min ?? 1;
      const max = def.constraints?.max ?? 99;
      const val = Math.floor(Math.random() * (max - min + 1)) + min;
      setFormValues(prev => ({ ...prev, [def.id]: String(val) }));
    }

    if (def.type === 'string') {
      const minLength = def.constraints?.minLength ?? 4;
      const maxLength = def.constraints?.maxLength ?? 14;
      const len = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

      // Use a limited character set for string match so matches occur frequently
      const chars = "ABCD";
      let str = "";
      for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormValues(prev => ({ ...prev, [def.id]: str }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl w-full max-w-md overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Configure Inputs</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-50 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {inputs.map((def) => {
            const hasError = !!errors[def.id];
            return (
              <div key={def.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {def.label}
                  </label>
                  <button 
                    type="button"
                    onClick={() => handleRandomize(def)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 active:scale-95"
                  >
                    <RefreshCw size={10} className="shrink-0" />
                    Randomize
                  </button>
                </div>
                
                {/* Array Input Field */}
                {def.type === 'array' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formValues[def.id] || ''}
                      onChange={(e) => handleChange(def.id, e.target.value)}
                      className={cn(
                        "w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
                        hasError ? "border-red-400 focus:ring-red-100 focus:border-red-500" : "border-slate-200"
                      )}
                      placeholder="e.g. 5, 12, 8, 1"
                      autoFocus={def.id === 'arr'} 
                    />
                    <div className="mt-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      Comma separated values
                    </div>
                  </div>
                )}

                {/* Integer Input Field */}
                {def.type === 'integer' && (
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues[def.id] || ''}
                      onChange={(e) => handleChange(def.id, e.target.value)}
                      className={cn(
                        "w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
                        hasError ? "border-red-400 focus:ring-red-100 focus:border-red-500" : "border-slate-200"
                      )}
                      placeholder="e.g. 42"
                    />
                  </div>
                )}

                {/* String Input Field */}
                {def.type === 'string' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={formValues[def.id] || ''}
                      onChange={(e) => handleChange(def.id, e.target.value)}
                      className={cn(
                        "w-full bg-slate-50 border rounded-lg px-3.5 py-2.5 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all",
                        hasError ? "border-red-400 focus:ring-red-100 focus:border-red-500" : "border-slate-200"
                      )}
                      placeholder="Enter string value..."
                    />
                  </div>
                )}

                {/* Error Banner Message */}
                {hasError && (
                  <div className="text-[10px] font-semibold text-red-500 tracking-tight animate-fade-in">
                    ⚠️ {errors[def.id]}
                  </div>
                )}

              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 text-xs">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-400 hover:text-slate-700 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Play size={12} fill="currentColor" className="shrink-0" />
              Load & Run
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};