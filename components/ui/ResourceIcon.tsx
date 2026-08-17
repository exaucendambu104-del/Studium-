import {
  ClipboardList,
  FileText,
  FileType2,
  Globe,
  ListChecks,
  MessagesSquare,
  StickyNote,
} from "lucide-react";
import type { ResourceKind } from "@/lib/types";

const MAP: Record<ResourceKind, { Icon: typeof FileText; label: string; color: string }> = {
  pdf: { Icon: FileText, label: "PDF", color: "#0F9BAD" },
  doc: { Icon: FileType2, label: "DOC", color: "#0F63C8" },
  quiz: { Icon: ListChecks, label: "Quiz", color: "#7A4FD6" },
  assign: { Icon: ClipboardList, label: "Devoir", color: "#D9762B" },
  page: { Icon: StickyNote, label: "Page", color: "#0F9BAD" },
  url: { Icon: Globe, label: "Lien", color: "#0F63C8" },
  forum: { Icon: MessagesSquare, label: "Forum", color: "#2E9E5B" },
};

export function resourceLabel(kind: ResourceKind) {
  return MAP[kind].label;
}

/** Icône colorée d'une ressource (PDF turquoise, quiz violet, devoir orange…). */
export function ResourceIcon({ kind, size = 24 }: { kind: ResourceKind; size?: number }) {
  const { Icon, color, label } = MAP[kind];
  return <Icon size={size} style={{ color }} aria-label={label} />;
}
