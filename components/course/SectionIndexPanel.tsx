"use client";

import { Check, X } from "lucide-react";
import { SortableList } from "@/components/dnd/SortableList";
import { DragHandle } from "@/components/dnd/DragHandle";
import { t } from "@/lib/i18n";
import { useStudium } from "@/store/useStudium";
import type { Section } from "@/lib/types";

/**
 * Panneau latéral ouvert par le bouton flottant : index de toutes les
 * sections, pour sauter directement à l'une d'elles.
 * En mode professeur, les sections y sont réordonnables à la poignée.
 */
export function SectionIndexPanel({
  open,
  onClose,
  sections,
  index,
  onSelect,
  courseId,
}: {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  index: number;
  onSelect: (index: number) => void;
  courseId: string;
}) {
  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const setSections = useStudium((s) => s.setSections);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-ink/40" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("sectionIndex", lang)}
        className="su-page-enter relative flex h-full w-[85%] max-w-[360px] flex-col bg-white shadow-lifted"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="su-title">{t("sectionIndex", lang)}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="su-tap grid place-items-center rounded-full text-muted hover:bg-surface"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isTeacher ? (
            <SortableList
              items={sections}
              onReorder={(next) => setSections(courseId, next)}
              activation="handle"
              className="space-y-1"
              renderItem={(section, { isDragging, handleProps }) => {
                const i = sections.findIndex((s) => s.id === section.id);
                return (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-2 ${
                      isDragging ? "su-dragging bg-white" : ""
                    } ${i === index ? "bg-primary-light" : ""}`}
                  >
                    <DragHandle {...(handleProps as object)} label={`Déplacer ${section.title}`} />
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(i);
                        onClose();
                      }}
                      className="su-tap min-w-0 flex-1 py-2 text-left text-[15px] text-ink"
                    >
                      <span className="block truncate">{section.title}</span>
                      <span className="su-meta">{section.resources.length} ressource(s)</span>
                    </button>
                  </div>
                );
              }}
            />
          ) : (
            <ul className="space-y-1">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(i);
                      onClose();
                    }}
                    aria-current={i === index ? "true" : undefined}
                    className={`su-tap flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${
                      i === index ? "bg-primary-light" : "hover:bg-surface"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[15px] ${
                          i === index ? "font-semibold text-primary-dark" : "text-ink"
                        }`}
                      >
                        {section.title}
                      </span>
                      <span className="su-meta">{section.resources.length} ressource(s)</span>
                    </span>
                    {i === index && <Check size={18} className="shrink-0 text-primary" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
