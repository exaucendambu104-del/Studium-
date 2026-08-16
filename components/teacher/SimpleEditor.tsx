"use client";

import { useState } from "react";
import { Bold, Italic, List, ListOrdered, TriangleAlert, Type } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { RichBlock } from "@/lib/types";

/**
 * Éditeur de consignes en mode professeur.
 *
 * Le texte est édité en clair avec un balisage minimal, puis reconverti en
 * blocs `RichBlock`. Ce choix évite de stocker du HTML arbitraire dans le
 * store — donc pas de `dangerouslySetInnerHTML` au rendu.
 *
 *   **gras**      *italique*
 *   # titre       - puce       1. numéro       ! texte d'alerte rouge
 */
export function SimpleEditor({
  courseId,
  sectionId,
  blocks,
  trigger,
}: {
  courseId: string;
  sectionId: string;
  blocks: RichBlock[];
  trigger: (open: () => void) => React.ReactNode;
}) {
  const lang = useStudium((s) => s.lang);
  const setSectionBlocks = useStudium((s) => s.setSectionBlocks);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => blocksToText(blocks));

  function openEditor() {
    setText(blocksToText(blocks));
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSectionBlocks(courseId, sectionId, textToBlocks(text));
    setOpen(false);
    toast(t("saved", lang));
  }

  /** Entoure la sélection courante avec un marqueur (gras, italique…). */
  function wrap(marker: string) {
    const el = document.getElementById("su-editor") as HTMLTextAreaElement | null;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const selected = text.slice(a, b) || "texte";
    const next = `${text.slice(0, a)}${marker}${selected}${marker}${text.slice(b)}`;
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + marker.length, a + marker.length + selected.length);
    });
  }

  /** Préfixe la ligne courante (titre, puce, numéro, alerte). */
  function prefixLine(prefix: string) {
    const el = document.getElementById("su-editor") as HTMLTextAreaElement | null;
    if (!el) return;
    const pos = el.selectionStart;
    const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
    setText(`${text.slice(0, lineStart)}${prefix}${text.slice(lineStart)}`);
    requestAnimationFrame(() => el.focus());
  }

  return (
    <>
      {trigger(openEditor)}

      <Modal open={open} title={t("editText", lang)} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <ToolButton onClick={() => wrap("**")} label="Gras" Icon={Bold} />
            <ToolButton onClick={() => wrap("*")} label="Italique" Icon={Italic} />
            <ToolButton onClick={() => prefixLine("# ")} label="Titre" Icon={Type} />
            <ToolButton onClick={() => prefixLine("- ")} label="Liste à puces" Icon={List} />
            <ToolButton onClick={() => prefixLine("1. ")} label="Liste numérotée" Icon={ListOrdered} />
            <ToolButton
              onClick={() => prefixLine("! ")}
              label="Texte d'alerte (rouge)"
              Icon={TriangleAlert}
              danger
            />
          </div>

          <textarea
            id="su-editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="su-input resize-y font-mono text-[13px] leading-relaxed"
            aria-label={t("editText", lang)}
          />

          <p className="su-meta">
            <strong>**gras**</strong> · <em>*italique*</em> · <code># titre</code> ·{" "}
            <code>- puce</code> · <code>1. numéro</code> ·{" "}
            <code className="text-danger">! alerte</code>
          </p>

          <div className="flex gap-2">
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
              {t("save", lang)}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ToolButton({
  onClick,
  label,
  Icon,
  danger = false,
}: {
  onClick: () => void;
  label: string;
  Icon: typeof Bold;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-lg border border-line hover:bg-surface ${
        danger ? "text-danger" : "text-ink"
      }`}
    >
      <Icon size={16} aria-hidden />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Conversion blocs ⇄ texte                                                   */
/* -------------------------------------------------------------------------- */

export function blocksToText(blocks: RichBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h":
          return `# ${b.text}`;
        case "ul":
          return b.items.map((i) => `- ${i}`).join("\n");
        case "ol":
          return b.items.map((i, n) => `${n + 1}. ${i}`).join("\n");
        case "note":
          return `! ${b.text}`;
        default:
          return b.tone === "alert" ? `! ${b.text}` : b.text;
      }
    })
    .join("\n\n");
}

export function textToBlocks(text: string): RichBlock[] {
  const blocks: RichBlock[] = [];

  for (const chunk of text.split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;

    if (lines.every((l) => /^-\s+/.test(l))) {
      blocks.push({ type: "ul", items: lines.map((l) => l.replace(/^-\s+/, "")) });
      continue;
    }
    if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      blocks.push({ type: "ol", items: lines.map((l) => l.replace(/^\d+\.\s+/, "")) });
      continue;
    }

    for (const line of lines) {
      if (line.startsWith("# ")) blocks.push({ type: "h", text: line.slice(2) });
      else if (line.startsWith("! ")) blocks.push({ type: "note", text: line.slice(2) });
      else if (/^-\s+/.test(line)) blocks.push({ type: "ul", items: [line.replace(/^-\s+/, "")] });
      else if (/^\d+\.\s+/.test(line))
        blocks.push({ type: "ol", items: [line.replace(/^\d+\.\s+/, "")] });
      else blocks.push({ type: "p", text: line });
    }
  }

  return blocks;
}
