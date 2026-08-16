"use client";

import { useState } from "react";
import { CircleCheckBig, Minus, Plus, TriangleAlert, Trash2 } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import type { Announcement } from "@/lib/types";

/** Bannière d'annonce dépliable (avertissement ambre / information verte). */
export function AnnouncementBanner({ announcement }: { announcement: Announcement }) {
  const [open, setOpen] = useState(false);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const removeAnnouncement = useStudium((s) => s.removeAnnouncement);

  const warning = announcement.tone === "warning";
  const Icon = warning ? TriangleAlert : CircleCheckBig;

  return (
    <section className="su-card p-4">
      <div
        className={`rounded-lg px-4 py-4 ${
          warning ? "bg-warnBg text-warnInk" : "bg-infoBg text-infoInk"
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon size={26} className="mt-0.5 shrink-0" aria-hidden />

          <h3 className="flex-1 text-[20px] font-bold leading-snug">
            {announcement.title}
          </h3>

          <div className="flex shrink-0 items-center gap-1">
            {isTeacher && (
              <button
                type="button"
                onClick={() => removeAnnouncement(announcement.id)}
                aria-label={`Supprimer l'annonce « ${announcement.title} »`}
                className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/10"
              >
                <Trash2 size={14} aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Réduire l'annonce" : "Déplier l'annonce"}
              className={`grid h-6 w-6 place-items-center rounded-full ${
                warning ? "bg-warnInk/20" : "bg-infoInk"
              }`}
            >
              {open ? (
                <Minus size={12} strokeWidth={3} className={warning ? "" : "text-white"} aria-hidden />
              ) : (
                <Plus size={12} strokeWidth={3} className={warning ? "" : "text-white"} aria-hidden />
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="su-page-enter mt-3 space-y-2 border-t border-current/15 pt-3">
            <p className="text-[15px] leading-relaxed">{announcement.body}</p>
            <p className="text-[13px] opacity-70">Publié le {announcement.date}</p>
          </div>
        )}
      </div>
    </section>
  );
}
