const APP_NAME = "Académique";
const CONTACT_EMAIL = "archangekouaho@gmail.com";
const STORAGE_KEY = "academique-v1";
const $ = (selector, root = document) => root.querySelector(selector);

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const subjects = [
  {
    id: "python", title: "Python", icon: "🐍", short: "PY",
    description: "Passe de tes premières lignes de code à la création de vrais petits programmes.",
    detail: "Apprends les bases pas à pas, comprends chaque instruction et entraîne-toi avec des exemples concrets.",
    courses: [
      { id: "py01", title: "Les bases de Python", description: "Découvrir Python, préparer Pydroid 3, écrire ses premières instructions et comprendre print().", level: "Débutant", duration: "Leçon 01", available: true, status: "Cours complet disponible", reader: "./pdf/lecon-01-reader.html" },
      { id: "py02", title: "Les variables et les types de données", description: "Créer des variables et comprendre str, int, float et bool.", level: "Débutant", duration: "Leçon 02", available: false, status: "Nouveau PDF à créer" },
      { id: "py03", title: "Les opérations et les expressions", description: "Calculs, opérateurs, priorités et arrondis.", level: "Débutant", duration: "Leçon 03", available: false, status: "Nouveau PDF à créer" },
      { id: "py04", title: "Saisir et convertir des données", description: "Utiliser input(), int(), float() et str().", level: "Débutant", duration: "Leçon 04", available: false, status: "Nouveau PDF à créer" }
    ],
    roadmap: ["Conditions et opérateurs logiques", "Boucles for et while", "Listes et dictionnaires", "Fonctions et modules", "Fichiers et gestion des erreurs", "Projets pratiques"]
  },
  {
    id: "ia", title: "Intelligence artificielle", icon: "✦", short: "IA",
    description: "Explore les mécanismes derrière les assistants intelligents et les modèles d’IA.",
    detail: "Découvre les notions essentielles, les données et les méthodes qui permettent de construire une intelligence artificielle.",
    courses: [],
    roadmap: ["Comprendre l'intelligence artificielle", "Python pour l'IA", "Données et préparation des jeux de données", "Machine Learning", "Réseaux de neurones", "Construire un assistant intelligent"]
  },
  {
    id: "discord", title: "Discord", icon: "◈", short: "DC",
    description: "Apprends à programmer des bots, automatiser des tâches et organiser des communautés.",
    detail: "Construis progressivement ton bot Discord et découvre les commandes, événements et outils utiles.",
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (error) {
    showToast("La progression n'a pas pu être enregistrée sur cet appareil.");
  }
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
  const cards = subjects.map((subject, index) => {
    const availableCount = subject.courses.filter((course) => course.available).length;
    const courseCount = subject.courses.length;
    const info = availableCount
      ? availableCount + (availableCount > 1 ? " cours disponibles" : " cours disponible")
      : "Parcours en préparation";
    const descriptions = {
      python: "Apprends à programmer étape par étape.",
      ia: "Comprends et construis des systèmes intelligents.",
      discord: "Crée ton propre bot et automatise ton serveur."
    };
    return '<a class="subject-card subject-' + subject.id + '" href="#matiere/' + subject.id + '" style="--card-index:' + index + '">' +
      '<div class="subject-card-top"><span class="subject-icon" aria-hidden="true">' + subject.icon + '</span>' +
      '<span class="subject-arrow" aria-hidden="true">↗</span></div>' +
      '<div class="subject-card-body"><span class="subject-kicker">' + escapeHtml(subject.short) + ' · FORMATION</span>' +
      '<h3 class="subject-name">' + escapeHtml(subject.title) + '</h3>' +
      '<p class="subject-description">' + escapeHtml(descriptions[subject.id] || subject.description) + '</p></div>' +
      '<div class="subject-card-bottom"><span>' + escapeHtml(info) + '</span><span class="card-chevron" aria-hidden="true">→</span></div>' +
      '</a>';
  }).join("");

  $("#appView").innerHTML =
    '<section class="home-page" aria-labelledby="welcomeHeading">' +
      '<div class="welcome-panel">' +
        '<div class="welcome-copy"><span class="eyebrow"><span class="eyebrow-line"></span> TON ESPACE D’APPRENTISSAGE</span>' +
        '<h1 id="welcomeHeading">Chaque idée commence<br>par <span>une première ligne.</span></h1>' +
        '<p>Prends le temps de comprendre, avance à ton rythme et transforme ce que tu apprends en projets concrets.</p>' +
        '<a class="primary-link" href="#matiere/python">Commencer à apprendre <span aria-hidden="true">↗</span></a>' +
        '<div class="welcome-foot"><span><i class="tiny-check">✓</i> Des explications progressives</span><span><i class="tiny-check">✓</i> Des exercices intégrés aux cours</span></div>' +
        '</div>' +
        '<div class="welcome-art" aria-hidden="true"><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>' +
          '<div class="art-core"><span class="art-bracket">&lt;/&gt;</span><span class="art-core-label">LEARN<br>BY DOING</span></div>' +
          '<span class="art-spark spark-one">✦</span><span class="art-spark spark-two">+</span><span class="art-spark spark-three">·</span></div>' +
      '</div>' +
      '<div class="section-heading"><div><span class="eyebrow">CHOISIS TON PARCOURS</span><h2>Qu’aimerais-tu apprendre ?</h2>' +
      '<p>Trois domaines pour développer tes compétences numériques.</p></div><span class="section-count">03 <i>PARCOURS</i></span></div>' +
      '<div class="subject-grid">' + cards + '</div>' +
      '<section class="learning-note"><div class="note-icon" aria-hidden="true">✎</div><div><span class="eyebrow">UNE MÉTHODE SIMPLE</span>' +
        '<h2>Comprendre avant de mémoriser.</h2><p>Chaque formation est conçue pour expliquer les notions clairement, montrer des exemples et proposer des exercices avec leurs corrections dans le même document.</p></div>' +
      '</section>' +
      '<footer class="app-footer"><span>© ' + new Date().getFullYear() + ' Académique</span><span>Fait pour apprendre à son rythme.</span></footer>' +
    '</section>';
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
        return '<article class="course-card"><div class="course-card-main"><span class="course-number">' + escapeHtml(course.duration) + '</span>' +
          '<h3 class="course-title">' + escapeHtml(course.title) + '</h3><p class="course-description">' + escapeHtml(course.description) + '</p>' +
          '<div class="course-details"><span class="pill">' + escapeHtml(course.level) + '</span>' +
          (done ? '<span class="pill pill-done">✓ Terminé</span>' : '') + '</div></div>' +
          '<a class="course-action" href="#cours/' + course.id + '">Ouvrir le cours <span aria-hidden="true">→</span></a></article>';
      }).join("") + '</div>'
    : '<div class="empty-state"><span class="empty-state-icon" aria-hidden="true">✎</span><div><h3>Les premiers cours arrivent.</h3>' +
      '<p>Le parcours est structuré. Les PDF seront publiés avec des explications détaillées, des exemples, des exercices et leurs corrections.</p></div></div>';

  const pendingMarkup = pending.length
    ? '<div class="course-list">' + pending.map((course) =>
        '<article class="course-card course-pending"><div class="course-card-main"><span class="course-number">' + escapeHtml(course.duration) + '</span>' +
        '<h3 class="course-title">' + escapeHtml(course.title) + '</h3><p class="course-description">' + escapeHtml(course.description) + '</p>' +
        '<div class="course-details"><span class="pill">' + escapeHtml(course.level) + '</span><span class="pill pill-muted">' + escapeHtml(course.status) + '</span></div></div>' +
        '<span class="coming-soon">À venir</span></article>'
      ).join("") + '</div>'
    : '';

  const roadmapMarkup = subject.roadmap.map((item, index) =>
    '<div class="roadmap-item"><span class="roadmap-number">' + String(index + 1).padStart(2, "0") + '</span>' +
    '<span class="roadmap-label">' + escapeHtml(item) + '</span><span class="roadmap-arrow" aria-hidden="true">↗</span></div>'
  ).join("");

  $("#appView").innerHTML =
    '<section class="subject-page"><a class="back-link" href="#accueil"><span aria-hidden="true">←</span> Tous les parcours</a>' +
      '<header class="subject-hero subject-hero-' + subject.id + '"><div class="subject-hero-copy"><span class="eyebrow">PARCOURS D’APPRENTISSAGE</span>' +
      '<h1>' + escapeHtml(subject.title) + '</h1><p>' + escapeHtml(subject.detail) + '</p></div>' +
      '<div class="subject-hero-icon" aria-hidden="true">' + subject.icon + '</div></header>' +
      '<div class="content-panel"><div class="panel-heading-row"><div><span class="eyebrow">TA BIBLIOTHÈQUE</span><h2 class="panel-heading">Les cours</h2></div>' +
      '<span class="section-count">' + String(available.length).padStart(2, "0") + ' <i>DISPONIBLE' + (available.length > 1 ? 'S' : '') + '</i></span></div>' +
      (available.length ? '<p class="panel-subtitle">' + completedCount + ' cours terminé' + (completedCount > 1 ? 's' : '') + ' sur ' + available.length + '.</p>' : '') +
      availableMarkup + (pendingMarkup ? '<div class="upcoming-heading"><span class="eyebrow">À DÉCOUVRIR ENSUITE</span></div>' + pendingMarkup : '') +
      '</div>' +
      '<div class="content-panel roadmap-panel"><div class="panel-heading-row"><div><span class="eyebrow">VUE D’ENSEMBLE</span><h2 class="panel-heading">Le programme</h2></div></div>' +
      '<div class="roadmap">' + roadmapMarkup + '</div></div>' +
      '<footer class="app-footer"><span>© ' + new Date().getFullYear() + ' Académique</span><a href="#apropos">Nous contacter</a></footer>' +
    '</section>';
  updateNavigation("accueil");
}

