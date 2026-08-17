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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type DragActivation = "handle" | "longpress";

export interface SortableRenderProps {
  isDragging: boolean;
  /** À étaler sur la poignée (mode « handle ») — sinon déjà sur le conteneur. */
  handleProps: Record<string, unknown>;
}

/** Vibration légère au démarrage du drag (ignorée sur iOS/desktop). */
function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate?.(12);
    } catch {
      /* certains navigateurs bloquent la vibration hors geste utilisateur */
    }
  }
}

/**
 * Liste réordonnable générique, tactile et clavier (@dnd-kit).
 *
 * - `activation="handle"` : le glissement ne part que de la poignée ⠿ (mode prof).
 * - `activation="longpress"` : appui long de 400 ms sur l'élément entier.
 *
 * Dans les deux cas le défilement vertical de la page reste intact : le
 * `PointerSensor` exige 8 px de déplacement et le `TouchSensor` un délai,
 * donc un simple balayage fait défiler la page comme d'habitude.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  enabled = true,
  activation = "longpress",
  direction = "vertical",
  className = "",
  itemClassName = "",
  renderOverlay,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, props: SortableRenderProps) => React.ReactNode;
  enabled?: boolean;
  activation?: DragActivation;
  direction?: "vertical" | "horizontal" | "grid";
  className?: string;
  itemClassName?: string;
  renderOverlay?: (item: T) => React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      // Appui long : laisse passer le défilement vertical normal.
      activationConstraint:
        activation === "longpress"
          ? { delay: 400, tolerance: 8 }
          : { delay: 120, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const strategy =
    direction === "horizontal"
      ? horizontalListSortingStrategy
      : direction === "grid"
        ? rectSortingStrategy
        : verticalListSortingStrategy;

  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const activeItem = items.find((i) => i.id === activeId) ?? null;

  function handleStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    haptic();
  }

  function handleEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(items, from, to));
  }

  if (!enabled) {
    return (
      <div className={className}>
        {items.map((item) => (
          <div key={item.id} className={itemClassName}>
            {renderItem(item, { isDragging: false, handleProps: {} })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={direction === "vertical" ? [restrictToVerticalAxis] : undefined}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={strategy}>
        <div className={className}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              activation={activation}
              className={itemClassName}
            >
              {(props) => renderItem(item, props)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeItem
          ? (renderOverlay?.(activeItem) ?? (
              <div className="su-dragging">
                {renderItem(activeItem, { isDragging: true, handleProps: {} })}
              </div>
            ))
          : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Un élément triable. Affiche une ligne bleue d'insertion quand il est survolé. */
export function SortableItem({
  id,
  children,
  activation = "longpress",
  className = "",
  data,
}: {
  id: string;
  children: (props: SortableRenderProps) => React.ReactNode;
  activation?: DragActivation;
  className?: string;
  data?: Record<string, unknown>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ id, data });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    // L'original reste en place en fantôme ; c'est le DragOverlay qui suit le doigt.
    opacity: isDragging ? 0.35 : 1,
  };

  const showDropLine = isOver && active?.id !== id;

  // En mode « longpress », l'élément entier est saisissable ; en mode
  // « handle », seules les props transmises à la poignée le sont.
  const containerListeners = activation === "longpress" ? listeners : undefined;

  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`}>
      {showDropLine && (
        <div className="su-drop-line pointer-events-none absolute -top-1 left-0 right-0 z-10" aria-hidden />
      )}
      <div
        {...(activation === "longpress" ? attributes : {})}
        {...containerListeners}
        className={activation === "longpress" ? "touch-pan-y" : undefined}
      >
        {children({
          isDragging,
          // En mode « handle », c'est la poignée qui porte les attributs
          // d'accessibilité : elle devient le point focusable au clavier.
          handleProps:
            activation === "handle"
              ? { ref: setActivatorNodeRef, ...attributes, ...listeners }
              : { ref: setActivatorNodeRef, ...listeners },
        })}
      </div>
    </div>
  );
}
