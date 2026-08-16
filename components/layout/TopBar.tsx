"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useStudium } from "@/store/useStudium";

/** Barre supérieure : « StudiUM » à gauche, loupe et pastille de langue à droite. */
export function TopBar() {
  const router = useRouter();
  const lang = useStudium((s) => s.lang);
  const setLang = useStudium((s) => s.setLang);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-[20px] font-bold tracking-tight text-ink"
      >
        StudiUM
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/recherche")}
          aria-label="Rechercher"
          className="su-tap grid place-items-center rounded-full text-ink hover:bg-surface"
        >
          <Search size={24} strokeWidth={2.4} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          aria-label={lang === "fr" ? "Switch interface to English" : "Basculer l'interface en français"}
          className="grid h-11 w-11 place-items-center rounded-full bg-surface text-[15px] font-medium text-ink transition-colors hover:bg-line"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </header>
  );
}
