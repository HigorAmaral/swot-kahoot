import React from 'react';
import { Question } from '../data/questions';
import { Sparkles, ArrowRight, BookOpen, Layers, RotateCw } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onProceedToQuestion: () => void;
  onProceedToDispute: () => void;
  onOpenCaseModal: () => void;
}

export const QuestionIntroBanner: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  onProceedToQuestion,
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
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={onOpenCaseModal}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs sm:text-sm transition flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Revisar Estudo de Caso
        </button>

        <button
          onClick={onProceedToQuestion}
          className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-lg sm:text-xl shadow-2xl transition transform active:scale-95 flex items-center gap-3 animate-pulse"
        >
          <span>Ir para a Pergunta #{questionIndex + 1}</span>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={onProceedToDispute}
          className="px-4 py-3 rounded-2xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs transition flex items-center gap-1.5"
          title="Se a turma quiser usar a disputa do peão"
        >
          <RotateCw className="w-3.5 h-3.5 text-purple-400" />
          <span>Rodar Peão (Opcional)</span>
        </button>
      </div>
    </div>
  );
};
