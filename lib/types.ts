/**
 * Modèle de données du clone StudiUM.
 * Tout est local : le seed alimente le store Zustand persisté dans localStorage.
 */

export type BannerPattern =
  | "hexagons"
  | "triangles"
  | "diamonds"
  | "squares";

export type ResourceKind =
  | "pdf"
  | "doc"
  | "quiz"
  | "assign"
  | "page"
  | "url"
  | "forum";

export type GradeItemKind = "assign" | "quiz" | "submission" | "exam";

export type CompetencyState = "none" | "progress" | "achieved";

export type Role = "student" | "teacher";

export type Lang = "fr" | "en";

/** Bloc de texte riche minimal : rendu par <RichText /> */
export type RichBlock =
  | { type: "p"; text: string; tone?: "normal" | "alert"; italic?: boolean }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export interface Resource {
  id: string;
  kind: ResourceKind;
  title: string;
  /** Métadonnée affichée sous le titre (taille, échéance…) */
  meta?: string;
  downloaded?: boolean;
  /** Bandeau « Dernière activité ouverte » */
  lastOpened?: boolean;
}

export interface Section {
  id: string;
  title: string;
  blocks: RichBlock[];
  resources: Resource[];
}

export interface GradeItem {
  id: string;
  kind: GradeItemKind;
  name: string;
  /** Pondération en % — 0 pour un total/dossier */
  weight: number;
  max: number;
  /** Notes par identifiant de participant */
  grades: Record<string, number | null>;
  feedback?: Record<string, string>;
  dueDate?: string;
  /** Sous-dossier (ex. « Bibliographie ») */
  children?: GradeItem[];
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher";
  roleLabel?: string;
  email: string;
}

export interface Competency {
  id: string;
  title: string;
  state: CompetencyState;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  term: "H26" | "A25" | "A24";
  color: string;
  pattern: BannerPattern;
  sections: Section[];
  participants: Participant[];
  gradeItems: GradeItem[];
  competencies: Competency[];
}

export interface Announcement {
  id: string;
  tone: "warning" | "info";
  title: string;
  body: string;
  date: string;
}

export interface TimelineActivity {
  id: string;
  courseId: string;
  title: string;
  kind: ResourceKind;
  dueDate: string;
  /** true → catégorie « En retard » */
  overdue?: boolean;
}

export interface RecentItem {
  id: string;
  courseId: string;
  resourceId: string;
  title: string;
  kind: ResourceKind;
}

export interface Message {
  id: string;
  from: string;
  initials: string;
  preview: string;
  date: string;
  unread: boolean;
  thread: { id: string; author: string; text: string; time: string; mine: boolean }[];
}

export interface Notification {
  id: string;
  courseCode: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface StudiumData {
  courses: Course[];
  /** Ordre d'affichage des cartes de cours (glisser-déposer) */
  courseOrder: string[];
  announcements: Announcement[];
  timeline: TimelineActivity[];
  recentItems: RecentItem[];
  messages: Message[];
  notifications: Notification[];
  /** Identifiant du participant « moi » (l'étudiant connecté) */
  currentStudentId: string;
}
