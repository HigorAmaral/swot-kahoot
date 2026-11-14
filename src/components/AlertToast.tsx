import React, { useEffect, useState } from 'react';
import { AlertItem, subscribeAlerts } from '../utils/toast';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const STYLE_MAP = {
  success: {
    box: 'bg-emerald-950/95 border-emerald-400/70 text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.28)]',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    bar: 'bg-emerald-400',
  },
  warning: {
    box: 'bg-amber-950/95 border-amber-400/70 text-amber-100 shadow-[0_10px_30px_rgba(245,158,11,0.28)]',
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    bar: 'bg-amber-400',
  },
  error: {
    box: 'bg-rose-950/95 border-rose-400/70 text-rose-100 shadow-[0_10px_30px_rgba(244,63,94,0.28)]',
    icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    bar: 'bg-rose-400',
  },
  info: {
    box: 'bg-slate-900/95 border-cyan-400/70 text-cyan-100 shadow-[0_10px_30px_rgba(6,182,212,0.25)]',
    icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    bar: 'bg-cyan-400',
  },
};

export const AlertToast: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    return subscribeAlerts(item => {
      setAlerts(prev => [...prev.slice(-2), item]);
      window.setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== item.id));
      }, 4200);
    });
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-[max(1rem,env(safe-area-inset-top))] inset-x-0 z-[100] flex flex-col items-center gap-2.5 px-3 pointer-events-none"
    >
      {alerts.map(alert => {
        const theme = STYLE_MAP[alert.type];
        return (
          <div
            key={alert.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden w-full max-w-md rounded-2xl border backdrop-blur-xl px-4 py-3 flex items-start gap-3 animate-fade-in ${theme.box}`}
          >
            <div className="mt-0.5">{theme.icon}</div>
            <p className="flex-1 text-xs sm:text-sm font-bold leading-snug">
              {alert.message}
            </p>
            <button
              type="button"
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
              className="p-1 rounded-lg hover:bg-white/10 transition shrink-0"
              aria-label="Fechar alerta"
            >
              <X className="w-4 h-4 opacity-80" />
            </button>
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-80 ${theme.bar}`} />
          </div>
        );
      })}
    </div>
  );
};
