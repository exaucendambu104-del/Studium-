"use client";

import { AnnouncementBanner } from "@/components/dashboard/AnnouncementBanner";
import { RecentCoursesCarousel } from "@/components/dashboard/RecentCoursesCarousel";
import { RecentItemsCard } from "@/components/dashboard/RecentItemsCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { AnnouncementForm } from "@/components/teacher/AnnouncementForm";
import { useStudium } from "@/store/useStudium";

/** PAGE 1 — Tableau de bord. */
export default function DashboardPage() {
  const announcements = useStudium((s) => s.data.announcements);
  const isTeacher = useStudium((s) => s.role === "teacher");

  return (
    <div className="space-y-3 p-3 pb-6">
      <TimelineCard />
      <RecentItemsCard />
      <RecentCoursesCarousel />

      {announcements.map((a) => (
        <AnnouncementBanner key={a.id} announcement={a} />
      ))}

      {isTeacher && <AnnouncementForm />}
    </div>
  );
}
