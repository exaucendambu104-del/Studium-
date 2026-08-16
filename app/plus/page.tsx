"use client";

import { useState } from "react";
import { Globe, Info, RotateCcw } from "lucide-react";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/** Menu « Plus » : rôle, langue, à propos et réinitialisation de la démo. */
export default function MorePage() {
  const lang = useStudium((s) => s.lang);
  const setLang = useStudium((s) => s.setLang);
  const reset = useStudium((s) => s.reset);
  const toast = useToast();

  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-3 p-3 pb-6">
      <section className="su-card space-y-3 p-4">
        <h2 className="su-title">{t("role", lang)}</h2>
        <RoleSwitcher />
        <p className="su-meta">
          En mode professeur, vous pouvez saisir les notes, modifier le contenu des sections,
          réorganiser les ressources et publier des annonces. Tout ce que vous modifiez est
          immédiatement visible en mode étudiant.
        </p>
      </section>

      <section className="su-card space-y-3 p-4">
        <h2 className="su-title flex items-center gap-2">
          <Globe size={20} aria-hidden />
          {t("language", lang)}
        </h2>
        <div className="flex rounded-full bg-surface p-1">
          {(
            [
              ["fr", "Français"],
              ["en", "English"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLang(value)}
              aria-pressed={lang === value}
              className={`su-tap flex-1 rounded-full px-4 text-[14px] font-medium transition-colors ${
                lang === value ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="su-meta">
          Seuls les libellés d&apos;interface changent — les contenus de cours restent en français.
        </p>
      </section>

      <section className="su-card space-y-2 p-4">
        <h2 className="su-title flex items-center gap-2">
          <Info size={20} aria-hidden />
          {t("about", lang)}
        </h2>
        <p className="text-[15px] leading-relaxed text-ink">{t("aboutBody", lang)}</p>
      </section>

      <section className="su-card space-y-3 p-4">
        {confirming ? (
          <>
            <p className="text-[15px] text-ink">
              Cette action efface vos notes saisies, vos réorganisations et vos annonces.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="su-tap flex-1 rounded-lg border border-line text-[15px] font-medium text-ink"
              >
                {t("cancel", lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setConfirming(false);
                  toast(t("resetDone", lang));
                }}
                className="su-tap flex-1 rounded-lg bg-danger text-[15px] font-medium text-white"
              >
                {t("resetDemo", lang)}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="su-tap flex w-full items-center justify-center gap-2 text-[14px] font-medium text-muted hover:text-danger"
          >
            <RotateCcw size={16} aria-hidden />
            {t("resetDemo", lang)}
          </button>
        )}
      </section>
    </div>
  );
}
