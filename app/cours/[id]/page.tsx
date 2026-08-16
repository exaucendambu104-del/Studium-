"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CloudDownload, Info } from "lucide-react";
import { CourseBanner } from "@/components/course/CourseBanner";
import { CourseContent } from "@/components/course/CourseContent";
import { CourseTabs, type CourseTab } from "@/components/course/CourseTabs";
import { CompetencyList } from "@/components/competencies/CompetencyList";
import { GradeEditor } from "@/components/grades/GradeEditor";
import { GradesTable } from "@/components/grades/GradesTable";
import { ParticipantList } from "@/components/participants/ParticipantList";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { pendingCount } from "@/lib/grades";
import { t } from "@/lib/i18n";

/** PAGE 3 — Page d'un cours. */
export default function CoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const currentStudentId = useStudium((s) => s.data.currentStudentId);
  const course = useStudium((s) => s.data.courses.find((c) => c.id === params.id));

  const [tab, setTab] = useState<CourseTab>("course");
  const [infoOpen, setInfoOpen] = useState(false);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-[15px] text-muted">Ce cours est introuvable.</p>
        <Link href="/cours" className="mt-3 inline-block text-[15px] font-medium text-primary">
          Retour à mes cours
        </Link>
      </div>
    );
  }

  const teacher = course.participants.find((p) => p.role === "teacher");
  const studentCount = course.participants.length - 1;

  return (
    <div className="pb-6">
      {/* En-tête du cours */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-2 py-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="su-tap grid place-items-center rounded-full text-ink hover:bg-surface"
          >
            <ArrowLeft size={24} aria-hidden />
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toast("Contenu du cours téléchargé pour la lecture hors ligne")}
              aria-label={t("download", lang)}
              className="su-tap grid place-items-center rounded-full text-ink hover:bg-surface"
            >
              <CloudDownload size={24} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              aria-label={t("courseInfo", lang)}
              className="su-tap grid place-items-center rounded-full text-ink hover:bg-surface"
            >
              <Info size={24} aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 pb-3">
          <CourseBanner
            color={course.color}
            pattern={course.pattern}
            className="h-14 w-14 shrink-0"
            rounded="rounded-lg"
          />
          <h1 className="text-[18px] font-semibold leading-snug text-ink">
            {course.code} - {course.title}
          </h1>
        </div>
      </div>

      <CourseTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "course", label: t("tabCourse", lang) },
          { id: "participants", label: t("tabParticipants", lang) },
          { id: "grades", label: t("tabGrades", lang) },
          { id: "competencies", label: t("tabCompetencies", lang) },
        ]}
      />

      <div key={tab} className="su-page-enter">
        {tab === "course" && <CourseContent course={course} />}
        {tab === "participants" && <ParticipantList course={course} />}
        {tab === "grades" &&
          (isTeacher ? (
            <GradeEditor course={course} />
          ) : (
            <GradesTable course={course} studentId={currentStudentId} />
          ))}
        {tab === "competencies" && <CompetencyList course={course} />}
      </div>

      <Modal open={infoOpen} title={t("courseInfo", lang)} onClose={() => setInfoOpen(false)}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px]">
          <dt className="text-muted">Code</dt>
          <dd className="text-ink">{course.code}</dd>

          <dt className="text-muted">Titre</dt>
          <dd className="text-ink">{course.title}</dd>

          <dt className="text-muted">Département</dt>
          <dd className="text-ink">{course.department}</dd>

          <dt className="text-muted">Session</dt>
          <dd className="text-ink">{course.term}</dd>

          <dt className="text-muted">{t("teacher", lang)}</dt>
          <dd className="text-ink">
            {teacher ? `${teacher.firstName} ${teacher.lastName}` : "—"}
          </dd>

          <dt className="text-muted">Participants</dt>
          <dd className="text-ink">{studentCount} étudiants</dd>

          <dt className="text-muted">Sections</dt>
          <dd className="text-ink">{course.sections.length}</dd>

          {isTeacher && (
            <>
              <dt className="text-muted">À corriger</dt>
              <dd className="text-ink">{pendingCount(course)} copies</dd>
            </>
          )}
        </dl>
      </Modal>
    </div>
  );
}
