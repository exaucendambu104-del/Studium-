"use client";

import { CircleCheck, CircleDashed, CircleDotDashed } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { CompetencyState, Course } from "@/lib/types";

const STATES: Record<
  CompetencyState,
  { Icon: typeof CircleCheck; classes: string; labelKey: "compNone" | "compProgress" | "compAchieved" }
> = {
  none: { Icon: CircleDashed, classes: "bg-surface text-muted", labelKey: "compNone" },
  progress: {
    Icon: CircleDotDashed,
    classes: "bg-warnBg text-warnInk",
    labelKey: "compProgress",
  },
  achieved: { Icon: CircleCheck, classes: "bg-infoBg text-infoInk", labelKey: "compAchieved" },
};

const ORDER: CompetencyState[] = ["none", "progress", "achieved"];

/**
 * Onglet « Compétences » : compétences du plan de cours et leur état.
 * En mode professeur, un tap fait tourner l'état (non évaluée → en
 * progression → atteinte).
 */
export function CompetencyList({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const setCompetencyState = useStudium((s) => s.setCompetencyState);

  return (
    <div className="su-card m-3 divide-y divide-line">
      {course.competencies.map((c) => {
        const { Icon, classes, labelKey } = STATES[c.state];
        const badge = (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium ${classes}`}
          >
            <Icon size={14} aria-hidden />
            {t(labelKey, lang)}
          </span>
        );

        return (
          <div key={c.id} className="flex items-start justify-between gap-3 p-4">
            <p className="min-w-0 flex-1 text-[15px] leading-snug text-ink">{c.title}</p>

            {isTeacher ? (
              <button
                type="button"
                onClick={() =>
                  setCompetencyState(
                    course.id,
                    c.id,
                    ORDER[(ORDER.indexOf(c.state) + 1) % ORDER.length]
                  )
                }
                aria-label={`Changer l'état de « ${c.title} »`}
                className="shrink-0"
              >
                {badge}
              </button>
            ) : (
              badge
            )}
          </div>
        );
      })}

      {course.competencies.length === 0 && (
        <p className="p-8 text-center text-[15px] text-muted">
          Aucune compétence n&apos;est associée à ce cours.
        </p>
      )}
    </div>
  );
}
