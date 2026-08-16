"use client";
/**
 * Point d'entrée de la version « artefact » : même code que l'app Next.js,
 * mais rendue dans une page unique autonome. Seul le routage change
 * (hash au lieu du routeur Next), via les shims de ./shim.
 */
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/layout/AppShell";
import { usePathname } from "./shim/navigation";

import DashboardPage from "@/app/page";
import MyCoursesPage from "@/app/cours/page";
import CoursePage from "@/app/cours/[id]/page";
import MessagesPage from "@/app/messages/page";
import NotificationsPage from "@/app/notifications/page";
import MorePage from "@/app/plus/page";
import SearchPage from "@/app/recherche/page";

function Router() {
  const path = usePathname();

  if (path === "/") return <DashboardPage />;
  if (path === "/cours") return <MyCoursesPage />;
  if (path.startsWith("/cours/")) return <CoursePage />;
  if (path === "/messages") return <MessagesPage />;
  if (path === "/notifications") return <NotificationsPage />;
  if (path === "/plus") return <MorePage />;
  if (path === "/recherche") return <SearchPage />;

  return (
    <div className="p-8 text-center">
      <p className="text-[15px] text-muted">Page introuvable.</p>
      <a href="#/" className="mt-3 inline-block text-[15px] font-medium text-primary">
        Retour au tableau de bord
      </a>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <AppShell>
    <Router />
  </AppShell>
);
