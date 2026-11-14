import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Maximize2, ShieldAlert, Sparkles, Share2, LogOut, Download, Music, Globe } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { MascotDetail } from './ArenaMascot';

interface Props {
  onOpenAdminModal: () => void;
  onOpenCreatorModal: () => void;
  onOpenMyQuizzesModal: () => void;
  onOpenCommunityModal: () => void;
  onOpenProfileModal: () => void;
  currentUser: UserAccount;
  onLogoutUser: () => void;
  isAdmin: boolean;
}

export const HostHeader: React.FC<Props> = ({
  onOpenAdminModal,
  onOpenCreatorModal,
  onOpenMyQuizzesModal,
  onOpenCommunityModal,
  onOpenProfileModal,
  currentUser,
  onLogoutUser,
  isAdmin,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isMusicOn, setIsMusicOn] = useState(() => sound.getMusicEnabled());
  const [musicTrack, setMusicTrack] = useState<1 | 2 | 3>(() => sound.getMusicTrack());
  const [musicVolume, setMusicVolume] = useState<number>(() => sound.getMusicVolume());
  const { canInstall, promptInstall } = usePwaInstall();

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const enabled = sound.toggleMusic();
    setIsMusicOn(enabled);
  };

  const handleSwitchTrack = () => {
    const nextTrack = sound.toggleMusicTrack();
    setMusicTrack(nextTrack);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = sound.setMusicVolume(parseFloat(e.target.value));
    setMusicVolume(vol);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] px-3 sm:px-6 lg:px-8 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 sm:py-3 sticky top-0 z-40 shrink-0">
      <div className="w-full max-w-[1680px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo / Title with Animated Mascot Face */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <MascotDetail variant="face" size="sm" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-base sm:text-xl lg:text-2xl text-white tracking-tight truncate">
                Arena<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Quiz</span>
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Arena Interativa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              Quiz Competitivo em Tempo Real • Equipes, Power-Ups & Premiação
            </p>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Desktop Navigation Pill Group */}
          <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 lg:bg-slate-900/70 lg:border lg:border-slate-800/90 lg:p-1 lg:rounded-2xl">
            {/* Create Kahoot Button */}
            <button
              onClick={onOpenCreatorModal}
              className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-95"
              title="Criar novo quiz com PDF, Planilha Excel/CSV, Texto ou na mão"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Criar Quiz</span>
            </button>

            {/* Community Button (Desktop) */}
            <button
              onClick={onOpenCommunityModal}
              className="flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-black transition active:scale-95"
              title="Explorar e compartilhar Kahoots na Comunidade"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Comunidade</span>
            </button>

            {/* My Quizzes / Share Button */}
            <button
              onClick={onOpenMyQuizzesModal}
              className="flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-slate-200 text-xs font-bold transition"
              title="Meus Kahoots salvos e enviar para outras pessoas"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Meus Kahoots / Enviar</span>
              <span className="md:hidden">Enviar</span>
            </button>

            {/* Admin Dashboard Button */}
            {isAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 lg:px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-black transition shadow-sm"
                title="Abrir Painel do Administrador (Exclusivo ADM)"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Painel ADM</span>
              </button>
            )}
          </div>

          {/* Mobile Community Button */}
          <button
            onClick={onOpenCommunityModal}
            className="sm:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 text-xs font-black transition active:scale-95"
            title="Explorar e compartilhar Kahoots na Comunidade"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 text-xs font-black transition active:scale-95"
              title="Instalar ArenaQuiz como aplicativo"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">App</span>
            </button>
          )}

          {/* Unified Audio & Music Studio Pill */}
          <div className="flex items-center gap-1 lg:bg-slate-900/80 lg:border lg:border-slate-800 lg:p-1 lg:rounded-2xl">
            <button
              onClick={handleToggleMusic}
              className={`p-2 rounded-xl transition border ${
                isMusicOn && !isMuted
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-500'
              }`}
              title={isMusicOn ? 'Desligar Música de Fundo' : 'Ligar Música de Fundo'}
            >
              <Music className="w-4 h-4" />
            </button>
            {isMusicOn && !isMuted && (
              <>
                <button
                  onClick={handleSwitchTrack}
                  className="px-2 lg:px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-[11px] font-black text-emerald-300 transition flex items-center gap-1"
                  title={`Trocar música (Atual: Faixa ${musicTrack} — ${musicTrack === 1 ? 'Lo-Fi Groove' : musicTrack === 2 ? 'Arcade Synth' : 'Suspense'})`}
                >
                  <span>♪{musicTrack}</span>
                  <span className="hidden 2xl:inline text-[10px] text-slate-400 font-bold">
                    {musicTrack === 1 ? 'Lo-Fi' : musicTrack === 2 ? 'Arcade' : 'Suspense'}
                  </span>
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={handleVolumeChange}
                  className="hidden md:block w-14 lg:w-16 accent-emerald-400 cursor-pointer mx-1"
                  title={`Volume da música: ${Math.round(musicVolume * 100)}%`}
                />
              </>
            )}

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Som'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

          {/* Logged-in User (Click to Customize) & Logout */}
          <div className="flex items-center gap-1.5 sm:pl-2 sm:border-l sm:border-slate-800">
            <button
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-xs font-bold text-slate-200 transition active:scale-95 max-w-[125px] sm:max-w-none shadow-sm"
              title="Clique para personalizar sua conta (nome, avatar, senha)"
            >
              <span className="text-base shrink-0">{currentUser.avatar}</span>
              <span className="hidden sm:inline truncate">{currentUser.displayName}</span>
              <span className="sm:hidden truncate">@{currentUser.username}</span>
            </button>
            <button
              onClick={onLogoutUser}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 transition border border-slate-800"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 transition border border-slate-800 hidden sm:block"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
