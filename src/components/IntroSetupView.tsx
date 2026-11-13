import React, { useState } from 'react';
import { Team, DisputeMode, Participant } from '../types';
import { sound } from '../utils/sound';
import { Play, BookOpen, Users, HelpCircle, Sparkles, RotateCw, Zap, Target, UserPlus, CheckCircle2, ShieldAlert, Award, Trash2 } from 'lucide-react';

interface Props {
  teams: Team[];
  onUpdateTeamName: (teamId: number, newName: string) => void;
  disputeMode: DisputeMode;
  onSetDisputeMode: (mode: DisputeMode) => void;
  onStartGame: () => void;
  onOpenCaseModal: () => void;
  onOpenGuideModal: () => void;
  onOpenAdminModal: () => void;
  onAddParticipant: (teamId: number, name: string, avatar?: string) => void;
  onRemoveParticipant: (teamId: number, participantId: string, name: string) => void;
}

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🧠', '🛡️', '🎯', '👑', '🔥', '⭐'];

export const IntroSetupView: React.FC<Props> = ({
  teams,
  onUpdateTeamName,
  disputeMode,
  onSetDisputeMode,
  onStartGame,
  onOpenCaseModal,
  onOpenGuideModal,
  onOpenAdminModal,
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
    <div className="flex flex-col items-center justify-center min-h-[660px] w-full max-w-6xl mx-auto p-3 sm:p-4 animate-fade-in text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-3 shadow-neon-purple animate-float">
        <Sparkles className="w-4 h-4 fill-current text-yellow-300" />
        Dinâmica de Sala • Funções Administrativas & Matriz SWOT em TI
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl mb-3 leading-none">
        SWOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-400">Kahoot!</span>
      </h1>

      <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mb-6 font-medium">
        Selecione seu grupo, digite seu nome de usuário, gire o peão e conquiste brindes de chocolate 🍫 e balas 🍬 para a sua equipe!
      </p>

      {/* 4 Teams Grid with Member count & Interactive Join */}
      <div className="w-full mb-6 text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            1. Selecione um Grupo da Sala para Participar ({totalParticipants} alunos inscritos):
          </span>
          <button
            onClick={onOpenAdminModal}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Abrir Painel ADM
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {teams.map(team => {
            const isSelected = selectedTeamId === team.id;

            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? `${team.borderClass} ${team.glowClass} bg-slate-900/95 scale-[1.02] ring-2 ring-white/40`
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Active Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-slate-950 flex items-center gap-1 shadow-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-current" /> Selecionado
                  </div>
                )}

                <div>
                  {/* Team Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${team.bgClass} shadow-md`} />
                      <span className="text-xs font-black uppercase text-slate-400">Grupo #{team.id}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                      👥 {team.participants.length}
                    </span>
                  </div>

                  {/* Editable Team Name */}
                  <input
                    type="text"
                    value={team.name}
                    onChange={e => onUpdateTeamName(team.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-purple-400 transition"
                    placeholder={`Nome da Equipe ${team.id}`}
                  />

                  {/* Participant Chips */}
                  <div className="mt-3 min-h-[48px]">
                    <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Integrantes:</span>
                      {isSelected && (
                        <span className="text-cyan-400 text-[10px] animate-pulse">Inscrever abaixo ▼</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                      {team.participants.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">Nenhum aluno inscrito ainda</span>
                      ) : (
                        team.participants.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-white shadow-sm"
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
                <div className="mt-3 pt-2 border-t border-slate-800/60 text-center">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Grupo Ativo para Inscrição' : 'Clique para selecionar este grupo'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* USER NAME JOIN BOX */}
      <div className="w-full max-w-3xl glass-card rounded-3xl p-5 sm:p-6 mb-6 text-left border-2 border-purple-500/40 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-black text-white">
              Entrar no grupo: <span className="text-amber-400 underline">{activeTeam.name}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Digite seu nome de aluno/participante da sala
          </span>
        </div>

        <form onSubmit={handleJoinTeam} className="flex flex-col sm:flex-row gap-3">
          {/* Avatar Selector Dropdown / Row */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1.5 overflow-x-auto">
            {AVATAR_OPTIONS.slice(0, 6).map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedAvatar(emoji)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition ${
                  selectedAvatar === emoji ? 'bg-purple-600 scale-110 shadow' : 'hover:bg-slate-800'
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
            className="flex-1 bg-slate-950 border-2 border-slate-700 focus:border-pink-500 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none transition"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 whitespace-nowrap"
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

      {/* Main Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
        <button
          onClick={onOpenCaseModal}
          className="px-5 py-3.5 rounded-2xl glass-card-interactive text-slate-200 font-extrabold text-sm shadow-xl flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Apresentar Estudo de Caso (TI)
        </button>

        <button
          onClick={onStartGame}
          className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-black text-xl sm:text-2xl shadow-neon-purple active:scale-95 transition flex items-center gap-3 animate-pulse"
        >
          <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          COMEÇAR O QUIZ DA SALA!
        </button>

        <button
          onClick={onOpenAdminModal}
          className="px-5 py-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-extrabold text-sm shadow-xl flex items-center gap-2 transition"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Painel do ADM
        </button>
      </div>
    </div>
  );
};
