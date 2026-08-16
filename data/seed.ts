/**
 * ============================================================================
 *  DONNÉES FACTICES — clone StudiUM
 * ============================================================================
 *  C'est LE fichier à modifier pour changer le contenu de la démo :
 *  cours, sections, ressources, participants, grilles d'évaluation,
 *  annonces, messages et notifications.
 *
 *  Aucune base de données, aucune API : `buildSeed()` est appelée une fois
 *  puis l'état vit dans le store Zustand persisté dans localStorage.
 * ============================================================================
 */

import { seededInt, seededUnit } from "@/lib/hash";
import { NAME_POOL, TEACHERS } from "./names";
import type {
  Announcement,
  Competency,
  Course,
  GradeItem,
  Message,
  Notification,
  Participant,
  RecentItem,
  Resource,
  RichBlock,
  Section,
  StudiumData,
  TimelineActivity,
} from "@/lib/types";

/** Identifiant de l'étudiant connecté — présent dans les 5 cours. */
export const CURRENT_STUDENT_ID = "me";

const ME: Omit<Participant, "id"> = {
  firstName: "Exauce",
  lastName: "Ndambu",
  role: "student",
  email: "exauce.ndambu@umontreal.ca",
};

/* -------------------------------------------------------------------------- */
/*  Fabriques                                                                  */
/* -------------------------------------------------------------------------- */

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function email(first: string, last: string) {
  return `${slug(first)}.${slug(last)}@umontreal.ca`;
}

/**
 * Construit la liste de participants d'un cours :
 * l'enseignant en tête, puis ~30 étudiants triés par nom de famille,
 * dont l'utilisateur connecté.
 */
function makeParticipants(
  courseId: string,
  teacherKey: string,
  offset: number,
  count = 30
): Participant[] {
  const t = TEACHERS[teacherKey];
  const teacher: Participant = {
    id: `${courseId}-teacher`,
    firstName: t.first,
    lastName: t.last,
    role: "teacher",
    roleLabel: t.label,
    email: email(t.first, t.last),
  };

  const students: Participant[] = [];
  for (let i = 0; i < count - 1; i++) {
    const [first, last] = NAME_POOL[(offset + i) % NAME_POOL.length];
    students.push({
      id: `${courseId}-s${i}`,
      firstName: first,
      lastName: last,
      role: "student",
      email: email(first, last),
    });
  }
  students.push({ id: CURRENT_STUDENT_ID, ...ME });

  students.sort((a, b) =>
    a.lastName.localeCompare(b.lastName, "fr", { sensitivity: "base" })
  );

  return [teacher, ...students];
}

let resourceCounter = 0;
function res(
  kind: Resource["kind"],
  title: string,
  extra: Partial<Resource> = {}
): Resource {
  resourceCounter += 1;
  return { id: `r${resourceCounter}`, kind, title, ...extra };
}

function section(title: string, blocks: RichBlock[], resources: Resource[]): Section {
  return { id: `sec-${slug(title)}-${resources[0]?.id ?? "x"}`, title, blocks, resources };
}

/**
 * Notes des autres étudiants : déterministes (pas de Math.random, sinon
 * l'hydratation React casse) mais crédibles — ~15 % de copies non remises.
 */
function fillGrades(
  itemId: string,
  participants: Participant[],
  max: number,
  mine: number | null
): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const p of participants) {
    if (p.role === "teacher") continue;
    if (p.id === CURRENT_STUDENT_ID) {
      out[p.id] = mine;
      continue;
    }
    const u = seededUnit(`${itemId}:${p.id}`);
    if (u < 0.15) {
      out[p.id] = null;
    } else {
      // Distribution resserrée autour de 72 % du maximum.
      const ratio = 0.45 + seededUnit(`${itemId}:${p.id}:v`) * 0.55;
      out[p.id] = Math.round(max * ratio * 100) / 100;
    }
  }
  return out;
}

function gradeItem(
  id: string,
  kind: GradeItem["kind"],
  name: string,
  weight: number,
  max: number,
  mine: number | null,
  participants: Participant[],
  dueDate?: string
): GradeItem {
  return {
    id,
    kind,
    name,
    weight,
    max,
    dueDate,
    grades: fillGrades(id, participants, max, mine),
    feedback: {},
  };
}

/* -------------------------------------------------------------------------- */
/*  1. ECN1901-A-H26 — Initiation à l'économie                                 */
/* -------------------------------------------------------------------------- */

