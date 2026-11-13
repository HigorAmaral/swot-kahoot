import React, { useState, useEffect } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Zap, Trophy, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  teams: Team[];
  onDisputeResolved: (winnerTeamId: number, passedToTeamId?: number) => void;
  questionNumber: number;
}

interface BuzzEntry {
  teamId: number;
  timeMs: number;
  rank: number;
}

export const BuzzerDispute: React.FC<Props> = ({ teams, onDisputeResolved, questionNumber }) => {
  const [buzzList, setBuzzList] = useState<BuzzEntry[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);
  const [decisionStep, setDecisionStep] = useState<'waiting' | 'ready' | 'choose'>('waiting');

  // Start Buzzer Round
  const startRound = () => {
    setBuzzList([]);
    setWinnerTeam(null);
    setDecisionStep('ready');
    setStartTime(performance.now());
    sound.playTone(600, 0.2, 'triangle', 0.2);
  };

  // Keyboard shortcut listener (Keys 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (decisionStep !== 'ready' || !startTime) return;
      const keyMap: { [key: string]: number } = {
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
      };
      const teamId = keyMap[e.key];
      if (teamId && teams.some(t => t.id === teamId)) {
        triggerBuzz(teamId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [decisionStep, startTime, teams]);

  const triggerBuzz = (teamId: number) => {
    if (decisionStep !== 'ready' || !startTime) return;
    if (buzzList.some(b => b.teamId === teamId)) return; // already buzzed

    sound.playBuzzer();
    const elapsed = performance.now() - startTime;
    const newRank = buzzList.length + 1;
    const newEntry: BuzzEntry = { teamId, timeMs: elapsed, rank: newRank };

    const updated = [...buzzList, newEntry];
    setBuzzList(updated);

    if (newRank === 1) {
      const winner = teams.find(t => t.id === teamId) || null;
      setWinnerTeam(winner);
      // Wait 1.2s to show other buzzers if they press, then go to choose
      setTimeout(() => {
        setDecisionStep('choose');
        sound.playCorrect();
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[580px] w-full max-w-5xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-sm font-semibold mb-2">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
          Pergunta #{questionNumber} • Disputa: Quem Bate Primeiro (Buzzer)
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Bata no botão ou use as teclas (1, 2, 3, 4)!
        </h2>
        <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mt-2">
          A primeira equipe a acionar o buzzer ganha a posse da pergunta da Análise SWOT!
        </p>
      </div>

      {decisionStep === 'waiting' && (
        <button
          onClick={startRound}
          className="px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-red-500 to-pink-600 hover:brightness-110 text-white font-black text-2xl shadow-2xl active:scale-95 transition flex items-center gap-3 animate-pulse"
        >
          <Zap className="w-8 h-8 fill-current" />
          LIBERAR OS BUZZERS AGORA!
        </button>
      )}

      {(decisionStep === 'ready' || decisionStep === 'choose') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mb-8">
          {teams.map(team => {
            const buzz = buzzList.find(b => b.teamId === team.id);
            const isFirst = buzz?.rank === 1;

            return (
              <div
                key={team.id}
                onClick={() => triggerBuzz(team.id)}
                className={`relative flex flex-col items-center p-6 rounded-3xl border-4 cursor-pointer select-none transition-all duration-150 transform active:scale-90 shadow-2xl ${
                  isFirst
                    ? 'border-yellow-400 bg-yellow-950/60 scale-105 ring-4 ring-yellow-400 animate-pulse'
                    : buzz
                    ? 'border-slate-500 bg-slate-800/60 opacity-80'
                    : `${team.borderClass} ${team.bgClass} hover:brightness-110 active:translate-y-2`
                }`}
              >
                {/* Keyboard Badge */}
                <div className="absolute top-3 right-3 bg-black/40 text-white font-mono text-xs px-2 py-0.5 rounded border border-white/20">
                  Tecla [{team.id}]
                </div>

                {/* Rank Badge */}
                {buzz && (
                  <div className={`absolute -top-3.5 px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg flex items-center gap-1 ${
                    isFirst ? 'bg-yellow-400 text-slate-950' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {isFirst ? <Trophy className="w-3.5 h-3.5 fill-current" /> : null}
                    {buzz.rank}º Lugar ({(buzz.timeMs / 1000).toFixed(2)}s)
                  </div>
                )}

                <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center my-4 shadow-inner">
                  <Zap className="w-12 h-12 text-white fill-white" />
                </div>

                <h3 className="text-xl font-black text-white text-center">
                  {team.name}
                </h3>
                {team.participants.length > 0 && (
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <span>{team.participants[(questionNumber - 1) % team.participants.length].avatar}</span>
                    <span>No Buzzer: {team.participants[(questionNumber - 1) % team.participants.length].name}</span>
                  </div>
                )}
                <span className="text-xs text-white/80 mt-1 uppercase font-bold tracking-wider">
                  {buzz ? 'Acionado!' : 'CLIQUE AQUI!'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Winner Decision Modal */}
      {decisionStep === 'choose' && winnerTeam && (
        <div className="w-full max-w-2xl bg-slate-800/95 border-2 border-yellow-400 rounded-2xl p-6 shadow-2xl text-center animate-bounce-short">
          <div className="inline-flex items-center gap-2 text-yellow-400 font-black text-lg mb-2 uppercase tracking-wide">
            <Trophy className="w-6 h-6" /> {winnerTeam.name} bateu no buzzer primeiro!
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Qual a decisão da equipe?
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
