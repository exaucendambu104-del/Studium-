// Configuration « flat » d'ESLint 9. Next 16 a retiré la commande
// `next lint` : le script npm appelle désormais `eslint` directement.
import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    // Sorties générées par `npm run artifact` (code minifié).
    "artifact/bundle.js",
    "artifact/styles.css",
    "artifact/studium.html",
  ]),
  nextCoreWebVitals,
  nextTypeScript,
  {
    rules: {
      // Un paramètre préfixé de « _ » est intentionnellement inutilisé :
      // on le déstructure pour l'empêcher d'atterrir dans le DOM.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
]);
