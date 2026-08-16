"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchField } from "@/components/ui/SearchField";
import { ResourceIcon } from "@/components/ui/ResourceIcon";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/** Recherche globale (loupe de la barre supérieure) : cours et ressources. */
export default function SearchPage() {
  const lang = useStudium((s) => s.lang);
  const courses = useStudium((s) => s.data.courses);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { courses: [], resources: [] };

    const matchedCourses = courses.filter(
      (c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
    );

    const matchedResources = courses.flatMap((c) =>
      c.sections.flatMap((s) =>
        s.resources
          .filter((r) => r.title.toLowerCase().includes(q))
          .map((r) => ({ resource: r, course: c, section: s }))
      )
    );

    return { courses: matchedCourses, resources: matchedResources.slice(0, 30) };
  }, [courses, query]);

  return (
    <div className="space-y-3 p-3">
      <section className="su-card p-4">
        <h1 className="su-title mb-3">{t("search", lang)}</h1>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Cours, document, quiz…"
        />
      </section>

      {query.trim().length >= 2 && (
        <>
          {results.courses.length > 0 && (
            <section className="su-card divide-y divide-line">
              <h2 className="su-meta px-4 py-2 font-semibold uppercase tracking-wide">
                {t("myCourses", lang)}
              </h2>
              {results.courses.map((c) => (
                <Link key={c.id} href={`/cours/${c.id}`} className="block px-4 py-3 hover:bg-surface">
                  <p className="text-[15px] text-ink">
                    {c.code} - {c.title}
                  </p>
                  <p className="su-meta">{c.department}</p>
                </Link>
              ))}
            </section>
          )}

          {results.resources.length > 0 && (
            <section className="su-card divide-y divide-line">
              <h2 className="su-meta px-4 py-2 font-semibold uppercase tracking-wide">
                Documents et activités
              </h2>
              {results.resources.map(({ resource, course, section }) => (
                <Link
                  key={`${course.id}-${resource.id}`}
                  href={`/cours/${course.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface"
                >
                  <ResourceIcon kind={resource.kind} size={22} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-ink">{resource.title}</span>
                    <span className="su-meta block truncate">
                      {course.code} · {section.title}
                    </span>
                  </span>
                </Link>
              ))}
            </section>
          )}

          {results.courses.length === 0 && results.resources.length === 0 && (
            <p className="su-card p-8 text-center text-[15px] text-muted">
              Aucun résultat pour « {query} ».
            </p>
          )}
        </>
      )}
    </div>
  );
}
