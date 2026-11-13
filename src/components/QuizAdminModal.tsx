import React, { useState, useEffect } from 'react';
import { SavedQuiz, Team, RoundLog, Question, GameStage, UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { buildQuizCsvReport, downloadCsvFile } from '../utils/quizReport';
import {
  X,
  BarChart3,
  Play,
  Copy,
  Check,
  RefreshCw,
  Users,
  Mail,
  Send,
  Trophy,
  CheckCircle2,
  Clock,
  Activity,
  Download
} from 'lucide-react';

interface Props {
  quiz: SavedQuiz | null;
  onClose: () => void;
  isActiveInArena: boolean;
  currentQuestionIndex: number;
  stage: GameStage;
  teams: Team[];
  roundLogs: RoundLog[];
  currentUser?: UserAccount | null;
  onLoadQuiz: (questions: Question[], title: string, shareCode?: string) => void;
}

interface QuizRunData {
  sessionId: string;
  playerUsername: string;
  playerName: string;
  playerAvatar: string;
  status: 'playing' | 'finished';
  currentQuestion: number;
  totalQuestions: number;
  winnerTeamName: string | null;
  winnerPoints: number;
  winnerMembers: string;
  startedAt: string;
  updatedAt: string;
}

interface QuizStatsData {
  shareCode: string;
  title: string;
  ownerUsername: string;
  ownerName: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  userShares: Array<{ recipientUsername: string; senderUsername: string; createdAt: string }>;
  emailInvites: Array<{ recipientEmail: string; senderUsername: string; createdAt: string }>;
  runs?: QuizRunData[];
}

export const QuizAdminModal: React.FC<Props> = ({
  quiz,
  onClose,
  isActiveInArena,
  currentQuestionIndex,
  stage,
  teams,
  roundLogs,
  currentUser,
  onLoadQuiz,
}) => {
  const [stats, setStats] = useState<QuizStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadStats = async () => {
    if (!quiz) return;
    setLoading(true);
    const res = await dbService.getQuizStats(quiz.shareCode);
    if (res.success && res.stats) {
      setStats(res.stats);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (quiz) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [quiz?.shareCode]);

  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const answeredCount = isActiveInArena ? roundLogs.length : 0;
  const correctCount = isActiveInArena ? roundLogs.filter(l => l.isCorrect).length : 0;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const currentStep = isActiveInArena
    ? stage === 'podium'
      ? totalQuestions
      : Math.min(currentQuestionIndex + 1, totalQuestions)
    : 0;
  const progressPercent = totalQuestions > 0 ? Math.round((currentStep / totalQuestions) * 100) : 0;

  const stageLabel: Record<GameStage, string> = {
    intro: 'Lobby / Preparação',
    case_study: 'Estudo de Caso',
    question_intro: 'Apresentando Pergunta',
    dispute: 'Disputa em Andamento',
    question_play: 'Respondendo ao Vivo',
    verdict: 'Veredito da Rodada',
    scoreboard: 'Placar Parcial',
    podium: 'Finalizado (Pódio)',
  };

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const totalParticipants = teams.reduce((acc, t) => acc + t.participants.length, 0);

  const declaredWinner = isActiveInArena ? teams.find(t => t.isWinner) : undefined;
  const arenaFinished = isActiveInArena && (stage === 'podium' || Boolean(declaredWinner));
  const arenaWinnerTeam = arenaFinished ? (declaredWinner || sortedTeams[0]) : undefined;

  const dbRuns = stats?.runs || [];
  const finishedRuns = dbRuns.filter(r => r.status === 'finished');
  const activeRuns = dbRuns.filter(r => r.status === 'playing');
  const latestWinnerRun = finishedRuns.find(r => r.winnerTeamName);

  const winnerDisplay = arenaWinnerTeam
    ? {
        teamName: arenaWinnerTeam.name,
        points: arenaWinnerTeam.points,
        members: arenaWinnerTeam.participants.map(p => p.name).join(', '),
        hostedBy: currentUser ? `@${currentUser.username}` : 'Sessão Atual',
      }
    : latestWinnerRun
    ? {
        teamName: latestWinnerRun.winnerTeamName!,
        points: latestWinnerRun.winnerPoints,
        members: latestWinnerRun.winnerMembers,
        hostedBy: `@${latestWinnerRun.playerUsername}`,
      }
    : null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?quiz=${quiz.shareCode}`;
    navigator.clipboard.writeText(url).then(() => {
      sound.playTone(700, 0.1, 'sine', 0.15);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 text-cyan-300 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white truncate">
                  Painel do Kahoot: {quiz.title}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-cyan-300">
                  {quiz.shareCode}
                </span>
                {isActiveInArena ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-black uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Em Andamento
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-black uppercase">
                    Em Espera
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Status, envios registrados e andamento em tempo real deste Kahoot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const csv = buildQuizCsvReport({
                  quizTitle: quiz.title,
                  shareCode: quiz.shareCode,
                  teams,
                  roundLogs,
                  runs: dbRuns,
                  isActiveInArena,
                });
                downloadCsvFile(`arenaquiz-${quiz.shareCode.toLowerCase()}.csv`, csv);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
              title="Exportar relatório CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={loadStats}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Andamento na Arena</span>
              </div>
              <span className="text-xs font-bold text-cyan-300">
                {isActiveInArena ? stageLabel[stage] : 'Não carregado na arena atual'}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>
                {isActiveInArena
                  ? `Pergunta ${currentStep} de ${totalQuestions}`
                  : `0 de ${totalQuestions} perguntas iniciadas`}
              </span>
              <span className="text-emerald-400">{progressPercent}% concluído</span>
            </div>
          </div>

          {/* 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400">Perguntas</div>
              <div className="text-2xl font-black text-white mt-0.5">{totalQuestions}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400">Envios @Usuário</div>
              <div className="text-2xl font-black text-cyan-400 mt-0.5">
                {stats ? stats.userShares.length : '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400">Convites E-mail</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {stats ? stats.emailInvites.length : '—'}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-black uppercase text-slate-400">Taxa de Acerto</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">
                {isActiveInArena && answeredCount > 0 ? `${accuracy}%` : '—'}
              </div>
            </div>
          </div>

          {/* Winner Highlight Card */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            winnerDisplay
              ? 'bg-gradient-to-r from-amber-950/70 via-yellow-950/40 to-slate-900 border-amber-400/60'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                winnerDisplay ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-500'
              }`}>
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Quem Ganhou este Kahoot
                </div>
                {winnerDisplay ? (
                  <>
                    <div className="text-base sm:text-lg font-black text-white">
                      {winnerDisplay.teamName} •{' '}
                      <span className="text-amber-300">{winnerDisplay.points.toLocaleString('pt-BR')} pts</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {winnerDisplay.members ? `Integrantes: ${winnerDisplay.members} • ` : ''}
                      Partida de <strong className="text-emerald-300">{winnerDisplay.hostedBy}</strong>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Ainda não há vencedor registrado para este Kahoot. Quando uma partida terminar, o vencedor aparecerá aqui!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Who is playing now & Who already finished */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Fazendo Agora ({activeRuns.length + (isActiveInArena && !arenaFinished && !activeRuns.some(r => r.playerUsername === currentUser?.username) ? 1 : 0)})
              </h3>
              {activeRuns.length === 0 && (!isActiveInArena || arenaFinished) ? (
                <p className="text-xs text-slate-500 italic py-3">
                  Ninguém está jogando este Kahoot neste momento.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {isActiveInArena && !arenaFinished && currentUser && !activeRuns.some(r => r.playerUsername === currentUser.username) && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{currentUser.avatar}</span>
                        <div className="min-w-0">
                          <div className="font-black text-white truncate">{currentUser.displayName}</div>
                          <div className="text-[10px] text-emerald-300">@{currentUser.username} • Você agora</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-300 shrink-0">
                        Pergunta {currentStep}/{totalQuestions}
                      </span>
                    </div>
                  )}
                  {activeRuns.map((r, idx) => (
                    <div
                      key={`${r.sessionId}_${r.playerUsername}_${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{r.playerAvatar}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{r.playerName}</div>
                          <div className="text-[10px] text-slate-400">@{r.playerUsername}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-cyan-300 shrink-0">
                        Pergunta {r.currentQuestion}/{r.totalQuestions || totalQuestions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Quem Já Fez ({finishedRuns.length})
              </h3>
              {finishedRuns.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3">
                  Nenhuma partida concluída registrada ainda.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {finishedRuns.map((r, idx) => (
                    <div
                      key={`${r.sessionId}_${r.playerUsername}_${idx}`}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{r.playerAvatar}</span>
                          <span className="font-bold text-white truncate">{r.playerName}</span>
                          <span className="text-[10px] text-slate-400">@{r.playerUsername}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(r.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {r.winnerTeamName && (
                        <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 flex-wrap">
                          <span>🏆 Ganhou: {r.winnerTeamName} ({r.winnerPoints.toLocaleString('pt-BR')} pts)</span>
                          {r.winnerMembers && (
                            <span className="text-slate-400 font-normal">• {r.winnerMembers}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Teams & Logs if Active */}
          {isActiveInArena && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Placar Atual ({totalParticipants} alunos)
                  </h3>
                </div>
                <div className="space-y-2">
                  {sortedTeams.map((t, i) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-slate-500 w-4">#{i + 1}</span>
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.bgClass}`} />
                        <span className="font-bold text-white truncate">{t.name}</span>
                      </div>
                      <span className="font-mono font-black text-emerald-400 shrink-0">
                        {t.points.toLocaleString('pt-BR')} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Últimas Respostas ({roundLogs.length})
                </h3>
                {roundLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    Nenhuma pergunta respondida ainda nesta rodada.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {roundLogs.slice(0, 8).map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black shrink-0 ${
                            log.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {log.isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="text-slate-200 truncate">{log.questionTitle}</span>
                        </div>
                        <span className="font-bold text-emerald-400 shrink-0">
                          +{log.pointsAwarded}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shares & Email Invites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Enviado para Usuários ({stats?.userShares.length || 0})
              </h3>
              {!stats || stats.userShares.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3">
                  Ainda não enviado diretamente para nenhum @usuário.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {stats.userShares.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <Send className="w-3 h-3" /> @{s.recipientUsername}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Convites por E-mail ({stats?.emailInvites.length || 0})
              </h3>
              {!stats || stats.emailInvites.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-3">
                  Nenhum convite enviado por e-mail ainda.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {stats.emailInvites.map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="font-bold text-emerald-300 truncate">{inv.recipientEmail}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(inv.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            {copied ? 'Link Copiado!' : 'Copiar Link Direto'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isActiveInArena ? 'Voltar para o Jogo' : 'Iniciar este Kahoot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
