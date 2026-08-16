"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const ToastContext = createContext<(message: string) => void>(() => {});

/** Toast de confirmation (« Modifications enregistrées »). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((m: string) => setMessage(m), []);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 2400);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="su-page-enter pointer-events-none fixed bottom-[84px] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] text-white shadow-lifted"
        >
          <CheckCircle2 size={16} className="text-[#5BD98A]" aria-hidden />
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
