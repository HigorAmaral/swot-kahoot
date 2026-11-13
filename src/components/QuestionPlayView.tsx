import React, { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Clock, ShieldCheck, HelpCircle, Pause, Play } from 'lucide-react';

interface Props {
  question: Question;
  answeringTeam: Team;
  disputeWinnerTeam: Team;
  isPassed: boolean;
  onAnswerSelected: (selectedIndex: number, timeLeft: number) => void;
  onOpenCaseModal: () => void;
}

export const QuestionPlayView: React.FC<Props> = ({
  question,
  answeringTeam,
  disputeWinnerTeam,
  isPassed,
  onAnswerSelected,
  onOpenCaseModal,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isPaused || selectedOption !== null) return;

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
  }, [timeLeft, isPaused, selectedOption, onAnswerSelected]);

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    sound.playTone(550, 0.15, 'sine', 0.2);
    // Short delay for visual selection feedback before handing to verdict
    setTimeout(() => {
      onAnswerSelected(idx, timeLeft);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[640px] w-full max-w-6xl mx-auto p-4 animate-fade-in">
      {/* Top Bar: Category, Case Study button & Timer */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Category & Theme Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600/60 border border-purple-400 text-purple-200">
            {question.category}
          </span>
          {question.swotQuadrant && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-cyan-300 border border-cyan-500/40">
              {question.swotQuadrant}
            </span>
          )}
        </div>

        {/* Turn Indicator */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-800/90 border-2 border-slate-700 shadow-md">
          <span className="text-xs text-slate-400 font-semibold">Vez de Responder:</span>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black text-white ${answeringTeam.bgClass}`}>
            {answeringTeam.name}
          </span>
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
        </div>

        {/* Controls: Case button & Timer Pause */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Consultar Estudo de Caso TI
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition"
            title={isPaused ? "Retomar Tempo" : "Pausar Tempo"}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Central Question Box */}
      <div className="relative w-full bg-slate-800/90 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl text-center mb-6 flex flex-col items-center justify-center min-h-[160px]">
        {/* Floating Timer Circle */}
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-xl shadow-2xl transition-all ${
          timeLeft <= 5
            ? 'bg-red-600 border-red-300 text-white animate-bounce ring-4 ring-red-400/50'
            : timeLeft <= 10
            ? 'bg-amber-600 border-amber-300 text-white'
            : 'bg-purple-900 border-purple-400 text-purple-100'
        }`}>
          {timeLeft}
        </div>

        <h2 className="text-xl md:text-3xl font-black text-white leading-snug tracking-tight max-w-4xl mt-2">
          {question.question}
        </h2>

        {/* Small Case hint below question */}
        <p className="text-xs text-slate-400 italic mt-3 max-w-2xl">
          💡 Contexto do Paper: "{question.caseRelation}"
        </p>
      </div>

      {/* 4 Kahoot Answer Options (2x2 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;

          return (
            <button
              key={idx}
              disabled={selectedOption !== null}
              onClick={() => handleSelect(idx)}
              className={`relative flex items-center gap-4 p-5 md:p-6 rounded-2xl text-left font-bold text-lg md:text-xl text-white shadow-xl transform transition-all active:scale-95 ${
                opt.color
              } ${
                isSelected
                  ? 'ring-8 ring-white scale-105 brightness-125 z-10'
                  : selectedOption !== null
                  ? 'opacity-50'
                  : 'hover:brightness-110 hover:-translate-y-1'
              }`}
            >
              {/* Geometric Symbol (Triangle, Diamond, Circle, Square) */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/25 flex items-center justify-center text-white shadow-inner">
                {opt.symbol === 'triangle' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,3 22,21 2,21" />
                  </svg>
                )}
                {opt.symbol === 'diamond' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 22,12 12,22 2,12" />
                  </svg>
                )}
                {opt.symbol === 'circle' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
                {opt.symbol === 'square' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
              </div>

              {/* Option Text */}
              <span className="flex-1 font-extrabold leading-tight drop-shadow">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Bar: Instructions for Classroom Host */}
      <div className="w-full text-center py-2 text-xs text-slate-400 border-t border-slate-800">
        Grupo de Comando: Clique na opção dita pela equipe <strong>{answeringTeam.name}</strong> ou permita que o representante clique diretamente na tela!
      </div>
    </div>
  );
};
