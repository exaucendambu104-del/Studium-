"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Gauge, GraduationCap, MessageSquare, MoreHorizontal } from "lucide-react";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/**
 * Barre inférieure fixe à 5 items, surmontée de la fine barre de progression
 * bleue qui indique l'onglet actif.
 */
export function BottomNav() {
  const pathname = usePathname();
  const lang = useStudium((s) => s.lang);
  const unreadMessages = useStudium(
    (s) => s.data.messages.filter((m) => m.unread).length
  );
  const unreadNotifs = useStudium(
    (s) => s.data.notifications.filter((n) => !n.read).length
  );

  const items = [
    { href: "/", Icon: Gauge, label: t("dashboard", lang), badge: 0 },
    { href: "/cours", Icon: GraduationCap, label: t("myCourses", lang), badge: 0 },
    { href: "/messages", Icon: MessageSquare, label: t("messages", lang), badge: unreadMessages },
    { href: "/notifications", Icon: Bell, label: t("notifications", lang), badge: unreadNotifs },
    { href: "/plus", Icon: MoreHorizontal, label: t("more", lang), badge: 0 },
  ];

  const activeIndex = items.reduce((best, item, i) => {
    if (item.href === "/") return pathname === "/" ? 0 : best;
    return pathname.startsWith(item.href) ? i : best;
  }, 0);

  return (
    <nav
      aria-label="Navigation principale"
      className="sticky bottom-0 z-30 border-t border-line bg-white"
    >
      {/* Barre de progression fine indiquant l'onglet actif */}
      <div className="relative h-[3px] w-full bg-line/60">
        <div
          className="absolute top-0 h-[3px] bg-primary-dark transition-all duration-200"
          style={{ width: "20%", left: `${activeIndex * 20}%` }}
        />
      </div>

      <ul className="flex items-stretch">
        {items.map(({ href, Icon, label, badge }, i) => {
          const active = i === activeIndex;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="su-tap relative flex h-[58px] flex-col items-center justify-center"
              >
                <span className="relative">
                  <Icon
                    size={26}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? "text-ink" : "text-[#4A5058]"}
                    aria-hidden
                  />
                  {badge > 0 && (
                    <span className="absolute -right-3.5 -top-2 min-w-[22px] rounded-full bg-primary px-1.5 py-[1px] text-center text-[12px] font-semibold leading-[18px] text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
