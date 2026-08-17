# StudiUM — clone

Reproduction fidèle de **StudiUM**, la plateforme de cours en ligne de l'Université
de Montréal (instance Moodle 5.x, thème mobile de l'application officielle).

Travail universitaire, à visée pédagogique. **Toutes les données sont factices** et
vivent uniquement dans le navigateur : aucun backend, aucune base de données,
aucune API externe.

---

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir <http://localhost:3000>.

L'application est pensée **mobile-first** (largeur de référence ~390 px). En desktop,
le contenu est centré dans un cadre de 480 px sur fond gris. Pour l'inspecter dans
les meilleures conditions, activez le mode appareil mobile des outils de développement
(iPhone 14, 390 × 844).

Autres commandes :

```bash
npm run build     # build de production
npm start         # sert le build
npm run lint      # ESLint 9 (config plate, règles Next.js)
npm run artifact  # démo autonome en un seul fichier HTML
```

`npm run artifact` produit `artifact/studium.html` : l'application entière —
même code, CSS et JavaScript inclus — dans un fichier unique de ~400 Ko,
ouvrable par double-clic, sans serveur ni installation. Pratique pour montrer
le projet à quelqu'un. Le routage y passe par le hash de l'URL (`#/cours`) au
lieu du routeur Next : voir `artifact/shim/`.

**Node.js 20.9 ou plus** est requis (contrainte de Next 16).

Aucune police n'est téléchargée au build : la typographie utilise une pile système
arrondie, ce qui permet de lancer le projet hors ligne. Pour passer à Poppins ou
Nunito Sans, ajoutez `next/font/google` dans `app/layout.tsx` et branchez la
variable `--font-app` définie dans `app/globals.css`.

---

## Basculer en mode professeur

Deux chemins mènent au sélecteur de rôle :

1. **Menu « Plus »** (5ᵉ onglet de la barre inférieure) → section « Rôle » →
   bouton **Professeur**.
2. Une fois en mode professeur, un bandeau bleu foncé « Mode édition — Professeur »
   reste affiché en haut de l'écran ; son bouton **Étudiant** ramène en lecture seule.

Le rôle est persisté : il survit à un rechargement de page.

### Ce que débloque le mode professeur

| Où | Possibilités |
|---|---|
| Onglet **Notes** | Vue « Choisir un étudiant » (une fiche par étudiant, avec rétroaction) ou « Tous les étudiants » (tableau étudiants × évaluations). Saisie validée de 0 à la note maximale, total pondéré recalculé en direct, bouton **Enregistrer** + toast, création et suppression d'évaluations. |
| Onglet **Cours** | Ajouter / renommer / supprimer une section, ajouter une ressource (PDF, DOC, quiz, devoir, page, lien, forum), éditer les consignes avec l'éditeur simple (gras, italique, titre, listes à puces et numérotées, texte d'alerte rouge), supprimer une ressource. |
| Onglet **Cours** (glisser-déposer) | Poignées ⠿ pour réordonner les ressources d'une section ; pendant le glissement, une liste de zones de dépôt apparaît pour envoyer la ressource **dans une autre section**. |
| Panneau d'index des sections | Réordonner les sections à la poignée. |
| Onglet **Participants** | Cases de présence par étudiant, avec compteur. |
| Onglet **Compétences** | Un tap fait tourner l'état : non évaluée → en progression → atteinte. |
| Tableau de bord | Bouton « Nouvelle annonce » : l'annonce créée apparaît immédiatement sur le tableau de bord des étudiants ; icône corbeille pour retirer une annonce. |

Le store étant partagé, **toute modification faite en mode professeur est
immédiatement visible en mode étudiant**.

---

## Où modifier les données factices

Tout le contenu de la démo est dans **`data/seed.ts`** — c'est le seul fichier à
toucher pour changer les cours, les sections, les ressources, les grilles
d'évaluation, les annonces, les messages et les notifications.

```
data/
├── seed.ts     ← LE fichier de contenu : buildSeed() assemble tout
└── names.ts    ← bassin de ~95 noms + les 5 enseignants
```

Repères dans `seed.ts` :

| Ce que vous voulez changer | Où |
|---|---|
| Un cours entier | `buildEcn1901()`, `buildFas1919()`, `buildMat1905A()`, `buildMat1905C()`, `buildMat1903()` |
| Les sections d'un cours | Le tableau `sections` de la fonction du cours, via l'aide `section(titre, blocs, ressources)` |
| Une ressource | L'aide `res(type, titre, { meta, downloaded, lastOpened })` |
| Les consignes d'une section | Les `RichBlock` : `{type:"p"}`, `{type:"h"}`, `{type:"ul"}`, `{type:"ol"}`, `{type:"note"}` (rouge italique). Dans un `p`, `**gras**` et `*italique*` sont interprétés. |
| Une grille d'évaluation | Le tableau `gradeItems`, via `gradeItem(id, type, nom, pondération, max, maNote, participants, échéance)` |
| Les semaines de maths | Les constantes `ALGEBRA_WEEKS` et `CALCULUS_WEEKS` |
| Les annonces / messages / notifications | `ANNOUNCEMENTS`, `MESSAGES`, `buildNotifications()` |
| L'étudiant connecté | `CURRENT_STUDENT_ID` et la constante `ME` |

