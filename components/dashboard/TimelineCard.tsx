"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownWideNarrow } from "lucide-react";
import { SearchField } from "@/components/ui/SearchField";
import { Dropdown } from "@/components/ui/Dropdown";
import { ResourceIcon } from "@/components/ui/ResourceIcon";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

type Filter = "all" | "assign" | "quiz" | "overdue";

/** Carte « Chronologie » du tableau de bord. */
export function TimelineCard() {
  const lang = useStudium((s) => s.lang);
  const timeline = useStudium((s) => s.data.timeline);
  const courses = useStudium((s) => s.data.courses);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [ascending, setAscending] = useState(true);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = timeline.filter((a) => {
      if (filter === "assign") return a.kind === "assign";
      if (filter === "quiz") return a.kind === "quiz";
      if (filter === "overdue") return Boolean(a.overdue);
      // « Tout » = les activités qui nécessitent encore une action.
      // La session H26 étant terminée, tout est échu : la liste est vide,
      // comme sur l'écran d'origine. Les autres filtres, eux, montrent
      // bien l'historique.
      return !a.overdue;
    });

    if (q) {
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.kind.includes(q)
      );
    }
    return ascending ? list : [...list].reverse();
  }, [timeline, filter, query, ascending]);

  return (
    <section className="su-card p-4">
      <h2 className="su-title mb-3">{t("timeline", lang)}</h2>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={t("searchActivity", lang)}
      />

      <div className="mt-3 flex items-center justify-between">
        <Dropdown<Filter>
          value={filter}
          onChange={setFilter}
          label={t("all", lang)}
          options={[
            { value: "all", label: t("all", lang) },
            { value: "assign", label: t("assignmentsDue", lang) },
            { value: "quiz", label: t("quizzes", lang) },
            { value: "overdue", label: t("overdue", lang) },
          ]}
        />

        <button
          type="button"
          onClick={() => setAscending((v) => !v)}
          aria-label={t("sortBy", lang)}
          aria-pressed={!ascending}
          className="su-tap grid place-items-center rounded-lg text-ink hover:bg-surface"
        >
          <ArrowDownWideNarrow
            size={26}
            className={`transition-transform duration-200 ${ascending ? "" : "-scale-y-100"}`}
            aria-hidden
          />
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyTimeline label={t("noActivity", lang)} />
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {visible.map((a) => {
            const course = courses.find((c) => c.id === a.courseId);
            return (
              <li key={a.id}>
                <Link
                  href={`/cours/${a.courseId}`}
                  className="su-tap flex items-center gap-3 py-3"
                >
                  <ResourceIcon kind={a.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-ink">{a.title}</span>
                    <span className="su-meta block truncate">{course?.code}</span>
                  </span>
                  <span
                    className={`shrink-0 text-[13px] ${a.overdue ? "font-medium text-danger" : "text-muted"}`}
                  >
                    {a.dueDate}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** État vide : illustration grise « pas d'activité ». */
function EmptyTimeline({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-8">
      <svg width="200" height="150" viewBox="0 0 200 150" aria-hidden>
        <ellipse cx="100" cy="132" rx="52" ry="9" fill="#D5D9DD" />
        <rect x="58" y="18" width="84" height="104" rx="3" fill="#C8CDD2" />
        <rect x="66" y="28" width="32" height="38" rx="2" fill="#EDEFF1" />
        <rect x="102" y="28" width="32" height="38" rx="2" fill="#EDEFF1" />
        <rect x="66" y="72" width="32" height="38" rx="2" fill="#EDEFF1" />
        <rect x="102" y="72" width="32" height="38" rx="2" fill="#EDEFF1" />
        {[
          [70, 34],
          [106, 34],
          [70, 78],
          [106, 78],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x + 4} cy={y + 4} r="4" fill="#C8CDD2" />
            <rect x={x + 11} y={y + 1} width="17" height="3" rx="1.5" fill="#C8CDD2" />
            <rect x={x + 11} y={y + 7} width="12" height="3" rx="1.5" fill="#C8CDD2" />
            <rect x={x} y={y + 15} width="24" height="3" rx="1.5" fill="#C8CDD2" />
            <rect x={x} y={y + 21} width="20" height="3" rx="1.5" fill="#C8CDD2" />
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-[17px] font-semibold text-ink">{label}</p>
    </div>
  );
}
