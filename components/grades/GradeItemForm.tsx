"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { parseGrade } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Course, GradeItemKind } from "@/lib/types";

const KINDS: [GradeItemKind, string][] = [
  ["assign", "Devoir"],
  ["quiz", "Quiz"],
  ["submission", "Remise"],
  ["exam", "Examen"],
];

/** Mode professeur : création d'une nouvelle évaluation dans la grille. */
export function GradeItemForm({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const addGradeItem = useStudium((s) => s.addGradeItem);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("10");
  const [max, setMax] = useState("10");
  const [kind, setKind] = useState<GradeItemKind>("assign");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = parseGrade(weight);
    const m = parseGrade(max);
    if (!name.trim() || w === null || m === null || m <= 0 || w < 0) return;

    addGradeItem(course.id, {
      id: `gi-${Date.now().toString(36)}`,
      kind,
      name: name.trim(),
      weight: w,
      max: m,
    });

    setName("");
    setOpen(false);
    toast(t("saved", lang));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="su-tap flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 text-[14px] font-medium text-primary hover:bg-primary-light/40"
      >
        <Plus size={16} aria-hidden />
        {t("newGradeItem", lang)}
      </button>

      <Modal open={open} title={t("newGradeItem", lang)} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="su-meta mb-1 block">Nom de l&apos;évaluation</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="su-input"
              placeholder="Travail réflexif #3 (15%)"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="su-meta mb-1 block">{t("weight", lang)} (%)</span>
              <input
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="su-input"
              />
            </label>
            <label className="block">
              <span className="su-meta mb-1 block">{t("maxGrade", lang)}</span>
              <input
                inputMode="decimal"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="su-input"
              />
            </label>
          </div>

          <fieldset>
            <legend className="su-meta mb-1.5">{t("type", lang)}</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  aria-pressed={kind === value}
                  className={`rounded-full px-3 py-2 text-[14px] font-medium transition-colors ${
                    kind === value ? "bg-primary text-white" : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="su-tap flex-1 rounded-lg border border-line text-[15px] font-medium text-ink"
            >
              {t("cancel", lang)}
            </button>
            <button
              type="submit"
              className="su-tap flex-1 rounded-lg bg-primary text-[15px] font-medium text-white"
            >
              {t("create", lang)}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
