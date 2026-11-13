import React, { useState, useEffect } from 'react';
import { Team, UserAccount, Question } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { Play, Users, Sparkles, UserPlus, CheckCircle2, Share2, Layers, RotateCcw, BarChart3, Trophy, Activity, Plus, Trash2, X } from 'lucide-react';

interface Props {
  teams: Team[];
  currentUser: UserAccount;
  onUpdateTeamName: (teamId: number, newName: string) => void;
  onStartGame: () => void;
  onOpenCreatorModal?: () => void;
  onOpenMyQuizzesModal?: () => void;
  activeQuizInfo?: { title: string; shareCode?: string } | null;
  questions?: Question[];
  onClearActiveQuiz?: () => void;
  onOpenActiveQuizAdmin?: () => void;
  onAddParticipant: (teamId: number, name: string, avatar?: string) => void;
  onRemoveParticipant: (teamId: number, participantId: string, name: string) => void;
  onAddTeam?: (name: string, colorIdx?: number) => void;
  onRemoveTeam?: (teamId: number) => void;
}

const GROUP_COLOR_SWATCHES = [
  { label: 'Vermelho', bg: 'bg-kahoot-red' },
  { label: 'Azul', bg: 'bg-kahoot-blue' },
  { label: 'Amarelo', bg: 'bg-kahoot-yellow' },
  { label: 'Verde', bg: 'bg-kahoot-green' },
  { label: 'Roxo', bg: 'bg-purple-600' },
  { label: 'Ciano', bg: 'bg-cyan-600' },
  { label: 'Rosa', bg: 'bg-pink-600' },
  { label: 'Laranja', bg: 'bg-orange-600' },
];

