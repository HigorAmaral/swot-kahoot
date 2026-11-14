import React from 'react';
import { Home, Sparkles, FolderOpen, Share2, ShieldAlert, Globe } from 'lucide-react';

interface Props {
  onGoHome: () => void;
  onOpenCreatorModal: () => void;
  onOpenKahootsDrawer: () => void;
  onOpenMyQuizzesModal: () => void;
  onOpenCommunityModal: () => void;
  onOpenAdminModal: () => void;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<Props> = ({
  onGoHome,
  onOpenCreatorModal,
  onOpenKahootsDrawer,
  onOpenMyQuizzesModal,
  onOpenCommunityModal,
  onOpenAdminModal,
  isAdmin,
}) => {
  return (
    <nav
      aria-label="Navegação mobile"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d111a]/95 backdrop-blur-lg border-t border-slate-800/90 px-1.5 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          type="button"
          onClick={onGoHome}
          className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl text-slate-300 hover:text-white active:scale-95 transition min-w-[48px]"
        >
          <Home className="w-5 h-5 text-slate-300" />
          <span className="text-[10px] font-bold tracking-tight">Início</span>
        </button>

        <button
          type="button"
          onClick={onOpenCommunityModal}
          className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl text-cyan-300 hover:text-white active:scale-95 transition min-w-[52px]"
        >
          <Globe className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-bold tracking-tight">Comunidade</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreatorModal}
          className="flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 active:scale-95 transition min-w-[54px]"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-black tracking-tight">Criar</span>
        </button>

        <button
          type="button"
          onClick={onOpenKahootsDrawer}
          className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl text-slate-300 hover:text-white active:scale-95 transition min-w-[48px]"
        >
          <FolderOpen className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-bold tracking-tight">Kahoots</span>
        </button>

        <button
          type="button"
          onClick={onOpenMyQuizzesModal}
          className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl text-slate-300 hover:text-white active:scale-95 transition min-w-[48px]"
        >
          <Share2 className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-tight">Enviar</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="flex flex-col items-center justify-center gap-0.5 px-1.5 py-1 rounded-xl text-amber-300 hover:text-amber-200 active:scale-95 transition min-w-[44px]"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-black tracking-tight">ADM</span>
          </button>
        )}
      </div>
    </nav>
  );
};
