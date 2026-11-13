import React, { useState } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { LogIn, UserPlus, Lock, User, Sparkles, AlertCircle, Share2, ArrowRight } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: UserAccount) => void;
  pendingQuizCode?: string | null;
}

const AVATAR_LIST = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🧠', '🎯', '👑', '🔥'];

export const LoginView: React.FC<Props> = ({ onLoginSuccess, pendingQuizCode }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('👨‍💻');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await dbService.loginUser(username, password);
        if (res.success && res.user) {
          sound.playCorrect();
          onLoginSuccess(res.user);
        } else {
          sound.playWrong();
          setError(res.error || 'Usuário ou senha incorretos.');
        }
      } else {
        const res = await dbService.registerUser(username, displayName, password, avatar);
        if (res.success && res.user) {
          sound.playCorrect();
          onLoginSuccess(res.user);
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
    <div className="min-h-screen w-full bg-grid-pattern flex flex-col items-center justify-center p-4 animate-fade-in">
      {/* Pending shared quiz notification */}
      {pendingQuizCode && (
        <div className="w-full max-w-md mb-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-lg">
          <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Você recebeu um Kahoot compartilhado (<strong className="text-white">{pendingQuizCode}</strong>)! Entre ou crie sua conta para abrir e jogar.
          </span>
        </div>
      )}

      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/25 shadow-2xl relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-emerald-500/30 mb-3">
            FQ
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fabrica<span className="text-emerald-400">Quiz</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Crie seus próprios Kahoots e envie para outras pessoas
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow'
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
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Criar Conta
          </button>
        </div>

        {/* Form */}
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Conectando...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar no FabricaQuiz' : 'Criar Conta e Entrar'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
