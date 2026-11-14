import React, { useEffect, useRef, useState } from 'react';
import { Question } from '../data/questions';
import { Team, GamePlayMode } from '../types';
import { sound } from '../utils/sound';
import { CheckCircle2, XCircle, Award, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';

interface Props {
  question: Question;
  selectedIndex: number; // -1 for timeout
  answeringTeam: Team;
  disputeWinnerTeam: Team;
  isPassed: boolean;
  gameMode?: GamePlayMode;
  onAwardBrinde: (teamId: number, type: 'candy' | 'chocolate') => void;
  onContinue: () => void;
  onReassignAnswer: (newTeamId: number, isCorrect: boolean) => void;
  allTeams: Team[];
}

export const VerdictView: React.FC<Props> = ({
  question,
  selectedIndex,
  answeringTeam,
  disputeWinnerTeam,
  isPassed,
  gameMode = 'turno',
  onAwardBrinde,
  onContinue,
  onReassignAnswer,
  allTeams
}) => {
  const isCorrect = selectedIndex === question.correctIndex;
  const isTimeout = selectedIndex === -1;
  const [brindeAwarded, setBrindeAwarded] = useState<'candy' | 'chocolate' | null>(null);
  const [awardedExtraIds, setAwardedExtraIds] = useState<number[]>([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    if (isCorrect) {
      sound.playCorrect();
      // Auto award candy on correct
      setBrindeAwarded('candy');
      onAwardBrinde(answeringTeam.id, 'candy');
    } else {
      sound.playWrong();
    }
  }, [isCorrect, answeringTeam.id, onAwardBrinde]);

  const handleManualBrinde = (type: 'candy' | 'chocolate') => {
    setBrindeAwarded(type);
    sound.playCandyChime();
    onAwardBrinde(answeringTeam.id, type);
  };

  // Presenter PC Keyboard shortcuts: Enter, Space, or ArrowRight to continue
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-160px)] w-full max-w-6xl mx-auto p-3 sm:p-5 lg:p-6 animate-fade-in">
      {/* Result Banner */}
      <div className={`w-full p-5 sm:p-6 md:p-8 rounded-3xl border-2 text-center shadow-2xl mb-6 transform transition-all ${
        isCorrect
          ? 'bg-gradient-to-b from-emerald-950/85 to-slate-950/95 border-emerald-400/80 ring-4 ring-emerald-500/20'
          : 'bg-gradient-to-b from-rose-950/85 to-slate-950/95 border-rose-500/80 ring-4 ring-rose-500/20'
      }`}>
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-2">
          {isCorrect ? (
            <CheckCircle2 className="w-9 h-9 sm:w-12 sm:h-12 text-emerald-400 animate-bounce shrink-0" />
          ) : (
            <XCircle className="w-9 h-9 sm:w-12 sm:h-12 text-rose-400 animate-pulse shrink-0" />
          )}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">
            {isCorrect ? 'RESPOSTA CORRETA! 🎉' : isTimeout ? 'TEMPO ESGOTADO! ⏰' : 'RESPOSTA INCORRETA! ❌'}
          </h2>
        </div>

        <p className="text-base sm:text-lg md:text-xl font-bold text-slate-200 mt-1">
          {isCorrect ? (
            <span>
              A equipe <strong className="text-emerald-300 underline">{answeringTeam.name}</strong> faturou <strong>1.000 pontos</strong> e garantiu o brinde!
            </span>
          ) : (
            <span>
              A equipe <strong className="text-rose-300">{answeringTeam.name}</strong> não pontuou nesta rodada.
            </span>
          )}
        </p>

        {/* Special Passed question bonus */}
        {isPassed && !isCorrect && (
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs sm:text-sm font-bold">
            ⚡ Jogada Estratégica: {disputeWinnerTeam.name} passou a pergunta e a equipe rival errou! ({disputeWinnerTeam.name} ganha +500 pts bônus de risco).
          </div>
        )}

        {/* Brinde (Candy / Chocolate) Delivery Animation */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-slate-900/90 border-2 border-yellow-400 shadow-xl max-w-full">
            <span className="text-2xl animate-bounce">🍬</span>
            <div className="text-center sm:text-left">
              <div className="text-[11px] sm:text-xs font-black uppercase text-yellow-400 tracking-wider">
                Mesa / Grupo de Comando: Entregar Brinde Físico!
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                {brindeAwarded === 'chocolate' ? '🍫 1 Chocolate entregue!' : '🍬 1 Bala entregue para a equipe!'}
              </div>
            </div>
            <div className="flex gap-1.5 sm:ml-2">
              <button
                onClick={() => handleManualBrinde('candy')}
                className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white transition flex items-center gap-1"
                title="Entregar mais uma bala"
              >
                +🍬 Bala
              </button>
              <button
                onClick={() => handleManualBrinde('chocolate')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-xs font-bold text-white transition flex items-center gap-1"
                title="Entregar um chocolate"
              >
                +🍫 Chocolate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options Overview showing which was right */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {question.options.map((opt, idx) => {
          const isThisCorrect = idx === question.correctIndex;
          const wasSelected = idx === selectedIndex;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-2 flex items-center justify-between font-bold text-white transition-all ${
                isThisCorrect
                  ? 'bg-emerald-600/90 border-emerald-300 ring-2 ring-white shadow-lg'
                  : wasSelected
                  ? 'bg-rose-900/60 border-rose-500 opacity-80 line-through'
                  : 'bg-slate-800/60 border-slate-700 opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center text-xs font-black">
                  {idx === 0 ? '▲' : idx === 1 ? '◆' : idx === 2 ? '●' : '■'}
                </span>
                <span className="text-base">{opt.text}</span>
              </div>
              {isThisCorrect && (
                <span className="px-2.5 py-1 rounded bg-white text-emerald-900 text-xs font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correta
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Educational Explanation Box for Presentation */}
      <div className="w-full bg-slate-800/90 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" /> Explicação da Resposta
        </div>
        <p className="text-slate-200 text-base md:text-lg leading-relaxed font-medium">
          {question.explanation}
        </p>
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span><strong>Tema:</strong> {question.category}</span>
          <span><strong>Aplicação no Paper TI:</strong> InovaTech Soluções Digitais</span>
        </div>
      </div>

      {/* Grupo de Comando Actions */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4">
        {/* If team missed, allow Grupo de Comando to pass to another team in room */}
        {!isCorrect && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Repassar para outra equipe da sala:</span>
            {allTeams.filter(t => t.id !== answeringTeam.id).map(other => (
              <button
                key={other.id}
                onClick={() => onReassignAnswer(other.id, true)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white border border-slate-500 transition"
              >
                Dar ponto p/ {other.name}
              </button>
            ))}
          </div>
        )}

        {/* In Todos Respondem mode, allow awarding points to other teams that also got it right */}
        {isCorrect && gameMode === 'todos' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-cyan-300 font-bold">Todos Respondem — também acertaram:</span>
            {allTeams.filter(t => t.id !== answeringTeam.id).map(other => {
              const alreadyAwarded = awardedExtraIds.includes(other.id);
              return (
                <button
                  key={other.id}
                  disabled={alreadyAwarded}
                  onClick={() => {
                    setAwardedExtraIds(prev => [...prev, other.id]);
                    onReassignAnswer(other.id, true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    alreadyAwarded
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500'
                  }`}
                >
                  {alreadyAwarded ? `✓ ${other.name}` : `+ Ponto ${other.name}`}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={onContinue}
          className="ml-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg shadow-xl flex items-center gap-2 transform transition active:scale-95"
        >
          <span>Ver Placar da Sala</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
