"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastContextValue = {
  message: string | null;
  push: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const push = useCallback((next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage((current) => (current === next ? null : current)), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ message, push }}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {message ? <p className="toast">{message}</p> : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
