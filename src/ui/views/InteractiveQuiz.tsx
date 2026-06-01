import React, { useState } from 'react';
import { HelpCircle, Award, CheckCircle2, XCircle, ChevronRight, X } from 'lucide-react';
import { cn } from '@utils/cn';
import { QuizQuestion } from '@utils/quizRegistry';

interface InteractiveQuizProps {
  question: QuizQuestion;
  onCorrect: () => void;
  onClose: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ question, onCorrect, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    
    setSelectedIdx(idx);
    setIsAnswered(true);
    const correct = idx === question.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      onCorrect();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-40 p-4 overflow-y-auto">
      <div className="glass-panel border border-algo-border rounded-2xl p-5 shadow-2xl w-full max-w-2xl flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200 relative my-auto">
        
        {/* Skip/Close Button in top-right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-algo-muted hover:text-algo-text hover:bg-algo-surface-hover/50 transition duration-300 z-10 active:scale-95"
          title="Skip Quiz"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-algo-border/30 pb-2.5 shrink-0">
          <div className="p-1.5 bg-algo-primary/10 rounded-lg text-algo-primary">
            <HelpCircle size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-algo-muted uppercase tracking-widest">Active Recall Quiz</h4>
            <h3 className="text-xs font-bold text-algo-text">Socratic Checkpoint</h3>
          </div>
        </div>

        {/* Landscape Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start overflow-visible">
          
          {/* Left Side: Question Text & Explanation */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-xs sm:text-sm font-bold text-algo-text leading-relaxed">
              {question.question}
            </div>

            {/* Explanation box (visible after answering) */}
            {isAnswered && (
              <div className={cn(
                "p-3.5 rounded-xl text-[11px] space-y-1 transition-all duration-300 animate-fade-in border",
                isCorrect 
                  ? "bg-algo-success/10 border-algo-success/20 text-algo-success" 
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                <div className="font-black flex items-center gap-1">
                  {isCorrect ? (
                    <>
                      <Award size={12} className="animate-bounce" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <XCircle size={12} />
                      Incorrect option.
                    </>
                  )}
                </div>
                <p className="opacity-95 leading-relaxed font-semibold">{question.explanation}</p>
              </div>
            )}
          </div>

          {/* Right Side: Options & Continue Button */}
          <div className="md:col-span-5 space-y-3 w-full">
            <div className="space-y-1.5">
              {question.options.map((opt, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectOption = idx === question.correctIndex;
                
                let btnClass = "border-algo-border bg-algo-bg/50 hover:bg-algo-surface-hover hover:border-algo-muted text-algo-text";
                let iconElement = null;

                if (isAnswered) {
                  if (isCorrectOption) {
                    btnClass = "border-algo-success bg-algo-success/15 text-algo-success font-semibold shadow-inner";
                    iconElement = <CheckCircle2 size={14} className="text-algo-success shrink-0" />;
                  } else if (isSelected) {
                    btnClass = "border-red-500 bg-red-500/10 text-red-500 font-semibold";
                    iconElement = <XCircle size={14} className="text-red-500 shrink-0" />;
                  } else {
                    btnClass = "opacity-35 border-algo-border text-algo-muted";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(idx)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl border text-[11px] font-semibold flex items-center justify-between gap-2.5 transition-all duration-300 active:scale-[0.99]",
                      btnClass
                    )}
                  >
                    <span>{opt}</span>
                    {iconElement}
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            {isAnswered && (
              <button
                onClick={onClose}
                className="w-full py-2 bg-algo-primary hover:bg-algo-primary/90 text-white font-extrabold text-[11px] rounded-xl shadow-md shadow-algo-primary/10 flex items-center justify-center gap-1 transition active:scale-[0.98]"
              >
                <span>Continue Visualizer</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
