"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carrousel horizontal avec flèches `<` `>` et alignement par « écran ».
 * Le débordement partiel des voisins vient du padding : `scroll-snap` cale
 * la carte active tout en laissant deviner les suivantes.
 */
export function Carousel({
  title,
  children,
  itemWidthClass = "w-[86%]",
  action,
}: {
  title: string;
  children: React.ReactNode[];
  itemWidthClass?: string;
  action?: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.86;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section className="su-card py-4">
      <div className="mb-3 flex items-start justify-between gap-2 px-4">
        <h2 className="su-title leading-snug">{title}</h2>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`${title} — précédent`}
            className="su-tap grid place-items-center rounded-full text-[#4A5058] hover:bg-surface"
          >
            <ChevronLeft size={26} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`${title} — suivant`}
            className="su-tap grid place-items-center rounded-full text-[#4A5058] hover:bg-surface"
          >
            <ChevronRight size={26} aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-center ${itemWidthClass}`}>
            {child}
          </div>
        ))}
      </div>
    </section>
  );
}
