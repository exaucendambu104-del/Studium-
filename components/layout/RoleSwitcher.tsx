"use client";

import { GraduationCap, Presentation } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { Role } from "@/lib/types";

/**
 * Bascule Étudiant ⇄ Professeur.
 * Le même store étant partagé, tout ce qui est modifié en mode professeur
 * est immédiatement visible en mode étudiant.
 */
export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const role = useStudium((s) => s.role);
  const setRole = useStudium((s) => s.setRole);
  const lang = useStudium((s) => s.lang);

  const options: { value: Role; label: string; Icon: typeof GraduationCap }[] = [
    { value: "student", label: t("roleStudent", lang), Icon: GraduationCap },
    { value: "teacher", label: t("roleTeacher", lang), Icon: Presentation },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={t("role", lang)}
      className={`inline-flex rounded-full bg-surface p-1 ${compact ? "" : "w-full"}`}
    >
      {options.map(({ value, label, Icon }) => {
        const active = role === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setRole(value)}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
              compact ? "min-h-[36px]" : "min-h-[44px]",
              active ? "bg-primary text-white shadow-card" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
