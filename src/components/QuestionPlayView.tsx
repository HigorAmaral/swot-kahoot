import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '../data/questions';
import { Team, GamePlayMode } from '../types';
import { sound } from '../utils/sound';
import { FastForward, Sparkles, Clock, Zap, Shield } from 'lucide-react';

interface PowerUpsUsedInRound {
  usedFiftyFifty?: boolean;
  doublePoints?: boolean;
  shield?: boolean;
}

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  questionDuration: number;
  answeringTeam: Team;
  disputeWinnerTeam: Team;
  isPassed: boolean;
  gameMode?: GamePlayMode;
  isTiebreaker?: boolean;
  onAnswerSelected: (selectedIndex: number, timeLeft: number, powerUps?: PowerUpsUsedInRound) => void;
  allTeams?: Team[];
  onSelectAnsweringTeam?: (teamId: number) => void;
}

export const QuestionPlayView: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  questionDuration,
  answeringTeam,
  disputeWinnerTeam,
  isPassed,
  gameMode = 'turno',
  isTiebreaker = false,
  onAnswerSelected,
  allTeams,
  onSelectAnsweringTeam,
}) => {
  const [timeLeft, setTimeLeft] = useState(questionDuration || 30);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedDoublePoints, setUsedDoublePoints] = useState(false);
  const [usedShield, setUsedShield] = useState(false);
  const [usedExtraTime, setUsedExtraTime] = useState(false);

  const teamPowerUps = answeringTeam.powerUpsUsed || {};
  const isFinalDouble = !isTiebreaker && totalQuestions > 1 && questionIndex === totalQuestions - 1;

  useEffect(() => {
    setTimeLeft(questionDuration || 30);
    setSelectedOption(null);
    setEliminatedIndices([]);
    setUsedFiftyFifty(false);
    setUsedDoublePoints(false);
    setUsedShield(false);
    setUsedExtraTime(false);
  }, [question.id, questionDuration]);

  const handleSelect = useCallback((idx: number) => {
    if (selectedOption !== null || eliminatedIndices.includes(idx)) return;
    setSelectedOption(idx);
    sound.playTone(550, 0.15, 'sine', 0.2);
    // Short delay for visual selection feedback before handing to verdict
    setTimeout(() => {
      onAnswerSelected(idx, timeLeft, {
        usedFiftyFifty,
        doublePoints: usedDoublePoints,
        shield: usedShield,
      });
    }, 600);
  }, [selectedOption, eliminatedIndices, onAnswerSelected, timeLeft, usedFiftyFifty, usedDoublePoints, usedShield]);

  const handleFiftyFifty = () => {
    if (teamPowerUps.fiftyFifty || usedFiftyFifty || selectedOption !== null) return;
    const wrongIndices = question.options
      .map((_, i) => i)
      .filter(i => i !== question.correctIndex);
    const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedIndices(shuffled);
    setUsedFiftyFifty(true);
    sound.playTone(620, 0.12, 'triangle', 0.18);
  };

  const handleDoublePoints = () => {
    if (teamPowerUps.doublePoints || usedDoublePoints || selectedOption !== null) return;
    setUsedDoublePoints(true);
    sound.playCandyChime();
  };

  const handleShield = () => {
    if (teamPowerUps.shield || usedShield || selectedOption !== null) return;
    setUsedShield(true);
    sound.playTone(520, 0.14, 'sine', 0.2);
  };

  const handleExtraTime = () => {
    if (usedExtraTime || selectedOption !== null) return;
    setTimeLeft(prev => prev + 10);
    setUsedExtraTime(true);
    sound.playCandyChime();
  };

  // Keyboard shortcuts: 1-4 or A-D to answer
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const key = e.key.toLowerCase();
      const map: Record<string, number> = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2, '4': 3, d: 3 };
      if (key in map) {
        const idx = map[key];
        if (idx < question.options.length) {
          e.preventDefault();
          handleSelect(idx);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSelect, question.options.length]);

  // Timer countdown
  useEffect(() => {
    if (selectedOption !== null) return;

    if (timeLeft <= 0) {
      // Time is up! Select -1 (timeout)
      onAnswerSelected(-1, 0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 5 && next > 0) {
          sound.playTick(true);
        } else if (next > 5) {
          sound.playTick(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selectedOption, onAnswerSelected]);

  const progressPercent = Math.round(((questionIndex + 1) / Math.max(totalQuestions, 1)) * 100);
  const maxDuration = Math.max(questionDuration || 30, timeLeft);
  const timePercent = Math.max(0, Math.min(100, Math.round((timeLeft / maxDuration) * 100)));
  const speedBonusPreview = Math.min(500, Math.max(0, timeLeft * 15));

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-150px)] w-full max-w-7xl mx-auto p-2.5 sm:p-4 lg:p-6 xl:p-8 animate-fade-in">
      {/* Progress Bar */}
      <div className="w-full mb-3">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-slate-400 mb-1.5 px-1">
          <span>PERGUNTA {questionIndex + 1} DE {totalQuestions}</span>
          <span className="text-emerald-400">{progressPercent}% concluído</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900/90 border border-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Top Bar: Category & Timer Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 lg:bg-slate-900/60 lg:border lg:border-slate-800/80 lg:p-2.5 lg:rounded-2xl">
        {/* Category & Theme Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-sm">
            {question.category}
          </span>
          {question.swotQuadrant && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-xl text-xs font-bold bg-slate-800/90 text-cyan-300 border border-cyan-500/40">
              {question.swotQuadrant}
            </span>
          )}
        </div>

        {/* Turn Indicator */}
        <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 shadow-md">
          <span className="text-xs text-slate-400 font-semibold">Vez:</span>
          {allTeams && onSelectAnsweringTeam ? (
            <div className="flex items-center gap-1">
              {allTeams.map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelectAnsweringTeam(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                    answeringTeam.id === t.id
                      ? `${t.bgClass} text-white ring-2 ring-white scale-105 shadow`
                      : 'bg-slate-900/80 text-slate-400 hover:text-white'
                  }`}
                  title={`Passar a vez para ${t.name}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black text-white ${answeringTeam.bgClass}`}>
              {answeringTeam.name}
            </span>
          )}
          {answeringTeam.participants.length > 0 && (
            <span className="text-xs font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
              <span>{answeringTeam.participants[(question.id - 1) % answeringTeam.participants.length].avatar}</span>
              <span>{answeringTeam.participants[(question.id - 1) % answeringTeam.participants.length].name}</span>
            </span>
          )}
          {isPassed && (
            <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
              (Passada por {disputeWinnerTeam.name})
            </span>
          )}
          {(answeringTeam.streak || 0) >= 2 && (
            <span className="text-[10px] font-black text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-400/40 animate-pulse">
              🔥 Combo x{answeringTeam.streak}
            </span>
          )}
          {gameMode === 'todos' && (
            <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-400/40">
              Todos Respondem
            </span>
          )}
        </div>

        {/* Controls: Power-Ups & Reveal */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleFiftyFifty}
            disabled={teamPowerUps.fiftyFifty || usedFiftyFifty || selectedOption !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition ${
              teamPowerUps.fiftyFifty || usedFiftyFifty
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-purple-600/25 hover:bg-purple-600/40 border-purple-400/50 text-purple-200'
            }`}
            title="Power-Up (1x por equipe): Eliminar 2 alternativas incorretas (50:50)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>50:50</span>
          </button>
          <button
            onClick={handleDoublePoints}
            disabled={teamPowerUps.doublePoints || usedDoublePoints || selectedOption !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition ${
              usedDoublePoints
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
                : teamPowerUps.doublePoints
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/50 text-amber-200'
            }`}
            title="Power-Up (1x por equipe): Dobrar pontos desta pergunta (2x)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{usedDoublePoints ? '2x ATIVO' : '2x'}</span>
          </button>
          <button
            onClick={handleShield}
            disabled={teamPowerUps.shield || usedShield || selectedOption !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition ${
              usedShield
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg'
                : teamPowerUps.shield
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-500/20 hover:bg-cyan-500/35 border-cyan-400/50 text-cyan-200'
            }`}
            title="Power-Up (1x por equipe): Escudo protege o combo se errar"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{usedShield ? 'ESCUDO' : 'Escudo'}</span>
          </button>
          <button
            onClick={handleExtraTime}
            disabled={usedExtraTime || selectedOption !== null}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition ${
              usedExtraTime
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-600/25 hover:bg-emerald-600/40 border-emerald-400/50 text-emerald-200'
            }`}
            title="Adicionar +10 segundos ao cronômetro"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>
          <button
            onClick={() => onAnswerSelected(-1, 0, { usedFiftyFifty, doublePoints: usedDoublePoints, shield: usedShield })}
            disabled={selectedOption !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition"
            title="Encerrar tempo e revelar resposta correta"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Revelar</span>
          </button>
        </div>
      </div>

      {/* Central Question Box */}
      <div className="relative w-full glass-card border-2 border-cyan-500/30 rounded-3xl p-5 sm:p-7 md:p-9 lg:p-10 shadow-2xl text-center mt-4 mb-4 sm:mb-6 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px] lg:min-h-[210px]">
        {/* Floating Timer Circle */}
        <div className={`absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-full border-4 flex items-center justify-center font-black text-base sm:text-xl lg:text-2xl shadow-2xl transition-all z-10 ${
          timeLeft <= 5
            ? 'bg-red-600 border-red-300 text-white animate-bounce ring-4 ring-red-400/50'
            : timeLeft <= 10
            ? 'bg-amber-600 border-amber-300 text-white'
            : 'bg-slate-950 border-cyan-400 text-cyan-100 shadow-cyan-500/20'
        }`}>
          {timeLeft}
        </div>

        {(isFinalDouble || isTiebreaker) && (
          <div className={`mt-3 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
            isTiebreaker
              ? 'bg-rose-500/20 border-rose-400 text-rose-200 animate-pulse'
              : 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
          }`}>
            {isTiebreaker ? '⚡ Morte Súbita — Desempate!' : '🔥 Pergunta Final — Pontos em Dobro (2x)!'}
          </div>
        )}

        <h2 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-black text-white leading-snug tracking-tight max-w-5xl mt-3 sm:mt-2 text-glow">
          {question.question}
        </h2>

        {(question.imageUrl || question.codeSnippet) && (
          <div className="w-full max-w-4xl mt-4 flex flex-col lg:flex-row items-center justify-center gap-4">
            {question.imageUrl && (
              <img
                src={question.imageUrl}
                alt="Imagem da pergunta"
                className="max-h-56 rounded-2xl border border-slate-700 object-contain shadow-xl bg-slate-950/60 p-1"
              />
            )}

            {question.codeSnippet && (
              <pre className="w-full max-w-2xl text-left p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/30 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto shadow-inner">
                <code>{question.codeSnippet}</code>
              </pre>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2.5 text-[11px] sm:text-xs font-bold text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-amber-300">
            ⚡ Bônus de velocidade atual: +{speedBonusPreview} pts
          </span>
          <span className="hidden md:inline text-slate-400">• Atalhos no PC: teclas <strong className="text-white">1-4</strong> ou <strong className="text-white">A-D</strong></span>
        </div>

        {/* Countdown Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900/90 overflow-hidden rounded-b-3xl">
          <div
            className={`h-full transition-all duration-1000 linear ${
              timeLeft <= 5
                ? 'bg-rose-500'
                : timeLeft <= 10
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* 4 Kahoot Answer Options (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full mb-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isEliminated = eliminatedIndices.includes(idx);
          const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);

          return (
            <button
              key={idx}
              disabled={selectedOption !== null || isEliminated}
              onClick={() => handleSelect(idx)}
              className={`kahoot-option-card relative flex items-center gap-3.5 sm:gap-4 lg:gap-5 p-4 sm:p-5 md:p-6 lg:p-7 lg:min-h-[108px] rounded-2xl lg:rounded-3xl text-left font-bold text-sm sm:text-lg md:text-xl lg:text-2xl text-white transform transition-all active:scale-[0.98] ${
                opt.color
              } ${
                isEliminated
                  ? 'opacity-15 grayscale cursor-not-allowed scale-95'
                  : isSelected
                  ? 'ring-4 sm:ring-8 ring-white scale-[1.02] sm:scale-[1.03] brightness-125 z-10'
                  : selectedOption !== null
                  ? 'opacity-50'
                  : 'hover:brightness-110 hover:-translate-y-1'
              }`}
            >
              {/* Geometric Symbol (Triangle, Diamond, Circle, Square) */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-black/25 border border-white/15 flex items-center justify-center text-white shadow-inner">
                {opt.symbol === 'triangle' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,3 22,21 2,21" />
                  </svg>
                )}
                {opt.symbol === 'diamond' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,12 12,22 2,12" />
                  </svg>
                )}
                {opt.symbol === 'circle' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
                {opt.symbol === 'square' && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
              </div>

              {/* Option Text */}
              <span className={`flex-1 font-extrabold leading-snug drop-shadow ${isEliminated ? 'line-through' : ''}`}>
                {opt.text}
              </span>

              {/* Desktop Keycap Hint */}
              <span className="hidden md:inline-flex items-center justify-center px-2.5 h-8 rounded-xl bg-black/30 text-xs font-black text-white/90 border border-white/20 shrink-0 shadow-inner">
                {idx + 1} / {letter}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
