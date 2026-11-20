const APP_NAME = "Académique";
const CONTACT_EMAIL = "archangekouaho@gmail.com";
const STORAGE_KEY = "academique-v1";
const $ = (selector, root = document) => root.querySelector(selector);

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const subjects = [
  {
    id: "python", title: "Python", icon: "🐍",
    description: "Apprends à programmer étape par étape.",
    detail: "Découvre Python progressivement avec des explications simples, des exemples et de la pratique.",
    courses: [
      { id: "py01", title: "Les bases de Python", description: "Découvrir Python, préparer Pydroid 3, écrire ses premières instructions et comprendre print().", level: "Débutant", duration: "Leçon 01", available: true, reader: "./pdf/lecon-01-reader.html", pdf: "./pdf/lecon-01-python-school.pdf" },
      { id: "py02", title: "Les variables et les types de données", description: "Créer des variables et comprendre str, int, float et bool.", level: "Débutant", duration: "Leçon 02", available: false, status: "À préparer" },
      { id: "py03", title: "Les opérations et les expressions", description: "Calculs, opérateurs, priorités et arrondis.", level: "Débutant", duration: "Leçon 03", available: false, status: "À préparer" },
      { id: "py04", title: "Saisir et convertir des données", description: "Utiliser input(), int(), float() et str().", level: "Débutant", duration: "Leçon 04", available: false, status: "À préparer" }
    ],
    roadmap: ["Conditions et opérateurs logiques", "Boucles for et while", "Listes et dictionnaires", "Fonctions et modules", "Fichiers et gestion des erreurs", "Projets pratiques"]
  },
  {
    id: "ia", title: "Intelligence artificielle", icon: "✦",
    description: "Comprends les bases et découvre comment construire une IA.",
    detail: "Découvre les notions essentielles, les données et les méthodes qui permettent de construire une intelligence artificielle.",
    courses: [],
    roadmap: ["Comprendre l'intelligence artificielle", "Python pour l'IA", "Données et préparation des jeux de données", "Machine Learning", "Réseaux de neurones", "Construire un assistant intelligent"]
  },
  {
    id: "discord", title: "Discord", icon: "◈",
    description: "Crée des bots et automatise ton serveur Discord.",
    detail: "Apprends à développer des bots Discord, gérer les commandes et automatiser les tâches d’un serveur.",
    courses: [],
    roadmap: ["Découvrir l'API Discord", "Préparer Python et son environnement", "Créer un premier bot", "Commandes et événements", "Rôles, permissions et modération", "Bases de données et hébergement"]
  }
];

let appState = { completed: [] };
let deferredInstallPrompt = null;

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
    const course = subject.courses.find((item) => item.id === id);
    if (course) return { subject, course };
  }
  return null;
}

function isInstalledApp() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

function showInstallOption() {
  const isSecureWebsite = location.protocol === "https:" ||
    (location.hostname === "localhost" && location.protocol === "http:");
  return isSecureWebsite && !isInstalledApp();
}

function renderHome() {
  const cards = subjects.map((subject) => {
    const availableCount = subject.courses.filter((course) => course.available).length;
    const availability = availableCount
      ? availableCount + (availableCount > 1 ? " cours disponibles" : " cours disponible")
      : "Formation en préparation";

    return '<a class="subject-card subject-' + subject.id + '" href="#matiere/' + subject.id + '">' +
      '<div class="subject-card-top"><span class="subject-icon" aria-hidden="true">' + subject.icon + '</span>' +
      '<span class="subject-arrow" aria-hidden="true">↗</span></div>' +
      '<h3>' + escapeHtml(subject.title) + '</h3>' +
      '<p>' + escapeHtml(subject.description) + '</p>' +
      '<div class="subject-card-bottom"><span>' + escapeHtml(availability) + '</span><span aria-hidden="true">→</span></div>' +
      '</a>';
  }).join("");

  $("#appView").innerHTML =
    '<section class="home-page" aria-labelledby="welcomeHeading">' +
      '<header class="home-intro"><span class="eyebrow">TON ESPACE D’APPRENTISSAGE</span>' +
        '<h1 id="welcomeHeading">Apprends à coder,<br><span>un pas après l’autre.</span></h1>' +
        '<p>Choisis une formation, avance à ton rythme et mets tes connaissances en pratique.</p>' +
      '</header>' +
      '<div class="section-heading"><div><span class="eyebrow">FORMATIONS</span><h2>Que veux-tu apprendre ?</h2></div>' +
      '<span class="section-count">03</span></div>' +
      '<div class="subject-grid">' + cards + '</div>' +
      '<footer class="app-footer">© ' + new Date().getFullYear() + ' Académique</footer>' +
    '</section>';
  updateNavigation("accueil");
}