function buildEcn1901(): Course {
  const id = "ecn1901-a-h26";
  const participants = makeParticipants(id, "ECN1901", 0);

  const sections: Section[] = [
    section(
      "Généralités",
      [
        {
          type: "p",
          text: "Bienvenue au cours **ECN1901 — Initiation à l'économie**. Vous trouverez ici le plan de cours, les modalités d'évaluation et les coordonnées de l'équipe enseignante.",
        },
        {
          type: "p",
          text: "Les disponibilités de l'auxiliaire d'enseignement sont affichées chaque lundi dans le forum de nouvelles.",
        },
      ],
      [
        res("pdf", "Plan de cours ECN1901 - Hiver 2026", { meta: "PDF · 412 Ko", downloaded: true }),
        res("forum", "Forum de nouvelles", { meta: "Annonces de l'enseignante" }),
        res("url", "Centre étudiant", { meta: "Lien externe" }),
      ]
    ),
    section(
      "12 Janvier - 16 Janvier",
      [
        { type: "h", text: "Séance 1 — Qu'est-ce que l'économie ?" },
        {
          type: "p",
          text: "Rareté, coût d'opportunité et *pensée à la marge*. Lisez le chapitre 1 **avant** la séance.",
        },
      ],
      [
        res("pdf", "Notes de cours - Séance 1", { meta: "PDF · 1,2 Mo", downloaded: true }),
        res("pdf", "Exercices chapitre 1", { meta: "PDF · 288 Ko" }),
      ]
    ),
    section(
      "19 Janvier - 23 Janvier",
      [
        { type: "h", text: "Séance 2 — Offre, demande et équilibre de marché" },
        {
          type: "p",
          text: "Construction des courbes, déplacements le long de la courbe versus déplacements de la courbe.",
        },
        { type: "ul", items: ["Déterminants de la demande", "Déterminants de l'offre", "Surplus et pénurie"] },
      ],
      [
        res("pdf", "Notes de cours - Séance 2", { meta: "PDF · 1,4 Mo" }),
        res("quiz", "Quiz formatif - Offre et demande", { meta: "Tentatives illimitées" }),
      ]
    ),
    section(
      "26 Janvier - 30 Janvier",
      [
        { type: "h", text: "Séance 3 — Élasticités" },
        { type: "p", text: "Élasticité-prix, élasticité-revenu et élasticité croisée. Applications aux politiques de taxation." },
      ],
      [
        res("pdf", "Notes de cours - Séance 3", { meta: "PDF · 980 Ko" }),
        res("doc", "Fiche de calcul des élasticités", { meta: "DOCX · 64 Ko" }),
      ]
    ),
    section(
      "2 Février - 6 Février",
      [
        { type: "h", text: "Séance 4 — Surplus du consommateur et du producteur" },
        { type: "p", text: "Mesure du bien-être, perte sèche et efficacité des marchés." },
      ],
      [
        res("pdf", "Notes de cours - Séance 4", { meta: "PDF · 1,1 Mo" }),
        res("pdf", "Exercices - Surplus", { meta: "PDF · 320 Ko" }),
      ]
    ),
    section(
      "9 Février - 13 Février",
      [
        { type: "h", text: "Séance 5 — Intervention de l'État" },
        { type: "p", text: "Prix plafond, prix plancher, taxes et subventions." },
      ],
      [
        res("pdf", "Notes de cours - Séance 5", { meta: "PDF · 1,0 Mo" }),
        res("assign", "Devoir 1 - Analyse d'une politique publique", { meta: "À remettre le 20 février, 23 h 59" }),
      ]
    ),
    section(
      "16 Février - 20 Février",
      [
        { type: "h", text: "Séance 6 — Révision avant l'intra" },
        { type: "p", text: "Séance de révision en classe. Apportez vos questions sur les chapitres 1 à 5." },
      ],
      [
        res("pdf", "Fiche de révision Intra", { meta: "PDF · 540 Ko", downloaded: true }),
        res("pdf", "Ancien examen intra (2025)", { meta: "PDF · 760 Ko" }),
      ]
    ),
    section(
      "23 Février - 27 Février",
      [
        { type: "p", text: "**Semaine de l'examen intra.**", tone: "alert", italic: true },
        { type: "p", text: "L'examen porte sur les chapitres 1 à 5 inclusivement. Durée : 2 h." },
      ],
      [res("quiz", "Examen intra", { meta: "Sur place · 2 h" })]
    ),
    section(
      "30 Mars - 3 Avril",
      [
        { type: "h", text: "Séance 10 — Concurrence imparfaite" },
        { type: "p", text: "Monopole, concurrence monopolistique et oligopole." },
      ],
      [
        res("pdf", "Notes de cours - Séance 10", { meta: "PDF · 1,3 Mo" }),
        res("pdf", "Exercices - Monopole", { meta: "PDF · 410 Ko" }),
      ]
    ),
    section(
      "6 Avril - 10 Avril",
      [
        { type: "h", text: "Séance 11 — Marché du travail et introduction à la macroéconomie" },
        { type: "p", text: "Dernière séance de matière. Le PIB, le chômage et l'inflation sont au programme de l'examen final." },
      ],
      [
        res("pdf", "Notes de cours - Séance 11", { meta: "PDF · 1,5 Mo" }),
        res("quiz", "Quiz formatif - Macroéconomie", { meta: "Tentatives illimitées" }),
      ]
    ),
    section(
      "13 Avril - 17 Avril",
      [
        { type: "p", text: "Semaine de l'Examen Final.", tone: "alert", italic: true },
        {
          type: "p",
          text: "Bien vouloir consulter l'horaire et la salle d'examen dans le centre étudiant !",
        },
      ],
      [
        res("pdf", "Fiche de préparation Examen Final", { meta: "PDF · 622 Ko" }),
        res("pdf", "Solutionnaire fiche de préparation Examen Final", {
          meta: "PDF · 1,1 Mo",
          downloaded: true,
          lastOpened: true,
        }),
      ]
    ),
  ];

  const gradeItems: GradeItem[] = [
    gradeItem("ecn-intra", "exam", "Intra", 40, 100, 0, participants, "25 février 2026"),
    gradeItem("ecn-final", "exam", "Final", 60, 100, null, participants, "16 avril 2026"),
  ];

  const competencies: Competency[] = [
    { id: "ecn-c1", title: "Expliquer le fonctionnement d'un marché concurrentiel", state: "achieved" },
    { id: "ecn-c2", title: "Calculer et interpréter une élasticité", state: "progress" },
    { id: "ecn-c3", title: "Évaluer l'effet d'une intervention de l'État sur le bien-être", state: "progress" },
    { id: "ecn-c4", title: "Distinguer les grandes structures de marché", state: "none" },
    { id: "ecn-c5", title: "Interpréter les principaux indicateurs macroéconomiques", state: "none" },
  ];

  return {
    id,
    code: "ECN1901-A-H26",
    title: "Initiation à l'économie",
    department: "Département de sciences économiques",
    term: "H26",
    color: "#F5B942",
    pattern: "hexagons",
    sections,
    participants,
    gradeItems,
    competencies,
  };
}

