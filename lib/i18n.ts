import type { Lang } from "./types";

/**
 * Libellés d'interface. Le bouton « EN » de la barre supérieure bascule
 * uniquement l'interface — les contenus de cours restent en français,
 * comme sur StudiUM.
 */
const DICT = {
  // Navigation
  dashboard: ["Tableau de bord", "Dashboard"],
  myCourses: ["Mes cours", "My courses"],
  messages: ["Messages", "Messages"],
  notifications: ["Notifications", "Notifications"],
  more: ["Plus", "More"],

  // Tableau de bord
  timeline: ["Chronologie", "Timeline"],
  searchActivity: [
    "Rechercher par type d'activité ou nom",
    "Search by activity type or name",
  ],
  all: ["Tout", "All"],
  assignmentsDue: ["Devoirs à rendre", "Assignments due"],
  quizzes: ["Quiz", "Quizzes"],
  overdue: ["En retard", "Overdue"],
  noActivity: [
    "Aucune activité ne nécessite d'action",
    "No activities require action",
  ],
  recentItems: ["Éléments consultés récemment", "Recently accessed items"],
  recentCourses: ["Cours consultés récemment", "Recently accessed courses"],
  sortBy: ["Trier", "Sort"],

  // Cours
  search: ["Rechercher", "Search"],
  searchCourse: ["Rechercher un cours", "Search a course"],
  allTerms: ["Toutes les sessions", "All terms"],
  tabCourse: ["Cours", "Course"],
  tabParticipants: ["Participants", "Participants"],
  tabGrades: ["Notes", "Grades"],
  tabCompetencies: ["Compétences", "Competencies"],
  lastOpened: ["Dernière activité ouverte", "Last opened activity"],
  sectionIndex: ["Index des sections", "Section index"],
  previous: ["Précédent", "Previous"],
  next: ["Suivant", "Next"],
  download: ["Télécharger", "Download"],
  downloaded: ["Téléchargé", "Downloaded"],
  courseInfo: ["Informations sur le cours", "Course information"],

  // Notes
  gradeItem: ["Élément d'évaluation", "Grade item"],
  grade: ["Grade", "Grade"],
  courseTotal: ["Total du cours", "Course total"],
  subtotalOf: ["Total de", "Total of"],
  maxGrade: ["Note maximale", "Maximum grade"],
  weight: ["Pondération", "Weight"],
  feedback: ["Rétroaction", "Feedback"],
  dueDate: ["Date de remise", "Due date"],
  noFeedback: ["Aucune rétroaction", "No feedback"],
  selectStudent: ["Choisir un étudiant", "Select a student"],
  allStudents: ["Tous les étudiants", "All students"],
  save: ["Enregistrer", "Save"],
  saved: ["Modifications enregistrées", "Changes saved"],
  newGradeItem: ["Nouvelle évaluation", "New grade item"],

  // Compétences
  compNone: ["Non évaluée", "Not assessed"],
  compProgress: ["En progression", "In progress"],
  compAchieved: ["Atteinte", "Achieved"],

  // Participants
  teacher: ["Enseignant", "Teacher"],
  student: ["Étudiant", "Student"],
  coursesInCommon: ["Cours en commun", "Courses in common"],
  sendMessage: ["Envoyer un message", "Send a message"],
  attendance: ["Présence", "Attendance"],
  present: ["Présent", "Present"],
  absent: ["Absent", "Absent"],

  // Rôles
  role: ["Rôle", "Role"],
  roleStudent: ["Étudiant", "Student"],
  roleTeacher: ["Professeur", "Teacher"],
  editMode: ["Mode édition — Professeur", "Edit mode — Teacher"],

  // Mode professeur
  addSection: ["Ajouter une section", "Add section"],
  renameSection: ["Renommer la section", "Rename section"],
  deleteSection: ["Supprimer la section", "Delete section"],
  addResource: ["Ajouter une ressource", "Add resource"],
  editText: ["Modifier le texte de consignes", "Edit section text"],
  newAnnouncement: ["Nouvelle annonce", "New announcement"],
  title: ["Titre", "Title"],
  body: ["Contenu", "Body"],
  type: ["Type", "Type"],
  cancel: ["Annuler", "Cancel"],
  create: ["Créer", "Create"],
  deleteConfirm: ["Supprimer définitivement ?", "Delete permanently?"],

  // Plus
  language: ["Langue", "Language"],
  resetDemo: [
    "Réinitialiser les données de démo",
    "Reset demo data",
  ],
  resetDone: ["Données réinitialisées", "Demo data reset"],
  about: ["À propos", "About"],
  aboutBody: [
    "Clone pédagogique de StudiUM. Toutes les données sont factices et stockées localement dans votre navigateur.",
    "Educational StudiUM clone. All data is fictitious and stored locally in your browser.",
  ],
  markAllRead: ["Tout marquer comme lu", "Mark all as read"],
  noMessages: ["Aucun message", "No messages"],
} as const;

export type LabelKey = keyof typeof DICT;

export function t(key: LabelKey, lang: Lang): string {
  return DICT[key][lang === "fr" ? 0 : 1];
}