function renderPdf(courseId) {
  const result = courseById(courseId);
  if (!result || !result.course.available || (!result.course.pdf && !result.course.reader)) {
    location.hash = "#accueil";
    return;
  }
  const { subject, course } = result;
  const done = appState.completed.includes(course.id);
  const resource = course.reader || course.pdf;
  const fileName = course.pdf ? course.pdf.split("/").pop() : "";
  const downloadAction = course.pdf
    ? '<a class="secondary-action" href="' + escapeHtml(course.pdf) + '" download="' + escapeHtml(fileName) + '">↓ Télécharger le PDF</a>'
    : '';

  $("#appView").innerHTML =
    '<section class="reader-page"><a class="back-link" href="#matiere/' + subject.id + '"><span aria-hidden="true">←</span> Retour à ' + escapeHtml(subject.title) + '</a>' +
      '<header class="page-heading"><span class="eyebrow">LECTURE DU COURS</span><h1>' + escapeHtml(course.title) + '</h1><p>' + escapeHtml(course.description) + '</p></header>' +
      '<div class="pdf-toolbar"><span class="pill">' + (course.pdf ? 'Document PDF' : 'Lecture intégrée') + ' · ' + escapeHtml(course.level) + '</span><div class="pdf-toolbar-actions">' +
      downloadAction +
      '<button class="secondary-action primary-action" type="button" data-action="toggle-complete" data-course="' + course.id + '">' +
      (done ? '✓ Terminé' : 'Marquer comme terminé') + '</button></div></div>' +
      (done ? '<p class="completed-message">Ce document est marqué comme terminé sur cet appareil.</p>' : '') +
      '<iframe class="reader-frame" src="' + escapeHtml(resource) + (course.pdf && !course.reader ? '#toolbar=1&navpanes=0' : '') + '" title="Lecture du cours : ' + escapeHtml(course.title) + '"></iframe>' +
      '<p class="reader-help">' + (course.pdf ? 'Tu peux télécharger ce PDF pour le consulter hors connexion.' : 'Le cours se lit directement ici. Le bouton « Imprimer / Enregistrer en PDF » est disponible en haut du document.') + '</p></section>';
  updateNavigation("accueil");
}

