import React, { useState } from 'react';
import { DisputeMode } from '../types';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Maximize2, HelpCircle, BookOpen, Settings, Users, Sparkles, Award } from 'lucide-react';

interface Props {
  disputeMode: DisputeMode;
  onSetDisputeMode: (mode: DisputeMode) => void;
  onOpenCaseModal: () => void;
  onOpenGuideModal: () => void;
}

export const HostHeader: React.FC<Props> = ({
  disputeMode,
  onSetDisputeMode,
  onOpenCaseModal,
  onOpenGuideModal,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur border-b border-purple-900/40 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-purple-600/30">
            K!
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg md:text-xl text-white tracking-tight">
                SWOT Kahoot!
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                TI & Gestão
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Funções Administrativas • Planejamento Estratégico
            </p>
          </div>
        </div>

        {/* Dispute Mode Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 gap-1">
          <span className="text-[11px] font-bold text-slate-400 px-2 hidden lg:inline">
            Modo da Disputa:
          </span>
          <button
            onClick={() => onSetDisputeMode('peao')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1 ${
              disputeMode === 'peao'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Peão tradicional: quem gira por mais tempo responde ou passa!"
          >
            <span>🌀 Peão</span>
          </button>
          <button
            onClick={() => onSetDisputeMode('buzzer')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1 ${
              disputeMode === 'buzzer'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Buzzer: quem bate primeiro no botão ou teclado (1, 2, 3, 4)"
          >
            <span>⚡ Buzzer</span>
          </button>
          <button
            onClick={() => onSetDisputeMode('alvo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1 ${
              disputeMode === 'alvo'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Alvo de Precisão: miro e acerto o centro"
          >
            <span>🎯 Alvo</span>
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Case Study */}
          <button
            onClick={onOpenCaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Paper / Caso TI</span>
          </button>

          {/* Dinamica Guide */}
          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-bold transition border border-purple-600/40"
          >
            <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden md:inline">Regras da Dinâmica</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title={isMuted ? "Ativar Efeitos Sonoros" : "Mutar Som"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 hidden sm:block"
            title="Tela Cheia (Projetor da Sala)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
