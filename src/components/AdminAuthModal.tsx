import React, { useState } from 'react';
import { Lock, Key, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'higoramaral') {
      sound.playCorrect();
      setIsSuccess(true);
      setError(false);
      sessionStorage.setItem('swot_admin_auth', 'true');
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onSuccess();
      }, 500);
    } else {
      sound.playWrong();
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-500/20">
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 animate-pulse" />
            )}
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Acesso Restrito ao ADM
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Digite a senha de administrador para acessar o painel de comando do Kahoot.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Digite a senha do ADM..."
              className={`w-full bg-slate-950 border-2 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white focus:outline-none transition ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-slate-700 focus:border-amber-400'
              }`}
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-bounce-short">
              <ShieldAlert className="w-4 h-4" /> Senha incorreta! Tente novamente.
            </div>
          )}

          {isSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Acesso concedido! Abrindo painel...
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Entrar no Painel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-500">
            Painel exclusivo do condutor da dinâmica.
          </span>
        </div>
      </div>
    </div>
  );
};