/* -------------------------------------------------------------------------- */
/*  2. FAS1919-C-H26 — Initiation aux études universitaires                    */
/* -------------------------------------------------------------------------- */

function buildFas1919(): Course {
  const id = "fas1919-c-h26";
  const participants = makeParticipants(id, "FAS1919", 17);

  const moduleTitles = [
    ["Module 1 - S'orienter à l'université", "Repérer les ressources du campus et planifier sa session."],
    ["Module 2 - Méthodes de travail", "Gestion du temps, environnement d'étude et concentration."],
    ["Module 3 - Prise de notes", "Méthodes Cornell, linéaire et schématique."],
    ["Module 4 - Recherche documentaire", "Interroger les bases de données des bibliothèques de l'UdeM."],
    ["Module 5 - Lecture universitaire", "Lire efficacement un article scientifique."],
    ["Module 6 - Intégrité intellectuelle", "Plagiat, paraphrase et usage responsable de l'IA générative."],
    ["Module 7 - Rédaction argumentative", "Thèse, plan détaillé et transitions."],
  ] as const;

  const sections: Section[] = [
    section(
      "Accueil",
      [
        {
          type: "p",
          text: "Bienvenue dans **FAS1919 — Initiation aux études universitaires**. Prenez le temps de lire le plan de cours et la feuille de route avant la première séance.",
        },
        { type: "h", text: "Étapes détaillées pour la connexion Zoom (SSO)" },
        {
          type: "ol",
          items: [
            "Ouvrez l'application Zoom sur votre appareil.",
            "Cliquez sur « Se connecter » puis sur « Connexion par SSO ».",
            "Entrez le domaine **umontreal** puis validez.",
            "Authentifiez-vous avec votre UNIP et votre code d'accès UdeM.",
            "Acceptez la double authentification (Duo) si elle vous est demandée.",
            "Rejoignez la séance à partir du lien affiché dans la section de la semaine.",
          ],
        },
        {
          type: "note",
          text: "Une connexion Zoom faite sans SSO ne sera pas reconnue : votre présence ne sera pas comptabilisée.",
        },
      ],
      [
        res("pdf", "Plan de cours", { meta: "PDF · 386 Ko", downloaded: true }),
        res("pdf", "Feuille de route", { meta: "PDF · 244 Ko", downloaded: true }),
        res("doc", "Gabarit page titre", { meta: "DOCX · 38 Ko" }),
        res("forum", "Forum de nouvelles", { meta: "Annonces de l'enseignante" }),
      ]
    ),
    ...moduleTitles.map(([title, intro]) =>
      section(
        title,
        [
          { type: "p", text: intro },
          {
            type: "p",
            text: "Visionnez la capsule vidéo, lisez le document de référence, puis répondez au questionnaire d'auto-évaluation.",
          },
        ],
        [
          res("pdf", `Document de référence — ${title.split(" - ")[1]}`, { meta: "PDF · 520 Ko" }),
          res("page", "Capsule vidéo (12 min)", { meta: "Page" }),
          res("quiz", "Auto-évaluation", { meta: "Tentatives illimitées · non noté" }),
        ]
      )
    ),
    section(
      "Module 8 - Travaux universitaires",
      [
        { type: "h", text: "Travail de réflexion critique et de citation (15%)" },
        {
          type: "p",
          text: "Ce module porte sur la citation des sources dans un travail universitaire. Vous devez démontrer votre maîtrise **d'un seul** style bibliographique, celui qui correspond à votre discipline d'études.",
        },
        {
          type: "p",
          text: "**Votre tâche :** choisissez l'une des trois options ci-dessous, complétez le questionnaire associé, puis déposez votre texte de réflexion critique de 500 mots dans le devoir du Module 9.",
        },
        {
          type: "note",
          text: "ATTENTION : faites uniquement l'une des trois évaluations, et non les trois.",
        },
        {
          type: "ul",
          items: [
            "Sciences de la santé → style Vancouver",
            "Sciences sociales et psychologie → style APA (7e éd.)",
            "Lettres, histoire et philosophie → style Chicago",
          ],
        },
      ],
      [
        res("quiz", "Option 1 : style APA (7e éd.)", { meta: "1 tentative · 15 questions" }),
        res("quiz", "Option 2 : style Chicago (notes et bibliographie)", { meta: "1 tentative · 15 questions" }),
        res("quiz", "Option 3 : style Vancouver", { meta: "1 tentative · 15 questions", lastOpened: true }),
      ]
    ),
    section(
      "Module 9 - Bibliographie et citation",
      [
        { type: "h", text: "Construire une bibliographie cohérente" },
        {
          type: "p",
          text: "Déposez ici votre texte de réflexion critique. Le fichier doit être en format **PDF** et respecter le gabarit de page titre fourni dans la section d'accueil.",
        },
      ],
      [
        res("pdf", "Aide-mémoire des trois styles", { meta: "PDF · 640 Ko" }),
        res("assign", "Dépôt du travail réflexif #2", { meta: "À remettre le 3 avril, 23 h 59", downloaded: false }),
      ]
    ),
    section(
      "Module 10 - Projet d'études",
      [
        { type: "h", text: "Projet d'études personnel (25%)" },
        {
          type: "p",
          text: "Le projet d'études est le travail intégrateur du cours. Il compte pour **25 %** de la note finale.",
        },
        { type: "p", text: "La grille de correction détaillée est jointe ci-dessous." },
      ],
      [
        res("pdf", "Consignes du projet d'études", { meta: "PDF · 712 Ko" }),
        res("pdf", "Grille de correction", { meta: "PDF · 190 Ko" }),
        res("assign", "Dépôt du projet d'études", { meta: "À remettre le 17 avril, 23 h 59" }),
      ]
    ),
  ];

  const biblio: GradeItem = {
    id: "fas-biblio",
    kind: "quiz",
    name: "Bibliographie",
    weight: 15,
    max: 15,
    grades: {},
    children: [
      gradeItem("fas-biblio-3", "quiz", "Option 3 : style Vancouver", 15, 15, null, participants),
      gradeItem("fas-biblio-1", "quiz", "Option 1 : style APA (7e éd.)", 15, 15, null, participants),
      gradeItem("fas-biblio-2", "quiz", "Option 2 : style Chicago (notes et bibliographie)", 15, 15, null, participants),
    ],
  };

  const gradeItems: GradeItem[] = [
    gradeItem("fas-calendrier", "assign", "Calendrier organisationnel de travail (10%)", 10, 10, null, participants, "23 janvier 2026"),
    gradeItem("fas-notes", "assign", "Produire notes de cours (10%)", 10, 10, 10, participants, "6 février 2026"),
    gradeItem("fas-type", "quiz", "Quel type d'étudiant.e suis-je ? (10%)", 10, 10, 8.8, participants, "13 février 2026"),
    gradeItem("fas-reflexif1", "submission", "Travail réflexif #1 (15%)", 15, 15, 12, participants, "6 mars 2026"),
    gradeItem("fas-reflexif2", "submission", "Travail réflexif #2 (15%)", 15, 15, 15, participants, "3 avril 2026"),
    gradeItem("fas-projet", "assign", "Projet d'études (25%)", 25, 25, 20, participants, "17 avril 2026"),
    biblio,
  ];

  const competencies: Competency[] = [
    { id: "fas-c1", title: "Planifier une session universitaire de façon réaliste", state: "achieved" },
    { id: "fas-c2", title: "Prendre des notes efficaces en contexte de cours magistral", state: "achieved" },
    { id: "fas-c3", title: "Mener une recherche documentaire dans les bases de données de l'UdeM", state: "progress" },
    { id: "fas-c4", title: "Citer ses sources selon un style bibliographique reconnu", state: "progress" },
    { id: "fas-c5", title: "Rédiger un texte argumentatif structuré", state: "none" },
    { id: "fas-c6", title: "Agir avec intégrité intellectuelle", state: "achieved" },
  ];

  return {
    id,
    code: "FAS1919-C-H26",
    title: "Initiation aux études universitaires",
    department: "Direction des arts et des sciences",
    term: "H26",
    color: "#F5B942",
    pattern: "triangles",
    sections,
    participants,
    gradeItems,
    competencies,
  };
}

