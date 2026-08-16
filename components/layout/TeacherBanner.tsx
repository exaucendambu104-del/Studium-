"use client";

import { Pencil } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/** Bandeau discret affiché en permanence en mode professeur. */
export function TeacherBanner() {
  const role = useStudium((s) => s.role);
  const lang = useStudium((s) => s.lang);
  const setRole = useStudium((s) => s.setRole);

  if (role !== "teacher") return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-primary-dark px-4 py-1.5 text-[13px] text-white">
      <span className="flex items-center gap-2">
        <Pencil size={13} aria-hidden />
        {t("editMode", lang)}
      </span>
      <button
        type="button"
        onClick={() => setRole("student")}
        className="rounded-full bg-white/15 px-2.5 py-1 text-[12px] font-medium transition-colors hover:bg-white/25"
      >
        {t("roleStudent", lang)}
      </button>
    </div>
  );
}
