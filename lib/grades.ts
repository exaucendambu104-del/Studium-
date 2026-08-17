import type { Course, GradeItem } from "./types";

/** Aplatit les dossiers de notes en une liste de feuilles évaluables. */
export function leafItems(items: GradeItem[]): GradeItem[] {
  const out: GradeItem[] = [];
  for (const item of items) {
    if (item.children?.length) out.push(...leafItems(item.children));
    else out.push(item);
  }
  return out;
}

/**
 * Total pondéré d'un dossier pour un étudiant.
 * Chaque évaluation contribue `note / max × pondération`.
 * Une évaluation non notée contribue 0 (comportement de Moodle lorsque
 * le total du cours est affiché en cours de session).
 */
export function weightedTotal(items: GradeItem[], studentId: string): number {
  return leafItems(items).reduce((sum, item) => {
    const g = item.grades[studentId];
    if (g === null || g === undefined || item.max <= 0) return sum;
    return sum + (g / item.max) * item.weight;
  }, 0);
}

/** Somme des pondérations d'un dossier — sert au libellé « /100 ». */
export function totalWeight(items: GradeItem[]): number {
  return leafItems(items).reduce((sum, item) => sum + item.weight, 0);
}

/** Total du cours, arrondi à deux décimales. */
export function courseTotal(course: Course, studentId: string): number {
  return Math.round(weightedTotal(course.gradeItems, studentId) * 100) / 100;
}

/** Nombre d'évaluations restant à corriger, pour le mode professeur. */
export function pendingCount(course: Course): number {
  const students = course.participants.filter((p) => p.role === "student");
  return leafItems(course.gradeItems).reduce((n, item) => {
    return (
      n +
      students.filter((s) => {
        const g = item.grades[s.id];
        return g === null || g === undefined;
      }).length
    );
  }, 0);
}
