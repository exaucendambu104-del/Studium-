/** Formatage des notes : virgule décimale, toujours deux décimales. */
export function formatGrade(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toFixed(2).replace(".", ",");
}

/** Idem, mais accepte une saisie texte au clavier (« 12,5 » ou « 12.5 »). */
export function parseGrade(input: string): number | null {
  const cleaned = input.trim().replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Initiales affichées dans la pastille d'un participant. */
export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Coupe un titre trop long avec une ellipse typographique. */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}
