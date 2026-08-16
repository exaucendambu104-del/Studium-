import base from "../tailwind.config";
import type { Config } from "tailwindcss";

// Même thème que l'app ; on ajoute juste l'entrée de l'artefact au scan.
const config: Config = {
  ...base,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./artifact/**/*.{ts,tsx}",
  ],
};
export default config;
