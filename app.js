const APP_NAME = "Académique";
const STORAGE_KEY = "academique-v1";
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const subjects = [
  {
    id: "python", title: "Python", icon: "🐍",
    description: "Apprends les bases de la programmation, puis construis tes propres programmes avec Python.",
    courses: [
      { id: "py01", title: "Les bases de Python", description: "Premiers programmes, affichage et syntaxe.", level: "Débutant", duration: "Leçon 01", available: false, status: "PDF à finaliser" },
      { id: "py02", title: "Les variables et les types de données", description: "Créer des variables et comprendre str, int, float et bool.", level: "Débutant", duration: "Leçon 02", available: false, status: "Nouveau PDF à créer" },
      { id: "py03", title: "Les opérations et les expressions", description: "Calculs, opérateurs, priorités et arrondis.", level: "Débutant", duration: "Leçon 03", available: false, status: "Nouveau PDF à créer" },
      { id: "py04", title: "Saisir et convertir des données", description: "Utiliser input(), int(), float() et str().", level: "Débutant", duration: "Leçon 04", available: false, status: "Nouveau PDF à créer" }
    ],
    roadmap: ["Conditions et opérateurs logiques", "Boucles for et while", "Listes et dictionnaires", "Fonctions et modules", "Fichiers et gestion des erreurs", "Projets pratiques"]
  },
  {
    id: "ia", title: "Intelligence artificielle", icon: "✦",
    description: "Découvre comment fonctionnent les intelligences artificielles et apprends à en construire progressivement.",
    courses: [],
    roadmap: ["Comprendre l'intelligence artificielle", "Python pour l'IA", "Données et préparation des jeux de données", "Machine Learning", "Réseaux de neurones", "Construire un assistant intelligent"]
  },
  {
    id: "discord", title: "Discord", icon: "♫",
    description: "Apprends à développer des bots Discord, automatiser des tâches et organiser des communautés.",
    courses: [],
    roadmap: ["Découvrir l'API Discord", "Préparer Python et son environnement", "Créer un premier bot", "Commandes et événements", "Rôles, permissions et modération", "Bases de données et hébergement"]
  }
];

let appState = { completed: [] };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (Array.isArray(saved.completed)) appState.completed = saved.completed;
} catch (error) {
  console.warn("La progression locale n'a pas pu être lue.", error);
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }
  catch (error) { showToast("La progression n'a pas pu être enregistrée sur cet appareil."); }
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function courseById(id) {
  for (const subject of subjects) {
    const found = subject.courses.find((course) => course.id === id);
    if (found) return { subject, course: found };
  }
  return null;
}

function renderHome() {
  const cards = subjects.map((subject) => {
    const count = subject.courses.filter((course) => course.available).length;
    const info = count ? count + (count > 1 ? " PDF disponibles" : " PDF disponible") : "Formation en préparation";
    return '<a class="subject-card" data-subject="' + subject.id + '" href="#matiere/' + subject.id + '">' +
      '<span class="subject-icon" aria-hidden="true">' + subject.icon + '</span>' +
      '<span class="subject-name">' + escapeHtml(subject.title) + '</span>' +
      '<span class="subject-meta">' + escapeHtml(info) + '</span></a>';
  }).join("");
  $("#appView").innerHTML = '<section aria-labelledby="welcomeHeading">' +
    '<h1 class="welcome-title" id="welcomeHeading">Bonjour, <span>Élève!</span></h1>' +
    '<h2 class="section-title">Mes matières</h2><div class="subject-grid">' + cards + '</div></section>';
  updateNavigation("accueil");
}

