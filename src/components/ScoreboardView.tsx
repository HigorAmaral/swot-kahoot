import React from 'react';
import { Team } from '../types';
import { Trophy, ArrowRight, Flame, Award } from 'lucide-react';

interface Props {
  teams: Team[];
  questionNumber: number;
  totalQuestions: number;
  onNextQuestion: () => void;
}

export const ScoreboardView: React.FC<Props> = ({
  teams,
  questionNumber,
  totalQuestions,
  onNextQuestion,
}) => {
  // Sort teams descending by points, then by candies
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.candies + b.chocolates) - (a.candies + a.chocolates));
  const maxPoints = Math.max(...sorted.map(t => t.points), 1000);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-kahoot-purple/60 border border-purple-400 text-purple-200 text-sm font-semibold mb-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Placar Geral da Sala • Rodada {questionNumber} de {totalQuestions}
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Classificação das Equipes
        </h2>
      </div>

      {/* Leaderboard Stack */}
      <div className="w-full flex flex-col gap-3.5 mb-8">
        {sorted.map((team, idx) => {
          const rank = idx + 1;
          const percentage = Math.max(15, (team.points / maxPoints) * 100);

          return (
            <div
              key={team.id}
              className="relative overflow-hidden rounded-2xl bg-slate-800/90 border-2 border-slate-700 shadow-xl p-4 flex items-center justify-between transition-all hover:scale-[1.01]"
            >
              {/* Animated Progress Bar fill */}
              <div
                className={`absolute inset-y-0 left-0 opacity-25 ${team.bgClass} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              />

              {/* Left Info: Rank, Avatar, Team Name */}
              <div className="relative z-10 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-md ${
                  rank === 1
                    ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300'
                    : rank === 2
                    ? 'bg-slate-300 text-slate-900'
                    : rank === 3
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-lg md:text-xl">
                      {team.name}
                    </span>
                    {rank === 1 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-yellow-400 text-slate-950 animate-pulse">
                        <Flame className="w-3 h-3 fill-current text-red-600" /> Líder
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-medium">
                    <span>Acertos: <strong>{team.answersCorrect}</strong></span>
                    <span>•</span>
                    <span className="text-pink-300">🍬 {team.candies} balas</span>
                    <span className="text-amber-300">🍫 {team.chocolates} chocolates</span>
                  </div>
                </div>
              </div>

              {/* Right Info: Points */}
              <div className="relative z-10 text-right">
                <div className="font-mono text-2xl md:text-3xl font-black text-white">
                  {team.points.toLocaleString('pt-BR')} <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance to next */}
      <button
        onClick={onNextQuestion}
        className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xl shadow-2xl flex items-center gap-3 transform transition active:scale-95"
      >
        <span>
          {questionNumber < totalQuestions ? `Ir para a Pergunta #${questionNumber + 1}` : 'Ver o Pódio Final! 🏆'}
        </span>
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};
