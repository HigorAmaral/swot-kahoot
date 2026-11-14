export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  id: string;
  resolve: (value: boolean) => void;
}

type Listener = (req: ConfirmRequest) => void;
const listeners = new Set<Listener>();

export function subscribeConfirms(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showConfirm(options: ConfirmOptions | string): Promise<boolean> {
  const normalized: ConfirmOptions =
    typeof options === 'string' ? { message: options } : options;

  return new Promise<boolean>(resolve => {
    const req: ConfirmRequest = {
      ...normalized,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      resolve,
    };
    listeners.forEach(fn => fn(req));
  });
}
