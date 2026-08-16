"use client";

import { useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { GradeItemForm } from "./GradeItemForm";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { formatGrade, parseGrade } from "@/lib/format";
import { leafItems, weightedTotal } from "@/lib/grades";
import { t } from "@/lib/i18n";
import type { Course } from "@/lib/types";

type View = "single" | "matrix";

/**
 * Onglet « Notes » en mode professeur : saisie des notes.
 *
 * Deux vues :
 *  - « single »  → un étudiant, toutes ses évaluations, avec rétroaction
 *  - « matrix »  → tableau tous les étudiants × toutes les évaluations
 *
 * Les saisies sont conservées localement puis poussées dans le store au
 * clic sur « Enregistrer », ce qui permet d'annuler en changeant d'étudiant.
 */
export function GradeEditor({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const setGrade = useStudium((s) => s.setGrade);
  const setFeedback = useStudium((s) => s.setFeedback);
  const deleteGradeItem = useStudium((s) => s.deleteGradeItem);
  const toast = useToast();

  const students = useMemo(
    () => course.participants.filter((p) => p.role === "student"),
    [course.participants]
  );
  const items = useMemo(() => leafItems(course.gradeItems), [course.gradeItems]);

  const [view, setView] = useState<View>("single");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  /** Valeur affichée : brouillon en cours de saisie, sinon valeur du store. */
  const gradeValue = (itemId: string, sid: string) => {
    const key = `${itemId}:${sid}`;
    if (key in drafts) return drafts[key];
    const stored = items.find((i) => i.id === itemId)?.grades[sid];
    return stored === null || stored === undefined ? "" : String(stored).replace(".", ",");
  };

  const feedbackValue = (itemId: string, sid: string) => {
    const key = `${itemId}:${sid}`;
    if (key in feedbackDrafts) return feedbackDrafts[key];
    return items.find((i) => i.id === itemId)?.feedback?.[sid] ?? "";
  };

  /** Total pondéré recalculé en direct, brouillons compris. */
  const liveTotal = (sid: string) => {
    const base = items.reduce((sum, item) => {
      const raw = gradeValue(item.id, sid);
      const value = raw === "" ? null : parseGrade(raw);
      if (value === null || item.max <= 0) return sum;
      return sum + (value / item.max) * item.weight;
    }, 0);
    return Math.round(base * 100) / 100;
  };

  function save() {
    let invalid = 0;

    for (const [key, raw] of Object.entries(drafts)) {
      const [itemId, sid] = key.split(":");
      const item = items.find((i) => i.id === itemId);
      if (!item) continue;

      if (raw.trim() === "") {
        setGrade(course.id, itemId, sid, null);
        continue;
      }

      const value = parseGrade(raw);
      if (value === null || value < 0 || value > item.max) {
        invalid += 1;
        continue;
      }
      setGrade(course.id, itemId, sid, Math.round(value * 100) / 100);
    }

    for (const [key, text] of Object.entries(feedbackDrafts)) {
      const [itemId, sid] = key.split(":");
      setFeedback(course.id, itemId, sid, text);
    }

    setDrafts({});
    setFeedbackDrafts({});
    toast(
      invalid > 0
        ? `${invalid} note(s) hors bornes ignorée(s)`
        : t("saved", lang)
    );
  }

  const dirty = Object.keys(drafts).length + Object.keys(feedbackDrafts).length > 0;

  return (
    <div className="m-3 space-y-3">
      <section className="su-card space-y-3 p-4">
        <div className="flex rounded-full bg-surface p-1">
          {(
            [
              ["single", t("selectStudent", lang)],
              ["matrix", t("allStudents", lang)],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={`flex-1 rounded-full px-3 py-2 text-[14px] font-medium transition-colors ${
                view === value ? "bg-white text-ink shadow-card" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "single" && (
          <Dropdown
            value={studentId}
            onChange={setStudentId}
            label={t("selectStudent", lang)}
            options={students.map((s) => ({
              value: s.id,
              label: `${s.lastName}, ${s.firstName}`,
            }))}
          />
        )}

        <GradeItemForm course={course} />
      </section>

      {view === "single" ? (
        <section className="su-card divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug text-ink">{item.name}</p>
                  <p className="su-meta">
                    {t("maxGrade", lang)} {formatGrade(item.max)} · {item.weight} %
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <input
                    inputMode="decimal"
                    value={gradeValue(item.id, studentId)}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [`${item.id}:${studentId}`]: e.target.value }))
                    }
                    placeholder="-"
                    aria-label={`Note — ${item.name}`}
                    aria-invalid={isOutOfRange(gradeValue(item.id, studentId), item.max)}
                    className={`h-11 w-20 rounded-lg border px-2 text-right text-[15px] outline-none focus:ring-2 focus:ring-primary/20 ${
                      isOutOfRange(gradeValue(item.id, studentId), item.max)
                        ? "border-danger text-danger"
                        : "border-line text-ink"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`${t("deleteConfirm", lang)}\n\n${item.name}`)) {
                        deleteGradeItem(course.id, item.id);
                      }
                    }}
                    aria-label={`Supprimer ${item.name}`}
                    className="su-tap grid place-items-center rounded-full text-muted hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </div>

              <textarea
                value={feedbackValue(item.id, studentId)}
                onChange={(e) =>
                  setFeedbackDrafts((d) => ({
                    ...d,
                    [`${item.id}:${studentId}`]: e.target.value,
                  }))
                }
                rows={2}
                placeholder={t("feedback", lang)}
                aria-label={`${t("feedback", lang)} — ${item.name}`}
                className="su-input mt-2 resize-none text-[14px]"
              />
            </div>
          ))}

          <div className="flex items-center justify-between bg-surface px-4 py-3">
            <span className="text-[15px] font-bold text-ink">{t("courseTotal", lang)}</span>
            <span className="text-[15px] font-bold text-ink">
              {formatGrade(liveTotal(studentId))}
            </span>
          </div>
        </section>
      ) : (
        <section className="su-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-surface">
                  <th className="sticky left-0 z-10 min-w-[150px] bg-surface px-3 py-2 text-left font-semibold text-muted">
                    {t("allStudents", lang)}
                  </th>
                  {items.map((item) => (
                    <th
                      key={item.id}
                      className="min-w-[92px] px-2 py-2 text-center font-semibold text-muted"
                      title={`${item.name} — max ${formatGrade(item.max)}`}
                    >
                      <span className="block truncate">{item.name}</span>
                      <span className="block font-normal">/{formatGrade(item.max)}</span>
                    </th>
                  ))}
                  <th className="min-w-[76px] px-2 py-2 text-center font-semibold text-muted">
                    {t("courseTotal", lang)}
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="sticky left-0 z-10 max-w-[150px] truncate bg-white px-3 py-1.5 text-ink">
                      {s.lastName}, {s.firstName}
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="px-1 py-1.5">
                        <input
                          inputMode="decimal"
                          value={gradeValue(item.id, s.id)}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [`${item.id}:${s.id}`]: e.target.value }))
                          }
                          placeholder="-"
                          aria-label={`${item.name} — ${s.firstName} ${s.lastName}`}
                          className={`h-9 w-full rounded border px-1 text-center outline-none focus:ring-2 focus:ring-primary/20 ${
                            isOutOfRange(gradeValue(item.id, s.id), item.max)
                              ? "border-danger text-danger"
                              : "border-line text-ink"
                          }`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center font-semibold text-ink">
                      {formatGrade(liveTotal(s.id))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={save}
        disabled={!dirty}
        className="su-tap flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-medium text-white disabled:bg-line disabled:text-muted"
      >
        <Save size={18} aria-hidden />
        {t("save", lang)}
      </button>

      <p className="su-meta px-1">
        Moyenne du groupe :{" "}
        {formatGrade(
          Math.round(
            (students.reduce((sum, s) => sum + weightedTotal(course.gradeItems, s.id), 0) /
              Math.max(1, students.length)) *
              100
          ) / 100
        )}
      </p>
    </div>
  );
}

/** Une saisie est invalide si elle n'est pas un nombre de 0 à la note max. */
function isOutOfRange(raw: string, max: number): boolean {
  if (raw.trim() === "") return false;
  const value = parseGrade(raw);
  return value === null || value < 0 || value > max;
}
