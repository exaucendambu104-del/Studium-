import fs from "node:fs";

const css = fs.readFileSync("artifact/styles.css", "utf8");
const js = fs.readFileSync("artifact/bundle.js", "utf8");

// Le script est inliné tel quel : la CSP de l'artefact interdit toute
// requête externe, donc rien ne doit sortir de ce fichier.
const html = `<title>StudiUM</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<style>
${css}
/* Le shell de l'app gère déjà tout le fond ; on neutralise la marge du body. */
html, body { margin: 0; padding: 0; }

/* Bandeau hors application : signale que ce n'est pas le vrai StudiUM.
   Volontairement en dehors du cadre « téléphone » pour ne pas altérer
   le rendu que la démo cherche à reproduire. */
.demo-note {
  background: #1D2125;
  color: #C8CDD2;
  font: 400 12px/1.45 var(--font-app);
  padding: 8px 16px;
  text-align: center;
}
.demo-note strong { color: #FFFFFF; font-weight: 600; }
</style>
<div class="demo-note">
  <strong>Démo — travail étudiant.</strong> Reproduction de StudiUM à des fins
  pédagogiques, sans lien avec l'Université de Montréal. Données fictives.
</div>
<div id="root"></div>
<script>
${js}
</script>
`;

fs.writeFileSync("artifact/studium.html", html);
console.log("HTML:", (html.length / 1024 / 1024).toFixed(2), "Mo");
