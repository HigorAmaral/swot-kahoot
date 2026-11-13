import React from 'react';
import { Question } from '../data/questions';
import { Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onProceedToDispute: () => void;
  onOpenCaseModal: () => void;
}

export const QuestionIntroBanner: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  onProceedToDispute,
  onOpenCaseModal,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] w-full max-w-4xl mx-auto p-4 animate-fade-in text-center">
      {/* Question Counter Pill */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600/80 border border-purple-400 text-purple-200 font-extrabold text-sm uppercase tracking-wider mb-6 shadow-xl animate-bounce">
        <Sparkles className="w-4 h-4 fill-current text-yellow-300" />
        Pergunta #{questionIndex + 1} de {totalQuestions}
      </div>

      {/* Category Box */}
      <div className="w-full bg-slate-800/90 border-2 border-purple-500/50 rounded-3xl p-8 md:p-10 shadow-2xl mb-8 flex flex-col items-center">
        <span className="text-xs font-black uppercase text-purple-400 tracking-widest mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Eixo Temático & Quadrante
        </span>

        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-4">
          {question.category}
        </h2>

        {question.swotQuadrant && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-bold text-sm mb-4">
            Matriz SWOT: {question.swotQuadrant}
          </div>
        )}

        <p className="text-slate-300 text-base max-w-xl mx-auto italic">
          "{question.caseRelation}"
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onOpenCaseModal}
          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm transition flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Revisar Estudo de Caso
        </button>

        <button
          onClick={onProceedToDispute}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:brightness-110 text-white font-black text-xl shadow-2xl transition transform active:scale-95 flex items-center gap-3 animate-pulse"
        >
          <span>Ir para a Disputa da Rodada!</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