function renderSubject(subjectId) {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) {
    location.hash = "#accueil";
    return;
  }

  const available = subject.courses.filter((course) => course.available);
  const pending = subject.courses.filter((course) => !course.available);
  const completedCount = available.filter((course) => appState.completed.includes(course.id)).length;

  const availableMarkup = available.length
    ? '<div class="course-list">' + available.map((course) => {
        const done = appState.completed.includes(course.id);
        return '<article class="course-card"><div class="course-card-main">' +
          '<span class="course-number">' + escapeHtml(course.duration) + '</span>' +
          '<h3>' + escapeHtml(course.title) + '</h3><p>' + escapeHtml(course.description) + '</p>' +
          '<div class="course-details"><span class="pill">' + escapeHtml(course.level) + '</span>' +
          (done ? '<span class="pill pill-done">✓ Terminé</span>' : '') + '</div></div>' +
          '<a class="course-action" href="#cours/' + course.id + '">Lire le cours <span aria-hidden="true">→</span></a></article>';
      }).join("") + '</div>'
    : '<div class="empty-state"><h3>Les cours de cette formation sont en préparation.</h3>' +
      '<p>Les leçons seront ajoutées ici au fur et à mesure de leur création.</p></div>';

  const pendingMarkup = pending.length
    ? '<div class="course-list">' + pending.map((course) =>
        '<article class="course-card course-pending"><div class="course-card-main">' +
        '<span class="course-number">' + escapeHtml(course.duration) + '</span>' +
        '<h3>' + escapeHtml(course.title) + '</h3><p>' + escapeHtml(course.description) + '</p>' +
        '<div class="course-details"><span class="pill">' + escapeHtml(course.level) + '</span>' +
        '<span class="pill pill-muted">' + escapeHtml(course.status) + '</span></div></div>' +
        '<span class="coming-soon">À venir</span></article>'
      ).join("") + '</div>'
    : "";

  const roadmapMarkup = subject.roadmap.map((item, index) =>
    '<div class="roadmap-item"><span class="roadmap-number">' + String(index + 1).padStart(2, "0") + '</span>' +
    '<span>' + escapeHtml(item) + '</span></div>'
  ).join("");

  $("#appView").innerHTML =
    '<section class="subject-page"><a class="back-link" href="#accueil">← Toutes les formations</a>' +
      '<header class="subject-hero subject-hero-' + subject.id + '">' +
        '<div><span class="eyebrow">FORMATION</span><h1>' + escapeHtml(subject.title) + '</h1>' +
        '<p>' + escapeHtml(subject.detail) + '</p></div><span class="subject-hero-icon" aria-hidden="true">' + subject.icon + '</span>' +
      '</header>' +
      '<section class="content-panel"><div class="panel-heading-row"><div><span class="eyebrow">BIBLIOTHÈQUE</span>' +
        '<h2>Les cours</h2></div><span class="section-count">' + String(available.length).padStart(2, "0") + '</span></div>' +
        (available.length ? '<p class="panel-subtitle">' + completedCount + ' cours terminé' + (completedCount > 1 ? 's' : '') + ' sur ' + available.length + '.</p>' : '') +
        availableMarkup + (pendingMarkup ? '<div class="upcoming-heading">Prochaines leçons</div>' + pendingMarkup : '') +
      '</section>' +
      '<section class="content-panel"><div class="panel-heading-row"><div><span class="eyebrow">PARCOURS</span><h2>Programme</h2></div></div>' +
        '<div class="roadmap">' + roadmapMarkup + '</div>' +
      '</section>' +
      '<footer class="app-footer"><span>© ' + new Date().getFullYear() + ' Académique</span><a href="#apropos">Contact</a></footer>' +
    '</section>';
  updateNavigation("accueil");
}