function renderAbout() {
  $("#appView").innerHTML =
    '<section class="about-page"><header class="about-hero"><span class="about-mark" aria-hidden="true">A</span>' +
      '<span class="eyebrow">À PROPOS DE TON APPLICATION</span><h1>Apprendre, avec<br><span>clarté et méthode.</span></h1>' +
      '<p>Académique rassemble des parcours pratiques pour apprendre à programmer et mieux comprendre les technologies numériques.</p></header>' +
      '<div class="about-feature-grid"><article class="about-feature"><span>01</span><h2>Des cours structurés</h2><p>Des notions expliquées progressivement, sans brûler les étapes.</p></article>' +
      '<article class="about-feature"><span>02</span><h2>De la pratique</h2><p>Des exemples, exercices et corrections réunis dans les PDF.</p></article></div>' +
      '<section class="about-contact"><div class="contact-icon" aria-hidden="true">✉</div><div class="contact-copy"><span class="eyebrow">UNE QUESTION ? UN RETOUR ?</span>' +
      '<h2>Parlons-en.</h2><p>Une suggestion ou un problème à signaler ? Écris-nous directement par e-mail.</p>' +
      '<a class="contact-email" href="mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent("Contact depuis Académique") + '">' + CONTACT_EMAIL + '</a></div>' +
      '<button class="copy-email" type="button" data-action="copy-email" aria-label="Copier l’adresse e-mail">Copier</button></section>' +
      '<div class="about-links">' +
      '<button class="about-menu-item" type="button" data-action="privacy"><span class="about-menu-icon">◌</span><span class="about-menu-copy"><b>Confidentialité</b><small>Comment tes données sont utilisées</small></span><span class="about-menu-arrow">↗</span></button>' +
      '<button class="about-menu-item" type="button" data-action="share"><span class="about-menu-icon">↗</span><span class="about-menu-copy"><b>Partager l’application</b><small>Faire découvrir Académique</small></span><span class="about-menu-arrow">↗</span></button>' +
      '<button class="about-menu-item" type="button" data-action="other-apps"><span class="about-menu-icon">⌘</span><span class="about-menu-copy"><b>Autres projets</b><small>Découvrir les projets GitHub</small></span><span class="about-menu-arrow">↗</span></button>' +
      '<button class="about-menu-item" type="button" data-action="rate"><span class="about-menu-icon">☆</span><span class="about-menu-copy"><b>Évaluer l’application</b><small>La fiche Play Store sera ajoutée plus tard</small></span><span class="about-menu-arrow">↗</span></button>' +
      '</div><footer class="app-footer"><span>© ' + new Date().getFullYear() + ' Académique</span><span>Merci de faire partie du parcours.</span></footer></section>';
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
    text: "Découvre Académique : des formations pour apprendre Python, l’IA et le développement Discord.",
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

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    showToast("Adresse e-mail copiée.");
  } catch (error) {
    openDialog("Adresse e-mail", '<p>Voici l’adresse à copier :</p><p class="dialog-email">' + CONTACT_EMAIL + '</p><a class="primary-link dialog-mail-link" href="mailto:' + CONTACT_EMAIL + '">Écrire un e-mail ↗</a>');
  }
}