/* -------------------------------------------------------------------------- */
/*  3 & 4 & 5. Cours de mathématiques                                          */
/* -------------------------------------------------------------------------- */

const ALGEBRA_WEEKS: [string, string, string[]][] = [
  ["Semaine 1 - Vecteurs du plan et de l'espace", "Norme, produit scalaire et angle entre deux vecteurs.", ["Combinaisons linéaires", "Orthogonalité"]],
  ["Semaine 2 - Droites et plans", "Équations paramétriques, cartésiennes et normales.", ["Intersection de deux plans", "Distance point-plan"]],
  ["Semaine 3 - Produit vectoriel", "Aire d'un parallélogramme et volume d'un parallélépipède.", ["Produit mixte", "Déterminant 3×3"]],
  ["Semaine 4 - Systèmes d'équations linéaires", "Méthode d'élimination de Gauss-Jordan.", ["Matrice augmentée", "Forme échelonnée réduite"]],
  ["Semaine 5 - Matrices", "Opérations matricielles et matrice inverse.", ["Produit matriciel", "Inversion par Gauss-Jordan"]],
  ["Semaine 6 - Déterminants", "Développement de Laplace et propriétés du déterminant.", ["Règle de Cramer"]],
  ["Semaine 7 - Espaces vectoriels", "Sous-espaces, engendrement et indépendance linéaire.", ["Base et dimension"]],
  ["Semaine 8 - Bases et changement de base", "Coordonnées dans une base et matrice de passage.", ["Rang d'une matrice"]],
  ["Semaine 9 - Transformations linéaires", "Noyau, image et théorème du rang.", ["Matrice d'une transformation"]],
  ["Semaine 10 - Valeurs et vecteurs propres", "Polynôme caractéristique et diagonalisation.", ["Diagonalisation orthogonale"]],
];

