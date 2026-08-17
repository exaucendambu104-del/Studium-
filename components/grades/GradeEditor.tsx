"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { GradeItemForm } from "./GradeItemForm";
import { GradesTable } from "./GradesTable";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { formatGrade, parseGrade } from "@/lib/format";
import { leafItems, weightedTotal } from "@/lib/grades";
import { t } from "@/lib/i18n";
import type { Course } from "@/lib/types";

type View = "single" | "matrix";

/**
 * Onglet « Notes » en mode professeur.
 *
 * Deux vues :
 *  - « single » → la même table que la vue étudiant, éditable : un appui
 *    long sur une note (ou un clic, ou le crayon) l'ouvre et l'enregistre
 *    aussitôt — même geste que le glisser-déposer ailleurs dans l'app.
 *  - « matrix » → tableau tous les étudiants × toutes les évaluations pour
 *    la saisie en lot ; les cellules restent des champs classiques avec un
 *    bouton « Enregistrer » explicite, mieux adapté à remplir beaucoup de
 *    notes d'un coup qu'un appui long répété sur chaque cellule.
 */
export function GradeEditor({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const setGrade = useStudium((s) => s.setGrade);
  const toast = useToast();

  const students = useMemo(
    () => course.participants.filter((p) => p.role === "student"),
    [course.participants]
  );
  const items = useMemo(() => leafItems(course.gradeItems), [course.gradeItems]);

  const [view, setView] = useState<View>("single");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  /** Valeur affichée dans la matrice : brouillon en cours de saisie, sinon valeur du store. */
  const gradeValue = (itemId: string, sid: string) => {
    const key = `${itemId}:${sid}`;
    if (key in drafts) return drafts[key];
    const stored = items.find((i) => i.id === itemId)?.grades[sid];
    return stored === null || stored === undefined ? "" : String(stored).replace(".", ",");
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

  function saveMatrix() {
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

    setDrafts({});
    toast(invalid > 0 ? `${invalid} note(s) hors bornes ignorée(s)` : t("saved", lang));
  }

  const dirty = Object.keys(drafts).length > 0;

  return (
    <>
      <section className="su-card m-3 space-y-3 p-4">
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
        <GradesTable course={course} studentId={studentId} editable />
      ) : (
        <section className="su-card mx-3 mb-3 overflow-hidden">
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

      {view === "matrix" && (
        <button
          type="button"
          onClick={saveMatrix}
          disabled={!dirty}
          className="su-tap mx-3 mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-medium text-white disabled:bg-line disabled:text-muted"
        >
          <Save size={18} aria-hidden />
          {t("save", lang)}
        </button>
      )}

      <p className="su-meta mx-3 mb-3">
        Moyenne du groupe :{" "}
        {formatGrade(
          Math.round(
            (students.reduce((sum, s) => sum + weightedTotal(course.gradeItems, s.id), 0) /
              Math.max(1, students.length)) *
              100
          ) / 100
        )}
      </p>
    </>
  );
}

/** Une saisie est invalide si elle n'est pas un nombre de 0 à la note max. */
function isOutOfRange(raw: string, max: number): boolean {
  if (raw.trim() === "") return false;
  const value = parseGrade(raw);
  return value === null || value < 0 || value > max;
}