export const IntroSetupView: React.FC<Props> = ({
  teams,
  currentUser,
  onUpdateTeamName,
  onStartGame,
  onOpenCreatorModal,
  onOpenMyQuizzesModal,
  activeQuizInfo,
  questions = [],
  onClearActiveQuiz,
  onOpenActiveQuizAdmin,
  onAddParticipant,
  onRemoveParticipant,
  onAddTeam,
  onRemoveTeam,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1);
  const [lastJoinedMessage, setLastJoinedMessage] = useState<string | null>(null);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColorIdx, setNewGroupColorIdx] = useState(4);
  const [quizSummary, setQuizSummary] = useState<{
    playingCount: number;
    finishedCount: number;
    winnerTeamName: string | null;
    winnerPoints: number;
  } | null>(null);

  useEffect(() => {
    const code = activeQuizInfo?.shareCode;
    if (!code) {
      setQuizSummary(null);
      return;
    }
    let cancelled = false;
    dbService.getQuizStats(code).then(res => {
      if (cancelled || !res.success || !res.stats) return;
      const runs = res.stats.runs || [];
      const playing = runs.filter(r => r.status === 'playing');
      const finished = runs.filter(r => r.status === 'finished');
      const lastWinner = finished.find(r => r.winnerTeamName);
      setQuizSummary({
        playingCount: playing.length,
        finishedCount: finished.length,
        winnerTeamName: lastWinner?.winnerTeamName || null,
        winnerPoints: lastWinner?.winnerPoints || 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [activeQuizInfo?.shareCode]);

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleJoinTeam = (teamId: number) => {
    const targetTeam = teams.find(t => t.id === teamId) || activeTeam;
    onAddParticipant(teamId, currentUser.displayName, currentUser.avatar);
    sound.playTone(650, 0.15, 'sine', 0.2);
    setLastJoinedMessage(`${currentUser.avatar} ${currentUser.displayName} entrou no ${targetTeam.name}!`);

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
            {activeQuizInfo ? 'Kahoot Selecionado na Arena' : 'Arena Interativa em Sala'}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2">
            {activeQuizInfo ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {activeQuizInfo.title}
              </span>
            ) : (
              <>
                Fabrica<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Quiz</span>
              </>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium">
            {activeQuizInfo
              ? `Este Kahoot possui ${questions.length} pergunta(s) pronta(s). Escolha sua equipe abaixo e clique em Começar!`
              : 'Escolha sua equipe abaixo, entre com sua conta e dispute os pontos e brindes da rodada!'}
          </p>

          {activeQuizInfo && (
            <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{questions.length} pergunta(s)</span>
                {activeQuizInfo.shareCode && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black">
                    Código: {activeQuizInfo.shareCode}
                  </span>
                )}
              </div>
              {onClearActiveQuiz && (
                <button
                  onClick={onClearActiveQuiz}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition"
                  title="Voltar para o quiz padrão"
                >
                  <RotateCcw className="w-3 h-3" /> Trocar / Padrão
                </button>
              )}
            </div>
          )}
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

          <div className="flex flex-wrap items-center gap-2 justify-center">
            {onOpenCreatorModal && (
              <button
                onClick={onOpenCreatorModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Criar Quiz
              </button>
            )}

            {onOpenMyQuizzesModal && (
              <button
                onClick={onOpenMyQuizzesModal}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                Enviar / Meus Quizzes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SELECTED KAHOOT QUESTIONS PREVIEW ON MAIN SCREEN */}
      {activeQuizInfo && questions.length > 0 && (
        <div className="w-full glass-card rounded-3xl p-4 sm:p-5 mb-6 border-2 border-cyan-500/35 shadow-xl animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                🎯 Kahoot Carregado
              </span>
              <h2 className="text-sm sm:text-base font-black text-white">
                {activeQuizInfo.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300">
                {questions.length} pergunta(s) na fila
              </span>
              {onOpenActiveQuizAdmin && (
                <button
                  onClick={onOpenActiveQuizAdmin}
                  className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5 transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Status / ADM
                </button>
              )}
            </div>
          </div>

          {quizSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Fazendo agora: <strong className="text-emerald-300">{quizSummary.playingCount}</strong>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Já concluíram: <strong className="text-cyan-300">{quizSummary.finishedCount}</strong>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-2 text-xs">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  {quizSummary.winnerTeamName
                    ? <>Vencedor: <strong className="text-amber-300">{quizSummary.winnerTeamName}</strong></>
                    : 'Sem vencedor ainda'}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 flex items-start gap-2 text-xs"
              >
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-black flex items-center justify-center shrink-0 text-[11px]">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-100 line-clamp-2 leading-snug">
                    {q.question}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {q.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCOUNT QUICK JOIN BAR (NO NAME TYPING NEEDED) */}
      <div className="w-full glass-card rounded-3xl p-4 sm:p-5 mb-6 text-left border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl shadow">
              {currentUser.avatar}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Participando como: <span className="text-emerald-400">{currentUser.displayName}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione uma equipe abaixo para entrar com 1 clique ({totalParticipants} na sala)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleJoinTeam(selectedTeamId)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Entrar no {activeTeam.name}
          </button>
        </div>

        {/* Success Alert */}
        {lastJoinedMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/60 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce-short">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {lastJoinedMessage}
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="w-full text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <span className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Competição entre Grupos ({teams.length} grupos ativos — clique para entrar):
          </span>
          {onAddTeam && (
            <button
              type="button"
              onClick={() => setShowNewGroupForm(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-xs font-black flex items-center gap-1.5 transition"
            >
              {showNewGroupForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showNewGroupForm ? 'Fechar' : 'Novo Grupo'}
            </button>
          )}
        </div>

        {/* Create New Competing Group Form */}
        {showNewGroupForm && onAddTeam && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!newGroupName.trim()) return;
              onAddTeam(newGroupName.trim(), newGroupColorIdx);
              sound.playCorrect();
              setNewGroupName('');
              setShowNewGroupForm(false);
            }}
            className="mb-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in"
          >
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="Nome do novo grupo (ex: Turma A, Equipe Relâmpago)..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-1.5 justify-center">
              {GROUP_COLOR_SWATCHES.map((sw, idx) => (
                <button
                  key={sw.label}
                  type="button"
                  onClick={() => setNewGroupColorIdx(idx)}
                  title={sw.label}
                  className={`w-6 h-6 rounded-full ${sw.bg} transition ${
                    newGroupColorIdx === idx ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Criar Grupo
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3.5 sm:gap-4">
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

                {/* Active Selection Indicator + Remove Group */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {isSelected && (
                    <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </div>
                  )}
                  {onRemoveTeam && teams.length > 2 && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Remover "${team.name}" da competição?`)) {
                          onRemoveTeam(team.id);
                          if (selectedTeamId === team.id) {
                            const next = teams.find(t => t.id !== team.id);
                            if (next) setSelectedTeamId(next.id);
                          }
                        }
                      }}
                      className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition"
                      title="Remover grupo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

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