const CALCULUS_WEEKS: [string, string, string[]][] = [
  ["Semaine 1 - Fonctions et graphiques", "Domaine, image et transformations élémentaires.", ["Fonctions usuelles"]],
  ["Semaine 2 - Limites", "Approche intuitive et calcul algébrique des limites.", ["Formes indéterminées"]],
  ["Semaine 3 - Continuité", "Théorème des valeurs intermédiaires.", ["Discontinuités"]],
  ["Semaine 4 - La dérivée", "Taux de variation instantané et interprétation géométrique.", ["Droite tangente"]],
  ["Semaine 5 - Règles de dérivation", "Produit, quotient et composition.", ["Règle de chaîne"]],
  ["Semaine 6 - Dérivation implicite", "Taux liés et applications.", ["Taux liés"]],
  ["Semaine 7 - Théorème de la moyenne", "Rolle et Lagrange.", ["Croissance et décroissance"]],
  ["Semaine 8 - Optimisation", "Extremums locaux et absolus.", ["Problèmes d'optimisation"]],
  ["Semaine 9 - Concavité et esquisse de courbe", "Points d'inflexion et asymptotes.", ["Étude complète de fonction"]],
  ["Semaine 10 - Règle de L'Hospital", "Formes indéterminées et croissances comparées.", ["Approximation linéaire"]],
  ["Semaine 11 - Introduction à l'intégrale", "Sommes de Riemann et théorème fondamental.", ["Primitives"]],
];