function renderSubject(subjectId) {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) { location.hash = "#accueil"; return; }
  const available = subject.courses.filter((course) => course.available);
  const pending = subject.courses.filter((course) => !course.available);
  const completedCount = available.filter((course) => appState.completed.includes(course.id)).length;
  const availableMarkup = available.length
    ? '<div class="course-list">' + available.map((course) => {
        const done = appState.completed.includes(course.id);
        return '<article class="course-card"><div><h3 class="course-title">' + escapeHtml(course.title) + '</h3>' +
          '<p class="course-description">' + escapeHtml(course.description) + '</p><div class="course-details">' +
          '<span class="pill">' + escapeHtml(course.level) + '</span><span class="pill">' + escapeHtml(course.duration) + '</span>' +
          (done ? '<span class="pill">Terminé</span>' : '') + '</div></div>' +
          '<a class="course-action" href="#cours/' + course.id + '">Lire le PDF →</a></article>';
      }).join("") + '</div>'
    : '<div class="pending-note"><span aria-hidden="true">📘</span><div><strong>Les premiers PDF sont en préparation.</strong>Les chapitres sont définis. Les leçons seront publiées sous forme de documents PDF complets, avec les explications, exemples, exercices et corrections dans chaque document.</div></div>';
  const pendingMarkup = pending.map((course) =>
    '<article class="course-card"><div><h3 class="course-title">' + escapeHtml(course.title) + '</h3>' +
    '<p class="course-description">' + escapeHtml(course.description) + '</p><div class="course-details">' +
    '<span class="pill">' + escapeHtml(course.level) + '</span><span class="pill">' + escapeHtml(course.status) + '</span></div></div>' +
    '<button class="course-action" type="button" disabled>À venir</button></article>'
  ).join("");
  const roadmapMarkup = subject.roadmap.map((item, index) =>
    '<div class="roadmap-item"><b>' + String(index + 1).padStart(2, "0") + ' · ' + escapeHtml(item) + '</b><small>Programme de formation</small></div>'
  ).join("");
  $("#appView").innerHTML = '<section class="subject-page"><a class="back-link" href="#accueil">← Retour à l’accueil</a>' +
    '<header class="page-heading"><h1>' + escapeHtml(subject.title) + '</h1><p>' + escapeHtml(subject.description) + '</p></header>' +
    (available.length ? '<div class="content-panel"><h2 class="panel-heading">Mes documents PDF <span class="pill">' + completedCount + '/' + available.length + ' terminés</span></h2>' + availableMarkup + '</div>' : availableMarkup) +
    (pendingMarkup ? '<div class="content-panel"><h2 class="panel-heading">Prochaines leçons</h2><div class="course-list">' + pendingMarkup + '</div></div>' : '') +
    '<div class="content-panel"><h2 class="panel-heading">Programme de la formation</h2><div class="roadmap">' + roadmapMarkup + '</div></div></section>';
  updateNavigation("accueil");
}

function renderPdf(courseId) {
  const result = courseById(courseId);
  if (!result || !result.course.available) { location.hash = "#accueil"; return; }
  const { subject, course } = result;
  const done = appState.completed.includes(course.id);
  const fileName = course.pdf.split("/").pop();
  $("#appView").innerHTML = '<section class="reader-page"><a class="back-link" href="#matiere/' + subject.id + '">← Retour à ' + escapeHtml(subject.title) + '</a>' +
    '<header class="page-heading"><h1>' + escapeHtml(course.title) + '</h1><p>' + escapeHtml(course.description) + '</p></header>' +
    '<div class="pdf-toolbar"><span class="pill">Document PDF · ' + escapeHtml(course.level) + '</span><div class="pdf-toolbar-actions">' +
    '<a class="secondary-action" href="' + course.pdf + '" download="' + escapeHtml(fileName) + '">↓ Télécharger</a>' +
    '<button class="secondary-action primary-action" type="button" data-action="toggle-complete" data-course="' + course.id + '">' +
    (done ? '✓ Terminé' : 'Marquer comme terminé') + '</button></div></div>' +
    (done ? '<p class="completed-message">Ce document est marqué comme terminé sur cet appareil.</p>' : '') +
    '<iframe class="reader-frame" src="' + course.pdf + '#toolbar=1&navpanes=0" title="Lecture du PDF : ' + escapeHtml(course.title) + '"></iframe>' +
    '<p class="reader-help">Le document est aussi téléchargeable pour être consulté hors connexion. Après son premier chargement, l’application tente de le conserver dans le cache de cet appareil.</p></section>';
  updateNavigation("accueil");
}

function renderAbout() {
  $("#appView").innerHTML = '<section class="about-page"><h1 class="about-title">À Propos</h1>' +
    '<div class="about-intro"><h1>Académique : apprendre le code</h1>' +
    '<p>Une bibliothèque de formations pratiques consacrées à Python, à l’intelligence artificielle et au développement Discord. Les cours sont proposés en PDF, avec leurs exercices et corrections intégrés.</p></div>' +
    '<div class="about-menu">' +
    '<button class="about-menu-item" type="button" data-action="privacy"><span class="about-menu-icon">♧</span><span class="about-menu-label">Politique de confidentialité</span><span class="about-menu-arrow">›</span></button>' +
    '<button class="about-menu-item" type="button" data-action="rate"><span class="about-menu-icon">☆</span><span class="about-menu-label">Évaluer l’application</span><span class="about-menu-arrow">›</span></button>' +
    '<button class="about-menu-item" type="button" data-action="share"><span class="about-menu-icon">♧</span><span class="about-menu-label">Partager l’application</span><span class="about-menu-arrow">›</span></button>' +
    '<button class="about-menu-item" type="button" data-action="other-apps"><span class="about-menu-icon">⠿</span><span class="about-menu-label">Découvrez d’autres applications</span><span class="about-menu-arrow">›</span></button>' +
    '<button class="about-menu-item" type="button" data-action="contact"><span class="about-menu-icon">✉</span><span class="about-menu-label">Contactez-nous</span><span class="about-menu-arrow">›</span></button>' +
    '</div></section>';
  updateNavigation("apropos");
}

