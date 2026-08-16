// Configuration « flat » d'ESLint 9. Next 16 a retiré la commande
// `next lint` : le script npm appelle désormais `eslint` directement.
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "out/**", "build/**"]),
  nextCoreWebVitals,
  nextTypeScript,
]);
