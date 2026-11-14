import React, { useState, useEffect } from 'react';
import { GamePlayMode, DisputeMode } from '../types';
import { X, Sliders, Users, User, Clock, Award, Check, Gamepad2 } from 'lucide-react';

export interface RoomSettings {
  participationMode: 'equipes' | 'individual';
  teamCount: number;
  gameMode: GamePlayMode;
  disputeMode: DisputeMode;
  questionDuration: number;
  pointsPerCorrect: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  initialSettings: RoomSettings;
  canConfigureDispute?: boolean;
  onApplySettings: (settings: RoomSettings) => void;
}

export const RoomConfigModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sessionId,
  initialSettings,
  canConfigureDispute = true,
  onApplySettings,
}) => {
  const [participationMode, setParticipationMode] = useState<'equipes' | 'individual'>(
    initialSettings.participationMode
  );
  const [teamCount, setTeamCount] = useState<number>(initialSettings.teamCount);
  const [gameMode, setGameMode] = useState<GamePlayMode>(initialSettings.gameMode);
  const [disputeMode, setDisputeMode] = useState<DisputeMode>(initialSettings.disputeMode || 'direto');
  const [questionDuration, setQuestionDuration] = useState<number>(initialSettings.questionDuration);
  const [pointsPerCorrect, setPointsPerCorrect] = useState<number>(initialSettings.pointsPerCorrect);

  useEffect(() => {
    if (isOpen) {
      setParticipationMode(initialSettings.participationMode);
      setTeamCount(initialSettings.teamCount);
      setGameMode(initialSettings.gameMode);
      setDisputeMode(initialSettings.disputeMode || 'direto');
      setQuestionDuration(initialSettings.questionDuration);
      setPointsPerCorrect(initialSettings.pointsPerCorrect);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySettings({
      participationMode,
      teamCount,
      gameMode,
      disputeMode,
      questionDuration,
      pointsPerCorrect,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white select-none"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-[#0d111a] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Configurar Sala ({sessionId})
              </h3>
              <p className="text-xs text-slate-400">
                Defina equipes ou individual, tempo e pontuação da sua sala.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formato: Equipes vs Individual */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-300 block">
            1. Formato da Disputa
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setParticipationMode('equipes')}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                participationMode === 'equipes'
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-black">Por Equipes</div>
                <div className="text-[11px] opacity-80">Grupos competem juntos</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setParticipationMode('individual')}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                participationMode === 'individual'
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-black">Individual</div>
                <div className="text-[11px] opacity-80">Cada jogador por si</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quantidade de Equipes (when Por Equipes) */}
        {participationMode === 'equipes' && (
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-300 block">
              2. Quantidade de Equipes
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTeamCount(count)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition ${
                    teamCount === count
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modo de Resposta */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-300 block">
            {participationMode === 'equipes' ? '3.' : '2.'} Modo de Resposta
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGameMode('turno')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black border transition ${
                gameMode === 'turno'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              Por Turno (1 por vez)
            </button>
            <button
              type="button"
              onClick={() => setGameMode('todos')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black border transition ${
                gameMode === 'todos'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              Todos Respondem
            </button>
          </div>
        </div>

        {/* Tempo por Pergunta */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Tempo por Pergunta
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[15, 20, 30, 45, 60].map(sec => (
              <button
                key={sec}
                type="button"
                onClick={() => setQuestionDuration(sec)}
                className={`py-2.5 rounded-xl text-xs font-black border transition ${
                  questionDuration === sec
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Pontos por Acerto */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Pontos por Acerto
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[500, 1000, 1500, 2000].map(pts => (
              <button
                key={pts}
                type="button"
                onClick={() => setPointsPerCorrect(pts)}
                className={`py-2.5 rounded-xl text-xs font-black border transition ${
                  pointsPerCorrect === pts
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {pts}
              </button>
            ))}
          </div>
        </div>

        {/* Mini-Games de Disputa (Apenas ADM do Quiz ou Dono da Sala) */}
        {canConfigureDispute && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              Mini-Game antes da Pergunta (Dono da Sala / ADM do Quiz)
            </label>
            <p className="text-[11px] text-slate-400">
              Opcional: ative um mini-game para definir qual equipe ganha o direito de responder ou passar a pergunta.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'direto', label: 'Direto (Sem Mini-Game)', desc: 'Vai direto para a pergunta' },
                { id: 'peao', label: '🌀 Arena de Piões', desc: 'Pião que girar por mais tempo vence' },
                { id: 'buzzer', label: '⚡ Buzzer (Teclas 1-4)', desc: 'Passa ou repassa por reflexo' },
                { id: 'alvo', label: '🎯 Tiro ao Alvo', desc: 'Quem acertar mais perto do centro' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDisputeMode(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    disputeMode === opt.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
