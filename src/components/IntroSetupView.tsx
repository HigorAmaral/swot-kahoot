import React, { useState, useEffect } from 'react';
import { Team, UserAccount, Question, GamePlayMode, DisputeMode } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/toast';
import { showConfirm } from '../utils/confirm';
import { QRCodeSVG } from 'qrcode.react';
import { Play, Users, User, Sparkles, UserPlus, CheckCircle2, Share2, Layers, RotateCcw, BarChart3, Trophy, Activity, Plus, Trash2, X, Shuffle, Copy, KeyRound, RefreshCw, QrCode, Sliders, BookOpen, HelpCircle, Smartphone, Gamepad2 } from 'lucide-react';

interface Props {
  teams: Team[];
  currentUser: UserAccount;
  onUpdateTeamName: (teamId: number, newName: string) => void;
  onStartGame: () => void;
  onOpenCreatorModal?: () => void;
  onOpenMyQuizzesModal?: () => void;
  activeQuizInfo?: { title: string; shareCode?: string; ownerUsername?: string } | null;
  questions?: Question[];
  onClearActiveQuiz?: () => void;
  onShuffleQuestions?: () => void;
  sessionId?: string;
  onChangeRoomPin?: (pin?: string) => void;
  gameMode?: GamePlayMode;
  onSetGameMode?: (mode: GamePlayMode) => void;
  participationMode?: 'equipes' | 'individual';
  disputeMode?: DisputeMode;
  onOpenRoomConfig?: () => void;
  onOpenActiveQuizAdmin?: () => void;
  onOpenCaseStudy?: () => void;
  onOpenDynamicGuide?: () => void;
  onOpenRemoteControl?: () => void;
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
  onShuffleQuestions,
  sessionId = 'sala-principal',
  onChangeRoomPin,
  gameMode = 'turno',
  onSetGameMode,
  participationMode = 'equipes',
  disputeMode = 'direto',
  onOpenRoomConfig,
  onOpenActiveQuizAdmin,
  onOpenCaseStudy,
  onOpenDynamicGuide,
  onOpenRemoteControl,
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
  const [pinInput, setPinInput] = useState('');
  const [showPinJoin, setShowPinJoin] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
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
  const userCurrentTeam = teams.find(t =>
    t.participants.some(
      p => (p.name || (p as any).user_name || '').trim().toLowerCase() === currentUser.displayName.trim().toLowerCase()
    )
  );

  const handleJoinTeam = (teamId: number) => {
    if (userCurrentTeam) {
      if (userCurrentTeam.id === teamId) {
        showAlert(`Você já está participando do ${userCurrentTeam.name}!`, 'info');
      } else {
        showAlert(
          `Você já está no ${userCurrentTeam.name}! Saia do seu grupo atual (clique no × ao lado do seu nome) para entrar em outro.`,
          'warning'
        );
      }
      return;
    }

    const targetTeam = teams.find(t => t.id === teamId) || activeTeam;
    if (participationMode === 'individual' && targetTeam.participants.length === 0) {
      onUpdateTeamName(targetTeam.id, currentUser.displayName);
    }
    onAddParticipant(teamId, currentUser.displayName, currentUser.avatar);
    sound.playPlayerJoined();
    const msg =
      participationMode === 'individual'
        ? `${currentUser.avatar} ${currentUser.displayName} entrou na disputa individual!`
        : `${currentUser.avatar} ${currentUser.displayName} entrou no ${targetTeam.name}!`;
    setLastJoinedMessage(msg);
    showAlert(msg, 'success');

    setTimeout(() => {
      setLastJoinedMessage(null);
    }, 3500);
  };

  const handleJoinIndividual = () => {
    if (userCurrentTeam) {
      showAlert(`Você já está na sala como ${userCurrentTeam.name}!`, 'info');
      return;
    }
    const emptySlot = teams.find(t => t.participants.length === 0);
    if (emptySlot) {
      setSelectedTeamId(emptySlot.id);
      handleJoinTeam(emptySlot.id);
    } else {
      handleJoinTeam(selectedTeamId);
    }
  };

