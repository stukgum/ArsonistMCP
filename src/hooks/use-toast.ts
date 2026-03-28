import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
}

let toastListeners: ((toast: Toast) => void)[] = [];
let toastCounter = 0;

function addToastListener(listener: (toast: Toast) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

function fireToast(toast: Omit<Toast, 'id'>) {
  toastCounter += 1;
  const t = { ...toast, id: `toast-${toastCounter}` };
  toastListeners.forEach((l) => l(t));
}

export function useToast() {
  const toast = useCallback((opts: { title: string; description?: string }) => {
    fireToast(opts);
  }, []);

  return { toast };
}

export { addToastListener };
export type { Toast };
