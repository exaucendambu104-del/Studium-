"use client";

import { useMemo, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeed } from "@/data/seed";
import type {
  Announcement,
  Competency,
  Course,
  GradeItem,
  Lang,
  Resource,
  RichBlock,
  Role,
  Section,
  StudiumData,
} from "@/lib/types";

interface StudiumState {
  data: StudiumData;
  role: Role;
  lang: Lang;
  /** Présences saisies en mode professeur : courseId → participantId → présent */
  attendance: Record<string, Record<string, boolean>>;

  setRole: (role: Role) => void;
  setLang: (lang: Lang) => void;

  /* Glisser-déposer */
  setCourseOrder: (order: string[]) => void;
  setSections: (courseId: string, sections: Section[]) => void;
  setResources: (courseId: string, sectionId: string, resources: Resource[]) => void;
  moveResource: (
    courseId: string,
    fromSectionId: string,
    toSectionId: string,
    resourceId: string,
    toIndex: number
  ) => void;

  /* Contenu — mode professeur */
  addSection: (courseId: string, title: string) => void;
  renameSection: (courseId: string, sectionId: string, title: string) => void;
  deleteSection: (courseId: string, sectionId: string) => void;
  setSectionBlocks: (courseId: string, sectionId: string, blocks: RichBlock[]) => void;
  addResource: (courseId: string, sectionId: string, resource: Omit<Resource, "id">) => void;
  deleteResource: (courseId: string, sectionId: string, resourceId: string) => void;

  /* Notes — mode professeur */
  setGrade: (courseId: string, itemId: string, studentId: string, value: number | null) => void;
  setFeedback: (courseId: string, itemId: string, studentId: string, text: string) => void;
  addGradeItem: (courseId: string, item: Omit<GradeItem, "grades" | "feedback">) => void;
  deleteGradeItem: (courseId: string, itemId: string) => void;

  /* Divers */
  setCompetencyState: (courseId: string, competencyId: string, state: Competency["state"]) => void;
  toggleDownloaded: (courseId: string, resourceId: string) => void;
  markLastOpened: (courseId: string, sectionId: string, resourceId: string) => void;
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  removeAnnouncement: (id: string) => void;
  setAttendance: (courseId: string, participantId: string, present: boolean) => void;
  markAllNotificationsRead: () => void;
  readMessage: (id: string) => void;
  reset: () => void;
}

/** Petit utilitaire immuable : applique `fn` au cours ciblé. */
function mapCourse(data: StudiumData, courseId: string, fn: (c: StudiumData["courses"][number]) => StudiumData["courses"][number]): StudiumData {
  return {
    ...data,
    courses: data.courses.map((c) => (c.id === courseId ? fn(c) : c)),
  };
}

function mapSection(
  data: StudiumData,
  courseId: string,
  sectionId: string,
  fn: (s: Section) => Section
): StudiumData {
  return mapCourse(data, courseId, (c) => ({
    ...c,
    sections: c.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  }));
}

/** Applique `fn` à l'élément de note ciblé, y compris dans les sous-dossiers. */
function mapGradeItems(items: GradeItem[], itemId: string, fn: (i: GradeItem) => GradeItem): GradeItem[] {
  return items.map((item) => {
    if (item.id === itemId) return fn(item);
    if (item.children?.length) {
      return { ...item, children: mapGradeItems(item.children, itemId, fn) };
    }
    return item;
  });
}