Le store ne relit `buildSeed()` en entier qu'au tout premier lancement ; ensuite,
c'est la sauvegarde locale du navigateur qui fait autorité. Un **nouveau** cours
(un `id` inédit) apparaît automatiquement pour tout le monde à la prochaine
visite — mais seulement si vous **incrémentez `version`** dans la config
`persist(...)` de `store/useStudium.ts` (la fonction `migrate` s'occupe
ensuite d'ajouter le cours manquant sans toucher aux notes ou à l'ordre des
cartes déjà personnalisés par quelqu'un). Sans ce coup de version, le nouveau
cours reste invisible pour quiconque a déjà visité le site.

Pour tout le reste (modifier un cours existant, une section, une grille…),
la seule façon fiable de voir le changement est de vider les données
persistées : **Plus → Réinitialiser les données de démo**.

### Les notes des autres étudiants

Elles sont générées par `fillGrades()` à partir d'un hachage déterministe du couple
(évaluation, étudiant) — jamais `Math.random()`, qui produirait des valeurs
différentes côté serveur et côté client et casserait l'hydratation React.

---

## Arborescence

```
app/
├── layout.tsx                 shell global
├── globals.css                jetons de couleur, composants Tailwind, animations
├── page.tsx                   PAGE 1 — Tableau de bord
├── cours/page.tsx             PAGE 2 — Mes cours
├── cours/[id]/page.tsx        PAGE 3 — Page d'un cours (4 onglets)
├── messages/page.tsx          conversations + fil de discussion
├── notifications/page.tsx     91 notifications datées, paginées
├── plus/page.tsx              rôle, langue, à propos, réinitialisation
└── recherche/page.tsx         recherche globale (loupe de la barre supérieure)

components/
├── layout/       AppShell · TopBar · BottomNav · TeacherBanner · RoleSwitcher
├── dashboard/    TimelineCard · RecentItemsCard · RecentCoursesCarousel ·
│                 Carousel · AnnouncementBanner
├── course/       CourseCard · CourseBanner · CourseTabs · CourseContent ·
│                 SectionNavigator · SectionIndexPanel · ResourceRow · RichText
├── participants/ ParticipantList · ParticipantProfile
├── grades/       GradesTable · GradeEditor · GradeItemForm
├── competencies/ CompetencyList
├── teacher/      AnnouncementForm · ResourceForm · SimpleEditor
├── dnd/          SortableList · SortableItem · DragHandle
└── ui/           SearchField · Dropdown · Modal · Toast · ResourceIcon

data/       seed.ts · names.ts
store/      useStudium.ts        Zustand + persist(localStorage)
lib/        types.ts · format.ts · grades.ts · i18n.ts · hash.ts
```

---

## Glisser-déposer

Implémenté avec **@dnd-kit** (tactile, souris et clavier).

| Quoi | Où | Comment |
|---|---|---|
| Cartes de cours | Tableau de bord (bouton ⇅ de « Cours consultés récemment ») et page Mes cours | Poignée ⠿ ; l'ordre est persisté dans `localStorage` |
| Ressources d'une section | Onglet Cours, mode professeur | Poignée ⠿ |
| Ressource → autre section | Onglet Cours, mode professeur | Pendant le glissement, des zones de dépôt listant les autres sections apparaissent sous la liste |
| Sections | Panneau d'index, mode professeur | Poignée ⠿ |

Retour visuel : élément soulevé (`scale(1.03)`, ombre marquée, opacité 0.9),
ligne bleue d'insertion, animation fluide des voisins, `navigator.vibrate(12)` au
démarrage du glissement sur mobile.

**Le défilement vertical n'est jamais bloqué** : le `PointerSensor` exige 8 px de
déplacement avant d'armer un glissement, le `TouchSensor` un délai (400 ms en appui
long, 120 ms depuis une poignée). Un balayage vertical ordinaire fait donc défiler
la page comme d'habitude. Le glisser-déposer est aussi utilisable au clavier
(`Tab` jusqu'à la poignée, `Espace`, flèches, `Espace`).

---

## Détails d'implémentation

- **Vignettes de cours** — motifs géométriques (hexagones, triangles, losanges,
  carrés concentriques) générés en SVG inline dans `CourseBanner`, une seule
  couleur avec variations d'opacité. Aucune image externe.
- **Notes** — toujours affichées avec une virgule décimale et deux décimales
  (`formatGrade`). La saisie accepte `12,5` comme `12.5`.
- **Total du cours** — *calculé*, pas stocké : `Σ (note / max × pondération)` sur
  les évaluations notées (`lib/grades.ts`). Il se met donc à jour dès qu'une note
  change en mode professeur. Conséquence : les totaux peuvent différer de quelques
  centièmes des captures d'écran d'origine, où ils étaient figés — par exemple
  MAT1905-A-H26 affiche **17,43** avec des pondérations rondes (4 quiz à 5 %,
  intra 30 %, final 50 %) là où la capture montrait 17,28.
- **Bilinguisme** — le bouton `EN` de la barre supérieure ne bascule que les
  libellés d'interface (`lib/i18n.ts`) ; les contenus de cours restent en français,
  comme sur StudiUM.
- **Hydratation** — le shell attend le premier effet client avant de rendre les
  pages (`useHydrated`). Sans cela, l'ordre des cartes rendu côté serveur (celui du
  seed) différerait de celui du navigateur (celui de l'utilisateur).
- **Texte riche** — l'éditeur du mode professeur produit un balisage minimal
  reconverti en blocs typés, jamais du HTML brut : aucun
  `dangerouslySetInnerHTML` dans le rendu.
- **Accessibilité** — cibles tactiles ≥ 44 px (`.su-tap`), rôles ARIA sur les
  onglets, les modales et le sélecteur de rôle, `aria-live` sur les toasts,
  `prefers-reduced-motion` respecté.
- **Pas de `setState` dans un effet** — l'index de section est borné au rendu et
  la détection d'hydratation passe par `useSyncExternalStore`, conformément aux
  règles du compilateur React appliquées par Next 16.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS ·
Zustand (avec `persist`) · @dnd-kit · lucide-react

`npm audit` ne remonte aucune vulnérabilité sur les dépendances de production.
