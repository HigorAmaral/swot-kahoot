import React, { useState } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { LogIn, UserPlus, Lock, User, Mail, Sparkles, AlertCircle, Share2, ArrowRight, KeyRound, CheckCircle2, ArrowLeft, Trophy, Zap, Users, FileSpreadsheet } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: UserAccount, remember?: boolean) => void;
  pendingQuizCode?: string | null;
}

const AVATAR_LIST = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🧠', '🎯', '👑', '🔥'];

export const LoginView: React.FC<Props> = ({ onLoginSuccess, pendingQuizCode }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [savedCreds] = useState<{ username?: string; password?: string } | null>(() => {
    try {
      const raw = localStorage.getItem('fabrica_saved_credentials');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [username, setUsername] = useState(savedCreds?.username || '');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(savedCreds?.password || '');
  const [rememberLogin, setRememberLogin] = useState<boolean>(savedCreds !== null || true);
  const [avatar, setAvatar] = useState('👨‍💻');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password recovery state
  const [forgotStep, setForgotStep] = useState<'request' | 'confirm'>('request');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await dbService.requestPasswordReset(recoveryIdentifier);
      if (res.success) {
        sound.playCorrect();
        setMaskedEmail(res.maskedEmail || 'seu e-mail cadastrado');
        setForgotStep('confirm');
        setSuccessMsg(`Código de 6 dígitos enviado para ${res.maskedEmail || 'seu e-mail'}!`);
      } else {
        sound.playWrong();
        setError(res.error || 'Não foi possível enviar o código.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await dbService.confirmPasswordReset(recoveryIdentifier, recoveryCode, newPassword);
      if (res.success) {
        sound.playCorrect();
        const recoveredUser = res.username || recoveryIdentifier.trim().replace(/^@/, '').toLowerCase();
        // Auto-login with the new password
        const loginRes = await dbService.loginUser(recoveredUser, newPassword);
        if (loginRes.success && loginRes.user) {
          onLoginSuccess(loginRes.user);
          return;
        }
        setUsername(recoveredUser);
        setPassword('');
        setMode('login');
        setForgotStep('request');
        setRecoveryCode('');
        setNewPassword('');
        setSuccessMsg('Senha redefinida com sucesso! Agora você já pode entrar.');
      } else {
        sound.playWrong();
        setError(res.error || 'Código inválido ou expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await dbService.loginUser(username, password);
        if (res.success && res.user) {
          sound.playCorrect();
          try {
            if (rememberLogin) {
              localStorage.setItem('fabrica_saved_credentials', JSON.stringify({ username: username.trim(), password }));
            } else {
              localStorage.removeItem('fabrica_saved_credentials');
            }
          } catch {}
          onLoginSuccess(res.user, rememberLogin);
        } else {
          sound.playWrong();
          setError(res.error || 'Usuário ou senha incorretos.');
        }
      } else {
        const res = await dbService.registerUser(username, displayName, password, avatar, email.trim() || undefined);
        if (res.success && res.user) {
          sound.playCorrect();
          try {
            if (rememberLogin) {
              localStorage.setItem('fabrica_saved_credentials', JSON.stringify({ username: username.trim(), password }));
            } else {
              localStorage.removeItem('fabrica_saved_credentials');
            }
          } catch {}
          onLoginSuccess(res.user, rememberLogin);
        } else {
          sound.playWrong();
          setError(res.error || 'Não foi possível criar sua conta.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-grid-pattern flex flex-col items-center justify-center p-4 lg:p-8 animate-fade-in">
      {/* Pending shared quiz notification */}
      {pendingQuizCode && (
        <div className="w-full max-w-md lg:max-w-5xl mb-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-lg">
          <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Você recebeu um Kahoot compartilhado (<strong className="text-white">{pendingQuizCode}</strong>)! Entre ou crie sua conta para abrir e jogar.
          </span>
        </div>
      )}

      <div className="w-full max-w-md lg:max-w-6xl lg:grid lg:grid-cols-12 lg:gap-8 items-stretch">
        {/* Desktop Showcase Left Panel */}
        <div className="hidden lg:flex lg:col-span-7 glass-card rounded-3xl p-8 xl:p-10 border border-slate-800/90 flex-col justify-between relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Plataforma Gamificada em Tempo Real
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.12] mb-4">
              Transforme sua sala ou treinamento em uma{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Arena de Quiz
              </span>
            </h1>

            <p className="text-slate-300 text-base xl:text-lg leading-relaxed max-w-xl mb-8">
              Crie, importe e apresente quizzes interativos no estilo Kahoot com equipes ao vivo, power-ups estratégicos, trilha sonora sintetizada e relatórios completos.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Equipes & PIN ao Vivo</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Entrada com 1 clique, QR Code de sala e modo Por Turno ou Todos Respondem.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Importação Inteligente</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Crie quizzes via PDF, Excel/CSV, texto colado ou gerador automático de temas.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Power-Ups & Combos</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    50:50, Pontos 2x, Escudo de combo, +10s e rodada Morte Súbita de desempate.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Pódio & Certificado PDF</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Gabarito comentado pós-jogo, exportação em planilha CSV e certificado oficial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pronto para projetor, PC e dispositivos móveis (PWA)</span>
            </div>
            <span className="font-bold text-slate-300">Desenvolvido por Higor Amaral</span>
          </div>
        </div>

        {/* Auth Card Right Panel */}
        <div className="w-full lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative flex flex-col justify-center">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 flex items-center justify-center font-black text-xl text-slate-950 mb-3 shadow-lg shadow-emerald-500/25">
            AQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Arena<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Quiz</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Crie quizzes e compartilhe com sua turma
          </p>
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Criar Conta
            </button>
          </div>
        )}

        {/* Forgot Password Flow */}
        {mode === 'forgot' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Recuperar Senha por E-mail
              </h2>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotStep('request');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
            </div>

            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Digite seu <strong className="text-slate-200">usuário</strong> ou <strong className="text-slate-200">e-mail cadastrado</strong>. Enviaremos um código de 6 dígitos para você redefinir sua senha.
                </p>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={recoveryIdentifier}
                      onChange={e => setRecoveryIdentifier(e.target.value)}
                      placeholder="Ex: higoramaral ou seu@email.com"
                      className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Enviando código...' : 'Enviar Código no E-mail'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                    Código de 6 dígitos (enviado para {maskedEmail})
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={e => setRecoveryCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm font-mono font-black tracking-widest text-white focus:outline-none transition text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setError(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Reenviar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-sm shadow-lg transition"
                  >
                    {loading ? 'Salvando...' : 'Redefinir Senha e Entrar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
        /* Login / Register Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Ex: Higor Amaral"
                  className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                  E-mail (para receber quizzes enviados)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com (opcional)"
                    className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                  Escolha seu Avatar
                </label>
                <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-xl p-1.5 overflow-x-auto">
                  {AVATAR_LIST.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition ${
                        avatar === em ? 'bg-emerald-500 text-slate-950 scale-105 shadow' : 'hover:bg-slate-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
              Usuário (Login)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: higoramaral"
                className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
              />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={e => setRememberLogin(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 accent-emerald-500 cursor-pointer"
                />
                <span>Salvar meu login</span>
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryIdentifier(username);
                    setMode('forgot');
                    setForgotStep('request');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Conectando...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar no ArenaQuiz' : 'Criar Conta e Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400 space-y-0.5">
          <p>
            Desenvolvido por <strong className="text-emerald-400">Higor Amaral</strong>
          </p>
          <p className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} ArenaQuiz • Todos os direitos reservados • Licença MIT
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};
