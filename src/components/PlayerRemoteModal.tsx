import React, { useState, useEffect } from 'react';
import { Team, UserAccount, Question, GameStage } from '../types';
import { sound } from '../utils/sound';
import { showAlert } from '../utils/toast';
import { Smartphone, X, CheckCircle2, Radio, Users } from 'lucide-react';

export interface RemoteVotePayload {
  sessionId: string;
  questionId: number;
  teamId: number;
  optionIndex: number;
  playerName: string;
  timestamp: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  teams: Team[];
  currentUser: UserAccount;
  currentQuestion?: Question;
  stage: GameStage;
  onCastVote?: (teamId: number, optionIndex: number) => void;
}

export const PlayerRemoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sessionId,
  teams,
  currentUser,
  currentQuestion,
  stage,
  onCastVote,
}) => {
  const userTeam = teams.find(t =>
    t.participants.some(
      p => (p.name || '').trim().toLowerCase() === currentUser.displayName.trim().toLowerCase()
    )
  );

  const [selectedTeamId, setSelectedTeamId] = useState<number>(userTeam?.id || teams[0]?.id || 1);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userTeam) {
      setSelectedTeamId(userTeam.id);
    }
  }, [userTeam?.id]);

  useEffect(() => {
    setVotedIndex(null);
  }, [currentQuestion?.id, stage]);

  if (!isOpen) return null;

  const activeTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const options = currentQuestion?.options || [
    { text: 'Alternativa A', symbol: 'triangle', color: 'bg-kahoot-red' },
    { text: 'Alternativa B', symbol: 'diamond', color: 'bg-kahoot-blue' },
    { text: 'Alternativa C', symbol: 'circle', color: 'bg-kahoot-yellow' },
    { text: 'Alternativa D', symbol: 'square', color: 'bg-kahoot-green' },
  ];

  const handleTapOption = (idx: number) => {
    setVotedIndex(idx);
    sound.playTone(580, 0.14, 'sine', 0.2);

    const payload: RemoteVotePayload = {
      sessionId,
      questionId: currentQuestion?.id || 0,
      teamId: activeTeam?.id || 1,
      optionIndex: idx,
      playerName: currentUser.displayName,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem('arenaquiz_remote_vote', JSON.stringify(payload));
    } catch {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('arenaquiz_sync');
        ch.postMessage({ type: 'REMOTE_VOTE', payload });
        ch.close();
      }
    } catch {}

    onCastVote?.(payload.teamId, idx);
    showAlert(`Voto enviado para ${activeTeam?.name || 'sua equipe'}!`, 'success');
  };

  const symbolMap: Record<string, string> = {
    triangle: '▲',
    diamond: '◆',
    circle: '●',
    square: '■',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-[#0d111a] border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#080b12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Controle Mobile
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Radio className="w-3 h-3 animate-pulse" /> PIN: {sessionId}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Toque na figura geométrica correspondente para enviar a resposta da sua equipe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Team Selector */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Respondendo pela equipe:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {teams.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border text-left truncate transition flex items-center gap-2 ${
                    selectedTeamId === t.id
                      ? `${t.bgClass} text-white border-white shadow-lg`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.bgClass} shrink-0`} />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Question Preview */}
          {currentQuestion && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                {stage === 'question_play' ? '⚡ Valendo Agora na Tela Principal' : 'Próxima / Pergunta Atual'}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1 line-clamp-3">
                {currentQuestion.question}
              </p>
            </div>
          )}

          {/* 4 Geometric Controller Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt, idx) => {
              const isVoted = votedIndex === idx;
              const sym = symbolMap[opt.symbol] || ['▲', '◆', '●', '■'][idx] || '●';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTapOption(idx)}
                  className={`kahoot-option-card min-h-[125px] sm:min-h-[140px] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-white font-black shadow-xl transition transform active:scale-95 ${
                    opt.color
                  } ${isVoted ? 'ring-4 ring-white scale-[1.02] brightness-125' : 'hover:brightness-110'}`}
                >
                  <span className="w-12 h-12 rounded-2xl bg-black/25 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                    {sym}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-center line-clamp-2 leading-snug">
                    {opt.text}
                  </span>
                  {isVoted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-black uppercase text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Enviado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
