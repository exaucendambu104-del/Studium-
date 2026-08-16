"use client";
/**
 * Remplacement minimal de `next/navigation` pour la version « page unique »
 * de l'application (artefact autonome). Le routage passe par le hash de
 * l'URL, ce qui évite tout serveur : #/cours, #/cours/ecn1901-a-h26, …
 */
import { useCallback, useSyncExternalStore } from "react";

function currentPath(): string {
  if (typeof window === "undefined") return "/";
  const h = window.location.hash.replace(/^#/, "");
  return h === "" ? "/" : h;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onHash = () => listeners.forEach((l) => l());
  window.addEventListener("hashchange", onHash);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("hashchange", onHash);
  };
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, currentPath, () => "/");
}

export function navigate(href: string) {
  window.location.hash = href;
  window.scrollTo({ top: 0 });
}

export function useRouter() {
  const push = useCallback((href: string) => navigate(href), []);
  return {
    push,
    replace: push,
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

/** `/cours/<id>` → { id } */
export function useParams<T extends Record<string, string>>(): T {
  const path = usePathname();
  const m = path.match(/^\/cours\/([^/]+)$/);
  return { id: m ? decodeURIComponent(m[1]) : "" } as unknown as T;
}

export function useSearchParams() {
  return new URLSearchParams();
}
