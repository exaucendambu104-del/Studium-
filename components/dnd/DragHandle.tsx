"use client";

import { GripVertical } from "lucide-react";

/** Poignée « ⠿ » — visible uniquement en mode professeur. */
export function DragHandle({
  label = "Réorganiser",
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      // touch-none : indispensable, sinon le navigateur interprète le geste
      // comme un défilement et le drag ne démarre jamais sur mobile.
      className="su-tap -ml-1 grid shrink-0 cursor-grab touch-none place-items-center rounded text-muted
                 hover:bg-surface active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      {...props}
    >
      <GripVertical size={18} aria-hidden />
    </button>
  );
}
