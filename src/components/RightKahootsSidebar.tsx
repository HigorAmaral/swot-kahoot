import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SavedQuiz, UserAccount, Question } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { showConfirm } from '../utils/confirm';
import {
  Sparkles,
  Play,
  Share2,
  Trash2,
  Plus,
  RefreshCw,
  FolderOpen,
  Inbox,
  X,
  ChevronLeft,
  Search,
  Link2,
  Check,
  BarChart3
} from 'lucide-react';

interface Props {
  currentUser: UserAccount;
  activeShareCode?: string;
  refreshKey: number;
  onLoadQuiz: (questions: Question[], title: string, shareCode?: string) => void;
  onOpenCreator: () => void;
  onOpenShareModal: () => void;
  onOpenQuizAdmin?: (quiz: SavedQuiz) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export const RightKahootsSidebar: React.FC<Props> = ({
  currentUser,
  activeShareCode,
  refreshKey,
  onLoadQuiz,
  onOpenCreator,
  onOpenShareModal,
  onOpenQuizAdmin,
  mobileOpen: controlledMobileOpen,
  onMobileOpenChange,
}) => {
  const [tab, setTab] = useState<'mine' | 'received'>('mine');
  const [myQuizzes, setMyQuizzes] = useState<SavedQuiz[]>([]);
  const [receivedQuizzes, setReceivedQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const mobileOpen = controlledMobileOpen ?? internalMobileOpen;
  const setMobileOpen = (open: boolean) => {
    setInternalMobileOpen(open);
    onMobileOpenChange?.(open);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadQuizzes = async () => {
    setLoading(true);
    const data = await dbService.getMyQuizzes(currentUser.username);
    setMyQuizzes(data.myQuizzes);
    setReceivedQuizzes(data.receivedQuizzes);
    setLoading(false);
  };

  useEffect(() => {
    loadQuizzes();
  }, [currentUser.username, refreshKey]);

  const handleDelete = async (quiz: SavedQuiz) => {
    const ok = await showConfirm({
      title: 'Excluir Kahoot',
      message: `Excluir o Kahoot "${quiz.title}"?`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    await dbService.deleteQuiz(quiz.shareCode, currentUser.username);
    sound.playTone(300, 0.1, 'triangle', 0.15);
    loadQuizzes();
  };

  const rawList = tab === 'mine' ? myQuizzes : receivedQuizzes;
  const list = rawList.filter(q => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      q.title.toLowerCase().includes(term) ||
      q.shareCode.toLowerCase().includes(term)
    );
  });

  const handleCopyQuizLink = (shareCode: string) => {
    const url = `${window.location.origin}/?quiz=${shareCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(shareCode);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(() => {});
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight">Kahoots Feitos</h2>
            <p className="text-[10px] text-slate-400">@{currentUser.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadQuizzes}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenCreator}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1 transition"
            title="Criar novo Kahoot"
          >
            <Plus className="w-3.5 h-3.5" /> Novo
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950/60 border-b border-slate-800">
        <button
          onClick={() => setTab('mine')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
            tab === 'mine'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" /> Meus ({myQuizzes.length})
        </button>
        <button
          onClick={() => setTab('received')}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
            tab === 'received'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Inbox className="w-3 h-3" /> Recebidos ({receivedQuizzes.length})
        </button>
      </div>

      {/* Search Filter */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por título ou código..."
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading && list.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">Carregando...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 px-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <p className="text-xs font-bold text-slate-300 mb-1">
              {tab === 'mine' ? 'Nenhum Kahoot criado ainda' : 'Nenhum Kahoot recebido'}
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              {tab === 'mine'
                ? 'Crie seu primeiro quiz e ele aparecerá aqui!'
                : 'Quizzes enviados para você aparecem aqui.'}
            </p>
            {tab === 'mine' && (
              <button
                onClick={onOpenCreator}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition"
              >
                + Criar Kahoot
              </button>
            )}
          </div>
        ) : (
          list.map(quiz => {
            const isActive = activeShareCode === quiz.shareCode;
            return (
              <div
                key={`${quiz.shareCode}_${quiz.sharedBy || 'own'}`}
                onClick={() => {
                  sound.playTone(650, 0.1, 'sine', 0.15);
                  onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
                  setMobileOpen(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950/40 border-emerald-400/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-white truncate" title={quiz.title}>
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold text-emerald-400">
                        {quiz.questions.length} perg.
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] font-mono text-cyan-300">{quiz.shareCode}</span>
                    </div>
                    {quiz.sharedBy && (
                      <div className="text-[10px] text-amber-300 mt-0.5">
                        De @{quiz.sharedBy}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase shrink-0">
                      Ativo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      sound.playTone(650, 0.1, 'sine', 0.15);
                      onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
                      setMobileOpen(false);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-current" /> Jogar
                  </button>
                  {onOpenQuizAdmin && (
                    <button
                      onClick={() => {
                        onOpenQuizAdmin(quiz);
                        setMobileOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 transition"
                      title="Status e ADM deste Kahoot"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyQuizLink(quiz.shareCode)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                    title="Copiar link direto"
                  >
                    {copiedCode === quiz.shareCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={onOpenShareModal}
                    className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 transition"
                    title="Enviar por Email / Compartilhar"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {tab === 'mine' && (
                    <button
                      onClick={() => handleDelete(quiz)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Right Sidebar (flush with navbar) */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 bg-[#0d111a] border-l border-slate-800 h-full">
        {sidebarContent}
      </aside>

      {/* Tablet Floating Toggle Button (phones use MobileBottomNav) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="hidden sm:flex lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-gradient-to-b from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs px-2 py-3 rounded-l-2xl shadow-xl flex-col items-center gap-1"
        title="Abrir Kahoots Feitos"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="[writing-mode:vertical-rl] rotate-180 tracking-wider uppercase text-[10px]">
          Kahoots ({myQuizzes.length})
        </span>
      </button>

      {/* Mobile Slide-Over Right Drawer (Portal to document.body for reliable mobile/iOS fixed positioning) */}
      {mobileOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-[60] flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-80 max-w-[88vw] h-full bg-slate-950 border-l border-cyan-500/30 shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            >
              {sidebarContent}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
