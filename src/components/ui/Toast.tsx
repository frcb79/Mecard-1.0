import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// TOAST TYPES
// =============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showToast: (title: string, type?: Toast['type']) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// =============================================
// TOAST PROVIDER
// =============================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 4000 };
    setToasts(prev => [...prev, newToast].slice(-5)); // Max 5 toasts
  }, []);

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description, duration: 6000 });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  }, [addToast]);

  const showToast = useCallback((title: string, type: Toast['type'] = 'info') => {
    addToast({ type, title });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// =============================================
// HOOK
// =============================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return context;
}

// =============================================
// TOAST CONTAINER (renders in top-right)
// =============================================

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// =============================================
// INDIVIDUAL TOAST
// =============================================

const toastStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-trust-50',
    border: 'border-trust-200',
    icon: 'text-trust-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-warm-50',
    border: 'border-warm-200',
    icon: 'text-warm-500',
  },
  info: {
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    icon: 'text-brand-500',
  },
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error:   <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = toastStyles[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 200);
      }, toast.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto rounded-xl border px-4 py-3 shadow-lg',
        styles.bg,
        styles.border,
        exiting ? 'animate-toast-out' : 'animate-toast-in'
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex-shrink-0', styles.icon)}>
          {toastIcons[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-800">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-surface-500 mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-surface-200/50 text-surface-400 hover:text-surface-600 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
