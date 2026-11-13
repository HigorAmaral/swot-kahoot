import React, { useState } from 'react';
import { Team } from '../types';
import { sound } from '../utils/sound';
import { Play, Users, Sparkles, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  teams: Team[];
  onUpdateTeamName: (teamId: number, newName: string) => void;
  onStartGame: () => void;
  onOpenAdminModal: () => void;
  onOpenCreatorModal?: () => void;
  onAddParticipant: (teamId: number, name: string, avatar?: string) => void;
  onRemoveParticipant: (teamId: number, participantId: string, name: string) => void;
}

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🧠', '🛡️', '🎯', '👑', '🔥', '⭐'];

export const IntroSetupView: React.FC<Props> = ({
  teams,
  onUpdateTeamName,
  onStartGame,
  onOpenAdminModal,
  onOpenCreatorModal,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻');
  const [lastJoinedMessage, setLastJoinedMessage] = useState<string | null>(null);

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleJoinTeam = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newStudentName.trim();
    if (!name) return;

    onAddParticipant(selectedTeamId, name, selectedAvatar);
    sound.playTone(650, 0.15, 'sine', 0.2);
    setLastJoinedMessage(`${selectedAvatar} ${name} entrou no ${activeTeam.name}!`);
    setNewStudentName('');

    setTimeout(() => {
      setLastJoinedMessage(null);
    }, 3500);
  };

  const totalParticipants = teams.reduce((acc, t) => acc + t.participants.length, 0);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-3 sm:p-5 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="w-full glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-cyan-500/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Arena Interativa em Sala
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">
            Fabrica<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Quiz</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium">
            Escolha sua equipe abaixo, digite seu nome de usuário e dispute os pontos e brindes da rodada!
          </p>
        </div>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-3 w-full lg:w-auto">
          <button
            onClick={onStartGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-lg sm:text-xl shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2.5"
          >
            <Play className="w-6 h-6 fill-current" />
            COMEÇAR O QUIZ!
          </button>

          <div className="flex items-center gap-2.5 justify-center">
            {onOpenCreatorModal && (
              <button
                onClick={onOpenCreatorModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Criar Quiz
              </button>
            )}

            <button
              onClick={onOpenAdminModal}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Painel ADM
            </button>
          </div>
        </div>
      </div>

      {/* USER NAME JOIN BOX */}
      <div className="w-full glass-card rounded-3xl p-5 sm:p-6 mb-6 text-left border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Entrar na equipe: <span className="text-cyan-300">{activeTeam.name}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {totalParticipants} participante(s) na sala
          </span>
        </div>

        <form onSubmit={handleJoinTeam} className="flex flex-col sm:flex-row gap-3">
          {/* Avatar Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1.5 overflow-x-auto">
            {AVATAR_OPTIONS.slice(0, 6).map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedAvatar(emoji)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition ${
                  selectedAvatar === emoji ? 'bg-emerald-500 text-slate-950 scale-110 shadow' : 'hover:bg-slate-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Name Input */}
          <input
            type="text"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
            placeholder="Digite seu nome (Ex: Higor Amaral, Ana Paula...)"
            className="flex-1 bg-slate-950/90 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none transition"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Entrar no Grupo!
          </button>
        </form>

        {/* Success Alert */}
        {lastJoinedMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce-short">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {lastJoinedMessage}
          </div>
        )}
      </div>

      {/* 4 Teams Grid */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Equipes da Sala (clique para selecionar onde deseja entrar):
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map(team => {
            const isSelected = selectedTeamId === team.id;

            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? `${team.borderClass} ${team.glowClass} bg-slate-900/95 scale-[1.02] ring-2 ring-white/30`
                    : 'border-slate-800 bg-slate-900/65 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top Colored Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${team.bgClass}`} />

                {/* Active Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 flex items-center gap-1 shadow">
                    <CheckCircle2 className="w-3 h-3" /> Ativo
                  </div>
                )}

                <div className="mt-1">
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${team.bgClass}`} />
                      <span className="text-xs font-black uppercase text-slate-400">Grupo #{team.id}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      👥 {team.participants.length}
                    </span>
                  </div>

                  {/* Editable Team Name */}
                  <input
                    type="text"
                    value={team.name}
                    onChange={e => onUpdateTeamName(team.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-emerald-400 transition"
                    placeholder={`Nome da Equipe ${team.id}`}
                  />

                  {/* Participant Chips */}
                  <div className="mt-3 min-h-[56px]">
                    <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                      Integrantes:
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {team.participants.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">Nenhum aluno inscrito ainda</span>
                      ) : (
                        team.participants.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-white shadow-sm"
                          >
                            <span>{p.avatar || '👨‍💻'}</span>
                            <span>{p.name || (p as any).user_name || 'Aluno'}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveParticipant(team.id, p.id, p.name);
                              }}
                              className="ml-1 text-slate-400 hover:text-rose-400 font-black"
                              title="Remover"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card footer select prompt */}
                <div className="mt-3 pt-2 border-t border-slate-800/70 text-center">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Selecionado para inscrição' : 'Clique para selecionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
