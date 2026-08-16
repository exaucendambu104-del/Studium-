/**
 * Générateur pseudo-aléatoire déterministe.
 * Indispensable : le seed doit produire exactement les mêmes valeurs côté
 * serveur et côté client, sinon Next.js signale une erreur d'hydratation.
 */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Nombre déterministe dans [0, 1) dérivé d'une clé texte. */
export function seededUnit(key: string): number {
  return (hashString(key) % 100000) / 100000;
}

/** Entier déterministe dans [min, max]. */
export function seededInt(key: string, min: number, max: number): number {
  return min + Math.floor(seededUnit(key) * (max - min + 1));
}
