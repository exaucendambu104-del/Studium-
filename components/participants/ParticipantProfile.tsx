"use client";

import { useRouter } from "next/navigation";
import { Mail, MessageSquare } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useStudium } from "@/store/useStudium";
import { initials } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Course, Participant } from "@/lib/types";

/** Fiche profil ouverte au tap sur un participant. */
export function ParticipantProfile({
  participant,
  course,
  onClose,
}: {
  participant: Participant | null;
  course: Course;
  onClose: () => void;
}) {
  const router = useRouter();
  const lang = useStudium((s) => s.lang);
  const courses = useStudium((s) => s.data.courses);

  if (!participant) return null;

  const shared = courses.filter((c) =>
    c.participants.some((p) => p.id === participant.id || p.email === participant.email)
  );

  return (
    <Modal open title={`${participant.firstName} ${participant.lastName}`} onClose={onClose}>
      <div className="flex items-center gap-4">
        <span
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-full text-[22px] font-semibold ${
            participant.role === "teacher"
              ? "bg-primary-light text-primary-dark"
              : "bg-[#E3E6E9] text-[#4A5058]"
          }`}
          aria-hidden
        >
          {initials(participant.firstName, participant.lastName)}
        </span>
        <div className="min-w-0">
          <p className="text-[17px] text-ink">
            {participant.firstName} {participant.lastName}
          </p>
          <p className="su-meta">
            {participant.roleLabel ??
              (participant.role === "teacher" ? t("teacher", lang) : t("student", lang))}
          </p>
          <p className="su-meta flex items-center gap-1 truncate">
            <Mail size={13} aria-hidden />
            {participant.email}
          </p>
        </div>
      </div>

      <section className="mt-5">
        <h3 className="su-meta mb-2 font-semibold uppercase tracking-wide">
          {t("coursesInCommon", lang)}
        </h3>
        <ul className="space-y-1">
          {shared.map((c) => (
            <li
              key={c.id}
              className={`rounded-lg px-3 py-2 text-[14px] ${
                c.id === course.id ? "bg-primary-light text-primary-dark" : "bg-surface text-ink"
              }`}
            >
              {c.code} - {c.title}
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => {
          onClose();
          router.push("/messages");
        }}
        className="su-tap mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-medium text-white"
      >
        <MessageSquare size={18} aria-hidden />
        {t("sendMessage", lang)}
      </button>
    </Modal>
  );
}
