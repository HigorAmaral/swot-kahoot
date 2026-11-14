import React, { useEffect, useState } from 'react';
import { ConfirmRequest, subscribeConfirms } from '../utils/confirm';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);

  useEffect(() => {
    return subscribeConfirms(req => {
      setQueue(prev => [...prev, req]);
    });
  }, []);

  const current = queue[0];

  const handleResolve = (accepted: boolean) => {
    if (!current) return;
    current.resolve(accepted);
    setQueue(prev => prev.slice(1));
  };

  useEffect(() => {
    if (!current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleResolve(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current]);

  if (!current) return null;

  const isDanger = current.danger ?? true;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white select-none"
      onClick={() => handleResolve(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl bg-[#0d111a] border p-5 sm:p-6 shadow-2xl space-y-4 ${
          isDanger ? 'border-rose-500/50 shadow-rose-500/10' : 'border-cyan-500/50 shadow-cyan-500/10'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isDanger
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
              }`}
            >
              {isDanger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {current.title || 'Confirmar ação'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleResolve(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {current.message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleResolve(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
          >
            {current.cancelText || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={() => handleResolve(true)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {current.confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
