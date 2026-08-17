"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

const PAGE_SIZE = 20;

/** Page Notifications : liste datée, paginée par « Afficher plus ». */
export default function NotificationsPage() {
  const lang = useStudium((s) => s.lang);
  const notifications = useStudium((s) => s.data.notifications);
  const markAllRead = useStudium((s) => s.markAllNotificationsRead);

  const [shown, setShown] = useState(PAGE_SIZE);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-3 p-3">
      <section className="su-card flex items-center justify-between gap-3 p-4">
        <div>
          <h1 className="su-title">{t("notifications", lang)}</h1>
          <p className="su-meta">{unread} non lues</p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="su-tap flex items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-primary disabled:text-muted"
        >
          <CheckCheck size={18} aria-hidden />
          {t("markAllRead", lang)}
        </button>
      </section>

      <section className="su-card divide-y divide-line">
        {notifications.slice(0, shown).map((n) => (
          <article key={n.id} className={`flex gap-3 p-4 ${n.read ? "opacity-60" : ""}`}>
            <span
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark"
              aria-hidden
            >
              <Bell size={17} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium leading-snug text-ink">{n.title}</p>
              <p className="su-meta mt-0.5">{n.body}</p>
              <p className="su-meta mt-1">
                {n.courseCode} · {n.date}
              </p>
            </div>

            {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
          </article>
        ))}
      </section>

      {shown < notifications.length && (
        <button
          type="button"
          onClick={() => setShown((s) => s + PAGE_SIZE)}
          className="su-card su-tap w-full text-[15px] font-medium text-primary"
        >
          Afficher plus ({notifications.length - shown} restantes)
        </button>
      )}
    </div>
  );
}