function buildMathSections(prefix: string, weeks: [string, string, string[]][]): Section[] {
  const intro = section(
    "Généralités",
    [
      {
        type: "p",
        text: "Le plan de cours, les démonstrations et les séances de dépannage sont regroupés dans cette section.",
      },
      {
        type: "p",
        text: "Les séances de dépannage ont lieu **les mardis de 15 h à 17 h** au local Z-255 du Pavillon Claire-McNicoll.",
      },
    ],
    [
      res("pdf", "Plan de cours", { meta: "PDF · 356 Ko", downloaded: true }),
      res("pdf", "Formulaire autorisé aux examens", { meta: "PDF · 128 Ko" }),
      res("forum", "Forum de discussion", { meta: "Questions et réponses" }),
    ]
  );

  const weekSections = weeks.map(([title, intro2, bullets], i) =>
    section(
      title,
      [
        { type: "p", text: intro2 },
        { type: "ul", items: bullets },
        ...(i === weeks.length - 1
          ? [
              {
                type: "p" as const,
                text: "Dernière semaine de matière avant l'examen final.",
                tone: "alert" as const,
                italic: true,
              },
            ]
          : []),
      ],
      [
        res("pdf", `${prefix} — Notes de cours ${i + 1}`, { meta: "PDF · 1,1 Mo", downloaded: i < 2 }),
        res("pdf", `Série d'exercices ${i + 1}`, { meta: "PDF · 420 Ko" }),
        ...(i % 3 === 2 ? [res("quiz", `Quiz ${Math.floor(i / 3) + 1}`, { meta: "1 tentative · 30 min" })] : []),
        ...(i % 4 === 1 ? [res("assign", `Devoir ${Math.floor(i / 4) + 1}`, { meta: "À remettre le dimanche, 23 h 59" })] : []),
      ]
    )
  );

  return [intro, ...weekSections];
}

const ALGEBRA_COMPETENCIES: Competency[] = [
  { id: "alg-c1", title: "Manipuler les vecteurs et le produit scalaire", state: "achieved" },
  { id: "alg-c2", title: "Résoudre un système linéaire par élimination de Gauss", state: "achieved" },
  { id: "alg-c3", title: "Calculer un déterminant et inverser une matrice", state: "progress" },
  { id: "alg-c4", title: "Déterminer une base et la dimension d'un sous-espace", state: "progress" },
  { id: "alg-c5", title: "Diagonaliser une matrice symétrique", state: "none" },
];

function buildMat1905A(): Course {
  const id = "mat1905-a-h26";
  const participants = makeParticipants(id, "MAT1905-A", 34);

  const gradeItems: GradeItem[] = [
    gradeItem("mat-a-q1", "quiz", "Quiz 1", 5, 5, 1.83, participants, "30 janvier 2026"),
    gradeItem("mat-a-q2", "quiz", "Quiz 2", 5, 5, null, participants, "13 février 2026"),
    gradeItem("mat-a-intra", "exam", "INTRA", 30, 100, 42, participants, "26 février 2026"),
    gradeItem("mat-a-final", "exam", "FINAL", 50, 100, null, participants, "20 avril 2026"),
    gradeItem("mat-a-q3", "quiz", "QUIZ 3", 5, 5, null, participants, "20 mars 2026"),
    gradeItem("mat-a-q4", "quiz", "QUIZ 4", 5, 5, 3, participants, "3 avril 2026"),
  ];

  return {
    id,
    code: "MAT1905-A-H26",
    title: "Algèbre vectorielle et linéaire",
    department: "Département de mathématiques et de statistique",
    term: "H26",
    color: "#0FBF8F",
    pattern: "triangles",
    sections: buildMathSections("Algèbre", ALGEBRA_WEEKS),
    participants,
    gradeItems,
    competencies: ALGEBRA_COMPETENCIES.map((c) => ({ ...c, id: `a-${c.id}` })),
  };
}

function buildMat1905C(): Course {
  const id = "mat1905-c-a24";
  const participants = makeParticipants(id, "MAT1905-C", 51);

  const gradeItems: GradeItem[] = [
    gradeItem("mat-c-dm1", "assign", "Devoir 1", 10, 20, 17, participants, "27 septembre 2024"),
    gradeItem("mat-c-dm2", "assign", "Devoir 2", 10, 20, 18.5, participants, "25 octobre 2024"),
    gradeItem("mat-c-intra", "exam", "Intra", 30, 100, 71, participants, "30 octobre 2024"),
    gradeItem("mat-c-final", "exam", "Final", 50, 100, 78, participants, "16 décembre 2024"),
  ];

  return {
    id,
    code: "MAT1905-C-A24",
    title: "Algèbre vectorielle et linéaire",
    department: "Département de mathématiques et de statistique",
    term: "A24",
    color: "#A78BF5",
    pattern: "diamonds",
    sections: buildMathSections("Algèbre", ALGEBRA_WEEKS),
    participants,
    gradeItems,
    competencies: ALGEBRA_COMPETENCIES.map((c) => ({ ...c, id: `c-${c.id}`, state: "achieved" as const })),
  };
}

