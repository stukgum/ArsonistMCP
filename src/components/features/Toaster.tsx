import { useState, useEffect } from 'react';
import { addToastListener, type Toast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const [toasts, setToasts] = useState<(Toast & { visible: boolean })[]>([]);

  useEffect(() => {
    const unsub = addToastListener((toast) => {
      const entry = { ...toast, visible: true };
      setToasts((prev) => [...prev, entry]);

      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === toast.id ? { ...t, visible: false } : t)));
      }, 3000);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3400);
    });
    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-md border border-dim bg-surface-elevated shadow-lg transition-all duration-300 ${
            toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[hsl(var(--text-primary))]">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-[hsl(var(--text-secondary))] mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="shrink-0 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
