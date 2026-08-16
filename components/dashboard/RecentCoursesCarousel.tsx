"use client";

import { useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import { Carousel } from "./Carousel";
import { CourseCard } from "@/components/course/CourseCard";
import { SortableList } from "@/components/dnd/SortableList";
import { useOrderedCourses, useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/**
 * « Cours consultés récemment ».
 * Un bouton bascule en mode réorganisation : le carrousel devient alors une
 * liste verticale triable (bien plus utilisable au doigt qu'un tri horizontal).
 */
export function RecentCoursesCarousel() {
  const lang = useStudium((s) => s.lang);
  const courses = useOrderedCourses();
  const setCourseOrder = useStudium((s) => s.setCourseOrder);
  const [reordering, setReordering] = useState(false);

  const toggle = (
    <button
      type="button"
      onClick={() => setReordering((v) => !v)}
      aria-pressed={reordering}
      aria-label="Réorganiser mes cours"
      className={`su-tap grid place-items-center rounded-full ${
        reordering ? "bg-primary text-white" : "text-[#4A5058] hover:bg-surface"
      }`}
    >
      {reordering ? <Check size={22} aria-hidden /> : <ArrowUpDown size={20} aria-hidden />}
    </button>
  );

  if (reordering) {
    return (
      <section className="su-card p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 className="su-title leading-snug">{t("recentCourses", lang)}</h2>
          {toggle}
        </div>
        <p className="su-meta mb-3">
          Glissez les cartes pour changer l&apos;ordre. L&apos;ordre est conservé sur cet appareil.
        </p>

        <SortableList
          items={courses}
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
      </section>
    );
  }

  return (
    <Carousel title={t("recentCourses", lang)} action={toggle}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Carousel>
  );
}
