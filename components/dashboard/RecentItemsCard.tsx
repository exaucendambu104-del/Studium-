"use client";

import Link from "next/link";
import { Carousel } from "./Carousel";
import { ResourceIcon } from "@/components/ui/ResourceIcon";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/** « Éléments consultés récemment » : petites cartes fichier en carrousel. */
export function RecentItemsCard() {
  const lang = useStudium((s) => s.lang);
  const items = useStudium((s) => s.data.recentItems);
  const courses = useStudium((s) => s.data.courses);

  if (items.length === 0) return null;

  return (
    <Carousel title={t("recentItems", lang)} itemWidthClass="w-[78%]">
      {items.map((item) => {
        const course = courses.find((c) => c.id === item.courseId);
        return (
          <Link
            key={item.id}
            href={`/cours/${item.courseId}`}
            className="su-card flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-surface"
          >
            <ResourceIcon kind={item.kind} size={26} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px] leading-snug text-ink">
                {item.title}
              </span>
              <span className="su-meta block truncate">
                {course ? `${course.code} - ${course.title}` : ""}
              </span>
            </span>
          </Link>
        );
      })}
    </Carousel>
  );
}
