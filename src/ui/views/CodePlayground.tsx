import React, { useState } from 'react';
import { Edit2, Check } from 'lucide-react';
import { cn } from '@utils/cn';

interface CodePlaygroundProps {
  pseudocode: string[];
  activeLine?: number;
  onCodeMutation?: (mutatedCode: string) => void;
}

type Language = 'pseudocode' | 'javascript' | 'python' | 'cpp' | 'java';

const translatePseudocodeLine = (line: string, lang: Language): string => {
  if (lang === 'pseudocode') return line;
  
  const trimmed = line.trim();
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
    let jsLine = trimmed.replace(/length\((\w+)\)/g, '$1.length');
    jsLine = jsLine.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, '[$1, $2] = [$2, $1]');
    if (jsLine.startsWith('return ') && !jsLine.endsWith(';')) {
      jsLine = jsLine + ';';
    }
    return indent + jsLine;
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
    let pyLine = trimmed.replace(/length\((\w+)\)/g, 'len($1)');
    pyLine = pyLine.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, '$1, $2 = $2, $1');
    return indent + pyLine;
  }
  
  if (lang === 'cpp') {
    if (trimmed.startsWith('function ')) {
      const sig = trimmed.substring(9).replace(/:$/, ' {');
      if (sig.includes('Sort') || sig.includes('search') || sig.includes('find')) {
        return indent + `void ${sig}`;
      }
      return indent + `auto ${sig}`;
    }
    const match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
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
    let cppLine = trimmed.replace(/length\((\w+)\)/g, '$1.size()');
    cppLine = cppLine.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, 'std::swap($1, $2);');
    if (!cppLine.endsWith('{') && !cppLine.endsWith('}') && !cppLine.endsWith(':') && !cppLine.endsWith(';')) {
      cppLine = cppLine + ';';
    }
    return indent + cppLine;
  }
  
  if (lang === 'java') {
    if (trimmed.startsWith('function ')) {
      const sig = trimmed.substring(9).replace(/:$/, ' {');
      return indent + `public static void ${sig}`;
    }
    const match = trimmed.match(/for\s+(\w+)\s+from\s+([^\s:]+)\s+to\s+([^\s:]+):/);
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
    let javaLine = trimmed.replace(/length\((\w+)\)/g, '$1.length');
    javaLine = javaLine.replace(/swap\((\w+\[\w+\]),\s*(\w+\[\w+\])\)/g, 'swap($1, $2);');
    if (!javaLine.endsWith('{') && !javaLine.endsWith('}') && !javaLine.endsWith(':') && !javaLine.endsWith(';')) {
      javaLine = javaLine + ';';
    }
    return indent + javaLine;
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
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col h-[385px] overflow-hidden font-sans">
      
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
          {(['pseudocode', 'javascript', 'python', 'cpp', 'java'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => {
                setSelectedLang(lang);
                setIsEditing(false);
              }}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-md uppercase transition",
                selectedLang === lang 
                  ? "bg-white text-slate-950 shadow-xs" 
                  : "text-slate-400 hover:text-slate-800"
              )}
            >
              {lang === 'cpp' ? 'C++' : lang}
            </button>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 text-[10px] font-semibold">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#34c759] text-white rounded-lg transition"
              >
                <Check size={12} />
                Save & Run
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditToggle}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition duration-200",
                isSaved 
                  ? "bg-[#34c759]/10 border-[#34c759]/20 text-[#34c759]" 
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-850"
              )}
            >
              <Edit2 size={12} />
              {isSaved ? 'Hot-Reloaded!' : 'Edit Code'}
            </button>
          )}
        </div>
      </div>

      {/* Code Textarea / Viewer */}
      <div className="flex-1 overflow-hidden relative">
        {isEditing ? (
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="w-full h-full bg-slate-50/50 border border-slate-200 p-4 rounded-lg font-mono text-xs text-slate-800 outline-none focus:border-slate-300 resize-none overflow-y-auto"
            placeholder="Edit pseudocode..."
          />
        ) : (
          <div className="w-full h-full overflow-y-auto font-mono text-xs text-slate-700 space-y-0.5 pr-2 scrollbar-thin">
            {translatedLines.map((line, idx) => {
              const isActive = activeLine === (idx + 1);
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "px-3 py-1 rounded-md transition border flex items-start gap-3",
                    isActive 
                      ? "bg-blue-50/70 text-[#0071e3] border-blue-100" 
                      : "text-slate-500 border-transparent hover:text-slate-900"
                  )}
                >
                  <span className="w-5 text-slate-300 select-none text-right font-medium text-[10px] pt-0.5">{idx + 1}</span>
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
