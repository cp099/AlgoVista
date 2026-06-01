import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { cn } from '@utils/cn';

interface CodePlaygroundProps {
  pseudocode: string[];
  activeLine?: number;
  onCodeMutation?: (mutatedCode: string) => void;
}

type Language = 'pseudocode' | 'javascript' | 'python' | 'cpp' | 'java';

export const translatePseudocodeLine = (line: string, lang: Language): string => {
  if (lang === 'pseudocode') return line;
  
  let trimmed = line.trim();
  const indent = line.substring(0, line.length - trimmed.length);
  
  if (trimmed === '') return '';

  if (lang === 'javascript') {
    if (trimmed.startsWith('function ')) {
      return indent + trimmed.replace(/:$/, ' {');
    }
    let match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
    if (match) {
      const [, varName, start, end] = match;
      return indent + `for (let ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {`;
    }
    match = trimmed.match(/for\s+each\s+(\w+)\s+in\s+([^\s:]+):/);
    if (match) {
      const [, val, arr] = match;
      return indent + `for (const ${val} of ${arr}) {`;
    }
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      return indent + `if (${trimmed.substring(3, trimmed.length - 1).trim()}) {`;
    }
    if (trimmed.startsWith('else if ') && trimmed.endsWith(':')) {
      return indent + `} else if (${trimmed.substring(8, trimmed.length - 1).trim()}) {`;
    }
    if (trimmed === 'else:') {
      return indent + '} else {';
    }
    if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
      return indent + `while (${trimmed.substring(6, trimmed.length - 1).trim()}) {`;
    }
    trimmed = trimmed.replace(/length\((\w+)\)/g, '$1.length');
    trimmed = trimmed.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, '[$1, $2] = [$2, $1]');
    if (trimmed.startsWith('return ') && !trimmed.endsWith(';')) {
      trimmed = trimmed + ';';
    }
    return indent + trimmed;
  }
  
  if (lang === 'python') {
    if (trimmed.startsWith('function ')) {
      return indent + 'def ' + trimmed.substring(9).replace(/\s+/g, '').replace(/([a-zA-Z0-9_]+)\((.*)\):?/, (_, name, args) => {
        const snakeName = name.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
        return `${snakeName}(${args}):`;
      });
    }
    let match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
    if (match) {
      const [, varName, start, end] = match;
      return indent + `for ${varName} in range(${start}, ${end} + 1):`;
    }
    match = trimmed.match(/for\s+each\s+(\w+)\s+in\s+([^\s:]+):/);
    if (match) {
      const [, val, arr] = match;
      return indent + `for ${val} in ${arr}:`;
    }
    trimmed = trimmed.replace(/length\((\w+)\)/g, 'len($1)');
    trimmed = trimmed.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, '$1, $2 = $2, $1');
    return indent + trimmed;
  }
  
  if (lang === 'cpp') {
    if (trimmed.startsWith('function ')) {
      const sig = trimmed.substring(9).replace(/:$/, ' {');
      if (sig.includes('Sort') || sig.includes('search') || sig.includes('find')) {
        return indent + `void ${sig}`;
      }
      return indent + `auto ${sig}`;
    }
    let match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
    if (match) {
      const [, varName, start, end] = match;
      return indent + `for (int ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {`;
    }
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      return indent + `if (${trimmed.substring(3, trimmed.length - 1).trim()}) {`;
    }
    if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
      return indent + `while (${trimmed.substring(6, trimmed.length - 1).trim()}) {`;
    }
    trimmed = trimmed.replace(/length\((\w+)\)/g, '$1.size()');
    trimmed = trimmed.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, 'std::swap($1, $2);');
    if (!trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(':') && !trimmed.endsWith(';')) {
      trimmed = trimmed + ';';
    }
    return indent + trimmed;
  }

  if (lang === 'java') {
    if (trimmed.startsWith('function ')) {
      const sig = trimmed.substring(9).replace(/:$/, ' {');
      return indent + `public static void ${sig}`;
    }
    let match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
    if (match) {
      const [, varName, start, end] = match;
      return indent + `for (int ${varName} = ${start}; ${varName} <= ${end}; ${varName}++) {`;
    }
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      return indent + `if (${trimmed.substring(3, trimmed.length - 1).trim()}) {`;
    }
    if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
      return indent + `while (${trimmed.substring(6, trimmed.length - 1).trim()}) {`;
    }
    trimmed = trimmed.replace(/length\((\w+)\)/g, '$1.length');
    trimmed = trimmed.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, 'swap($1, $2);');
    if (!trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(':') && !trimmed.endsWith(';')) {
      trimmed = trimmed + ';';
    }
    return indent + trimmed;
  }

  return line;
};

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ 
  pseudocode, 
  activeLine, 
  onCodeMutation 
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>('pseudocode');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  // Translate code into the selected language
  const getTranslatedCode = () => {
    return pseudocode.map(line => translatePseudocodeLine(line, selectedLang));
  };

  const translatedLines = getTranslatedCode();

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedCode(translatedLines.join('\n'));
      setIsEditing(true);
      setIsSaved(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setIsEditing(false);
    if (onCodeMutation) {
      onCodeMutation(editedCode);
    }
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="glass-panel border border-algo-border rounded-2xl p-5 shadow-lg flex flex-col h-[380px] overflow-hidden">
      
      {/* TABS HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-algo-border/30 pb-3 mb-3">
        <div className="flex flex-wrap gap-1 bg-algo-bg/50 p-1 rounded-xl border border-algo-border/40">
          {(['pseudocode', 'javascript', 'python', 'cpp', 'java'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLang(lang);
                setIsEditing(false);
              }}
              className={cn(
                "px-2.5 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all duration-300",
                selectedLang === lang 
                  ? "bg-algo-primary text-white shadow-md shadow-algo-primary/10" 
                  : "text-algo-muted hover:text-algo-text hover:bg-algo-surface-hover"
              )}
            >
              {lang === 'cpp' ? 'C++' : lang}
            </button>
          ))}
        </div>
        
        {/* EDIT STATE ACTIONS */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-algo-success hover:bg-algo-success/90 text-white text-[10px] font-bold rounded-lg shadow-sm transition"
              >
                <Check size={12} />
                Save & Run
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-algo-surface hover:bg-algo-surface-hover border border-algo-border text-[10px] font-bold rounded-lg text-algo-muted transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditToggle}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-algo-border transition duration-300",
                isSaved 
                  ? "bg-algo-success/15 border-algo-success text-algo-success animate-pulse" 
                  : "bg-algo-surface hover:bg-algo-surface-hover text-algo-muted hover:text-algo-text"
              )}
            >
              <Edit2 size={12} />
              {isSaved ? 'Hot-Reloaded!' : 'Edit Code'}
            </button>
          )}
        </div>
      </div>

      {/* CODE DISPLAY AREA */}
      <div className="flex-1 overflow-hidden relative">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-full bg-algo-bg/50 border border-algo-border/40 p-4 rounded-xl font-mono text-xs text-algo-text outline-none focus:ring-2 focus:ring-algo-primary/50 resize-none overflow-y-auto"
            placeholder="Edit your custom algorithm implementation..."
          />
        ) : (
          <div className="w-full h-full overflow-y-auto font-mono text-xs text-algo-text space-y-1 pr-2 scrollbar-thin scrollbar-thumb-algo-border scrollbar-track-transparent">
            {translatedLines.map((line, idx) => {
              const isActive = activeLine === (idx + 1);
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all duration-150 border flex items-start gap-3",
                    isActive 
                      ? "bg-algo-primary/10 text-algo-primary border-algo-primary/30 shadow-sm" 
                      : "text-algo-muted border-transparent hover:text-algo-text"
                  )}
                >
                  <span className="w-6 text-algo-muted/40 select-none text-right font-bold text-[10px] pt-0.5">{idx + 1}</span>
                  <pre className="whitespace-pre-wrap font-mono font-medium">{line}</pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
