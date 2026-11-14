import React, { useState } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { ArenaMascot, MascotMood } from './ArenaMascot';
import {
  LogIn,
  UserPlus,
  Lock,
  User,
  Mail,
  AlertCircle,
  Share2,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Gamepad2,
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: UserAccount, remember?: boolean) => void;
  pendingQuizCode?: string | null;
}

const AVATAR_LIST = ['🦊', '👨‍💻', '👩‍💻', '🚀', '⚡', '🎯', '👑', '🔥'];

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState<boolean>(savedCreds !== null || true);
  const [avatar, setAvatar] = useState('🦊');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Interactive Mascot Focus States
  const [focusedField, setFocusedField] = useState<'username' | 'displayName' | 'email' | 'password' | null>(null);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);

  // Password recovery state
  const [forgotStep, setForgotStep] = useState<'request' | 'confirm'>('request');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Compute Mascot Mood, Eye Tracking & Speech Bubble
  const computeMascotState = (): { mood: MascotMood; lookOffset: number; speech: string } => {
    if (error) {
      return {
        mood: 'error',
        lookOffset: 0,
        speech: `Ops! ${error}`,
      };
    }
    if (focusedField === 'password') {
      if (showPassword) {
        return {
          mood: 'peeking',
          lookOffset: 2,
          speech: 'Hehe, dando só uma espiadinha pra ver se você não digitou errado! 👀',
        };
      }
      return {
        mood: 'hiding',
        lookOffset: 0,
        speech: 'Pode digitar sua senha tranquilo, tapei os olhos! 🙈',
      };
    }
    if (isHoveringSubmit || loading) {
      return {
        mood: 'happy',
        lookOffset: 0,
        speech: loading ? 'Abrindo os portões da Arena...' : 'Tudo pronto! Bora começar o show! 🎉',
      };
    }
    if (focusedField === 'username' || focusedField === 'displayName' || focusedField === 'email') {
      const activeText =
        focusedField === 'displayName' ? displayName : focusedField === 'email' ? email : username;
      const offset = Math.min(7, Math.max(-7, (activeText.length - 8) * 0.7));
      const cleanName = (displayName || username).trim();
      return {
        mood: 'typing',
        lookOffset: offset,
        speech: cleanName
          ? `Opa, ${cleanName}! Já preparei o microfone pra sua rodada!`
          : 'Digite seu usuário pra entrar no palco!',
      };
    }
    if (mode === 'register') {
      return {
        mood: 'happy',
        lookOffset: 0,
        speech: 'Primeira vez aqui? Escolha seu apelido e seu ícone pra entrar no ranking!',
      };
    }
    if (mode === 'forgot') {
      return {
        mood: 'typing',
        lookOffset: 0,
        speech: 'Esqueceu a senha? Relaxa, a gente manda um código pro seu e-mail rapidinho!',
      };
    }
    return {
      mood: 'idle',
      lookOffset: 0,
      speech: username.trim()
        ? `Bem-vindo de volta, @${username.trim()}! Pronto pra mais uma disputa?`
        : 'Oi! Eu sou o Kiko! Entre na sua conta ou clique em mim pra trocar uma ideia!',
    };
  };

  const mascotState = computeMascotState();

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
    <div className="min-h-[100dvh] w-full bg-[#0b0f19] bg-grid-pattern flex flex-col items-center justify-center px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6 overflow-x-hidden animate-fade-in">
      {/* Shared quiz invite banner */}
      {pendingQuizCode && (
        <div className="w-full max-w-md md:max-w-xl lg:max-w-5xl mb-3 sm:mb-4 p-3 sm:p-3.5 rounded-2xl bg-amber-950/90 border-2 border-amber-400/60 text-amber-100 text-xs sm:text-sm font-extrabold flex items-center gap-2.5 shadow-xl">
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
          <span>
            Convite de jogo recebido (<strong className="text-white">{pendingQuizCode}</strong>)! Entre para jogar agora.
          </span>
        </div>
      )}

      <div className="w-full max-w-md md:max-w-xl lg:max-w-5xl xl:max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-8 items-center my-auto">
        {/* Mascot Stage Panel (Responsive across Mobile, Tablet, Laptop & Desktop) */}
        <div className="w-full lg:col-span-6 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-6 relative rounded-3xl bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent border-2 border-slate-800/80">
          <div className="relative z-10 w-full flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#182032] border-2 border-slate-700 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5 sm:mb-4 shadow-md">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
              <span>Palco Principal • ArenaQuiz</span>
            </div>

            <ArenaMascot
              mood={mascotState.mood}
              lookOffset={mascotState.lookOffset}
              speechText={mascotState.speech}
            />

            <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white tracking-tight mt-1 sm:mt-2 leading-tight">
              Quem vai levar o troféu hoje?
            </h1>
            <p className="hidden sm:block text-slate-400 text-xs lg:text-sm max-w-sm mt-1.5 font-semibold">
              Monte seu grupo, escolha sua cor na bancada e dispute cada rodada valendo pontos e brindes.
            </p>

            {/* Color Team Pills */}
            <div className="mt-2.5 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-kahoot-red text-white font-black text-[10px] sm:text-xs shadow">
                ▲ Vermelho
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-kahoot-blue text-white font-black text-[10px] sm:text-xs shadow">
                ◆ Azul
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-kahoot-yellow text-white font-black text-[10px] sm:text-xs shadow">
                ● Amarelo
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-kahoot-green text-white font-black text-[10px] sm:text-xs shadow">
                ■ Verde
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Passaporte do Jogador */}
        <div className="w-full lg:col-span-6 bg-[#111726] rounded-3xl sm:rounded-[28px] p-4 sm:p-6 lg:p-7 border-2 border-slate-800 shadow-[0_24px_60px_rgba(0,0,0,0.75)] relative">
          {/* Card Title Bar */}
          <div className="flex items-center justify-between gap-2 pb-3.5 sm:pb-4 mb-4 sm:mb-5 border-b-2 border-slate-800/90">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500 border-b-4 border-orange-700 flex items-center justify-center font-black text-lg sm:text-xl text-white shadow shrink-0">
                🦊
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none truncate">
                  Arena<span className="text-amber-400">Quiz</span>
                </h2>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1 truncate">
                  Passaporte do Jogador
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[10px] sm:text-[11px] font-black text-emerald-400 shrink-0">
              ● AO VIVO
            </span>
          </div>

          {/* Mode Switcher */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-[#0b0f19] p-1 sm:p-1.5 rounded-2xl border-2 border-slate-800 mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Já tenho conta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Novo Jogador</span>
              </button>
            </div>
          )}

          {/* Forgot Password Flow */}
          {mode === 'forgot' ? (
            <div className="space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" /> Recuperar Senha
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
                <form onSubmit={handleRequestReset} className="space-y-3.5 sm:space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Informe seu <strong className="text-slate-200">usuário</strong> ou <strong className="text-slate-200">e-mail</strong> para receber o código de 6 dígitos.
                  </p>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1.5">
                      Usuário ou E-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => setRecoveryIdentifier(e.target.value)}
                        placeholder="Ex: higoramaral ou seu@email.com"
                        className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
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
                    className="w-full py-3.5 rounded-xl btn-arcade-amber disabled:opacity-60 text-slate-950 font-black text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? 'Enviando código...' : 'Enviar Código por E-mail'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-3.5 sm:space-y-4">
                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1.5">
                      Código de 6 dígitos ({maskedEmail})
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={e => setRecoveryCode(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm font-mono font-black tracking-widest text-white focus:outline-none transition text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1.5">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        value={newPassword}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-white focus:outline-none transition"
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
                      className="flex-1 py-3 rounded-xl btn-arcade-green disabled:opacity-60 text-slate-950 font-black text-sm"
                    >
                      {loading ? 'Salvando...' : 'Salvar e Entrar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1">
                      Como a galera te chama? (Nome ou Apelido)
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onFocus={() => setFocusedField('displayName')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Ex: Higor Amaral"
                      className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2 sm:py-2.5 text-sm font-bold text-white focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1">
                      Seu E-mail (opcional — para recuperar senha)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-sm font-bold text-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-300 mb-1">
                      Escolha seu Ícone de Jogador
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-[#0b0f19] border-2 border-slate-800 rounded-xl p-1.5">
                      {AVATAR_LIST.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            sound.playTone(540, 0.08, 'sine', 0.12);
                            setAvatar(em);
                          }}
                          className={`h-9 rounded-lg flex items-center justify-center text-lg transition ${
                            avatar === em ? 'bg-amber-400 text-slate-950 scale-105 shadow' : 'hover:bg-slate-800'
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
                <label className="block text-[11px] font-black uppercase text-slate-300 mb-1">
                  Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ex: higoramaral"
                    className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-sm font-bold text-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0b0f19] border-2 border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-11 py-2 sm:py-2.5 text-sm font-bold text-white focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-amber-300 transition"
                    title={showPassword ? 'Esconder senha (Kiko fecha os olhos)' : 'Espiar senha (Kiko abre um olho)'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberLogin}
                      onChange={e => setRememberLogin(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 accent-amber-400 cursor-pointer"
                    />
                    <span>Lembrar de mim</span>
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
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition"
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
                onMouseEnter={() => setIsHoveringSubmit(true)}
                onMouseLeave={() => setIsHoveringSubmit(false)}
                className="w-full py-3 sm:py-3.5 rounded-2xl btn-arcade-green disabled:opacity-60 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Entrando na Arena...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'ENTRAR NA ARENA' : 'CRIAR CONTA E JOGAR'}</span>
                    <ArrowRight className="w-5 h-5 shrink-0" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>
              Por <strong className="text-amber-400">Higor Amaral</strong>
            </span>
            <span className="text-slate-500">© {new Date().getFullYear()} ArenaQuiz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
