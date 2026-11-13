import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Maximize2, ShieldAlert, Sparkles, Share2, LogOut } from 'lucide-react';

interface Props {
  onOpenAdminModal: () => void;
  onOpenCreatorModal: () => void;
  onOpenMyQuizzesModal: () => void;
  onOpenProfileModal: () => void;
  currentUser: UserAccount;
  onLogoutUser: () => void;
  isAdmin: boolean;
}

export const HostHeader: React.FC<Props> = ({
  onOpenAdminModal,
  onOpenCreatorModal,
  onOpenMyQuizzesModal,
  onOpenProfileModal,
  currentUser,
  onLogoutUser,
  isAdmin,
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
    <header className="w-full bg-[#0d111a] border-b border-slate-800 px-2.5 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-base sm:text-lg text-slate-950 tracking-tighter shrink-0">
            AQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-xl text-white tracking-tight">
                Arena<span className="text-emerald-400">Quiz</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Quiz em Tempo Real • Equipes & Premiação
            </p>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Create Kahoot Button */}
          <button
            onClick={onOpenCreatorModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition active:scale-95"
            title="Criar novo quiz com PDF, Planilha Excel/CSV, Texto ou na mão"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar Quiz</span>
            <span className="sm:hidden">Criar</span>
          </button>

          {/* My Quizzes / Share Button */}
          <button
            onClick={onOpenMyQuizzesModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
            title="Meus Kahoots salvos e enviar para outras pessoas"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Meus Kahoots / Enviar</span>
            <span className="md:hidden">Enviar</span>
          </button>

          {/* Admin Dashboard Button (Exclusive to Admin @higoramaral) */}
          {isAdmin && (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/60 text-amber-300 text-xs font-black transition shadow-sm"
              title="Abrir Painel do Administrador (Exclusivo ADM)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Painel ADM</span>
            </button>
          )}

          {/* Logged-in User (Click to Customize) & Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-xs font-bold text-slate-200 transition active:scale-95"
              title="Clique para personalizar sua conta (nome, avatar, senha)"
            >
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="hidden sm:inline">{currentUser.displayName}</span>
              <span className="sm:hidden">@{currentUser.username}</span>
            </button>
            <button
              onClick={onLogoutUser}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 transition border border-slate-800"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
