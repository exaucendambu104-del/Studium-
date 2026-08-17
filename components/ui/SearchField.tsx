"use client";

import { Search, X } from "lucide-react";

/** Champ de recherche StudiUM : loupe à droite + bouton « effacer ». */
export function SearchField({
  value,
  onChange,
  placeholder,
  showClear = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  showClear?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-muted"
      />
      <Search size={20} className="shrink-0 text-ink" aria-hidden />
      {showClear && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="grid h-7 w-7 shrink-0 place-items-center rounded bg-[#5A6067] text-white transition-opacity hover:opacity-80 disabled:opacity-30"
          disabled={value === ""}
        >
          <X size={14} strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  );
}
