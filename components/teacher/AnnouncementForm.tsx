"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { Announcement } from "@/lib/types";

/** Mode professeur : crée une annonce visible sur le tableau de bord étudiant. */
export function AnnouncementForm() {
  const lang = useStudium((s) => s.lang);
  const addAnnouncement = useStudium((s) => s.addAnnouncement);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<Announcement["tone"]>("info");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    addAnnouncement({
      title: title.trim(),
      body: body.trim(),
      tone,
      date: new Date().toLocaleDateString("fr-CA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    setTitle("");
    setBody("");
    setOpen(false);
    toast(t("saved", lang));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="su-card su-tap flex w-full items-center gap-3 border-dashed p-4 text-[15px] font-medium text-primary"
      >
        <Megaphone size={20} aria-hidden />
        {t("newAnnouncement", lang)}
      </button>

      <Modal open={open} title={t("newAnnouncement", lang)} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="su-meta mb-1 block">{t("title", lang)}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="su-input"
              placeholder="Report de la remise du travail #2"
            />
          </label>

          <label className="block">
            <span className="su-meta mb-1 block">{t("body", lang)}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="su-input resize-none"
              placeholder="Détails de l'annonce…"
            />
          </label>

          <fieldset>
            <legend className="su-meta mb-1">{t("type", lang)}</legend>
            <div className="flex gap-2">
              {(
                [
                  ["info", "Information", "bg-infoBg text-infoInk"],
                  ["warning", "Avertissement", "bg-warnBg text-warnInk"],
                ] as const
              ).map(([value, label, classes]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  aria-pressed={tone === value}
                  className={`su-tap flex-1 rounded-lg px-3 text-[14px] font-medium ${classes} ${
                    tone === value ? "ring-2 ring-primary" : "opacity-70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="su-tap flex-1 rounded-lg border border-line text-[15px] font-medium text-ink"
            >
              {t("cancel", lang)}
            </button>
            <button
              type="submit"
              className="su-tap flex-1 rounded-lg bg-primary text-[15px] font-medium text-white"
            >
              {t("create", lang)}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