function updateNavigation(active) {
  const onHome = active === "accueil";
  $("#homeTab").classList.toggle("active", onHome);
  $("#aboutTab").classList.toggle("active", !onHome);
  if (onHome) {
    $("#homeTab").setAttribute("aria-current", "page");
    $("#aboutTab").removeAttribute("aria-current");
  } else {
    $("#aboutTab").setAttribute("aria-current", "page");
    $("#homeTab").removeAttribute("aria-current");
  }
}

function render() {
  const route = decodeURIComponent(location.hash.replace(/^#/, "") || "accueil");
  const pieces = route.split("/");
  if (pieces[0] === "matiere" && pieces[1]) renderSubject(pieces[1]);
  else if (pieces[0] === "cours" && pieces[1]) renderPdf(pieces[1]);
  else if (pieces[0] === "apropos") renderAbout();
  else renderHome();
}

function openDialog(title, html) {
  $("#dialogTitle").textContent = title;
  $("#dialogContent").innerHTML = html;
  const dialog = $("#appDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}
function closeDialog() {
  const dialog = $("#appDialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

async function shareApp() {
  const data = {
    title: APP_NAME,
    text: "Découvre Académique : des formations PDF pour apprendre Python, l’IA et le développement Discord.",
    url: location.href.split("#")[0]
  };
  try {
    if (navigator.share) await navigator.share(data);
    else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(data.url);
      showToast("Lien de l’application copié.");
    } else {
      openDialog("Partager Académique", '<p>Copie ce lien pour partager l’application :</p><p><code>' + escapeHtml(data.url) + '</code></p>');
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Le partage n’a pas pu être ouvert.");
  }
}

function handleAction(action, element) {
  if (action === "close-dialog") return closeDialog();
  if (action === "privacy") {
    openDialog("Politique de confidentialité",
      '<h3>Données enregistrées</h3><p>Académique conserve uniquement sur cet appareil les documents marqués comme terminés. Cette version ne demande pas de compte et ne transmet pas de profil personnel à un serveur.</p>' +
      '<h3>Stockage local</h3><p>La progression est enregistrée dans le stockage local du navigateur. Effacer les données du navigateur ou changer d’appareil peut supprimer cette progression.</p>' +
      '<h3>Documents</h3><p>Les PDF sont servis depuis le dépôt public du projet. Leur consultation ou leur téléchargement nécessite une première connexion, sauf lorsqu’ils sont déjà disponibles dans le cache ou dans les téléchargements de l’appareil.</p>' +
      '<p>Cette page décrit le fonctionnement actuel de l’application. Elle devra être revue si des comptes, statistiques ou services externes sont ajoutés.</p>');
    return;
  }
  if (action === "rate") {
    openDialog("Évaluer l’application", "<p>La fiche Google Play n’est pas encore publiée. Le lien d’évaluation sera ajouté lorsque l’application sera disponible sur le Play Store.</p>");
    return;
  }
  if (action === "share") return shareApp();
  if (action === "other-apps") { window.open("https://github.com/archange22", "_blank", "noopener,noreferrer"); return; }
  if (action === "contact") { window.open("https://github.com/archange22/Python/issues/new", "_blank", "noopener,noreferrer"); return; }
  if (action === "toggle-complete") {
    const id = element.dataset.course;
    if (!id) return;
    if (appState.completed.includes(id)) appState.completed = appState.completed.filter((item) => item !== id);
    else appState.completed.push(id);
    saveState();
    render();
    showToast(appState.completed.includes(id) ? "Document marqué comme terminé." : "Progression mise à jour.");
  }
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    location.hash = "#" + routeLink.dataset.route;
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action, actionButton);
});
window.addEventListener("hashchange", render);
$("#appDialog").addEventListener("click", (event) => {
  if (event.target === $("#appDialog")) closeDialog();
});
render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Le mode hors connexion n'a pas pu être initialisé.", error);
  }));
}