  const totalParticipants = teams.reduce((acc, t) => acc + t.participants.length, 0);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 xl:p-8 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden w-full glass-card rounded-3xl p-4 sm:p-6 lg:p-8 mb-5 sm:mb-6 border border-slate-800/90 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Ambient Desktop Glows */}
        <div className="pointer-events-none hidden lg:block absolute -top-28 -left-28 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none hidden lg:block absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex-1 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              {activeQuizInfo ? 'Kahoot Selecionado' : 'Arena de Perguntas'}
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-300">
              <span className="text-emerald-400 font-black">{questions.length}</span> perguntas
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-black">{teams.length}</span> grupos
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-black">{totalParticipants}</span> na sala
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2.5">
            {activeQuizInfo ? (
              <span>{activeQuizInfo.title}</span>
            ) : (
              <>
                Arena<span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Quiz</span>
              </>
            )}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl font-medium leading-relaxed">
            {activeQuizInfo
              ? `Este Kahoot possui ${questions.length} pergunta(s) pronta(s). Escolha sua equipe abaixo e clique em Começar!`
              : 'Escolha sua equipe abaixo, entre com sua conta e dispute os pontos, combos e brindes da rodada em tempo real!'}
          </p>

          {/* Live Room PIN Bar + QR Code + Game Mode */}
          <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner text-xs">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-bold">PIN:</span>
              <span className="font-mono font-black text-amber-300 tracking-wider text-sm">{sessionId}</span>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/?sala=${encodeURIComponent(sessionId)}`;
                  navigator.clipboard?.writeText(url).then(() => {
                    showAlert(`Link da sala "${sessionId}" copiado!`, 'success');
                  });
                }}
                className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Copiar link de convite da sala"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 transition"
                title="Mostrar QR Code da sala"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
              {onChangeRoomPin && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeRoomPin()}
                    className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition"
                    title="Gerar novo PIN de sala exclusivo"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPinJoin(v => !v)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-bold text-cyan-300 transition"
                  >
                    {showPinJoin ? 'Fechar' : 'Entrar por PIN'}
                  </button>
                </>
              )}
            </div>

            {onSetGameMode && (
              <div className="inline-flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onSetGameMode('turno')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    gameMode === 'turno'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Um grupo por rodada"
                >
                  Por Turno
                </button>
                <button
                  type="button"
                  onClick={() => onSetGameMode('todos')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    gameMode === 'todos'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Todos os grupos podem pontuar na mesma pergunta"
                >
                  Todos Respondem
                </button>
              </div>
            )}

            {onOpenRoomConfig && (
              <button
                type="button"
                onClick={onOpenRoomConfig}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-black transition"
                title="Configurar equipes/individual, tempo e pontos da sala"
              >
                <Sliders className="w-3.5 h-3.5" />
                Configurar Sala
              </button>
            )}

            {onShuffleQuestions && questions.length > 1 && (
              <button
                type="button"
                onClick={onShuffleQuestions}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition"
                title="Embaralhar ordem das perguntas e alternativas"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                Embaralhar
              </button>
            )}

            {onOpenRemoteControl && (
              <button
                type="button"
                onClick={onOpenRemoteControl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-black transition"
                title="Abrir controle no celular para responder com figuras geométricas"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Controle Mobile
              </button>
            )}

            {onOpenCaseStudy && (
              <button
                type="button"
                onClick={onOpenCaseStudy}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-300 text-xs font-bold transition"
                title="Ver Estudo de Caso InovaTech e Matriz SWOT"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Estudo de Caso
              </button>
            )}

            {onOpenDynamicGuide && (
              <button
                type="button"
                onClick={onOpenDynamicGuide}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/40 text-pink-300 text-xs font-bold transition"
                title="Ver Roteiro da Dinâmica de Sala"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Guia da Dinâmica
              </button>
            )}

            {disputeMode && disputeMode !== 'direto' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-500/20 border border-purple-400/50 text-purple-200 text-xs font-black">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-300" />
                Mini-Game: {disputeMode === 'peao' ? '🌀 Piões' : disputeMode === 'buzzer' ? '⚡ Buzzer' : '🎯 Alvo'}
              </span>
            )}

            {participationMode === 'individual' && (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                <User className="w-3.5 h-3.5" />
                Modo Individual
              </span>
            )}

            {showPinJoin && onChangeRoomPin && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!pinInput.trim()) return;
                  onChangeRoomPin(pinInput.trim());
                  setPinInput('');
                  setShowPinJoin(false);
                }}
                className="inline-flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Digite o PIN..."
                  className="w-28 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition"
                >
                  Ir
                </button>
              </form>
            )}
          </div>

          {activeQuizInfo && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
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

        {/* Main CTA Launch Pad */}
        <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-3 w-full lg:w-[320px] xl:w-[340px] shrink-0 lg:bg-slate-950/60 lg:p-4 lg:rounded-2xl lg:border lg:border-slate-800/90">
          <button
            onClick={onStartGame}
            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-current" />
            COMEÇAR O QUIZ
          </button>

          <div className="hidden sm:grid grid-cols-2 gap-2 w-full">
            {onOpenCreatorModal && (
              <button
                onClick={onOpenCreatorModal}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Criar Quiz
              </button>
            )}

            {onOpenMyQuizzesModal && (
              <button
                onClick={onOpenMyQuizzesModal}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-extrabold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                Meus Quizzes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SELECTED KAHOOT QUESTIONS PREVIEW ON MAIN SCREEN */}
      {activeQuizInfo && questions.length > 0 && (
        <div className="w-full glass-card rounded-2xl p-4 sm:p-5 mb-6 border border-slate-800 shadow-lg animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                Kahoot Carregado
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

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-2">
            <span>As perguntas ficam ocultas até você iniciar e concluir o quiz.</span>
            <span className="text-emerald-400 font-bold shrink-0">{questions.length} pergunta(s)</span>
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
                {participationMode === 'individual'
                  ? `Modo Individual ativo — clique para entrar automaticamente (${totalParticipants} na sala)`
                  : `Selecione uma equipe abaixo para entrar com 1 clique (${totalParticipants} na sala)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (participationMode === 'individual' ? handleJoinIndividual() : handleJoinTeam(selectedTeamId))}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            {participationMode === 'individual' ? 'Entrar na Disputa Individual' : `Entrar no ${activeTeam.name}`}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {teams.map(team => {
            const isSelected = selectedTeamId === team.id;
            const isUserInTeam = team.participants.some(
              p => (p.name || (p as any).user_name || '').toLowerCase() === currentUser.displayName.toLowerCase()
            );

            return (
              <div
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`group relative overflow-hidden p-4 lg:p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between h-full ${
                  isSelected
                    ? `${team.borderClass} bg-gradient-to-b from-slate-900/95 to-[#0b101b] shadow-2xl lg:-translate-y-1`
                    : 'border-slate-800/90 bg-slate-900/75 hover:bg-slate-900/95 hover:border-slate-700 lg:hover:-translate-y-1'
                }`}
              >
                {/* Top Colored Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-2 ${team.bgClass}`} />

                <div className="pt-1.5">
                  {/* Team Header (no overlapping absolute badges) */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-lg shrink-0 ${team.bgClass} text-white font-black text-xs flex items-center justify-center shadow-sm`}>
                        #{team.id}
                      </span>
                      <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider truncate">
                        Grupo {team.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-200 bg-slate-800/90 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        👥 {team.participants.length}
                      </span>
                      {onRemoveTeam && teams.length > 2 && (
                        <button
                          type="button"
                          onClick={async e => {
                            e.stopPropagation();
                            const ok = await showConfirm({
                              title: 'Remover Grupo',
                              message: `Remover "${team.name}" da competição?`,
                              confirmText: 'Remover',
                            });
                            if (ok) {
                              onRemoveTeam(team.id);
                              if (selectedTeamId === team.id) {
                                const next = teams.find(t => t.id !== team.id);
                                if (next) setSelectedTeamId(next.id);
                              }
                            }
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition"
                          title="Remover grupo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Editable Team Name */}
                  <input
                    type="text"
                    value={team.name}
                    onChange={e => onUpdateTeamName(team.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-white focus:outline-none focus:border-emerald-400 transition shadow-inner"
                    placeholder={`Nome da Equipe ${team.id}`}
                  />

                  {/* Participant Chips */}
                  <div className="mt-3.5 min-h-[72px]">
                    <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Integrantes</span>
                      {team.points > 0 && (
                        <span className="text-[11px] font-black text-amber-300">{team.points} pts</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                      {team.participants.length === 0 ? (
                        <div className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-800/90 bg-slate-950/40 text-center">
                          <span className="text-[11px] text-slate-500 italic">Nenhum integrante ainda</span>
                        </div>
                      ) : (
                        team.participants.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-bold text-white shadow-sm"
                          >
                            <span>{p.avatar || '👨‍💻'}</span>
                            <span className="max-w-[115px] truncate">{p.name || (p as any).user_name || 'Aluno'}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveParticipant(team.id, p.id, p.name);
                              }}
                              className="ml-0.5 text-slate-400 hover:text-rose-400 font-black leading-none"
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

                {/* Card footer direct join action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {isUserInTeam ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Você está neste grupo
                    </div>
                  ) : userCurrentTeam ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinTeam(team.id);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      Já está no {userCurrentTeam.name}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeamId(team.id);
                        handleJoinTeam(team.id);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 border border-slate-700 hover:border-emerald-400 text-slate-200 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Entrar neste grupo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0d111a] border border-cyan-500/40 p-6 text-center shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                Entrar via QR Code
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="inline-block p-4 rounded-2xl bg-white shadow-xl">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?sala=${encodeURIComponent(sessionId)}`}
                size={200}
                level="M"
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">Aponte a câmera do celular para entrar na sala:</p>
              <p className="text-lg font-black text-amber-300 tracking-widest mt-1">{sessionId}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
