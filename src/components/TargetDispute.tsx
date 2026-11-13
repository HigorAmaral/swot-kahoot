import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Target, Trophy, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  teams: Team[];
  onDisputeResolved: (winnerTeamId: number, passedToTeamId?: number) => void;
  questionNumber: number;
}

export const TargetDispute: React.FC<Props> = ({ teams, onDisputeResolved, questionNumber }) => {
  const [currentShooterIndex, setCurrentShooterIndex] = useState(0);
  const [scores, setScores] = useState<{ [id: number]: number }>({});
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);
  const [decisionStep, setDecisionStep] = useState<'shooting' | 'choose'>('shooting');
  const animRef = useRef<number | null>(null);

  const activeTeam = teams[currentShooterIndex];

  // Moving target animation
  useEffect(() => {
    if (decisionStep !== 'shooting') return;
    let t = 0;

    const animate = () => {
      t += 0.04;
      const x = 50 + Math.sin(t * 1.5) * 35;
      const y = 50 + Math.cos(t * 2.1) * 30;
      setTargetPos({ x, y });
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [decisionStep]);

  const shoot = () => {
    if (decisionStep !== 'shooting' || !activeTeam) return;

    sound.playTone(800, 0.1, 'square', 0.2);
    // Calculate distance from center (50, 50)
    const dist = Math.hypot(targetPos.x - 50, targetPos.y - 50);
    // Score between 10 and 100 based on proximity to center
    const hitScore = Math.max(10, Math.round(100 - dist * 2));

    const newScores = { ...scores, [activeTeam.id]: hitScore };
    setScores(newScores);

    if (currentShooterIndex < teams.length - 1) {
      setCurrentShooterIndex(prev => prev + 1);
    } else {
      // All teams took their shot! Determine winner
      let highest = -1;
      let winningId = teams[0].id;

      teams.forEach(t => {
        const sc = newScores[t.id] ?? 0;
        if (sc > highest) {
          highest = sc;
          winningId = t.id;
        }
      });

      const winner = teams.find(t => t.id === winningId) || teams[0];
      setWinnerTeam(winner);
      setDecisionStep('choose');
      sound.playCorrect();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-400 text-red-200 text-sm font-semibold mb-2">
          <Target className="w-4 h-4 text-red-400 animate-spin-slow" />
          Pergunta #{questionNumber} • Disputa: Quem Acerta o Alvo
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Mire no Centro do Alvo!
        </h2>
        <p className="text-slate-300 text-sm md:text-base mt-1">
          Vez da equipe: <strong className="text-yellow-400 text-lg underline">{activeTeam?.name}</strong> disparar quando a mira estiver no meio!
        </p>
      </div>

      {decisionStep === 'shooting' && (
        <div className="relative w-full max-w-md h-80 bg-slate-900 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center cursor-crosshair select-none my-4">
          {/* Target concentric rings */}
          <div className="absolute w-72 h-72 rounded-full border-2 border-red-500/30 flex items-center justify-center">
            <div className="w-52 h-52 rounded-full border-2 border-yellow-500/40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-emerald-500/50 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center animate-ping" />
              </div>
            </div>
          </div>

          {/* Crosshairs */}
          <div className="absolute inset-x-0 h-0.5 bg-red-500/20 pointer-events-none" />
          <div className="absolute inset-y-0 w-0.5 bg-red-500/20 pointer-events-none" />

          {/* Moving Sight */}
          <div
            className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center shadow-lg transition-transform pointer-events-none"
            style={{
              left: `${targetPos.x}%`,
              top: `${targetPos.y}%`
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>

          <button
            onClick={shoot}
            className="absolute bottom-4 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-lg shadow-xl flex items-center gap-2"
          >
            <Target className="w-5 h-5" /> DISPARAR AGORA!
          </button>
        </div>
      )}

      {/* Scores mini-board */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md mb-6">
        {teams.map(t => (
          <div key={t.id} className="bg-slate-800 p-2 rounded-xl text-center border border-slate-700">
            <div className="text-xs text-slate-400 truncate">{t.name}</div>
            <div className="text-lg font-black text-white">{scores[t.id] ? `${scores[t.id]} pts` : '—'}</div>
          </div>
        ))}
      </div>

      {/* Winner Decision Step */}
      {decisionStep === 'choose' && winnerTeam && (
        <div className="w-full max-w-2xl bg-slate-800/95 border-2 border-yellow-400 rounded-2xl p-6 shadow-2xl text-center animate-bounce-short">
          <div className="inline-flex items-center gap-2 text-yellow-400 font-black text-lg mb-2 uppercase tracking-wide">
            <Trophy className="w-6 h-6" /> {winnerTeam.name} acertou mais perto do centro ({scores[winnerTeam.id]} pts)!
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Qual a decisão da equipe vencedora?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <button
              onClick={() => onDisputeResolved(winnerTeam.id)}
              className="py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              Responder a pergunta!
            </button>

            <div className="relative group">
              <button
                className="w-full py-4 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transform transition hover:scale-105 active:scale-95"
              >
                <ShieldAlert className="w-5 h-5" />
                Passar a pergunta ▼
              </button>
              
              <div className="hidden group-hover:flex flex-col gap-1.5 absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-amber-400/40 rounded-xl p-2 z-20 shadow-2xl">
                <span className="text-xs text-amber-300 font-semibold px-2 py-1">Passar para qual equipe?</span>
                {teams.filter(t => t.id !== winnerTeam.id).map(rival => (
                  <button
                    key={rival.id}
                    onClick={() => onDisputeResolved(winnerTeam.id, rival.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-amber-700 text-white font-bold text-sm text-left transition"
                  >
                    <span>{rival.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