function buildMat1903(): Course {
  const id = "mat1903-b-a25";
  const participants = makeParticipants(id, "MAT1903", 68);

  const gradeItems: GradeItem[] = [
    gradeItem("mat1903-q1", "quiz", "Quiz 1 - Limites", 10, 10, 8.5, participants, "26 septembre 2025"),
    gradeItem("mat1903-q2", "quiz", "Quiz 2 - Dérivées", 10, 10, 9, participants, "24 octobre 2025"),
    gradeItem("mat1903-intra", "exam", "Examen intra", 30, 100, 68, participants, "29 octobre 2025"),
    gradeItem("mat1903-final", "exam", "Examen final", 50, 100, 74, participants, "15 décembre 2025"),
  ];

  return {
    id,
    code: "MAT1903-B-A25",
    title: "Calcul différentiel",
    department: "Département de mathématiques et de statistique",
    term: "A25",
    color: "#6B4FE0",
    pattern: "squares",
    sections: buildMathSections("Calcul", CALCULUS_WEEKS),
    participants,
    gradeItems,
    competencies: [
      { id: "cal-c1", title: "Calculer une limite et lever une indétermination", state: "achieved" },
      { id: "cal-c2", title: "Dériver une fonction composée", state: "achieved" },
      { id: "cal-c3", title: "Résoudre un problème d'optimisation", state: "achieved" },
      { id: "cal-c4", title: "Esquisser le graphe d'une fonction à partir de ses dérivées", state: "progress" },
      { id: "cal-c5", title: "Interpréter l'intégrale définie comme une aire", state: "none" },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Contenus transversaux                                                      */
/* -------------------------------------------------------------------------- */

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-maintenance",
    tone: "warning",
    title: "Opération de maintenance dans la nuit du 20 août 2026",
    body: "StudiUM sera indisponible de 23 h 00 le 20 août à 3 h 00 le 21 août pour une mise à niveau des serveurs. Planifiez vos remises en conséquence : aucune prolongation ne sera accordée pour cette raison.",
    date: "12 août 2026",
  },
  {
    id: "ann-nouveautes",
    tone: "info",
    title: "Nouveautés StudiUM 5.1",
    body: "La nouvelle version apporte une chronologie repensée, l'accès hors ligne aux fichiers téléchargés et un mode sombre expérimental. Consultez le guide des nouveautés dans le menu Plus.",
    date: "5 août 2026",
  },
];

const MESSAGES: Message[] = [
  {
    id: "msg-1",
    from: "Geneviève Léveillé",
    initials: "GL",
    preview: "Bonjour, votre travail réflexif #2 a été corrigé. Bravo pour…",
    date: "14 août",
    unread: true,
    thread: [
      {
        id: "m1-1",
        author: "Geneviève Léveillé",
        text: "Bonjour, votre travail réflexif #2 a été corrigé. Bravo pour la qualité de l'argumentation !",
        time: "14 août, 09 h 12",
        mine: false,
      },
      {
        id: "m1-2",
        author: "Geneviève Léveillé",
        text: "N'oubliez pas de déposer le projet d'études avant le 17 avril.",
        time: "14 août, 09 h 13",
        mine: false,
      },
    ],
  },
  {
    id: "msg-2",
    from: "Mikael Arbec",
    initials: "MA",
    preview: "Salut ! On se retrouve à la bibli pour réviser l'intra ?",
    date: "13 août",
    unread: true,
    thread: [
      { id: "m2-1", author: "Mikael Arbec", text: "Salut ! On se retrouve à la bibli pour réviser l'intra ?", time: "13 août, 18 h 40", mine: false },
      { id: "m2-2", author: "Moi", text: "Oui, demain 14 h au 3e étage ?", time: "13 août, 19 h 02", mine: true },
    ],
  },
  {
    id: "msg-3",
    from: "Pierre-Luc Deslauriers",
    initials: "PD",
    preview: "Le QUIZ 3 est reporté à la semaine prochaine.",
    date: "9 août",
    unread: false,
    thread: [
      { id: "m3-1", author: "Pierre-Luc Deslauriers", text: "Le QUIZ 3 est reporté à la semaine prochaine.", time: "9 août, 11 h 25", mine: false },
      { id: "m3-2", author: "Moi", text: "Merci de l'information !", time: "9 août, 12 h 01", mine: true },
    ],
  },
  {
    id: "msg-4",
    from: "Jade Barazin",
    initials: "JB",
    preview: "Tu as le solutionnaire de la série 7 ?",
    date: "2 août",
    unread: false,
    thread: [
      { id: "m4-1", author: "Jade Barazin", text: "Tu as le solutionnaire de la série 7 ?", time: "2 août, 20 h 15", mine: false },
    ],
  },
];

function buildNotifications(): Notification[] {
  const templates: [string, string, string][] = [
    ["FAS1919-C-H26", "Devoir remis", "Votre dépôt pour « Travail réflexif #2 » a bien été reçu."],
    ["MAT1905-A-H26", "Note disponible", "Une note a été publiée pour « QUIZ 4 »."],
    ["ECN1901-A-H26", "Nouvelle annonce", "Semaine de l'Examen Final — consultez le centre étudiant."],
    ["FAS1919-C-H26", "Rappel d'échéance", "« Projet d'études » est à remettre dans 3 jours."],
    ["MAT1905-A-H26", "Nouveau document", "« Série d'exercices 10 » a été ajouté à la Semaine 10."],
    ["MAT1903-B-A25", "Note disponible", "Une note a été publiée pour « Examen final »."],
    ["ECN1901-A-H26", "Nouveau document", "« Solutionnaire fiche de préparation Examen Final » est disponible."],
    ["FAS1919-C-H26", "Message du forum", "Nouvelle réponse dans « Forum de nouvelles »."],
    ["MAT1905-C-A24", "Cours archivé", "Le cours a été archivé pour la session A24."],
    ["MAT1905-A-H26", "Rappel d'échéance", "« QUIZ 3 » ferme demain à 23 h 59."],
  ];

  const out: Notification[] = [];
  for (let i = 0; i < 91; i++) {
    const [courseCode, title, body] = templates[i % templates.length];
    const day = 16 - Math.floor(i / 3);
    const month = day > 0 ? "août" : "juillet";
    const shownDay = day > 0 ? day : 31 + day;
    out.push({
      id: `notif-${i}`,
      courseCode,
      title,
      body,
      date: `${shownDay} ${month} 2026, ${String(seededInt(`n${i}h`, 7, 21)).padStart(2, "0")} h ${String(
        seededInt(`n${i}m`, 0, 59)
      ).padStart(2, "0")}`,
      read: false,
    });
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Assemblage                                                                 */
/* -------------------------------------------------------------------------- */

export function buildSeed(): StudiumData {
  resourceCounter = 0;

  const ecn = buildEcn1901();
  const matC = buildMat1905C();
  const fas = buildFas1919();
  const matA = buildMat1905A();
  const mat1903 = buildMat1903();

  const courses = [ecn, matC, fas, matA, mat1903];

  const ecnLast = ecn.sections[ecn.sections.length - 1];
  const fasModule8 = fas.sections.find((s) => s.title.startsWith("Module 8"))!;

  const recentItems: RecentItem[] = [
    {
      id: "recent-1",
      courseId: ecn.id,
      resourceId: ecnLast.resources[1].id,
      title: "Solutionnaire fiche de préparation Examen Final",
      kind: "pdf",
    },
    {
      id: "recent-2",
      courseId: ecn.id,
      resourceId: ecnLast.resources[0].id,
      title: "Fiche de préparation Examen Final",
      kind: "pdf",
    },
    {
      id: "recent-3",
      courseId: fas.id,
      resourceId: fasModule8.resources[2].id,
      title: "Option 3 : style Vancouver",
      kind: "quiz",
    },
    {
      id: "recent-4",
      courseId: fas.id,
      resourceId: fas.sections[0].resources[0].id,
      title: "Plan de cours",
      kind: "pdf",
    },
  ];

  /**
   * Chronologie : vide au chargement initial (comme sur la capture d'écran),
   * mais les activités existent en réserve — le sélecteur « Tout » et le mode
   * professeur peuvent les faire apparaître.
   */
  const timeline: TimelineActivity[] = [
    {
      id: "tl-1",
      courseId: fas.id,
      title: "Dépôt du projet d'études",
      kind: "assign",
      dueDate: "17 avril 2026, 23 h 59",
      overdue: true,
    },
    {
      id: "tl-2",
      courseId: matA.id,
      title: "QUIZ 3",
      kind: "quiz",
      dueDate: "20 mars 2026, 23 h 59",
      overdue: true,
    },
    {
      id: "tl-3",
      courseId: ecn.id,
      title: "Devoir 1 - Analyse d'une politique publique",
      kind: "assign",
      dueDate: "20 février 2026, 23 h 59",
      overdue: true,
    },
  ];

  return {
    courses,
    courseOrder: [ecn.id, matC.id, fas.id, matA.id, mat1903.id],
    announcements: ANNOUNCEMENTS,
    timeline,
    recentItems,
    messages: MESSAGES,
    notifications: buildNotifications(),
    currentStudentId: CURRENT_STUDENT_ID,
  };
}