function renderCourse(courseId) {
  const result = courseById(courseId);
  if (!result || !result.course.available || (!result.course.pdf && !result.course.reader)) {
    location.hash = "#accueil";
    return;
  }

  const { subject, course } = result;
  const done = appState.completed.includes(course.id);
  const installed = isInstalledApp();
  const useAcademiqueReader = installed && Boolean(course.reader);
  const fileName = course.pdf ? course.pdf.split("/").pop() : "";
  const downloadAction = course.pdf
    ? '<a class="secondary-action" href="' + escapeHtml(course.pdf) + '" download="' + escapeHtml(fileName) + '">Télécharger le PDF</a>'
    : "";
  const pdfNativeActions = course.pdf
    ? '<div class="native-pdf-panel"><span class="eyebrow">LECTURE PDF DU NAVIGATEUR</span>' +
      '<h2>Ouvrir le document</h2>' +
      '<p>Le lecteur intégré Académique est réservé à l’application installée. Depuis le site, le document s’ouvre avec le lecteur PDF déjà disponible dans ton navigateur.</p>' +
      '<div class="native-pdf-actions"><a class="secondary-action primary-action" href="' + escapeHtml(course.pdf) + '" target="_blank" rel="noopener">Ouvrir le PDF</a>' +
      '<a class="secondary-action" href="' + escapeHtml(course.pdf) + '" download="' + escapeHtml(fileName) + '">Télécharger le PDF</a></div></div>'
    : '<p class="reader-help">Le fichier PDF de cette leçon sera bientôt disponible.</p>';
  const readerUrl = useAcademiqueReader
    ? course.reader + "?subject=" + encodeURIComponent(subject.id) + "&pdf=" + encodeURIComponent(course.pdf || "")
    : "";

  $( "#appView" ).innerHTML =
    '<section class="reader-page"><a class="back-link" href="#matiere/' + subject.id + '">← Retour à ' + escapeHtml(subject.title) + '</a>' +
      '<header class="page-heading"><span class="eyebrow">LEÇON</span><h1>' + escapeHtml(course.title) + '</h1>' +
      '<p>' + escapeHtml(course.description) + '</p></header>' +
      '<div class="pdf-toolbar">' + downloadAction +
        '<button class="secondary-action primary-action" type="button" data-action="toggle-complete" data-course="' + course.id + '">' +
        (done ? "✓ Terminé" : "Marquer comme terminé") + '</button></div>' +
      (done ? '<p class="completed-message">Le cours est marqué comme terminé sur cet appareil.</p>' : '') +
      (useAcademiqueReader
        ? '<div class="reader-mode-label">Lecteur Académique · Application installée</div><iframe class="reader-frame" src="' + escapeHtml(readerUrl) + '" title="Lecture du cours : ' + escapeHtml(course.title) + '" allow="clipboard-read; clipboard-write"></iframe>'
        : pdfNativeActions) +
      '<p class="reader-help">' + (useAcademiqueReader
        ? "Ta progression de lecture, tes préférences d’affichage et ta dernière position sont enregistrées sur cet appareil."
        : "Le lecteur personnalisé ne se lance pas depuis le site web. Ouvre le PDF pour utiliser le lecteur de ton navigateur.") + '</p>' +
    '</section>';
  updateNavigation("accueil");
}

