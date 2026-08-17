"use client";

import { ChevronsUpDown } from "lucide-react";

/** Sélecteur compact au style StudiUM (« Tout ⌃⌄ »). */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="relative inline-flex items-center rounded-lg border border-line bg-white">
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value as T)}
        className="su-tap appearance-none bg-transparent py-2 pl-3 pr-9 text-[15px] text-ink outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown
        size={16}
        className="pointer-events-none absolute right-3 text-ink"
        aria-hidden
      />
    </div>
  );
}
