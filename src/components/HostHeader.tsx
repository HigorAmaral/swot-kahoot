import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Maximize2, ShieldAlert, Database, Sparkles } from 'lucide-react';

interface Props {
  onOpenAdminModal: () => void;
  onOpenCreatorModal: () => void;
  isDbConnected: boolean;
}

export const HostHeader: React.FC<Props> = ({
  onOpenAdminModal,
  onOpenCreatorModal,
  isDbConnected,
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
    <header className="w-full bg-slate-950/90 backdrop-blur-lg border-b border-cyan-500/20 px-3 sm:px-6 py-3 sticky top-0 z-40 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg shadow-emerald-500/30 tracking-tighter">
            FQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                Fabrica<span className="text-emerald-400">Quiz</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                Arena Interativa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sistema de Quiz em Tempo Real • Equipes & Premiação
            </p>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Create Kahoot Button */}
          <button
            onClick={onOpenCreatorModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-95"
            title="Criar novo quiz com PDF, Planilha Excel/CSV, Texto ou na mão"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar Quiz</span>
            <span className="sm:hidden">Criar</span>
          </button>

          {/* Admin Dashboard Button */}
          <button
            onClick={onOpenAdminModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/60 text-amber-300 text-xs font-black transition shadow-sm"
            title="Abrir Painel do Administrador (Requer Senha)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Painel ADM</span>
          </button>

          {/* DB Indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold"
            title="Status de Conexão com o Banco de Dados Neon PostgreSQL"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className={isDbConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isDbConnected ? 'Online' : 'Local'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Som'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800 hidden sm:block"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
