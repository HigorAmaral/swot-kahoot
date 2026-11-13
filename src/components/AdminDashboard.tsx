import React, { useState } from 'react';
import { Team, Participant, RoundLog, Question } from '../types';
import { questionsData } from '../data/questions';
import { sound } from '../utils/sound';
import {
  ShieldAlert,
  Trophy,
  Plus,
  Minus,
  Sparkles,
  Users,
  Database,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  UserCheck,
  Trash2,
  RefreshCw,
  Clock,
  Download,
  Sliders
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onUpdateTeam: (teamId: number, updater: (t: Team) => Team) => void;
  onDeclareWinner: (teamId: number) => void;
  currentQuestionIndex: number;
  onSetQuestionIndex: (idx: number) => void;
  questions?: Question[];
  questionDuration?: number;
  onSetQuestionDuration?: (seconds: number) => void;
  pointsPerCorrect?: number;
  onSetPointsPerCorrect?: (points: number) => void;
  onGoToPodium?: () => void;
  onAddParticipant: (teamId: number, name: string) => void;
  onRemoveParticipant: (teamId: number, participantId: string, name: string) => void;
  onResetGame: () => void;
  sessionId: string;
  isDbConnected: boolean;
  roundLogs: RoundLog[];
  onOpenCreatorModal?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  isOpen,
  onClose,
  teams,
  onUpdateTeam,
  onDeclareWinner,
  currentQuestionIndex,
  onSetQuestionIndex,
  questions = questionsData,
  questionDuration = 30,
  onSetQuestionDuration,
  pointsPerCorrect = 1000,
  onSetPointsPerCorrect,
  onGoToPodium,
  onAddParticipant,
  onRemoveParticipant,
  onResetGame,
  sessionId,
  isDbConnected,
  roundLogs,
  onOpenCreatorModal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'winner_scores' | 'participants' | 'quiz_control' | 'logs'>('winner_scores');
  const [newParticipantNames, setNewParticipantNames] = useState<{ [teamId: number]: string }>({});

  if (!isOpen) return null;

  const handleScoreAdjust = (teamId: number, delta: number) => {
    sound.playTone(delta > 0 ? 700 : 300, 0.1, 'triangle', 0.15);
    onUpdateTeam(teamId, t => ({
      ...t,
      points: Math.max(0, t.points + delta),
    }));
  };

  const handleCandyAdjust = (teamId: number, type: 'candies' | 'chocolates', delta: number) => {
    sound.playCandyChime();
    onUpdateTeam(teamId, t => ({
      ...t,
      [type]: Math.max(0, t[type] + delta),
    }));
  };

  const handleAddUser = (teamId: number) => {
    const name = newParticipantNames[teamId]?.trim();
    if (!name) return;
    onAddParticipant(teamId, name);
    setNewParticipantNames(prev => ({ ...prev, [teamId]: '' }));
  };

  const totalParticipants = teams.reduce((acc, t) => acc + t.participants.length, 0);
  const leaderTeam = [...teams].sort((a, b) => b.points - a.points)[0];

  const handleExportCsv = () => {
    const rows = [
      ['Equipe', 'Pontos', 'Acertos', 'Erros', 'Balas', 'Chocolates', 'Vencedor', 'Integrantes'],
      ...teams.map(t => [
        `"${t.name}"`,
        t.points,
        t.answersCorrect,
        t.answersWrong,
        t.candies,
        t.chocolates,
        t.isWinner ? 'Sim' : 'Não',
        `"${t.participants.map(p => p.name).join(', ')}"`,
      ]),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_fabricaquiz_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Painel de Controle do Administrador (Host)
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Grupo de Comando
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerencie equipes, declare o vencedor, ajuste pontos e controle o banco de dados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Kahoot Quick Button */}
            {onOpenCreatorModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreatorModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Criar Perguntas</span>
              </button>
            )}

            {/* DB Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 hidden sm:inline">Neon DB:</span>
              <span className={`font-bold flex items-center gap-1 ${isDbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isDbConnected ? 'Conectado' : 'Local'}
              </span>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold transition"
                title="Bloquear Painel / Sair"
              >
                Sair
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Fechar Painel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 gap-2 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('winner_scores')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'winner_scores'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> 1. Declarar Vencedor & Pontos
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'participants'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> 2. Alunos nos Grupos ({teams.reduce((acc, t) => acc + t.participants.length, 0)})
          </button>
          <button
            onClick={() => setActiveTab('quiz_control')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'quiz_control'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 3. Rodadas & Mecânicas
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> 4. Histórico da Rodada ({roundLogs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* TAB 1: DECLARAR VENCEDOR & AJUSTAR PONTOS */}
          {activeTab === 'winner_scores' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Live Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-black uppercase text-slate-400">Alunos na Sala</div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">{totalParticipants}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-black uppercase text-slate-400">Perguntas Ativas</div>
                  <div className="text-2xl font-black text-cyan-400 mt-0.5">{questions.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-black uppercase text-slate-400">Rodadas Jogadas</div>
                  <div className="text-2xl font-black text-white mt-0.5">{roundLogs.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                  <div className="text-[10px] font-black uppercase text-amber-300">Líder Atual</div>
                  <div className="text-sm font-black text-white mt-1 truncate">{leaderTeam?.name || '-'}</div>
                </div>
              </div>

              <div className="bg-amber-950/40 border-2 border-amber-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Decisão Soberana do ADM: Declarar Vencedor da Atividade
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Como Administrador / Grupo de Comando, você pode proclamar qualquer equipe como vencedora da rodada ou do quiz inteiro a qualquer instante.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>
                  {onGoToPodium && (
                    <button
                      onClick={() => {
                        onGoToPodium();
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition"
                    >
                      <Award className="w-4 h-4" /> Ir para Pódio
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Teams with Winner Declaration & Score adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className={`p-5 rounded-2xl border-2 ${team.borderClass} bg-slate-800/80 shadow-xl flex flex-col justify-between`}
                  >
                    <div>
                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-full ${team.bgClass}`} />
                          <h4 className="font-extrabold text-white text-lg">
                            {team.name}
                          </h4>
                        </div>
                        <div className="font-mono text-2xl font-black text-white">
                          {team.points.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">pts</span>
                        </div>
                      </div>

                      {/* Members Chip Summary */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-4">
                        <span className="text-[11px] text-slate-400 font-semibold">Alunos:</span>
                        {team.participants.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">Nenhum cadastrado ainda</span>
                        ) : (
                          team.participants.map(p => (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-200 flex items-center gap-1"
                            >
                              <span>{p.avatar}</span> {p.name}
                            </span>
                          ))
                        )}
                      </div>

                      {/* Candies & Chocolates row */}
                      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span>🍬 Balas: <strong className="text-pink-300 font-bold">{team.candies}</strong></span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCandyAdjust(team.id, 'candies', -1)}
                              className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleCandyAdjust(team.id, 'candies', 1)}
                              className="w-5 h-5 rounded bg-pink-600 hover:bg-pink-500 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span>🍫 Choc: <strong className="text-amber-300 font-bold">{team.chocolates}</strong></span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleCandyAdjust(team.id, 'chocolates', -1)}
                              className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleCandyAdjust(team.id, 'chocolates', 1)}
                              className="w-5 h-5 rounded bg-amber-700 hover:bg-amber-600 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Points Quick Modifiers */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-4">
                        <span className="text-xs text-slate-400 font-bold mr-1">Pontos:</span>
                        <button
                          onClick={() => handleScoreAdjust(team.id, 100)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition"
                        >
                          +100
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(team.id, 500)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-bold text-emerald-300 transition"
                        >
                          +500
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(team.id, 1000)}
                          className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white transition"
                        >
                          +1.000
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(team.id, -200)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-bold text-rose-300 transition"
                        >
                          -200
                        </button>
                      </div>
                    </div>

                    {/* Declare Winner Button for this team */}
                    <button
                      onClick={() => {
                        onDeclareWinner(team.id);
                        onClose();
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
                    >
                      <Trophy className="w-4 h-4 fill-current" />
                      DECLARAR {team.name.toUpperCase()} COMO VENCEDOR! 🏆
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ALUNOS NOS GRUPOS (USUÁRIOS CADASTRADOS) */}
          {activeTab === 'participants' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-purple-950/40 border border-purple-500/40 p-4 rounded-2xl">
                <h3 className="text-base font-black text-purple-300 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Inscrição de Alunos nos 4 Grupos
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Os estudantes podem se inscrever na tela inicial ou o Administrador pode adicionar os nomes dos participantes diretamente por aqui.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-2xl border-2 ${team.borderClass} bg-slate-800/80 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${team.bgClass}`} />
                          <h4 className="font-extrabold text-white text-base">
                            {team.name}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400 font-bold">
                          {team.participants.length} participante(s)
                        </span>
                      </div>

                      {/* Participant input for this team */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newParticipantNames[team.id] || ''}
                          onChange={e => setNewParticipantNames({ ...newParticipantNames, [team.id]: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && handleAddUser(team.id)}
                          placeholder="Nome do aluno..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                        <button
                          onClick={() => handleAddUser(team.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>

                      {/* List of members */}
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {team.participants.length === 0 ? (
                          <div className="text-xs text-slate-500 italic p-2 text-center bg-slate-900/40 rounded-lg">
                            Nenhum aluno adicionado a esta equipe ainda.
                          </div>
                        ) : (
                          team.participants.map(p => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{p.avatar}</span>
                                <span className="font-bold text-white">{p.name}</span>
                              </div>
                              <button
                                onClick={() => onRemoveParticipant(team.id, p.id, p.name)}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950 transition"
                                title="Remover aluno"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONTROLE DE RODADAS & CONFIGURAÇÕES */}
          {activeTab === 'quiz_control' && (
            <div className="space-y-6 animate-fade-in">
              {/* Match Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <h4 className="font-black text-white text-sm mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" /> Tempo por Pergunta:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[15, 20, 30, 45, 60].map(sec => (
                      <button
                        key={sec}
                        onClick={() => onSetQuestionDuration && onSetQuestionDuration(sec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                          questionDuration === sec
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <h4 className="font-black text-white text-sm mb-2 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" /> Pontuação Base por Acerto:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 1500, 2000].map(pts => (
                      <button
                        key={pts}
                        onClick={() => onSetPointsPerCorrect && onSetPointsPerCorrect(pts)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                          pointsPerCorrect === pts
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {pts} pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Question Jumper */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <h4 className="font-black text-white text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Pular Diretamente para Pergunta (1 a {questions.length}):
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        onSetQuestionIndex(idx);
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl font-black text-sm transition flex flex-col items-center justify-center ${
                        currentQuestionIndex === idx
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-lg'
                          : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span className="text-[9px] uppercase opacity-75 truncate max-w-full">
                        {q.category || q.theme}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Quiz Button */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-rose-300 text-sm">Zerar e Reiniciar Toda a Atividade</h4>
                  <p className="text-xs text-slate-400">Limpa pontuações, brindes e registros da sessão atual.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente zerar o jogo?")) {
                      onResetGame();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Resetar Jogo
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: HISTÓRICO DE RODADAS & AUDITORIA */}
          {activeTab === 'logs' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-white text-sm">
                  Registro de Perguntas e Respostas da Sala:
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Sessão: {sessionId}
                </span>
              </div>

              {roundLogs.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-sm">
                  Nenhuma pergunta respondida ainda nesta sessão. Conforme a turma responder, os registros aparecerão aqui em tempo real.
                </div>
              ) : (
                <div className="space-y-2">
                  {roundLogs.map((log, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black ${
                          log.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {log.isCorrect ? '✓' : '✗'}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm">
                            Pergunta #{log.questionId}: {log.questionTitle}
                          </div>
                          <div className="text-slate-400">
                            Equipe: <strong className="text-purple-300">{teams.find(t => t.id === log.answeringTeamId)?.name || `Equipe ${log.answeringTeamId}`}</strong> • Disputa: {log.disputeMode} {log.isPassed ? '(Pergunta repassada)' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-400">
                          {log.pointsAwarded > 0 ? `+${log.pointsAwarded} pts` : '0 pts'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Painel exclusivo do Grupo de Comando e Professor.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 transition"
          >
            Concluir e Voltar ao Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
