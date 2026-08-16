"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { SortableList } from "@/components/dnd/SortableList";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchField } from "@/components/ui/SearchField";
import { useOrderedCourses, useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

type Term = "all" | "H26" | "A25" | "A24";

/** PAGE 2 — Mes cours : grille filtrable et réordonnable. */
export default function MyCoursesPage() {
  const lang = useStudium((s) => s.lang);
  const courses = useOrderedCourses();
  const setCourseOrder = useStudium((s) => s.setCourseOrder);

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState<Term>("all");
  const [reordering, setReordering] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (term !== "all" && c.term !== term) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    });
  }, [courses, query, term]);

  // Le tri n'a de sens que sur la liste complète : filtrer puis réordonner
  // produirait un ordre partiel impossible à réinjecter.
  const canReorder = term === "all" && query.trim() === "";

  return (
    <div className="space-y-3 p-3 pb-6">
      <section className="su-card space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="su-title">{t("myCourses", lang)}</h1>
          {canReorder && (
            <button
              type="button"
              onClick={() => setReordering((v) => !v)}
              aria-pressed={reordering}
              aria-label="Réorganiser mes cours"
              className={`su-tap grid shrink-0 place-items-center rounded-full ${
                reordering ? "bg-primary text-white" : "text-[#4A5058] hover:bg-surface"
              }`}
            >
              {reordering ? <Check size={22} aria-hidden /> : <ArrowUpDown size={20} aria-hidden />}
            </button>
          )}
        </div>

        <SearchField value={query} onChange={setQuery} placeholder={t("searchCourse", lang)} />

        <Dropdown<Term>
          value={term}
          onChange={setTerm}
          label={t("allTerms", lang)}
          options={[
            { value: "all", label: t("allTerms", lang) },
            { value: "H26", label: "Hiver 2026 (H26)" },
            { value: "A25", label: "Automne 2025 (A25)" },
            { value: "A24", label: "Automne 2024 (A24)" },
          ]}
        />

        <p className="su-meta">
          {visible.length} cours
          {reordering && " — glissez la poignée ⠿ pour réordonner"}
        </p>
      </section>

      {visible.length === 0 ? (
        <p className="su-card p-8 text-center text-[15px] text-muted">
          Aucun cours ne correspond à votre recherche.
        </p>
      ) : reordering ? (
        <SortableList
          items={visible}
          onReorder={(next) => setCourseOrder(next.map((c) => c.id))}
          activation="handle"
          className="space-y-3"
          renderItem={(course, { isDragging, handleProps }) => (
            <CourseCard
              course={course}
              showHandle
              handleProps={handleProps}
              isDragging={isDragging}
            />
          )}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
