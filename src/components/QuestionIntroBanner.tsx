import React from 'react';
import { Question } from '../data/questions';
import { Team, UserAccount } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Layers, Users, CheckCircle2 } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  teams: Team[];
  currentUser: UserAccount;
  onJoinTeam: (teamId: number) => void;
  onProceedToQuestion: () => void;
  onBack: () => void;
}

export const QuestionIntroBanner: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  teams,
  currentUser,
  onJoinTeam,
  onProceedToQuestion,
  onBack,
}) => {
  const userTeam = teams.find(t =>
    t.participants.some(p => p.name.toLowerCase() === currentUser.displayName.toLowerCase())
  );
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] w-full max-w-4xl mx-auto p-2.5 sm:p-4 animate-fade-in text-center">
      {/* Question Counter Pill */}
      <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-4 sm:mb-6 shadow-xl">
        <Sparkles className="w-4 h-4 fill-current text-cyan-300" />
        Pergunta #{questionIndex + 1} de {totalQuestions}
      </div>

      {/* Category Box */}
      <div className="w-full glass-card border-2 border-cyan-500/30 rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl mb-5 sm:mb-8 flex flex-col items-center">
        <span className="text-xs font-black uppercase text-cyan-400 tracking-widest mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Tema da Rodada
        </span>

        <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4">
          {question.category}
        </h2>

        {question.swotQuadrant && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 font-bold text-xs sm:text-sm">
            {question.swotQuadrant}
          </div>
        )}
      </div>

      {/* Entrar em um Grupo durante o Quiz */}
      <div className="w-full glass-card border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 mb-5 sm:mb-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {userTeam
              ? `Você está participando no: ${userTeam.name}`
              : 'Entrar em um Grupo para participar deste Quiz:'}
          </span>
          <span className="text-[11px] text-slate-400 font-bold">
            {currentUser.avatar} {currentUser.displayName}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {teams.map(t => {
            const isMember = userTeam?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onJoinTeam(t.id)}
                className={`px-3 py-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                  isMember
                    ? `${t.bgClass} text-white border-white ring-2 ring-white/40 shadow`
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {isMember && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{t.name}</span>
              </button>
            );
          })}
        </div>
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
