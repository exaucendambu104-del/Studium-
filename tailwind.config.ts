import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette StudiUM
        primary: {
          DEFAULT: "#0F63C8",
          dark: "#0A4F9E",
          light: "#DCE9F7",
        },
        ink: "#1D2125",
        muted: "#6B7278",
        line: "#E0E4E8",
        surface: "#F4F6F8",
        teal: "#0F9BAD",
        success: "#2E9E5B",
        danger: "#D93025",
        warnBg: "#FCEFD9",
        warnInk: "#5C4813",
        infoBg: "#E4F1E8",
        infoInk: "#1E4D2F",
      },
      fontFamily: {
        sans: ["var(--font-app)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(29, 33, 37, 0.04)",
        lifted: "0 12px 28px rgba(29, 33, 37, 0.18)",
      },
      transitionDuration: {
        page: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
