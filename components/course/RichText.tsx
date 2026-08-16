import { Fragment } from "react";
import type { RichBlock } from "@/lib/types";

/**
 * Rendu des consignes d'une section.
 * Balisage volontairement minimal (`**gras**`, `*italique*`) : c'est ce que
 * produit l'éditeur simple du mode professeur, et cela évite d'injecter du
 * HTML brut venant du store.
 */
export function RichText({ blocks }: { blocks: RichBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              <h3 key={i} className="text-[17px] font-semibold text-ink">
                <Inline text={block.text} />
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-ink">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1 pl-5 text-[15px] leading-relaxed text-ink">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            );
          case "note":
            return (
              <p key={i} className="text-[15px] font-semibold italic leading-relaxed text-danger">
                <Inline text={block.text} />
              </p>
            );
          case "p":
          default:
            return (
              <p
                key={i}
                className={[
                  "text-[15px] leading-relaxed",
                  block.tone === "alert" ? "text-danger" : "text-ink",
                  block.italic ? "italic" : "",
                ].join(" ")}
              >
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}

/** Applique `**gras**` et `*italique*` sans passer par dangerouslySetInnerHTML. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