function handleAction(action, element) {
  if (action === "close-dialog") return closeDialog();
  if (action === "privacy") {
    openDialog("Confidentialité",
      '<h3>Données enregistrées</h3><p>Académique conserve uniquement sur cet appareil les documents marqués comme terminés. Cette version ne demande pas de compte et ne transmet pas de profil personnel à un serveur.</p>' +
      '<h3>Stockage local</h3><p>La progression est enregistrée dans le stockage local du navigateur. Effacer les données du navigateur ou changer d’appareil peut supprimer cette progression.</p>' +
      '<h3>Documents</h3><p>Les PDF sont servis depuis le dépôt du projet. Leur consultation ou leur téléchargement nécessite une première connexion, sauf lorsqu’ils sont déjà disponibles dans le cache ou dans les téléchargements de l’appareil.</p>' +
      '<p>Cette page décrit le fonctionnement actuel de l’application. Elle devra être mise à jour si des comptes, statistiques ou services externes sont ajoutés.</p>');
    return;
  }
  if (action === "rate") {
    openDialog("Évaluer l’application", "<p>La fiche Google Play n’est pas encore publiée. Le lien d’évaluation sera ajouté lorsque l’application sera disponible sur le Play Store.</p>");
    return;
  }
  if (action === "share") return shareApp();
  if (action === "copy-email") return copyEmail();
  if (action === "other-apps") {
    window.open("https://github.com/archange22", "_blank", "noopener,noreferrer");
    return;
  }
  if (action === "toggle-complete") {
    const id = element.dataset.course;
    if (!id) return;
    if (appState.completed.includes(id)) appState.completed = appState.completed.filter((item) => item !== id);
    else appState.completed.push(id);
    saveState();
    render();
    showToast(appState.completed.includes(id) ? "Cours marqué comme terminé." : "Progression mise à jour.");
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