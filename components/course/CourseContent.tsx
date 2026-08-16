"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { List, Pencil, Plus, Trash2 } from "lucide-react";
import { RichText } from "./RichText";
import { ResourceRow } from "./ResourceRow";
import { SectionNavigator } from "./SectionNavigator";
import { SectionIndexPanel } from "./SectionIndexPanel";
import { SortableItem } from "@/components/dnd/SortableList";
import { ResourceForm } from "@/components/teacher/ResourceForm";
import { SimpleEditor } from "@/components/teacher/SimpleEditor";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";
import type { Course, Resource } from "@/lib/types";

/**
 * Onglet « Cours ».
 *
 * Une seule section est affichée à la fois. En mode professeur, un
 * `DndContext` multi-conteneurs permet de réordonner les ressources dans la
 * section courante **et** de les déposer dans une autre section via la liste
 * de cibles affichée pendant le glissement.
 */
export function CourseContent({ course }: { course: Course }) {
  const lang = useStudium((s) => s.lang);
  const isTeacher = useStudium((s) => s.role === "teacher");
  const setResources = useStudium((s) => s.setResources);
  const moveResource = useStudium((s) => s.moveResource);
  const addSection = useStudium((s) => s.addSection);
  const renameSection = useStudium((s) => s.renameSection);
  const deleteSection = useStudium((s) => s.deleteSection);

  const [selectedIndex, setIndex] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sections = course.sections;

  // Supprimer une section en mode professeur peut laisser l'index stocké hors
  // bornes. On le borne au rendu plutôt que de le corriger dans un effet :
  // pas de rendu en cascade, et l'état reste la seule source de vérité.
  const index = Math.min(selectedIndex, Math.max(0, sections.length - 1));
  const current = sections[index];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resourceIds = useMemo(
    () => (current ? current.resources.map((r) => r.id) : []),
    [current]
  );

  const activeResource: Resource | undefined = current?.resources.find(
    (r) => r.id === activeId
  );

  if (!current) {
    return (
      <div className="p-4">
        <p className="su-meta">Ce cours ne contient aucune section.</p>
        {isTeacher && <AddSectionButton onAdd={(title) => addSection(course.id, title)} />}
      </div>
    );
  }

  function handleStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(12);
      } catch {
        /* ignoré */
      }
    }
  }

  function handleEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !current) return;

    const overId = String(over.id);

    // Dépôt sur une autre section (zone « section-<id> »).
    if (overId.startsWith("section-")) {
      const targetSectionId = overId.slice("section-".length);
      if (targetSectionId !== current.id) {
        moveResource(course.id, current.id, targetSectionId, String(active.id), 0);
      }
      return;
    }

    // Réordonnancement à l'intérieur de la section courante.
    if (active.id === over.id) return;
    const from = resourceIds.indexOf(String(active.id));
    const to = resourceIds.indexOf(overId);
    if (from === -1 || to === -1) return;
    setResources(course.id, current.id, arrayMove(current.resources, from, to));
  }

  const body = (
    <>
      <header className="flex items-start justify-between gap-2">
        <h2 className="su-title flex-1 leading-snug">{current.title}</h2>

        {isTeacher && (
          <div className="flex shrink-0 items-center gap-0.5">
            <SimpleEditor
              courseId={course.id}
              sectionId={current.id}
              blocks={current.blocks}
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  aria-label={t("editText", lang)}
                  className="su-tap grid place-items-center rounded-full text-muted hover:bg-surface"
                >
                  <Pencil size={18} aria-hidden />
                </button>
              )}
            />
            <button
              type="button"
              onClick={() => {
                const title = window.prompt(t("renameSection", lang), current.title);
                if (title?.trim()) renameSection(course.id, current.id, title.trim());
              }}
              aria-label={t("renameSection", lang)}
              className="su-tap grid place-items-center rounded-full text-muted hover:bg-surface"
            >
              <List size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`${t("deleteConfirm", lang)}\n\n${current.title}`)) {
                  deleteSection(course.id, current.id);
                }
              }}
              aria-label={t("deleteSection", lang)}
              className="su-tap grid place-items-center rounded-full text-muted hover:bg-surface hover:text-danger"
            >
              <Trash2 size={18} aria-hidden />
            </button>
          </div>
        )}
      </header>

      <div className="mt-3">
        <RichText blocks={current.blocks} />
      </div>

      <div className="mt-4 divide-y divide-line border-t border-line">
        {current.resources.map((resource) =>
          isTeacher ? (
            <SortableItem key={resource.id} id={resource.id} activation="handle">
              {({ isDragging, handleProps }) => (
                <ResourceRow
                  resource={resource}
                  courseId={course.id}
                  sectionId={current.id}
                  showHandle
                  handleProps={handleProps}
                  isDragging={isDragging}
                />
              )}
            </SortableItem>
          ) : (
            <ResourceRow
              key={resource.id}
              resource={resource}
              courseId={course.id}
              sectionId={current.id}
            />
          )
        )}
      </div>

      {isTeacher && (
        <div className="mt-3 space-y-2">
          <ResourceForm courseId={course.id} sectionId={current.id} />
          {activeId && (
            <DropTargets
              sections={sections.filter((s) => s.id !== current.id)}
              label="Déposer dans une autre section"
            />
          )}
        </div>
      )}

      <SectionNavigator sections={sections} index={index} onChange={setIndex} />

      {isTeacher && <AddSectionButton onAdd={(title) => addSection(course.id, title)} />}
    </>
  );

  return (
    // pb-20 : réserve la place du bouton flottant, qui ne doit jamais
    // recouvrir les boutons de navigation entre sections.
    <div className="relative pb-20">
      <div className="su-card m-3 p-4">
        {isTeacher ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleStart}
            onDragEnd={handleEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={resourceIds} strategy={verticalListSortingStrategy}>
              {body}
            </SortableContext>

            <DragOverlay>
              {activeResource ? (
                <div className="su-dragging rounded-lg border border-line bg-white px-3">
                  <ResourceRow
                    resource={activeResource}
                    courseId={course.id}
                    sectionId={current.id}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          body
        )}
      </div>

      {/* Bouton flottant → index des sections */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label={t("sectionIndex", lang)}
        className="fixed bottom-[76px] right-4 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-lifted transition-transform active:scale-95"
        style={{ right: "max(1rem, calc(50vw - 240px + 1rem))" }}
      >
        <List size={24} aria-hidden />
      </button>

      <SectionIndexPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sections={sections}
        index={index}
        onSelect={setIndex}
        courseId={course.id}
      />
    </div>
  );
}

/** Zones de dépôt vers les autres sections, affichées pendant un glissement. */
function DropTargets({
  sections,
  label,
}: {
  sections: { id: string; title: string }[];
  label: string;
}) {
  return (
    <div className="su-page-enter rounded-lg border border-dashed border-primary bg-primary-light/30 p-2">
      <p className="su-meta mb-2 px-1 font-medium text-primary-dark">{label}</p>
      <div className="space-y-1">
        {sections.map((s) => (
          <DropTarget key={s.id} id={s.id} title={s.title} />
        ))}
      </div>
    </div>
  );
}

function DropTarget({ id, title }: { id: string; title: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `section-${id}` });

  return (
    <div
      ref={setNodeRef}
      className={`truncate rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
        isOver
          ? "bg-primary font-medium text-white"
          : "bg-white text-ink ring-1 ring-line"
      }`}
    >
      {title}
    </div>
  );
}

function AddSectionButton({ onAdd }: { onAdd: (title: string) => void }) {
  const lang = useStudium((s) => s.lang);

  return (
    <button
      type="button"
      onClick={() => {
        const title = window.prompt(t("addSection", lang), "Nouvelle section");
        if (title?.trim()) onAdd(title.trim());
      }}
      className="su-tap mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line text-[14px] font-medium text-primary hover:bg-surface"
    >
      <Plus size={16} aria-hidden />
      {t("addSection", lang)}
    </button>
  );
}
