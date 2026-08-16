"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { truncate } from "@/lib/format";
import type { Section } from "@/lib/types";

/**
 * Boutons bleus de navigation entre les sections, en bas de l'onglet « Cours ».
 * Les libellés sont tronqués quand le titre est trop long
 * (« Module 9 - Bi… → »).
 */
export function SectionNavigator({
  sections,
  index,
  onChange,
}: {
  sections: Section[];
  index: number;
  onChange: (index: number) => void;
}) {
  const previous = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <nav aria-label="Navigation entre les sections" className="flex items-stretch gap-2 pt-2">
      {previous ? (
        <button
          type="button"
          onClick={() => onChange(index - 1)}
          className="su-tap flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-left text-[14px] font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <ChevronLeft size={18} className="shrink-0" aria-hidden />
          <span className="truncate">{truncate(previous.title, 22)}</span>
        </button>
      ) : (
        <span className="flex-1" />
      )}

      {next ? (
        <button
          type="button"
          onClick={() => onChange(index + 1)}
          className="su-tap flex min-w-0 flex-1 items-center justify-end gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-right text-[14px] font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <span className="truncate">{truncate(next.title, 22)}</span>
          <ChevronRight size={18} className="shrink-0" aria-hidden />
        </button>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