function removeGradeItem(items: GradeItem[], itemId: string): GradeItem[] {
  return items
    .filter((i) => i.id !== itemId)
    .map((i) => (i.children?.length ? { ...i, children: removeGradeItem(i.children, itemId) } : i));
}

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${uid++}`;

export const useStudium = create<StudiumState>()(
  persist(
    (set) => ({
      data: buildSeed(),
      role: "student",
      lang: "fr",
      attendance: {},

      setRole: (role) => set({ role }),
      setLang: (lang) => set({ lang }),

      setCourseOrder: (order) =>
        set((st) => ({ data: { ...st.data, courseOrder: order } })),

      setSections: (courseId, sections) =>
        set((st) => ({ data: mapCourse(st.data, courseId, (c) => ({ ...c, sections })) })),

      setResources: (courseId, sectionId, resources) =>
        set((st) => ({
          data: mapSection(st.data, courseId, sectionId, (s) => ({ ...s, resources })),
        })),

      moveResource: (courseId, fromSectionId, toSectionId, resourceId, toIndex) =>
        set((st) => {
          const course = st.data.courses.find((c) => c.id === courseId);
          if (!course) return st;
          const from = course.sections.find((s) => s.id === fromSectionId);
          const moved = from?.resources.find((r) => r.id === resourceId);
          if (!moved) return st;

          return {
            data: mapCourse(st.data, courseId, (c) => ({
              ...c,
              sections: c.sections.map((s) => {
                if (s.id === fromSectionId && s.id === toSectionId) return s;
                if (s.id === fromSectionId) {
                  return { ...s, resources: s.resources.filter((r) => r.id !== resourceId) };
                }
                if (s.id === toSectionId) {
                  const next = s.resources.filter((r) => r.id !== resourceId);
                  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, moved);
                  return { ...s, resources: next };
                }
                return s;
              }),
            })),
          };
        }),

      addSection: (courseId, title) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            sections: [...c.sections, { id: nextId("sec"), title, blocks: [], resources: [] }],
          })),
        })),

      renameSection: (courseId, sectionId, title) =>
        set((st) => ({ data: mapSection(st.data, courseId, sectionId, (s) => ({ ...s, title })) })),

      deleteSection: (courseId, sectionId) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            sections: c.sections.filter((s) => s.id !== sectionId),
          })),
        })),

      setSectionBlocks: (courseId, sectionId, blocks) =>
        set((st) => ({ data: mapSection(st.data, courseId, sectionId, (s) => ({ ...s, blocks })) })),

      addResource: (courseId, sectionId, resource) =>
        set((st) => ({
          data: mapSection(st.data, courseId, sectionId, (s) => ({
            ...s,
            resources: [...s.resources, { ...resource, id: nextId("r") }],
          })),
        })),

      deleteResource: (courseId, sectionId, resourceId) =>
        set((st) => ({
          data: mapSection(st.data, courseId, sectionId, (s) => ({
            ...s,
            resources: s.resources.filter((r) => r.id !== resourceId),
          })),
        })),

      setGrade: (courseId, itemId, studentId, value) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            gradeItems: mapGradeItems(c.gradeItems, itemId, (i) => ({
              ...i,
              grades: { ...i.grades, [studentId]: value },
            })),
          })),
        })),

      setFeedback: (courseId, itemId, studentId, text) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            gradeItems: mapGradeItems(c.gradeItems, itemId, (i) => ({
              ...i,
              feedback: { ...(i.feedback ?? {}), [studentId]: text },
            })),
          })),
        })),

      addGradeItem: (courseId, item) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            gradeItems: [...c.gradeItems, { ...item, grades: {}, feedback: {} }],
          })),
        })),

      deleteGradeItem: (courseId, itemId) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            gradeItems: removeGradeItem(c.gradeItems, itemId),
          })),
        })),

      setCompetencyState: (courseId, competencyId, state) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            competencies: c.competencies.map((k) =>
              k.id === competencyId ? { ...k, state } : k
            ),
          })),
        })),

      toggleDownloaded: (courseId, resourceId) =>
        set((st) => ({
          data: mapCourse(st.data, courseId, (c) => ({
            ...c,
            sections: c.sections.map((s) => ({
              ...s,
              resources: s.resources.map((r) =>
                r.id === resourceId ? { ...r, downloaded: !r.downloaded } : r
              ),
            })),
          })),
        })),

      markLastOpened: (courseId, sectionId, resourceId) =>
        set((st) => {
          const course = st.data.courses.find((c) => c.id === courseId);
          const resource = course?.sections
            .flatMap((s) => s.resources)
            .find((r) => r.id === resourceId);

          const withFlag = mapCourse(st.data, courseId, (c) => ({
            ...c,
            sections: c.sections.map((s) => ({
              ...s,
              resources: s.resources.map((r) => ({
                ...r,
                lastOpened: s.id === sectionId && r.id === resourceId,
              })),
            })),
          }));

          if (!resource || !course) return { data: withFlag };

          // Remonte l'élément en tête de « Éléments consultés récemment ».
          const recent = [
            {
              id: nextId("recent"),
              courseId,
              resourceId,
              title: resource.title,
              kind: resource.kind,
            },
            ...withFlag.recentItems.filter((r) => r.resourceId !== resourceId),
          ].slice(0, 8);

          // …et le cours en tête de « Cours consultés récemment ».
          const order = [courseId, ...withFlag.courseOrder.filter((c) => c !== courseId)];

          return { data: { ...withFlag, recentItems: recent, courseOrder: order } };
        }),

      addAnnouncement: (a) =>
        set((st) => ({
          data: { ...st.data, announcements: [{ ...a, id: nextId("ann") }, ...st.data.announcements] },
        })),

      removeAnnouncement: (id) =>
        set((st) => ({
          data: { ...st.data, announcements: st.data.announcements.filter((a) => a.id !== id) },
        })),

      setAttendance: (courseId, participantId, present) =>
        set((st) => ({
          attendance: {
            ...st.attendance,
            [courseId]: { ...(st.attendance[courseId] ?? {}), [participantId]: present },
          },
        })),

      markAllNotificationsRead: () =>
        set((st) => ({
          data: {
            ...st.data,
            notifications: st.data.notifications.map((n) => ({ ...n, read: true })),
          },
        })),

      readMessage: (id) =>
        set((st) => ({
          data: {
            ...st.data,
            messages: st.data.messages.map((m) => (m.id === id ? { ...m, unread: false } : m)),
          },
        })),

      reset: () => set({ data: buildSeed(), role: "student", lang: "fr", attendance: {} }),
    }),
    {
      name: "studium-clone-v1",
      version: 1,
    }
  )
);

/* -------------------------------------------------------------------------- */
/*  Sélecteurs pratiques                                                       */
/* -------------------------------------------------------------------------- */

export function useCourse(courseId: string) {
  return useStudium((s) => s.data.courses.find((c) => c.id === courseId));
}

/**
 * Cours dans l'ordre choisi par l'utilisateur (glisser-déposer).
 * Le tri est mémoïsé : un sélecteur Zustand qui renvoie un nouveau tableau à
 * chaque appel ferait boucler `useSyncExternalStore`.
 */
export function useOrderedCourses(): Course[] {
  const courses = useStudium((s) => s.data.courses);
  const order = useStudium((s) => s.data.courseOrder);

  return useMemo(() => {
    const byId = new Map(courses.map((c) => [c.id, c]));
    const ordered = order
      .map((id) => byId.get(id))
      .filter((c): c is Course => Boolean(c));
    const missing = courses.filter((c) => !order.includes(c.id));
    return [...ordered, ...missing];
  }, [courses, order]);
}

export const useLang = () => useStudium((s) => s.lang);
export const useRole = () => useStudium((s) => s.role);
export const useIsTeacher = () => useStudium((s) => s.role === "teacher");

/**
 * `true` une fois que le store persisté a été relu depuis localStorage.
 * Le shell attend ce signal avant de rendre les pages : sans cela, l'ordre
 * des cartes rendu côté serveur diffère de celui du navigateur et React
 * signale une erreur d'hydratation.
 */
export function useHydrated(): boolean {
  // `useSyncExternalStore` renvoie l'instantané serveur (false) pendant le
  // rendu SSR et la première hydratation, puis l'instantané client (true).
  // Plus propre qu'un setState dans un effet, qui déclenche un rendu en
  // cascade — et que React 19 signale désormais.
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/** Aucun changement à écouter : l'abonnement est un no-op. */
const subscribeNoop = () => () => {};
