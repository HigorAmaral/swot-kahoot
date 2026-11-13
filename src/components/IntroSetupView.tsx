import React from 'react';
import { Team, DisputeMode } from '../types';
import { sound } from '../utils/sound';
import { Play, BookOpen, Users, HelpCircle, Sparkles, RotateCw, Zap, Target } from 'lucide-react';

interface Props {
  teams: Team[];
  onUpdateTeamName: (teamId: number, newName: string) => void;
  disputeMode: DisputeMode;
  onSetDisputeMode: (mode: DisputeMode) => void;
  onStartGame: () => void;
  onOpenCaseModal: () => void;
  onOpenGuideModal: () => void;
}

export const IntroSetupView: React.FC<Props> = ({
  teams,
  onUpdateTeamName,
  disputeMode,
  onSetDisputeMode,
  onStartGame,
  onOpenCaseModal,
  onOpenGuideModal,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[640px] w-full max-w-5xl mx-auto p-4 animate-fade-in text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider mb-4 shadow-xl">
        <Sparkles className="w-4 h-4 fill-current" />
        Dinâmica de Sala • Funções Administrativas & Matriz SWOT
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-4 leading-none">
        SWOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-400">Kahoot!</span>
      </h1>

      <p className="text-slate-200 text-base md:text-xl max-w-2xl mx-auto mb-8 font-medium">
        Disputa interativa em <strong>4 equipes</strong> sobre o Estudo de Caso em TI:
        gire o peão, responda primeiro e ganhe <strong>balas e chocolates 🍬🍫!</strong>
      </p>

      {/* 4 Teams Setup Cards */}
      <div className="w-full max-w-4xl mb-8 text-left">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            Configuração das 4 Equipes da Sala:
          </span>
          <span className="text-xs text-slate-400 italic">
            (Você pode alterar o nome de cada equipe)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {teams.map(team => (
            <div
              key={team.id}
              className={`p-4 rounded-2xl border-2 ${team.borderClass} bg-slate-800/80 shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3.5 h-3.5 rounded-full ${team.bgClass}`} />
                <span className="text-xs font-bold text-slate-400">Equipe #{team.id}</span>
              </div>
              <input
                type="text"
                value={team.name}
                onChange={e => onUpdateTeamName(team.id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
                placeholder={`Nome da Equipe ${team.id}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Selection */}
      <div className="w-full max-w-3xl bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 mb-8 text-left">
        <span className="text-xs font-black uppercase text-amber-400 tracking-wider block mb-3">
          Escolha a Mecânica Principal da Disputa:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSetDisputeMode('peao')}
            className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
              disputeMode === 'peao'
                ? 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-400/30'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <RotateCw className="w-4 h-4 text-purple-400" />
              <span>1. Peão Tradicional</span>
            </div>
            <p className="text-[11px] text-slate-400">
              O peão que rodar por mais tempo ganha o direito de responder ou passar!
            </p>
          </button>

          <button
            onClick={() => onSetDisputeMode('buzzer')}
            className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
              disputeMode === 'buzzer'
                ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400/30'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>2. Quem Bate Primeiro</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Botão estilo campainha/buzzer com teclas rápidas (1, 2, 3, 4).
            </p>
          </button>

          <button
            onClick={() => onSetDisputeMode('alvo')}
            className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
              disputeMode === 'alvo'
                ? 'border-red-400 bg-red-950/60 ring-2 ring-red-400/30'
                : 'border-slate-700 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Target className="w-4 h-4 text-red-400" />
              <span>3. Acerta o Alvo</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mini-game de pontaria: quem acertar mais perto do centro da mira.
            </p>
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onOpenCaseModal}
          className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 font-extrabold text-base shadow-xl transition flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Apresentar Estudo de Caso (TI)
        </button>

        <button
          onClick={onStartGame}
          className="px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-black text-2xl shadow-2xl active:scale-95 transition flex items-center gap-3 animate-pulse"
        >
          <Play className="w-7 h-7 fill-current" />
          COMEÇAR O QUIZ AGORA!
        </button>

        <button
          onClick={onOpenGuideModal}
          className="px-6 py-4 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border-2 border-purple-600/50 text-purple-200 font-extrabold text-base shadow-xl transition flex items-center gap-2"
        >
          <HelpCircle className="w-5 h-5 text-pink-400" />
          Manual da Apresentação
        </button>
      </div>
    </div>
  );
};
