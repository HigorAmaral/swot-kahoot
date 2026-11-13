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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in text-white select-none">
      <div className="relative w-full max-w-md bg-[#111622] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-3">
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Acesso Restrito ao ADM
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Digite a senha de administrador para acessar o painel de comando do ArenaQuiz.
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
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
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
