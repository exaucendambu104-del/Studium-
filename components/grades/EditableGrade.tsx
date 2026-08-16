"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { formatGrade, parseGrade } from "@/lib/format";
import { t } from "@/lib/i18n";

const HOLD_MS = 450;
/** Déplacement au-delà duquel un appui long est annulé (le doigt fait défiler). */
const MOVE_TOLERANCE = 8;

/**
 * Note affichée dans une cellule du tableau. En mode édition, un appui
 * long l'ouvre en édition — le même geste que le glisser-déposer ailleurs
 * dans l'app (poignée ⠿ + appui long). Un crayon reste visible comme
 * équivalent accessible au clavier ou à la souris, sur le modèle de la
 * poignée de glisser-déposer.
 */
export function EditableGrade({
  value,
  max,
  feedback,
  itemName,
  editable,
  onSave,
}: {
  value: number | null;
  max: number;
  feedback: string;
  itemName: string;
  editable: boolean;
  onSave: (value: number | null, feedback: string) => void;
}) {
  const lang = useStudium((s) => s.lang);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [draftValue, setDraftValue] = useState("");
  const [draftFeedback, setDraftFeedback] = useState("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
    startRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const openEditor = useCallback(() => {
    setDraftValue(value === null ? "" : String(value).replace(".", ","));
    setDraftFeedback(feedback);
    setOpen(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        /* certains navigateurs bloquent la vibration hors geste utilisateur */
      }
    }
  }, [value, feedback]);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (!editable) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setPressing(true);
    timerRef.current = setTimeout(() => {
      clearTimer();
      openEditor();
    }, HOLD_MS);
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE) clearTimer();
  }

  const draftNumber = draftValue.trim() === "" ? null : parseGrade(draftValue);
  const invalid =
    draftValue.trim() !== "" && (draftNumber === null || draftNumber < 0 || draftNumber > max);

  function save() {
    if (invalid) return;
    onSave(draftNumber, draftFeedback.trim());
    setOpen(false);
    toast(t("saved", lang));
  }

  if (!editable) {
    return <span>{formatGrade(value)}</span>;
  }

  return (
    <>
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onPointerCancel={clearTimer}
        onClick={() => {
          if (!open) openEditor();
        }}
        aria-label={`${itemName} : ${formatGrade(value)}. ${t("holdToEdit", lang)}`}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-transform duration-150 ${
          pressing ? "scale-95 bg-primary-light" : "hover:bg-surface"
        }`}
      >
        {formatGrade(value)}
        <Pencil size={12} className="text-muted" aria-hidden />
      </button>

      <Modal open={open} title={itemName} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="su-meta mb-1 block">
              {t("grade", lang)} · {t("maxGrade", lang)} {formatGrade(max)}
            </span>
            <input
              inputMode="decimal"
              autoFocus
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              placeholder="-"
              aria-invalid={invalid}
              className={`su-input text-right text-[17px] ${
                invalid ? "border-danger text-danger" : ""
              }`}
            />
            {invalid && (
              <span className="mt-1 block text-[13px] text-danger">
                {t("gradeOutOfRange", lang)} {formatGrade(max)}
              </span>
            )}
          </label>

          <label className="block">
            <span className="su-meta mb-1 block">{t("feedback", lang)}</span>
            <textarea
              value={draftFeedback}
              onChange={(e) => setDraftFeedback(e.target.value)}
              rows={3}
              placeholder={t("feedback", lang)}
              className="su-input resize-none"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="su-tap flex-1 rounded-lg border border-line text-[15px] font-medium text-ink"
            >
              {t("cancel", lang)}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={invalid}
              className="su-tap flex-1 rounded-lg bg-primary text-[15px] font-medium text-white disabled:bg-line disabled:text-muted"
            >
              {t("save", lang)}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
