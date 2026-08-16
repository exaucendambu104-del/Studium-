"use client";

import { CheckCircle2, CloudDownload, Eye, Trash2 } from "lucide-react";
import { DragHandle } from "@/components/dnd/DragHandle";
import { ResourceIcon } from "@/components/ui/ResourceIcon";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { Resource } from "@/lib/types";

/**
 * Ligne de ressource dans une section : icône de type à gauche, titre,
 * état de téléchargement à droite, et le bandeau « Dernière activité
 * ouverte » sous le dernier élément consulté.
 */
export function ResourceRow({
  resource,
  courseId,
  sectionId,
  showHandle = false,
  handleProps,
  isDragging = false,
}: {
  resource: Resource;
  courseId: string;
  sectionId: string;
  showHandle?: boolean;
  handleProps?: Record<string, unknown>;
  isDragging?: boolean;
}) {
  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const toggleDownloaded = useStudium((s) => s.toggleDownloaded);
  const markLastOpened = useStudium((s) => s.markLastOpened);
  const deleteResource = useStudium((s) => s.deleteResource);

  return (
    <div className={isDragging ? "su-dragging rounded-lg bg-white" : ""}>
      <div className="flex items-center gap-3 py-3">
        {showHandle && (
          <DragHandle {...(handleProps as object)} label={`Déplacer ${resource.title}`} />
        )}

        <ResourceIcon kind={resource.kind} size={26} />

        <button
          type="button"
          onClick={() => markLastOpened(courseId, sectionId, resource.id)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-[15px] leading-snug text-ink">{resource.title}</span>
          {resource.meta && <span className="su-meta block">{resource.meta}</span>}
        </button>

        {isTeacher ? (
          <button
            type="button"
            onClick={() => deleteResource(courseId, sectionId, resource.id)}
            aria-label={`Supprimer ${resource.title}`}
            className="su-tap grid shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-danger"
          >
            <Trash2 size={18} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => toggleDownloaded(courseId, resource.id)}
            aria-label={`${resource.downloaded ? t("downloaded", lang) : t("download", lang)} — ${resource.title}`}
            className="su-tap grid shrink-0 place-items-center rounded-full hover:bg-surface"
          >
            {resource.downloaded ? (
              <CheckCircle2 size={22} className="text-success" aria-hidden />
            ) : (
              <CloudDownload size={22} className="text-teal" aria-hidden />
            )}
          </button>
        )}
      </div>

      {resource.lastOpened && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary-light px-3 py-2 text-[13px] font-medium text-primary-dark">
          <Eye size={15} aria-hidden />
          {t("lastOpened", lang)}
        </div>
      )}
    </div>
  );
}
