"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { SearchField } from "@/components/ui/SearchField";
import { ParticipantProfile } from "./ParticipantProfile";
import { useStudium } from "@/store/useStudium";
import { initials } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Course, Participant } from "@/lib/types";

/**
 * Onglet « Participants » : enseignant en tête, puis les étudiants triés
 * par nom de famille. En mode professeur, une case de présence remplace
 * le chevron.
 */
export function ParticipantList({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const attendance = useStudium((s) => s.attendance[course.id]);
  const setAttendance = useStudium((s) => s.setAttendance);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Participant | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return course.participants;
    return course.participants.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
    );
  }, [course.participants, query]);

  const presentCount = Object.values(attendance ?? {}).filter(Boolean).length;

  return (
    <div className="su-card m-3 p-4">
      <SearchField value={query} onChange={setQuery} placeholder={t("search", lang)} />

      {isTeacher && (
        <p className="su-meta mt-3">
          {t("attendance", lang)} : {presentCount} / {course.participants.length - 1}
        </p>
      )}

      <ul className="mt-2 divide-y divide-line">
        {visible.map((p) => (
          <li key={p.id}>
            <div className="flex items-center gap-3 py-2.5">
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-semibold ${
                    p.role === "teacher"
                      ? "bg-primary-light text-primary-dark"
                      : "bg-[#E3E6E9] text-[#4A5058]"
                  }`}
                  aria-hidden
                >
                  {initials(p.firstName, p.lastName)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] text-ink">
                    {p.firstName} {p.lastName}
                  </span>
                  {p.role === "teacher" && (
                    <span className="su-meta block">{p.roleLabel ?? t("teacher", lang)}</span>
                  )}
                  {p.id === "me" && <span className="su-meta block">Vous</span>}
                </span>
              </button>

              {isTeacher && p.role === "student" ? (
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[13px] text-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(attendance?.[p.id])}
                    onChange={(e) => setAttendance(course.id, p.id, e.target.checked)}
                    className="h-5 w-5 accent-[#0F63C8]"
                    aria-label={`${t("present", lang)} — ${p.firstName} ${p.lastName}`}
                  />
                  {t("present", lang)}
                </label>
              ) : (
                <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />
              )}
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="py-8 text-center text-[15px] text-muted">Aucun participant trouvé.</p>
      )}

      <ParticipantProfile
        participant={selected}
        course={course}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
