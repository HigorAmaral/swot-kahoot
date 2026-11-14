import React, { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { Team, DisputeMode } from '../types';
import { sound } from '../utils/sound';
import { Sparkles, ArrowRight, ArrowLeft, Layers, Dices, Gamepad2 } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  teams?: Team[];
  isTiebreaker?: boolean;
  disputeMode?: DisputeMode;
  onProceedToQuestion: (chosenTeamId?: number) => void;
  onBack: () => void;
}

export const QuestionIntroBanner: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  teams = [],
  isTiebreaker = false,
  disputeMode = 'direto',
  onProceedToQuestion,
  onBack,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spunTeam, setSpunTeam] = useState<Team | null>(null);
  const [spunParticipant, setSpunParticipant] = useState<string | null>(null);
  const isFinalDouble = !isTiebreaker && totalQuestions > 1 && questionIndex === totalQuestions - 1;

  // Presenter PC Keyboard shortcuts: Enter, Space, or ArrowRight to proceed
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isSpinning) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        onProceedToQuestion(spunTeam?.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSpinning, onProceedToQuestion, spunTeam?.id]);

  const disputeBadgeLabel =
    disputeMode === 'peao'
      ? '🌀 Mini-Game Ativo: Arena de Piões'
      : disputeMode === 'buzzer'
      ? '⚡ Mini-Game Ativo: Buzzer de Reflexo'
      : disputeMode === 'alvo'
      ? '🎯 Mini-Game Ativo: Tiro ao Alvo'
      : null;

  const handleSpinRoulette = () => {
    if (isSpinning || teams.length === 0) return;
    setIsSpinning(true);
    setSpunParticipant(null);
    sound.playSpinSound();

    let ticks = 0;
    const totalTicks = 10;
    const interval = window.setInterval(() => {
      const randTeam = teams[Math.floor(Math.random() * teams.length)];
      setSpunTeam(randTeam);
      ticks++;
      if (ticks >= totalTicks) {
        window.clearInterval(interval);
        const winner = teams[Math.floor(Math.random() * teams.length)];
        setSpunTeam(winner);
        if (winner.participants.length > 0) {
          const randP = winner.participants[Math.floor(Math.random() * winner.participants.length)];
          setSpunParticipant(`${randP.avatar} ${randP.name}`);
        }
        sound.playCandyChime();
        setIsSpinning(false);
      }
    }, 75);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] w-full max-w-5xl mx-auto p-2.5 sm:p-4 lg:p-6 animate-fade-in text-center">
      {/* Question Counter Pill */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl">
          <Sparkles className="w-4 h-4 fill-current text-cyan-300" />
          {isTiebreaker ? '⚡ Rodada Morte Súbita' : `Pergunta #${questionIndex + 1} de ${totalQuestions}`}
        </div>
        {isFinalDouble && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/25 border border-amber-400 text-amber-200 font-black text-xs sm:text-sm uppercase tracking-wider animate-pulse">
            🔥 Pontos em Dobro (2x)!
          </div>
        )}
        {disputeBadgeLabel && !spunTeam && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
            <Gamepad2 className="w-4 h-4 text-purple-300" />
            {disputeBadgeLabel}
          </div>
        )}
      </div>

      {/* Category Box */}
      <div className="relative overflow-hidden w-full glass-card border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-9 md:p-12 lg:p-14 shadow-2xl mb-5 sm:mb-6 flex flex-col items-center">
        <div className="pointer-events-none hidden lg:block absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <span className="relative z-10 text-xs font-black uppercase text-cyan-400 tracking-widest mb-2.5 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Tema da Rodada
        </span>

        <h2 className="relative z-10 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4 text-glow">
          {question.category}
        </h2>

        {question.swotQuadrant && (
          <div className="relative z-10 inline-block px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-emerald-300 font-bold text-xs sm:text-sm">
            {question.swotQuadrant}
          </div>
        )}

        {/* Desktop Teams Quick Status Strip */}
        {teams.length > 0 && (
          <div className="relative z-10 hidden sm:flex flex-wrap items-center justify-center gap-2.5 mt-6 pt-5 border-t border-slate-800/80 w-full">
            {teams.map(t => (
              <div
                key={t.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.bgClass}`} />
                <span className="font-bold text-slate-200">{t.name}</span>
                <span className="font-mono font-black text-emerald-400">{t.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roulette Result Banner */}
      {spunTeam && (
        <div className={`mb-5 px-5 py-3 rounded-2xl border-2 border-white/30 shadow-xl flex flex-wrap items-center justify-center gap-2 transition-all ${spunTeam.bgClass} ${isSpinning ? 'scale-105 animate-pulse' : 'scale-100'}`}>
          <Dices className="w-5 h-5 text-white shrink-0" />
          <span className="text-sm sm:text-base font-black text-white">
            {isSpinning ? 'Sorteando...' : `Sorteado: ${spunTeam.name}`}
          </span>
          {!isSpinning && spunParticipant && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/30 text-xs font-bold text-amber-200">
              🎯 {spunParticipant}
            </span>
          )}
        </div>
      )}

      {/* Main Proceed, Roulette & Back Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="px-5 py-3.5 sm:py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-extrabold text-sm sm:text-lg shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {teams.length > 0 && (
          <button
            type="button"
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="px-5 py-3.5 sm:py-4 rounded-2xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/50 text-purple-200 font-extrabold text-sm sm:text-lg shadow-lg transition active:scale-95 flex items-center gap-2 disabled:opacity-60"
            title="Sortear aleatoriamente qual grupo e participante responde"
          >
            <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Sorteando...' : 'Sortear Grupo'}</span>
          </button>
        )}

        <button
          onClick={() => onProceedToQuestion(spunTeam?.id)}
          className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-base sm:text-xl shadow-2xl shadow-emerald-500/25 transition transform active:scale-95 flex items-center gap-3"
        >
          <span>
            {disputeMode !== 'direto' && !spunTeam
              ? `Disputar Vez (Mini-Game) #${questionIndex + 1}`
              : `Ir para a Pergunta #${questionIndex + 1}`}
          </span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      <p className="hidden md:block mt-3 text-[11px] text-slate-400 font-semibold">
        Atalho no PC: pressione <strong className="text-slate-200">Espaço</strong>, <strong className="text-slate-200">Enter</strong> ou <strong className="text-slate-200">→</strong> para avançar
      </p>
    </div>
  );
};
