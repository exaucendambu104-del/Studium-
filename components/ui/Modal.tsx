"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/** Feuille modale montant du bas — utilisée par tous les formulaires prof. */
export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="su-page-enter relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lifted sm:rounded-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="su-title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="su-tap grid place-items-center rounded-full text-muted hover:bg-surface"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
