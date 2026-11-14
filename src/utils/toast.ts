export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertItem {
  id: string;
  message: string;
  type: AlertType;
}

type Listener = (alert: AlertItem) => void;
const listeners = new Set<Listener>();

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showAlert(message: string, type: AlertType = 'info') {
  const item: AlertItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    type,
  };
  listeners.forEach(fn => fn(item));
}
