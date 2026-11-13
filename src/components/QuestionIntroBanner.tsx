import React from 'react';
import { Question } from '../data/questions';
import { Sparkles, ArrowRight, ArrowLeft, Layers } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onProceedToQuestion: () => void;
  onBack: () => void;
}

export const QuestionIntroBanner: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  onProceedToQuestion,
  onBack,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[540px] w-full max-w-4xl mx-auto p-4 animate-fade-in text-center">
      {/* Question Counter Pill */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold text-sm uppercase tracking-wider mb-6 shadow-xl">
        <Sparkles className="w-4 h-4 fill-current text-cyan-300" />
        Pergunta #{questionIndex + 1} de {totalQuestions}
      </div>

      {/* Category Box */}
      <div className="w-full glass-card border-2 border-cyan-500/30 rounded-3xl p-8 md:p-10 shadow-2xl mb-8 flex flex-col items-center">
        <span className="text-xs font-black uppercase text-cyan-400 tracking-widest mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Tema da Rodada
        </span>

        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-4">
          {question.category}
        </h2>

        {question.swotQuadrant && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 font-bold text-sm">
            {question.swotQuadrant}
          </div>
        )}
      </div>

      {/* Main Proceed & Back Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-extrabold text-base sm:text-lg shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <button
          onClick={onProceedToQuestion}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-lg sm:text-xl shadow-2xl shadow-emerald-500/25 transition transform active:scale-95 flex items-center gap-3"
        >
          <span>Ir para a Pergunta #{questionIndex + 1}</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
