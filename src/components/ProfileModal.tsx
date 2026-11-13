import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/sound';
import { X, User, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onProfileUpdated: (updatedUser: UserAccount) => void;
}

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '🚀', '⚡', '🧠', '🛡️', '🎯', '👑', '🔥', '⭐', '🦊', '🦁', '🐼', '🎓', '🏆', '💎'];

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser.displayName);
      setAvatar(currentUser.avatar);
      setNewPassword('');
      setFeedback(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setFeedback({ type: 'err', msg: 'O nome não pode ficar em branco.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const res = await dbService.updateProfile(
      currentUser.username,
      displayName.trim(),
      avatar,
      newPassword.trim() || undefined
    );

    setSaving(false);

    if (res.success && res.user) {
      sound.playCorrect();
      onProfileUpdated(res.user);
      setFeedback({ type: 'ok', msg: 'Perfil atualizado com sucesso!' });
      setNewPassword('');
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      sound.playWrong();
      setFeedback({ type: 'err', msg: res.error || 'Erro ao atualizar perfil.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg">
            {avatar}
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-1.5">
              Personalizar Conta
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Usuário: <strong className="text-cyan-300">@{currentUser.username}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
              Nome de Exibição (usado nos grupos)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Seu nome completo ou apelido"
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
              Escolha seu Avatar
            </label>
            <div className="grid grid-cols-8 gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl p-2.5">
              {AVATAR_OPTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`h-9 rounded-lg flex items-center justify-center text-lg transition ${
                    avatar === em
                      ? 'bg-emerald-500 text-slate-950 scale-110 shadow'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Optional New Password */}
          <div>
            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
              Nova Senha (opcional)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Deixe vazio para manter a atual"
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none transition"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                feedback.type === 'ok'
                  ? 'bg-emerald-950/70 border border-emerald-400/50 text-emerald-300'
                  : 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
              }`}
            >
              {feedback.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.msg}</span>
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
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
