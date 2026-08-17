"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CourseTab = "course" | "participants" | "grades" | "competencies";

/** Onglets glissables horizontalement avec chevrons aux extrémités. */
export function CourseTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: CourseTab; label: string }[];
  active: CourseTab;
  onChange: (tab: CourseTab) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex((t) => t.id === active);

  const step = useCallback(
    (dir: -1 | 1) => {
      const next = Math.min(tabs.length - 1, Math.max(0, activeIndex + dir));
      onChange(tabs[next].id);
      trackRef.current
        ?.querySelectorAll("button")
        [next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    },
    [activeIndex, onChange, tabs]
  );

  return (
    <div className="flex items-center border-b border-line bg-white">
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={activeIndex === 0}
        aria-label="Onglet précédent"
        className="su-tap grid shrink-0 place-items-center text-[#4A5058] disabled:opacity-25"
      >
        <ChevronLeft size={22} aria-hidden />
      </button>

      <div
        ref={trackRef}
        role="tablist"
        aria-label="Sections du cours"
        className="no-scrollbar flex flex-1 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={[
                "su-tap relative shrink-0 px-4 py-3 text-[15px] transition-colors",
                isActive ? "font-semibold text-primary" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={activeIndex === tabs.length - 1}
        aria-label="Onglet suivant"
        className="su-tap grid shrink-0 place-items-center text-[#4A5058] disabled:opacity-25"
      >
        <ChevronRight size={22} aria-hidden />
      </button>
    </div>
  );
}
