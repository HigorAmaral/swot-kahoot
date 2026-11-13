import React, { useState, useEffect } from 'react';
import { SavedQuiz, UserAccount, Question } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import {
  X,
  FolderOpen,
  Share2,
  Play,
  Copy,
  Check,
  Send,
  Trash2,
  Inbox,
  Download,
  Plus,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Mail,
  BarChart3
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onLoadQuiz: (questions: Question[], title: string, shareCode?: string) => void;
  onOpenCreator: () => void;
  onOpenQuizAdmin?: (quiz: SavedQuiz) => void;
}

export const MyQuizzesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onLoadQuiz,
  onOpenCreator,
  onOpenQuizAdmin,
}) => {
  const [tab, setTab] = useState<'mine' | 'received' | 'import'>('mine');
  const [myQuizzes, setMyQuizzes] = useState<SavedQuiz[]>([]);
  const [receivedQuizzes, setReceivedQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(false);

  // Share Panel state
  const [sharingQuiz, setSharingQuiz] = useState<SavedQuiz | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<Array<{ username: string; displayName: string; avatar: string }>>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [sendFeedback, setSendFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Import state
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    const data = await dbService.getMyQuizzes(currentUser.username);
    setMyQuizzes(data.myQuizzes);
    setReceivedQuizzes(data.receivedQuizzes);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuizzes();
    }
  }, [isOpen, currentUser.username]);

  // Autocomplete search for registered users as user types
  useEffect(() => {
    const clean = targetUsername.trim().replace(/^@/, '');
    if (!sharingQuiz || !clean) {
      setUserSuggestions([]);
      setSearchingUsers(false);
      return;
    }

    let cancelled = false;
    setSearchingUsers(true);
    const timer = setTimeout(async () => {
      const results = await dbService.searchUsers(clean, currentUser.username);
      if (!cancelled) {
        setUserSuggestions(results);
        setSearchingUsers(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [targetUsername, sharingQuiz, currentUser.username]);

  if (!isOpen) return null;

  const getShareUrl = (shareCode: string) => {
    const base = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://swot-kahoot.vercel.app/';
    return `${base}?quiz=${shareCode}`;
  };

  const handleCopyLink = (quiz: SavedQuiz) => {
    const url = getShareUrl(quiz.shareCode);
    navigator.clipboard.writeText(url);
    sound.playTone(700, 0.12, 'sine', 0.15);
    setCopiedCode(quiz.shareCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleWhatsAppShare = (quiz: SavedQuiz) => {
    const url = getShareUrl(quiz.shareCode);
    const text = `🎯 Jogue meu quiz "${quiz.title}" no FabricaQuiz!\n\nAcesse pelo link: ${url}\nOu use o código: *${quiz.shareCode}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingQuiz || !targetUsername.trim()) return;
    setSendFeedback(null);
    const res = await dbService.sendQuizToUser(sharingQuiz.shareCode, currentUser.username, targetUsername);
    if (res.success) {
      sound.playCorrect();
      setSendFeedback({ type: 'ok', msg: `Quiz enviado para @${targetUsername.replace(/^@/, '')}!` });
      setTargetUsername('');
    } else {
      sound.playWrong();
      setSendFeedback({ type: 'err', msg: res.error || 'Erro ao enviar' });
    }
  };

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendToEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingQuiz || !targetEmail.trim()) return;
    const emailClean = targetEmail.trim();
    if (!emailClean.includes('@')) {
      setSendFeedback({ type: 'err', msg: 'Digite um e-mail válido.' });
      return;
    }

    setSendFeedback(null);
    setSendingEmail(true);
    const res = await dbService.sendQuizToEmail(
      sharingQuiz.shareCode,
      currentUser.username,
      emailClean,
      currentUser.displayName
    );
    setSendingEmail(false);

    if (res.success && res.emailSent) {
      sound.playCorrect();
      setLastSentEmail(null);
      setSendFeedback({
        type: 'ok',
        msg: `E-mail estilizado enviado diretamente para ${emailClean}! Ele receberá o link na caixa de entrada.`,
      });
      setTargetEmail('');
    } else if (res.success && res.needsEmailConfig) {
      sound.playCorrect();
      setLastSentEmail(emailClean);
      setSendFeedback({
        type: 'ok',
        msg: `Convite salvo para ${emailClean}! Para disparo automático direto do servidor, configure SMTP_USER/SMTP_PASS ou RESEND_API_KEY no Vercel. Ou clique abaixo para enviar pelo Gmail:`,
      });
      setTargetEmail('');
    } else {
      sound.playWrong();
      setSendFeedback({ type: 'err', msg: res.error || 'Erro ao enviar por e-mail' });
    }
  };

  const getGmailComposeUrl = (quiz: SavedQuiz, email: string) => {
    const url = getShareUrl(quiz.shareCode);
    const subject = `Convite FabricaQuiz: ${quiz.title}`;
    const body = `Olá!\n\n${currentUser.displayName} (@${currentUser.username}) enviou um quiz para você jogar no FabricaQuiz:\n\nTítulo: ${quiz.title}\nCódigo: ${quiz.shareCode}\n\nLink para jogar: ${url}`;
    return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDelete = async (quiz: SavedQuiz) => {
    if (!confirm(`Excluir o quiz "${quiz.title}"?`)) return;
    await dbService.deleteQuiz(quiz.shareCode, currentUser.username);
    if (sharingQuiz?.shareCode === quiz.shareCode) setSharingQuiz(null);
    fetchQuizzes();
  };

  const handleClone = async (quiz: SavedQuiz) => {
    const res = await dbService.saveQuiz(
      currentUser.username,
      currentUser.displayName,
      `${quiz.title} (Cópia)`,
      quiz.questions
    );
    if (res.success) {
      sound.playCorrect();
      await fetchQuizzes();
      setTab('mine');
    }
  };

  const handleImportByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    if (!importCode.trim()) return;
    const res = await dbService.getQuizByCode(importCode);
    if (res.success && res.quiz) {
      sound.playCorrect();
      onLoadQuiz(res.quiz.questions, res.quiz.title, res.quiz.shareCode);
      onClose();
    } else {
      sound.playWrong();
      setImportError(res.error || 'Código não encontrado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-lg">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Meus Kahoots & Compartilhamento
              </h2>
              <p className="text-xs text-slate-400">
                Logado como <strong className="text-emerald-400">{currentUser.avatar} @{currentUser.username}</strong> • Envie seus quizzes para qualquer pessoa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreator();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Criar Novo
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'mine' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Meus Kahoots ({myQuizzes.length})
          </button>
          <button
            onClick={() => setTab('received')}
            className={`px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'received' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-4 h-4" /> Recebidos ({receivedQuizzes.length})
          </button>
          <button
            onClick={() => setTab('import')}
            className={`px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'import' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" /> Abrir por Código / Link
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">Carregando seus quizzes...</div>
          )}

          {/* TAB 1: MEUS KAHOOTS */}
          {!loading && tab === 'mine' && (
            <>
              {myQuizzes.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800 p-6">
                  <p className="text-sm font-bold text-slate-300 mb-2">
                    Você ainda não salvou nenhum Kahoot na sua conta.
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Clique em "Criar Novo" para montar perguntas na mão, por planilha, PDF ou texto e gerar um link para enviar!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreator();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
                  >
                    + Criar Meu Primeiro Kahoot
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {myQuizzes.map(quiz => (
                    <div
                      key={quiz.shareCode}
                      className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-white text-base">{quiz.title}</h3>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black">
                              Código: {quiz.shareCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {quiz.questions.length} pergunta(s)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {onOpenQuizAdmin && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenQuizAdmin(quiz);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-black text-xs transition flex items-center gap-1.5"
                            >
                              <BarChart3 className="w-3.5 h-3.5" /> Status / ADM
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
                              onClose();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Jogar Agora
                          </button>

                          <button
                            onClick={() => {
                              setSharingQuiz(sharingQuiz?.shareCode === quiz.shareCode ? null : quiz);
                              setSendFeedback(null);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-black text-xs transition flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Enviar / Compartilhar
                          </button>

                          <button
                            onClick={() => handleDelete(quiz)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-700 transition"
                            title="Excluir quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Share Drawer for this quiz */}
                      {sharingQuiz?.shareCode === quiz.shareCode && (
                        <div className="mt-1 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 space-y-3 animate-fade-in">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black text-cyan-300 uppercase">
                              Mandar "{quiz.title}" para outras pessoas:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleCopyLink(quiz)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white flex items-center gap-1.5 transition"
                              >
                                {copiedCode === quiz.shareCode ? (
                                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> Link Copiado!</>
                                ) : (
                                  <><Copy className="w-3.5 h-3.5 text-cyan-400" /> Copiar Link</>
                                )}
                              </button>
                              <button
                                onClick={() => handleWhatsAppShare(quiz)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white flex items-center gap-1.5 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Enviar no WhatsApp
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono break-all">
                            {getShareUrl(quiz.shareCode)}
                          </div>

                          {/* Enviar por E-mail (funciona mesmo para quem ainda não tem conta!) */}
                          <form onSubmit={handleSendToEmail} className="flex flex-col sm:flex-row gap-2 pt-1">
                            <div className="relative flex-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="email"
                                value={targetEmail}
                                onChange={e => setTargetEmail(e.target.value)}
                                placeholder="Enviar link por e-mail (ex: amigo@gmail.com)..."
                                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={sendingEmail}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <Mail className="w-3.5 h-3.5" /> {sendingEmail ? 'Enviando...' : 'Mandar no E-mail'}
                            </button>
                          </form>

                          {lastSentEmail && (
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3 py-2 text-[11px]">
                              <span className="text-slate-300">
                                Usa Gmail no navegador? Envie direto para <strong>{lastSentEmail}</strong>:
                              </span>
                              <a
                                href={getGmailComposeUrl(quiz, lastSentEmail)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black transition"
                              >
                                Abrir no Gmail
                              </a>
                            </div>
                          )}

                          <form onSubmit={handleSendToUser} className="flex flex-col sm:flex-row gap-2 pt-1">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={targetUsername}
                                onFocus={() => setShowUserSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowUserSuggestions(false), 180)}
                                onChange={e => {
                                  setTargetUsername(e.target.value);
                                  setShowUserSuggestions(true);
                                }}
                                placeholder="Ou enviar direto para @usuario do FabricaQuiz..."
                                autoComplete="off"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              />

                              {/* Autocomplete Suggestions Dropdown */}
                              {showUserSuggestions && targetUsername.trim().replace(/^@/, '').length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-slate-950 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                                  {searchingUsers ? (
                                    <div className="px-3 py-2 text-[11px] text-slate-400">
                                      Buscando usuários...
                                    </div>
                                  ) : userSuggestions.length === 0 ? (
                                    <div className="px-3 py-2 text-[11px] text-slate-500">
                                      Nenhum usuário correspondente encontrado.
                                    </div>
                                  ) : (
                                    userSuggestions.map(u => (
                                      <button
                                        key={u.username}
                                        type="button"
                                        onMouseDown={e => {
                                          e.preventDefault();
                                          setTargetUsername(u.username);
                                          setShowUserSuggestions(false);
                                        }}
                                        className="w-full px-3 py-2 text-left hover:bg-cyan-500/15 flex items-center justify-between gap-2 border-b border-slate-800/70 last:border-b-0 transition"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-base shrink-0">{u.avatar}</span>
                                          <div className="min-w-0">
                                            <div className="text-xs font-black text-cyan-300 truncate">
                                              @{u.username}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate">
                                              {u.displayName}
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                          Selecionar
                                        </span>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <Send className="w-3.5 h-3.5" /> Enviar para Usuário
                            </button>
                          </form>

                          {sendFeedback && (
                            <div className={`text-xs font-bold p-2 rounded-lg ${
                              sendFeedback.type === 'ok'
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                            }`}>
                              {sendFeedback.msg}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: RECEBIDOS */}
          {!loading && tab === 'received' && (
            <>
              {receivedQuizzes.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-2xl border border-slate-800 p-6">
                  <p className="text-sm font-bold text-slate-300 mb-1">
                    Nenhum quiz recebido diretamente ainda.
                  </p>
                  <p className="text-xs text-slate-400">
                    Quando alguém enviar um Kahoot para <strong>@{currentUser.username}</strong>, ele aparecerá aqui!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {receivedQuizzes.map(quiz => (
                    <div
                      key={`${quiz.shareCode}_${quiz.sharedBy}`}
                      className="p-4 rounded-2xl bg-slate-800/70 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-white text-base">{quiz.title}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-black">
                            Enviado por @{quiz.sharedBy}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {quiz.questions.length} pergunta(s) • Código: {quiz.shareCode}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onLoadQuiz(quiz.questions, quiz.title, quiz.shareCode);
                            onClose();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Jogar
                        </button>
                        <button
                          onClick={() => handleClone(quiz)}
                          className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition"
                        >
                          Salvar Cópia
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 3: IMPORTAR POR CÓDIGO */}
          {tab === 'import' && (
            <form onSubmit={handleImportByCode} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-black text-white text-sm mb-1">
                  Abrir Kahoot enviado por outra pessoa
                </h3>
                <p className="text-xs text-slate-400">
                  Cole o código (ex: <code className="text-emerald-400">FQ-7A3B</code>) ou o link completo que você recebeu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={importCode}
                  onChange={e => setImportCode(e.target.value)}
                  placeholder="Ex: FQ-7A3B ou https://..."
                  className="flex-1 bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Carregar Quiz
                </button>
              </div>

              {importError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {importError}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