function renderAbout() {
  const installMarkup = showInstallOption()
    ? '<section class="install-card"><div class="install-icon" aria-hidden="true">↓</div>' +
      '<div class="install-copy"><span class="eyebrow">SUR LE SITE WEB</span><h2>Installer Académique</h2>' +
      '<p>Ajoute l’application à l’écran d’accueil de ton appareil pour la retrouver facilement.</p></div>' +
      '<button class="install-button" type="button" data-action="install-app">' +
      (deferredInstallPrompt ? "Installer maintenant" : "Installer") + ' <span aria-hidden="true">↗</span></button></section>'
    : "";

  $("#appView").innerHTML =
    '<section class="about-page"><header class="about-hero"><span class="about-mark" aria-hidden="true">A</span>' +
      '<span class="eyebrow">À PROPOS</span><h1>Académique</h1>' +
      '<p>Une application pour apprendre Python, l’intelligence artificielle et le développement Discord, à ton rythme.</p></header>' +
      installMarkup +
      '<section class="contact-card"><span class="contact-icon" aria-hidden="true">✉</span>' +
        '<div class="contact-copy"><span class="eyebrow">NOUS CONTACTER</span><h2>Une question ?</h2>' +
        '<p>Écris-nous pour signaler un problème ou proposer une amélioration.</p>' +
        '<a href="mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent("Contact depuis Académique") + '">' + CONTACT_EMAIL + '</a></div>' +
      '</section>' +
      '<button class="privacy-link" type="button" data-action="privacy"><span>Confidentialité et données</span><span aria-hidden="true">→</span></button>' +
      '<footer class="app-footer">© ' + new Date().getFullYear() + ' Académique</footer>' +
    '</section>';
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
  const [page, id] = route.split("/");
  if (page === "matiere" && id) renderSubject(id);
  else if (page === "cours" && id) renderCourse(id);
  else if (page === "apropos") renderAbout();
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

function installInstructions() {
  const userAgent = navigator.userAgent.toLowerCase();
  let instructions;

  if (/iphone|ipad|ipod/.test(userAgent)) {
    instructions = "Dans Safari, appuie sur le bouton Partager, puis choisis « Sur l’écran d’accueil » et confirme avec « Ajouter ».";
  } else if (/android/.test(userAgent)) {
    instructions = "Dans Chrome, ouvre le menu ⋮ en haut à droite, puis choisis « Installer l’application ». Si cette option n’apparaît pas, sélectionne « Ajouter à l’écran d’accueil ».";
  } else {
    instructions = "Dans Chrome ou Edge, utilise l’icône d’installation dans la barre d’adresse. Tu peux aussi ouvrir le menu du navigateur et choisir « Installer Académique ».";
  }

  openDialog("Installer Académique",
    '<p>' + instructions + '</p>' +
    '<p class="install-note">Académique s’installe depuis le navigateur sous forme d’application web (PWA). Il n’existe pas encore de fichier APK séparé à télécharger.</p>');
}

async function installApp() {
  if (isInstalledApp()) {
    showToast("Académique est déjà installée.");
    return;
  }

  if (!deferredInstallPrompt) {
    installInstructions();
    return;
  }

  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice && choice.outcome === "accepted") {
      showToast("Installation lancée.");
    } else {
      showToast("Installation annulée.");
    }
    if (location.hash === "#apropos") renderAbout();
  } catch (error) {
    console.warn("La fenêtre d’installation n’a pas pu être ouverte.", error);
    installInstructions();
  }
}

function handleAction(action, element) {
  if (action === "close-dialog") {
    closeDialog();
    return;
  }

  if (action === "privacy") {
    openDialog("Confidentialité et données",
      '<h3>Progression</h3><p>Les cours marqués comme terminés sont enregistrés uniquement dans le stockage local de cet appareil.</p>' +
      '<h3>Compte</h3><p>Cette version ne demande pas de compte et ne synchronise pas la progression entre plusieurs appareils.</p>' +
      '<h3>Documents</h3><p>Les documents de formation sont servis depuis le dépôt du projet. Une connexion peut être nécessaire pour leur premier chargement.</p>');
    return;
  }

  if (action === "install-app") {
    installApp();
    return;
  }

  if (action === "toggle-complete") {
    const id = element.dataset.course;
    if (!id) return;

    if (appState.completed.includes(id)) {
      appState.completed = appState.completed.filter((item) => item !== id);
    } else {
      appState.completed.push(id);
    }

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

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (location.hash === "#apropos") renderAbout();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (location.hash === "#apropos") renderAbout();
});

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || !isInstalledApp()) return;
  const frame = $(".reader-frame");
  if (!frame || event.source !== frame.contentWindow || !event.data) return;

  if (event.data.type === "ACADEMIQUE_READER_READY") {
    frame.contentWindow.postMessage({ type: "ACADEMIQUE_READER_UNLOCK" }, location.origin);
    return;
  }

  if (event.data.type === "ACADEMIQUE_READER_BACK") {
    const subjectId = subjects.some((subject) => subject.id === event.data.subject)
      ? event.data.subject
      : "python";
    location.hash = "#matiere/" + subjectId;
  }
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