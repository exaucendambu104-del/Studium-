"use client";

import Link from "next/link";
import { CourseBanner } from "./CourseBanner";
import { DragHandle } from "@/components/dnd/DragHandle";
import type { Course } from "@/lib/types";

/**
 * Carte de cours : bannière géométrique, titre complet, pilule de département.
 * Utilisée à l'identique dans le carrousel du tableau de bord et dans « Mes cours ».
 */
export function CourseCard({
  course,
  showHandle = false,
  handleProps,
  isDragging = false,
  className = "",
}: {
  course: Course;
  showHandle?: boolean;
  handleProps?: Record<string, unknown>;
  isDragging?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "su-card overflow-hidden transition-shadow",
        isDragging ? "su-dragging" : "",
        className,
      ].join(" ")}
    >
      <Link href={`/cours/${course.id}`} className="block">
        <CourseBanner color={course.color} pattern={course.pattern} className="h-[92px]" />
      </Link>

      <div className="flex items-start gap-2 p-3">
        {showHandle && <DragHandle {...(handleProps as object)} label={`Réorganiser ${course.code}`} />}

        <Link href={`/cours/${course.id}`} className="min-w-0 flex-1">
          <h3 className="su-card-title leading-snug">
            {course.code} - {course.title}
          </h3>
          <span className="su-pill mt-2">{course.department}</span>
        </Link>
      </div>
    </div>
  );
}
