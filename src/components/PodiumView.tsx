import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Trophy, RotateCcw, Award, Sparkles, Heart } from 'lucide-react';

interface Props {
  teams: Team[];
  onRestart: () => void;
}

export const PodiumView: React.FC<Props> = ({ teams, onRestart }) => {
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.candies + b.chocolates) - (a.candies + a.chocolates));
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const fourth = sorted[3];

  useEffect(() => {
    sound.playCorrect();

    // Epic multi-stage confetti
    const end = Date.now() + 4 * 1000;
    const colors = ['#E21B3C', '#1368CE', '#D89E00', '#26890C', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[660px] w-full max-w-5xl mx-auto p-4 animate-fade-in text-center">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider mb-3 shadow-lg animate-bounce">
          <Trophy className="w-5 h-5 fill-current" /> Fim do Quiz SWOT! Grande Campeã Definida!
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
          PÓDIO DOS VENCEDORES
        </h1>
        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto mt-2">
          Parabéns a todas as 4 equipes pela disputa acirrada sobre as Funções Administrativas e a Matriz SWOT em TI!
        </p>
      </div>

      {/* 3D-style Podium Blocks */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 w-full max-w-3xl mb-10 h-72">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="mb-2 text-center">
              <span className="text-2xl">🥈</span>
              <div className="font-black text-white text-sm md:text-base truncate max-w-[120px]">
                {second.name}
              </div>
              <div className="text-xs text-slate-300 font-bold">{second.points} pts</div>
              <div className="text-[11px] text-pink-300">🍬 {second.candies} | 🍫 {second.chocolates}</div>
            </div>
            <div className="w-full bg-slate-600 border-t-4 border-slate-300 rounded-t-2xl h-40 flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-black text-slate-300">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {first && (
          <div className="flex-1 flex flex-col items-center scale-105 z-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="mb-2 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-slate-950 shadow-xl animate-bounce">
                <Trophy className="w-8 h-8 fill-current" />
              </div>
              <div className="font-black text-yellow-400 text-base md:text-lg truncate max-w-[150px] mt-1">
                {first.name}
              </div>
              <div className="text-sm text-white font-extrabold">{first.points} pts</div>
              <div className="text-xs text-yellow-200 font-bold">🍬 {first.candies} balas • 🍫 {first.chocolates} choc</div>
            </div>
            <div className="w-full bg-gradient-to-b from-yellow-500 to-amber-600 border-t-4 border-yellow-300 rounded-t-2xl h-56 flex flex-col items-center justify-center shadow-2xl">
              <span className="text-6xl font-black text-slate-950">1</span>
              <span className="text-xs font-black uppercase text-slate-950 tracking-wider">Campeã</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="mb-2 text-center">
              <span className="text-2xl">🥉</span>
              <div className="font-black text-white text-sm md:text-base truncate max-w-[120px]">
                {third.name}
              </div>
              <div className="text-xs text-slate-300 font-bold">{third.points} pts</div>
              <div className="text-[11px] text-pink-300">🍬 {third.candies} | 🍫 {third.chocolates}</div>
            </div>
            <div className="w-full bg-amber-800 border-t-4 border-amber-600 rounded-t-2xl h-32 flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-black text-amber-200">3</span>
            </div>
          </div>
        )}

        {/* 4th Place (Honorary) */}
        {fourth && (
          <div className="hidden sm:flex flex-1 flex-col items-center opacity-85">
            <div className="mb-2 text-center">
              <span className="text-xl">🎖️</span>
              <div className="font-bold text-slate-300 text-xs truncate max-w-[100px]">
                {fourth.name}
              </div>
              <div className="text-xs text-slate-400 font-semibold">{fourth.points} pts</div>
              <div className="text-[10px] text-pink-300">🍬 {fourth.candies}</div>
            </div>
            <div className="w-full bg-slate-800 border-t-2 border-slate-700 rounded-t-xl h-24 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-500">4</span>
            </div>
          </div>
        )}
      </div>

      {/* Prize Totals Box */}
      <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700 rounded-2xl p-4 mb-6 flex items-center justify-around shadow-xl">
        <div className="text-center">
          <div className="text-2xl">🍬</div>
          <div className="text-xl font-black text-white">
            {teams.reduce((acc, t) => acc + t.candies, 0)}
          </div>
          <div className="text-xs text-slate-400 font-bold">Total Balas Entregues</div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-2xl">🍫</div>
          <div className="text-xl font-black text-white">
            {teams.reduce((acc, t) => acc + t.chocolates, 0)}
          </div>
          <div className="text-xs text-slate-400 font-bold">Total Chocolates</div>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <div className="text-xl font-black text-white">10 / 10</div>
          <div className="text-xs text-slate-400 font-bold">Perguntas SWOT Feitas</div>
        </div>
      </div>

      {/* Presentation Completion Note & Restart */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onRestart}
          className="px-8 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-base shadow-lg transition flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reiniciar Quiz da Dinâmica
        </button>
      </div>
    </div>
  );
};
