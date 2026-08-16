"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { TeacherBanner } from "./TeacherBanner";
import { TopBar } from "./TopBar";
import { ToastProvider } from "@/components/ui/Toast";
import { useHydrated } from "@/store/useStudium";

/**
 * Cadre de l'application : téléphone de ~390 px centré sur fond gris en
 * desktop, plein écran sur mobile.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-white shadow-[0_0_40px_rgba(29,33,37,0.08)]">
        <TeacherBanner />
        <TopBar />

        <main className="flex-1 bg-surface">
          {hydrated ? (
            // `key` sur la route : rejoue l'animation d'entrée à chaque page.
            <div key={pathname} className="su-page-enter">
              {children}
            </div>
          ) : (
            <LoadingSkeleton />
          )}
        </main>

        <BottomNav />
      </div>
    </ToastProvider>
  );
}

/**
 * Affiché le temps que le store persisté soit relu depuis localStorage.
 * Sans ce garde-fou, l'ordre des cartes rendu côté serveur (celui du seed)
 * et celui du navigateur (celui de l'utilisateur) diffèrent → erreur
 * d'hydratation React.
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="su-card h-32 animate-pulse bg-line/30" />
      ))}
    </div>
  );
}
