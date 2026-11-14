import React, { useState, useEffect } from 'react';
import { SavedQuiz, UserAccount, Question } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import {
  X,
  Globe,
  Search,
  Play,
  Heart,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  RefreshCw,
  UploadCloud,
  EyeOff,
  Users
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onLoadQuiz: (questions: Question[], title: string, shareCode?: string) => void;
  onOpenCreator: () => void;
  onQuizCloned?: () => void;
}

const CATEGORIES = [
  'Todos',
  'Programação',
  'Frontend & Web',
  'Backend & APIs',
  'Banco de Dados',
  'Cloud & DevOps',
  'Segurança & Redes',
  'IA & Dados',
  'TI / SWOT',
  'Geral',
];
const PUBLISH_CATEGORIES = [
  'Programação',
  'Frontend & Web',
  'Backend & APIs',
  'Banco de Dados',
  'Cloud & DevOps',
  'Segurança & Redes',
  'IA & Dados',
  'TI / SWOT',
  'Geral',
];

export const CommunityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onLoadQuiz,
  onOpenCreator,
  onQuizCloned,
}) => {
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [myQuizzes, setMyQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [publishCategories, setPublishCategories] = useState<{ [code: string]: string }>({});
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [likedCodes, setLikedCodes] = useState<Set<string>>(new Set());
  const [clonedCodes, setClonedCodes] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadCommunity = async (q = search, cat = selectedCategory) => {
    setLoading(true);
    const list = await dbService.getCommunityQuizzes(q, cat);
    setQuizzes(list);
    setLoading(false);
  };

  const loadMine = async () => {
    const data = await dbService.getMyQuizzes(currentUser.username);
    setMyQuizzes(data.myQuizzes);
    const initialCats: { [code: string]: string } = {};
    data.myQuizzes.forEach(q => {
      initialCats[q.shareCode] = q.category || 'Geral';
    });
    setPublishCategories(initialCats);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadCommunity(search, selectedCategory);
    loadMine();
  }, [isOpen, currentUser.username]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      loadCommunity(search, selectedCategory);
    }, 220);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTogglePublish = async (quiz: SavedQuiz, nextPublic: boolean) => {
    setTogglingCode(quiz.shareCode);
    const cat = publishCategories[quiz.shareCode] || quiz.category || 'Geral';
    const res = await dbService.toggleQuizPublic(quiz.shareCode, currentUser.username, nextPublic, cat);
    setTogglingCode(null);
    if (res.success) {
      sound.playCorrect();
      showToast(
        nextPublic
          ? `"${quiz.title}" publicado na Comunidade!`
          : `"${quiz.title}" removido da Comunidade.`
      );
      await Promise.all([loadMine(), loadCommunity(search, selectedCategory)]);
      onQuizCloned?.();
    } else {
      alert(res.error || 'Não foi possível atualizar o quiz.');
    }
  };

  const handlePlayQuiz = (quiz: SavedQuiz) => {
    sound.playTone(700, 0.12, 'sine', 0.15);
    dbService.incrementQuizPlay(quiz.shareCode);
    onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
    onClose();
  };

  const handleLikeQuiz = async (quiz: SavedQuiz) => {
    if (likedCodes.has(quiz.shareCode)) return;
    sound.playTone(880, 0.1, 'sine', 0.12);
    setLikedCodes(prev => new Set(prev).add(quiz.shareCode));
    setQuizzes(prev =>
      prev.map(q =>
        q.shareCode === quiz.shareCode ? { ...q, likesCount: (q.likesCount || 0) + 1 } : q
      )
    );
    const res = await dbService.likeCommunityQuiz(quiz.shareCode);
    if (res.success && typeof res.likesCount === 'number') {
      setQuizzes(prev =>
        prev.map(q =>
          q.shareCode === quiz.shareCode ? { ...q, likesCount: res.likesCount } : q
        )
      );
    }
  };

  const handleCloneQuiz = async (quiz: SavedQuiz) => {
    const res = await dbService.cloneCommunityQuiz(
      quiz.shareCode,
      currentUser.username,
      currentUser.displayName
    );
    if (res.success) {
      sound.playCorrect();
      setClonedCodes(prev => new Set(prev).add(quiz.shareCode));
      showToast(`"${quiz.title}" salvo em Meus Kahoots!`);
      loadMine();
      onQuizCloned?.();
    } else {
      alert(res.error || 'Erro ao salvar quiz na sua conta.');
    }
  };

  const handleCopyLink = (shareCode: string) => {
    const url = `${window.location.origin}/?quiz=${shareCode}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    sound.playTone(700, 0.1, 'sine', 0.12);
    setCopiedCode(shareCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 animate-fade-in text-white select-none">
      <div className="relative w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-[#0d111a] border-0 sm:border sm:border-slate-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 sm:p-5 border-b border-slate-800 bg-[#090b10] gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-white truncate">
                Comunidade ArenaQuiz
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Explore, jogue, curta e salve Kahoots públicos criados pela comunidade.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPublishPanel(prev => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                showPublishPanel
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/50 text-emerald-300'
              }`}
            >
              <UploadCloud className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Publicar Meu Quiz</span>
              <span className="xs:hidden sm:hidden">Publicar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Fechar Comunidade"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {feedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-center text-xs font-bold text-emerald-300 shrink-0">
            ✓ {feedback}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Publish My Quiz Panel */}
          {showPublishPanel && (
            <div className="p-4 rounded-2xl bg-[#111622] border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Compartilhar seus Kahoots com a Comunidade
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Escolha um dos seus quizzes salvos para torná-lo público e visível para todos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPublishPanel(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Ocultar
                </button>
              </div>

              {myQuizzes.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    Você ainda não tem Kahoots salvos na sua conta.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreator();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Criar Meu Primeiro Kahoot
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {myQuizzes.map(q => (
                    <div
                      key={q.shareCode}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-white truncate">{q.title}</div>
                          <div className="text-[11px] text-slate-400">
                            {q.questions.length} perguntas • <span className="font-mono text-cyan-400">{q.shareCode}</span>
                          </div>
                        </div>
                        {q.isPublic && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                            Público
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={publishCategories[q.shareCode] || q.category || 'Geral'}
                          onChange={e =>
                            setPublishCategories(prev => ({ ...prev, [q.shareCode]: e.target.value }))
                          }
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-emerald-400"
                        >
                          {PUBLISH_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={togglingCode === q.shareCode}
                          onClick={() => handleTogglePublish(q, !q.isPublic)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                            q.isPublic
                              ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {q.isPublic ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Tornar Privado
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5" /> Publicar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar Kahoots da comunidade por título, @autor ou tema..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => loadCommunity(search, selectedCategory)}
                className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition shrink-0"
                title="Atualizar comunidade"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Community Quizzes Grid */}
          {loading && quizzes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Carregando Kahoots da comunidade...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111622] border border-slate-800 text-center space-y-3">
              <Users className="w-10 h-10 text-cyan-400 mx-auto opacity-80" />
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Nenhum Kahoot público encontrado ainda
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Seja o primeiro a compartilhar um quiz com a comunidade! Clique em "Publicar Meu Quiz" acima.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishPanel(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black inline-flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" /> Publicar Meu Quiz Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {quizzes.map(q => {
                const isOwner = q.ownerUsername.toLowerCase() === currentUser.username.toLowerCase();
                const isLiked = likedCodes.has(q.shareCode);
                const isCloned = clonedCodes.has(q.shareCode);

                return (
                  <div
                    key={q.shareCode}
                    className="p-4 rounded-2xl bg-[#111622] border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase">
                          {q.category || 'Geral'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          #{q.shareCode}
                        </span>
                      </div>

                      <h3 className="font-black text-white text-sm sm:text-base leading-snug">
                        {q.title}
                      </h3>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{q.ownerAvatar || '👨‍💻'}</span>
                          <span className="font-bold text-slate-200 truncate">{q.ownerName}</span>
                          <span className="text-slate-500 truncate">@{q.ownerUsername}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                          {q.questions.length} pergunta(s)
                        </span>
                      </div>
                    </div>

                    {/* Stats + Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLikeQuiz(q)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition ${
                            isLiked
                              ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                          title="Curtir este Kahoot"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{q.likesCount || 0}</span>
                        </button>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1 px-1.5">
                          <Play className="w-3 h-3 text-emerald-400" />
                          {q.playsCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(q.shareCode)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
                          title="Copiar link de compartilhamento"
                        >
                          {copiedCode === q.shareCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {!isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleCloneQuiz(q)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition ${
                              isCloned
                                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300'
                            }`}
                            title="Salvar uma cópia em Meus Kahoots"
                          >
                            {isCloned ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                            <span>{isCloned ? 'Salvo' : 'Salvar'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(q, false)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 text-slate-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition"
                            title="Remover da Comunidade"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handlePlayQuiz(q)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 transition active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Jogar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Compartilhe seus Kahoots para toda a comunidade jogar e aprender!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Voltar para Arena
          </button>
        </div>
      </div>
    </div>
  );
};
