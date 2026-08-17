"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { resourceLabel } from "@/components/ui/ResourceIcon";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { ResourceKind } from "@/lib/types";

const KINDS: ResourceKind[] = ["pdf", "doc", "quiz", "assign", "page", "url", "forum"];

/** Mode professeur : ajoute une ressource à une section. */
export function ResourceForm({
  courseId,
  sectionId,
}: {
  courseId: string;
  sectionId: string;
}) {
  const lang = useStudium((s) => s.lang);
  const addResource = useStudium((s) => s.addResource);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [kind, setKind] = useState<ResourceKind>("pdf");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addResource(courseId, sectionId, { kind, title: title.trim(), meta: meta.trim() || undefined });
    setTitle("");
    setMeta("");
    setOpen(false);
    toast(t("saved", lang));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="su-tap flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 text-[14px] font-medium text-primary hover:bg-primary-light/40"
      >
        <Plus size={16} aria-hidden />
        {t("addResource", lang)}
      </button>

      <Modal open={open} title={t("addResource", lang)} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <fieldset>
            <legend className="su-meta mb-1.5">{t("type", lang)}</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  aria-pressed={kind === k}
                  className={`rounded-full px-3 py-2 text-[14px] font-medium transition-colors ${
                    kind === k
                      ? "bg-primary text-white"
                      : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {resourceLabel(k)}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="su-meta mb-1 block">{t("title", lang)}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="su-input"
              placeholder="Notes de cours - Séance 12"
            />
          </label>

          <label className="block">
            <span className="su-meta mb-1 block">Métadonnée (facultatif)</span>
            <input
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="su-input"
              placeholder="PDF · 1,2 Mo"
            />
          </label>

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
