"use client";

import { Fragment, useState } from "react";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Folder,
  ListChecks,
  Trash2,
} from "lucide-react";
import { EditableGrade } from "./EditableGrade";
import { useStudium } from "@/store/useStudium";
import { formatGrade } from "@/lib/format";
import { courseTotal, weightedTotal } from "@/lib/grades";
import { t } from "@/lib/i18n";
import type { Course, GradeItem, GradeItemKind } from "@/lib/types";

const KIND_ICON: Record<GradeItemKind, typeof ClipboardList> = {
  assign: ClipboardList,
  quiz: ListChecks,
  submission: FileCheck2,
  exam: FileCheck2,
};

/**
 * Onglet « Notes ».
 * Deux colonnes : élément d'évaluation / grade. Le chevron déplie la ligne
 * pour révéler note max, pondération, rétroaction et date de remise.
 *
 * En mode professeur (`editable`), un appui long sur une note (ou un clic,
 * ou le crayon) l'ouvre en édition — même geste que le glisser-déposer
 * ailleurs dans l'app.
 */
export function GradesTable({
  course,
  studentId,
  editable = false,
}: {
  course: Course;
  studentId: string;
  editable?: boolean;
}) {
  const lang = useStudium((s) => s.lang);
  const total = courseTotal(course, studentId);

  return (
    <div className="su-card m-3 overflow-hidden">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="w-[68%] px-3 py-2.5 text-[13px] font-semibold text-muted">
              {t("gradeItem", lang)}
            </th>
            <th className="px-3 py-2.5 text-right text-[13px] font-semibold text-muted">
              {t("grade", lang)}
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Ligne de groupe : le cours lui-même */}
          <tr className="bg-surface">
            <td colSpan={2} className="px-3 py-2.5">
              <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Folder size={17} className="text-muted" aria-hidden />
                {course.code} - {course.title}
              </span>
            </td>
          </tr>

          {course.gradeItems.map((item) => (
            <GradeRows
              key={item.id}
              item={item}
              studentId={studentId}
              depth={1}
              courseId={course.id}
              editable={editable}
            />
          ))}

          {/* Total du cours */}
          <tr className="border-t border-line bg-surface">
            <td className="px-3 py-3">
              <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
                <Calculator size={17} className="text-muted" aria-hidden />
                {t("courseTotal", lang)}
              </span>
            </td>
            <td className="px-3 py-3 text-right text-[15px] font-bold text-ink">
              {formatGrade(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Une évaluation (ou un dossier avec ses sous-évaluations et son total). */
function GradeRows({
  item,
  studentId,
  depth,
  courseId,
  editable,
}: {
  item: GradeItem;
  studentId: string;
  depth: number;
  courseId: string;
  editable: boolean;
}) {
  const lang = useStudium((s) => s.lang);
  const setGrade = useStudium((s) => s.setGrade);
  const setFeedback = useStudium((s) => s.setFeedback);
  const deleteGradeItem = useStudium((s) => s.deleteGradeItem);
  const [open, setOpen] = useState(false);

  const isFolder = Boolean(item.children?.length);
  const Icon = isFolder ? Folder : KIND_ICON[item.kind];
  const grade = item.grades[studentId];
  const feedback = item.feedback?.[studentId] ?? "";

  if (isFolder) {
    const subtotal = weightedTotal(item.children!, studentId);
    return (
      <>
        <tr className="border-t border-line bg-surface/60">
          <td colSpan={2} className="px-3 py-2.5" style={{ paddingLeft: 12 + depth * 12 }}>
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Folder size={16} className="text-muted" aria-hidden />
              {item.name}
            </span>
          </td>
        </tr>

        {item.children!.map((child) => (
          <GradeRows
            key={child.id}
            item={child}
            studentId={studentId}
            depth={depth + 1}
            courseId={courseId}
            editable={editable}
          />
        ))}

        <tr className="border-t border-line">
          <td className="px-3 py-2.5" style={{ paddingLeft: 12 + (depth + 1) * 12 }}>
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Calculator size={15} className="text-muted" aria-hidden />
              {t("subtotalOf", lang)} {item.name}
            </span>
          </td>
          <td className="px-3 py-2.5 text-right text-[15px] font-semibold text-ink">
            {formatGrade(Math.round(subtotal * 100) / 100)}
          </td>
        </tr>
      </>
    );
  }

  return (
    <Fragment>
      <tr className="border-t border-line">
        <td className="px-3 py-2.5" style={{ paddingLeft: 12 + depth * 4 }}>
          <div className="flex items-start gap-1">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex min-w-0 flex-1 items-start gap-1.5 text-left"
            >
              {open ? (
                <ChevronDown size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              ) : (
                <ChevronRight size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              )}
              <Icon size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />
              <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink">{item.name}</span>
            </button>

            {editable && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`${t("deleteConfirm", lang)}\n\n${item.name}`)) {
                    deleteGradeItem(courseId, item.id);
                  }
                }}
                aria-label={`Supprimer ${item.name}`}
                className="su-tap grid shrink-0 place-items-center rounded-full text-muted hover:text-danger"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 align-top text-right text-[15px] text-ink">
          <EditableGrade
            value={grade}
            max={item.max}
            feedback={feedback}
            itemName={item.name}
            editable={editable}
            onSave={(value, text) => {
              setGrade(courseId, item.id, studentId, value);
              setFeedback(courseId, item.id, studentId, text);
            }}
          />
        </td>
      </tr>

      {open && (
        <tr className="bg-surface/60">
          <td colSpan={2} className="px-3 pb-3 pt-1" style={{ paddingLeft: 12 + depth * 4 + 24 }}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
              <dt className="text-muted">{t("maxGrade", lang)}</dt>
              <dd className="text-ink">{formatGrade(item.max)}</dd>

              <dt className="text-muted">{t("weight", lang)}</dt>
              <dd className="text-ink">{item.weight} %</dd>

              {item.dueDate && (
                <>
                  <dt className="text-muted">{t("dueDate", lang)}</dt>
                  <dd className="text-ink">{item.dueDate}</dd>
                </>
              )}

              <dt className="text-muted">{t("feedback", lang)}</dt>
              <dd className={feedback ? "text-ink" : "italic text-muted"}>
                {feedback || t("noFeedback", lang)}
              </dd>
            </dl>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
