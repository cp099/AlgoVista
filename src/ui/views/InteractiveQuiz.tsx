import React, { useState } from 'react';
import { HelpCircle, Award, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
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
      // Correct answer sound trigger or callback
      onCorrect();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-6 animate-fade-in">
      <div className="glass-panel border border-algo-border rounded-2xl p-6 shadow-2xl w-full max-w-lg flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-algo-border/30 pb-3">
          <div className="p-2 bg-algo-primary/10 rounded-xl text-algo-primary">
            <HelpCircle size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-algo-muted uppercase tracking-widest">Active Recall Quiz</h4>
            <h3 className="text-sm font-bold text-algo-text">Socratic Checkpoint</h3>
          </div>
        </div>

        {/* Question Text */}
        <div className="text-sm font-bold text-algo-text leading-relaxed">
          {question.question}
        </div>

        {/* Options Grid */}
        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrectOption = idx === question.correctIndex;
            
            let btnClass = "border-algo-border bg-algo-bg/50 hover:bg-algo-surface-hover hover:border-algo-muted text-algo-text";
            let iconElement = null;

            if (isAnswered) {
              if (isCorrectOption) {
                btnClass = "border-algo-success bg-algo-success/15 text-algo-success font-semibold shadow-inner";
                iconElement = <CheckCircle2 size={16} className="text-algo-success shrink-0" />;
              } else if (isSelected) {
                btnClass = "border-red-500 bg-red-500/10 text-red-500 font-semibold";
                iconElement = <XCircle size={16} className="text-red-500 shrink-0" />;
              } else {
                btnClass = "opacity-40 border-algo-border text-algo-muted";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(idx)}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 transition-all duration-300 active:scale-[0.99]",
                  btnClass
                )}
              >
                <span>{opt}</span>
                {iconElement}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isAnswered && (
          <div className={cn(
            "p-4 rounded-xl text-xs space-y-1.5 transition-all duration-300 animate-fade-in border",
            isCorrect 
              ? "bg-algo-success/10 border-algo-success/20 text-algo-success" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          )}>
            <div className="font-extrabold flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <Award size={14} className="animate-bounce" />
                  Correct! Well done.
                </>
              ) : (
                <>
                  <XCircle size={14} />
                  Incorrect answer. Try reviewing the explanation:
                </>
              )}
            </div>
            <p className="opacity-90 leading-relaxed font-medium">{question.explanation}</p>
          </div>
        )}

        {/* Continue Button */}
        {isAnswered && (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-algo-primary hover:bg-algo-primary/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-algo-primary/20 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <span>Continue Step-by-Step</span>
            <ChevronRight size={14} />
          </button>
        )}

      </div>
    </div>
  );
};
