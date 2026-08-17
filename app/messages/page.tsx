"use client";

import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SearchField } from "@/components/ui/SearchField";
import { useStudium } from "@/store/useStudium";
import { t } from "@/lib/i18n";

/** Page Messages : liste de conversations puis fil de discussion. */
export default function MessagesPage() {
  const lang = useStudium((s) => s.lang);
  const messages = useStudium((s) => s.data.messages);
  const readMessage = useStudium((s) => s.readMessage);

  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) => m.from.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q)
    );
  }, [messages, query]);

  const open = messages.find((m) => m.id === openId);

  if (open) {
    return (
      <div className="p-3">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="su-tap mb-2 flex items-center gap-2 text-[15px] font-medium text-primary"
        >
          <ArrowLeft size={18} aria-hidden />
          {t("messages", lang)}
        </button>

        <div className="su-card p-4">
          <h1 className="su-title mb-4">{open.from}</h1>
          <ul className="space-y-3">
            {open.thread.map((m) => (
              <li key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${
                    m.mine
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm bg-surface text-ink"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[12px] ${m.mine ? "text-white/70" : "text-muted"}`}>
                    {m.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <section className="su-card p-4">
        <h1 className="su-title mb-3">{t("messages", lang)}</h1>
        <SearchField value={query} onChange={setQuery} placeholder={t("search", lang)} />
      </section>

      <section className="su-card divide-y divide-line">
        {visible.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setOpenId(m.id);
              readMessage(m.id);
            }}
            className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E3E6E9] text-[15px] font-semibold text-[#4A5058]"
              aria-hidden
            >
              {m.initials}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span
                  className={`truncate text-[16px] ${m.unread ? "font-semibold text-ink" : "text-ink"}`}
                >
                  {m.from}
                </span>
                <span className="su-meta shrink-0">{m.date}</span>
              </span>
              <span className="su-meta mt-0.5 block truncate">{m.preview}</span>
            </span>

            {m.unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
          </button>
        ))}

        {visible.length === 0 && (
          <p className="p-8 text-center text-[15px] text-muted">{t("noMessages", lang)}</p>
        )}
      </section>
    </div>
  );
}
