const APP_NAME = "Académique";
const CONTACT_EMAIL = "archangekouaho@gmail.com";
const STORAGE_KEY = "academique-v2";
const LEGACY_STORAGE_KEY = "academique-v1";
const $ = (selector, root = document) => root.querySelector(selector);

const subjects = [
  {
    id: "python", title: "Python", icon: "🐍",
    description: "Apprends à programmer étape par étape.",
    detail: "Progresse depuis les premières instructions jusqu'à la création de vrais petits programmes, avec des cours conçus pour pratiquer sur Android ou PC.",
    courses: [
      { id: "py01", title: "Découvrir Python et écrire ses premières instructions", description: "Comprendre Python, préparer Pydroid 3, utiliser print(), écrire des commentaires et réaliser ses premiers exercices.", level: "Débutant", duration: "Leçon 01", available: true, reader: "./pdf/lecon-01-reader.html", pdf: "./pdf/lecon-01-python-school.pdf" },
      { id: "py02", title: "Les variables et les types de données", description: "Créer des variables et comprendre les textes, nombres entiers, nombres décimaux et booléens.", level: "Débutant", duration: "Leçon 02", available: false, status: "À préparer" },
      { id: "py03", title: "Les opérations et les expressions", description: "Effectuer des calculs, utiliser les opérateurs et respecter les priorités.", level: "Débutant", duration: "Leçon 03", available: false, status: "À préparer" },
      { id: "py04", title: "Saisir et convertir des données", description: "Utiliser input(), int(), float() et str() pour rendre un programme interactif.", level: "Débutant", duration: "Leçon 04", available: false, status: "À préparer" }
    ],
    roadmap: ["Conditions et opérateurs logiques", "Boucles for et while", "Listes et dictionnaires", "Fonctions et modules", "Fichiers et gestion des erreurs", "Projets pratiques"]
  },
  {
    id: "ia", title: "Intelligence artificielle", icon: "✦",
    description: "Comprends les bases et découvre comment construire une IA.",
    detail: "Découvre les principes de l'intelligence artificielle, les données, les modèles et les étapes nécessaires pour construire un assistant intelligent.",
    courses: [],
    roadmap: ["Comprendre l'intelligence artificielle", "Python pour l'IA", "Données et préparation des jeux de données", "Machine Learning", "Réseaux de neurones", "Construire un assistant intelligent"]
  },
  {
    id: "discord", title: "Discord", icon: "◈",
    description: "Crée des bots et automatise ton serveur Discord.",
    detail: "Apprends à développer des bots Discord, organiser les commandes et automatiser les tâches d'un serveur.",
    courses: [],
    roadmap: ["Découvrir l'API Discord", "Préparer Python et son environnement", "Créer un premier bot", "Commandes et événements", "Rôles, permissions et modération", "Bases de données et hébergement"]
  }
];

const emptyState = () => ({
  completed: [], favorites: [], notes: {}, history: [], lastCourse: null,
  readerPositions: {}, theme: "dark"
});

function loadState() {
  const state = emptyState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") {
      state.completed = Array.isArray(saved.completed) ? saved.completed : [];
      state.favorites = Array.isArray(saved.favorites) ? saved.favorites : [];
      state.notes = saved.notes && typeof saved.notes === "object" ? saved.notes : {};
      state.history = Array.isArray(saved.history) ? saved.history : [];
      state.lastCourse = typeof saved.lastCourse === "string" ? saved.lastCourse : null;
      state.readerPositions = saved.readerPositions && typeof saved.readerPositions === "object" ? saved.readerPositions : {};
      state.theme = saved.theme === "light" ? "light" : "dark";
    } else {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
      if (Array.isArray(legacy.completed)) state.completed = legacy.completed;
    }
  } catch (error) {
    console.warn("La progression locale n'a pas pu être lue.", error);
  }
  return state;
}

let appState = loadState();
let deferredInstallPrompt = null;
let toastTimer = null;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (error) {
    console.warn("La progression n'a pas pu être enregistrée.", error);
    showToast("Le stockage de cet appareil est plein.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2500);
}

function allCourses() {
  return subjects.flatMap((subject) => subject.courses.map((course) => ({ subject, course })));
}

function courseById(id) {
  return allCourses().find((entry) => entry.course.id === id) || null;
}

function isCompleted(id) {
  return appState.completed.includes(id);
}

function isFavorite(id) {
  return appState.favorites.includes(id);
}

function totalPublishedCourses() {
  return allCourses().filter((entry) => entry.course.available).length;
}

function applyTheme() {
  document.documentElement.dataset.theme = appState.theme;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = appState.theme === "dark" ? "#0b1020" : "#f3f5fb";
  const icon = $("#themeIcon");
  if (icon) icon.textContent = appState.theme === "dark" ? "☼" : "☾";
}

function setActiveNavigation(active) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const selected = link.dataset.nav === active;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderSubjectCards() {
  return subjects.map((subject) => {
    const published = subject.courses.filter((course) => course.available).length;
    const label = published ? published + (published > 1 ? " cours disponibles" : " cours disponible") : "Parcours en préparation";
    return '<a class="subject-card subject-' + subject.id + '" href="#matiere/' + subject.id + '">' +
      '<div class="subject-top"><span class="subject-icon" aria-hidden="true">' + subject.icon + '</span><span class="subject-arrow" aria-hidden="true">↗</span></div>' +
      '<h3>' + escapeHtml(subject.title) + '</h3><p>' + escapeHtml(subject.description) + '</p>' +
      '<div class="subject-card-bottom"><span>' + escapeHtml(label) + '</span><strong>Explorer →</strong></div></a>';
  }).join("");
}

function renderCourseRow(subject, course, options = {}) {
  const done = isCompleted(course.id);
  const favorite = isFavorite(course.id);
  const compact = options.compact === true;
  const action = course.available
    ? '<a class="small-action primary" href="#cours/' + course.id + '">' + (compact ? "Ouvrir" : "Lire le cours") + ' <span aria-hidden="true">→</span></a>'
    : '<span class="pill pill-muted">À préparer</span>';
  const favoriteAction = course.available
    ? '<button class="small-action icon-only ' + (favorite ? "is-favorite" : "") + '" type="button" data-action="toggle-favorite" data-course="' + course.id + '" aria-label="' + (favorite ? "Retirer des favoris" : "Ajouter aux favoris") + '" title="' + (favorite ? "Retirer des favoris" : "Ajouter aux favoris") + '">' + (favorite ? "★" : "☆") + '</button>'
    : "";
  return '<article class="course-row"><div class="course-row-main"><span class="course-index">' + escapeHtml(course.duration.replace("Leçon ", "")) + '</span>' +
    '<div class="course-row-copy"><h3>' + escapeHtml(course.title) + '</h3>' +
    '<p>' + escapeHtml(course.description) + '</p><div class="course-meta">' +
    '<span class="pill">' + escapeHtml(subject.title) + '</span><span class="pill">' + escapeHtml(course.level) + '</span>' +
    (done ? '<span class="pill pill-success">Terminé</span>' : '') +
    (favorite && !compact ? '<span class="pill pill-accent">Favori</span>' : '') +
    '</div></div></div><div class="course-actions">' + favoriteAction + action + '</div></article>';
}

function renderHome() {
  const published = totalPublishedCourses();
  const completed = appState.completed.length;
  const favoriteCount = appState.favorites.length;
  const last = appState.lastCourse ? courseById(appState.lastCourse) : null;
  const continueMarkup = last && last.course.available
    ? '<section class="continue-card"><div class="continue-main"><span class="continue-icon" aria-hidden="true">▶</span><div class="continue-copy"><span class="eyebrow">REPRENDRE</span><h3>' + escapeHtml(last.course.title) + '</h3><p>' + escapeHtml(last.subject.title) + ' · ' + (isCompleted(last.course.id) ? "Cours terminé" : "Dernière lecture") + '</p></div></div><a class="primary-button" href="#cours/' + last.course.id + '">Continuer <span aria-hidden="true">→</span></a></section>'
    : '<section class="continue-card"><div class="continue-main"><span class="continue-icon" aria-hidden="true">✦</span><div class="continue-copy"><span class="eyebrow">TON PARCOURS</span><h3>Ton prochain apprentissage commence ici</h3><p>Choisis une formation et découvre ton premier cours.</p></div></div><a class="primary-button" href="#formations">Explorer <span aria-hidden="true">→</span></a></section>';

  $("#appView").innerHTML =
    '<section class="home-page">' +
      '<header class="home-hero"><div class="home-hero-copy"><span class="eyebrow">TON ESPACE D’APPRENTISSAGE</span>' +
        '<h1>Apprendre.<br>Comprendre.<br><span>Construire.</span></h1>' +
        '<p>Des parcours clairs, des cours progressifs et de la pratique pour transformer ta curiosité en compétences.</p>' +
        '<div class="hero-actions"><a class="primary-button" href="#formations">Découvrir les formations <span aria-hidden="true">→</span></a><a class="secondary-button" href="#bibliotheque">Voir les cours</a></div>' +
      '</div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit orbit-two"></div><div class="core-tile">A</div>' +
        '<div class="hero-orbit-label one"><span>⌘</span> Apprendre</div><div class="hero-orbit-label two"><span>✦</span> Progresser</div></div></header>' +
      '<div class="stats-grid"><div class="stat-card"><span class="stat-icon">▦</span><div><strong class="stat-value">03</strong><span class="stat-label">Formations</span></div></div>' +
      '<div class="stat-card"><span class="stat-icon">✓</span><div><strong class="stat-value">' + completed + '</strong><span class="stat-label">Cours terminés</span></div></div>' +
      '<div class="stat-card"><span class="stat-icon">★</span><div><strong class="stat-value">' + favoriteCount + '</strong><span class="stat-label">Favoris</span></div></div></div>' +
      continueMarkup +
      '<div class="section-heading"><div><span class="eyebrow">APPRENDS À TON RYTHME</span><h2>Choisis ta formation</h2><p>Trois domaines, un seul espace pour progresser.</p></div><a class="text-button" href="#formations">Tout voir →</a></div>' +
      '<div class="subject-grid">' + renderSubjectCards() + '</div>' +
      '<footer class="app-footer">© ' + new Date().getFullYear() + ' Académique · Apprendre avec méthode.</footer>' +
    '</section>';
  setActiveNavigation("accueil");
}

function renderFormations() {
  $("#appView").innerHTML =
    '<section><header class="page-heading"><div><span class="eyebrow">PARCOURS D’APPRENTISSAGE</span><h1>Les formations</h1><p>Choisis un domaine pour consulter son programme et retrouver les leçons disponibles.</p></div><span class="page-count">03</span></header>' +
    '<div class="subject-grid">' + renderSubjectCards() + '</div>' +
    '<section class="panel" style="margin-top:18px"><div class="panel-title-row"><div><span class="eyebrow">PROGRESSION</span><h2>Un apprentissage organisé</h2><p class="panel-subtitle">Chaque formation avance par étapes. Les cours sont publiés lorsqu’ils sont prêts.</p></div></div></section>' +
    '<footer class="app-footer">© ' + new Date().getFullYear() + ' Académique</footer></section>';
  setActiveNavigation("formations");
}

function libraryResultMarkup(query) {
  const normalized = query.trim().toLocaleLowerCase("fr");
  const entries = allCourses().filter(({ subject, course }) => {
    const text = (subject.title + " " + course.title + " " + course.description + " " + course.level).toLocaleLowerCase("fr");
    return !normalized || text.includes(normalized);
  });
  const available = entries.filter(({ course }) => course.available);
  const pending = entries.filter(({ course }) => !course.available);
  let html = "";
  if (available.length) {
    html += '<h2 class="library-group-title">Cours disponibles · ' + available.length + '</h2><div class="course-list">' +
      available.map(({ subject, course }) => renderCourseRow(subject, course)).join("") + '</div>';
  }
  if (pending.length) {
    html += '<h2 class="library-group-title">Cours en préparation · ' + pending.length + '</h2><div class="course-list">' +
      pending.map(({ subject, course }) => renderCourseRow(subject, course)).join("") + '</div>';
  }
  if (!html) html = '<div class="empty-state"><h3>Aucun résultat</h3><p>Essaie un autre mot-clé ou le nom d’une formation.</p></div>';
  return html;
}

function renderLibrary(query = "") {
  $("#appView").innerHTML =
    '<section><header class="page-heading"><div><span class="eyebrow">CENTRE DE RESSOURCES</span><h1>Bibliothèque</h1><p>Retrouve les cours publiés et consulte les prochaines leçons en préparation.</p></div></header>' +
    '<label class="library-search"><span class="library-search-icon" aria-hidden="true">⌕</span><input id="librarySearch" type="search" autocomplete="off" placeholder="Rechercher un cours, un sujet…" value="' + escapeHtml(query) + '" aria-label="Rechercher un cours"></label>' +
    '<div class="library-results" id="libraryResults">' + libraryResultMarkup(query) + '</div>' +
    '<footer class="app-footer">Les cours disponibles sont lisibles directement dans Académique.</footer></section>';
  setActiveNavigation("bibliotheque");
}

function renderSubject(subjectId) {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) {
    location.hash = "#formations";
    return;
  }
  const available = subject.courses.filter((course) => course.available);
  const pending = subject.courses.filter((course) => !course.available);
  const completeCount = available.filter((course) => isCompleted(course.id)).length;
  const availableMarkup = available.length
    ? '<div class="course-list">' + available.map((course) => renderCourseRow(subject, course)).join("") + '</div>'
    : '<div class="empty-state"><h3>Les premiers cours arrivent.</h3><p>Le programme est organisé. Les leçons seront ajoutées ici lorsqu’elles seront prêtes.</p></div>';
  const pendingMarkup = pending.length
    ? '<div class="upcoming-heading">Prochaines leçons</div><div class="course-list">' + pending.map((course) => renderCourseRow(subject, course)).join("") + '</div>'
    : "";
  const roadmap = subject.roadmap.map((item, index) => '<div class="roadmap-item"><span class="roadmap-number">' + String(index + 1).padStart(2, "0") + '</span><span>' + escapeHtml(item) + '</span></div>').join("");

  $("#appView").innerHTML =
    '<section><a class="back-link" href="#formations">← Toutes les formations</a>' +
      '<header class="subject-hero"><div><span class="eyebrow">FORMATION</span><h1>' + escapeHtml(subject.title) + '</h1><p>' + escapeHtml(subject.detail) + '</p></div><span class="subject-hero-icon" aria-hidden="true">' + subject.icon + '</span></header>' +
      '<section class="panel" style="margin-top:16px"><div class="panel-title-row"><div><span class="eyebrow">BIBLIOTHÈQUE</span><h2>Les cours</h2><p class="panel-subtitle">' + completeCount + ' cours terminé' + (completeCount > 1 ? "s" : "") + ' sur ' + available.length + ' disponible' + (available.length > 1 ? "s" : "") + '.</p></div><span class="page-count">' + String(available.length).padStart(2, "0") + '</span></div>' +
        availableMarkup + pendingMarkup + '</section>' +
      '<section class="panel"><div class="panel-title-row"><div><span class="eyebrow">PROGRAMME</span><h2>Parcours prévu</h2></div></div><div class="roadmap">' + roadmap + '</div></section>' +
      '<footer class="app-footer"><a href="#apropos">Contacter Académique</a></footer></section>';
  setActiveNavigation("formations");
}

function renderProgress() {
  const published = totalPublishedCourses();
  const completed = appState.completed.filter((id) => {
    const found = courseById(id);
    return found && found.course.available;
  }).length;
  const percent = published ? Math.round((completed / published) * 100) : 0;
  const favoriteEntries = appState.favorites.map(courseById).filter((entry) => entry && entry.course.available);
  const recentEntries = appState.history.map(courseById).filter((entry) => entry && entry.course.available).slice(0, 5);
  const favoritesMarkup = favoriteEntries.length
    ? '<div class="course-list">' + favoriteEntries.map(({ subject, course }) => renderCourseRow(subject, course, { compact: true })).join("") + '</div>'
    : '<div class="empty-state"><h3>Pas encore de favoris</h3><p>Utilise l’étoile sur un cours pour le retrouver rapidement ici.</p></div>';
  const historyMarkup = recentEntries.length
    ? '<div class="course-list">' + recentEntries.map(({ subject, course }) => renderCourseRow(subject, course, { compact: true })).join("") + '</div>'
    : '<div class="empty-state"><h3>Ton historique apparaîtra ici</h3><p>Ouvre un cours pour commencer à construire ton historique de lecture.</p></div>';

  $("#appView").innerHTML =
    '<section><header class="page-heading"><div><span class="eyebrow">TON ESPACE PERSONNEL</span><h1>Ta progression</h1><p>Retrouve tes cours terminés, tes favoris et tes dernières lectures sur cet appareil.</p></div></header>' +
    '<div class="progress-overview"><section class="progress-card"><span class="eyebrow">COURS TERMINÉS</span><strong class="progress-big">' + completed + '<span style="color:var(--muted);font-size:17px;font-weight:750"> / ' + published + '</span></strong><p>' + percent + '% des cours actuellement publiés terminés.</p><div class="progress-track"><div class="progress-fill" style="width:' + percent + '%"></div></div></section>' +
    '<div class="progress-mini-grid"><div class="progress-mini"><strong>' + favoriteEntries.length + '</strong><span>Favoris enregistrés</span></div><div class="progress-mini"><strong>' + recentEntries.length + '</strong><span>Lectures récentes</span></div></div></div>' +
    '<section class="panel" style="margin-top:16px"><div class="panel-title-row"><div><span class="eyebrow">À RETROUVER</span><h2>Mes favoris</h2></div></div>' + favoritesMarkup + '</section>' +
    '<section class="panel"><div class="panel-title-row"><div><span class="eyebrow">ACTIVITÉ</span><h2>Dernières lectures</h2></div></div>' + historyMarkup + '</section>' +
    '<p class="reader-footnote">Ces informations restent enregistrées dans le navigateur de cet appareil. Elles ne sont pas encore synchronisées entre plusieurs appareils.</p></section>';
  setActiveNavigation("progression");
}

function renderCourse(courseId) {
  const found = courseById(courseId);
  if (!found || !found.course.available || (!found.course.pdf && !found.course.reader)) {
    location.hash = "#bibliotheque";
    return;
  }

  const { subject, course } = found;
  appState.lastCourse = course.id;
  appState.history = [course.id, ...appState.history.filter((id) => id !== course.id)].slice(0, 20);
  saveState();

  const installed = isInstalledApp();
  const useAcademiqueReader = installed && Boolean(course.reader);
  const fileName = course.pdf ? course.pdf.split("/").pop() : "";
  const downloadAction = installed && course.pdf
    ? '<a class="small-action" href="' + escapeHtml(course.pdf) + '" download="' + escapeHtml(fileName) + '">↓ Télécharger le PDF</a>'
    : "";
  const nativePdfPanel = course.pdf
    ? '<section class="native-pdf-panel"><span class="eyebrow">LECTURE PDF DU NAVIGATEUR</span>' +
      '<h2>Ouvrir le document</h2>' +
      '<p>Depuis le site, le cours s’ouvre avec le lecteur PDF de ton navigateur. Dans l’application installée, tu retrouves le lecteur pédagogique Académique.</p>' +
      '<div class="native-pdf-actions"><a class="small-action primary" href="' + escapeHtml(course.pdf) + '" target="_blank" rel="noopener">Ouvrir le PDF ↗</a>' +
      '<a class="small-action" href="' + escapeHtml(course.pdf) + '" download="' + escapeHtml(fileName) + '">Télécharger le PDF ↓</a></div></section>'
    : '<div class="empty-state"><h3>PDF non disponible</h3><p>Le document de cette leçon sera publié ici lorsqu’il sera prêt.</p></div>';
  const readerUrl = useAcademiqueReader
    ? course.reader + "?subject=" + encodeURIComponent(subject.id) + "&pdf=" + encodeURIComponent(course.pdf || "")
    : "";

  $("#appView").innerHTML =
    '<section class="reader-page"><a class="back-link" href="#matiere/' + subject.id + '">← Retour à ' + escapeHtml(subject.title) + '</a>' +
      '<header class="reader-heading"><div><span class="eyebrow">' + escapeHtml(course.duration) + ' · ' + escapeHtml(course.level) + '</span><h1>' + escapeHtml(course.title) + '</h1>' +
      '<p>' + escapeHtml(course.description) + '</p></div></header>' +
      '<div class="reader-toolbar">' + downloadAction +
        '<button class="small-action ' + (isFavorite(course.id) ? "is-favorite" : "") + '" type="button" data-action="toggle-favorite" data-course="' + course.id + '">' + (isFavorite(course.id) ? "★ En favori" : "☆ Ajouter aux favoris") + '</button>' +
        '<button class="small-action" type="button" data-action="edit-note" data-course="' + course.id + '">✎ Mes notes</button>' +
        '<button class="small-action primary" type="button" data-action="toggle-complete" data-course="' + course.id + '">' + (isCompleted(course.id) ? "✓ Terminé" : "Marquer terminé") + '</button>' +
      '</div>' +
      (useAcademiqueReader
        ? '<div class="reader-mode-label">Lecteur Académique · Application installée</div><div class="reader-frame-wrap"><iframe class="reader-frame" id="courseFrame" src="' + escapeHtml(readerUrl) + '" title="Lecture du cours : ' + escapeHtml(course.title) + '" allow="clipboard-read; clipboard-write"></iframe></div>'
        : nativePdfPanel) +
      '<p class="reader-footnote">' + (useAcademiqueReader
        ? "La recherche, les thèmes de lecture, la taille du texte et la reprise de position sont disponibles dans le lecteur."
        : "Le lecteur personnalisé est réservé à l’application installée. Depuis le site, le PDF utilise le lecteur natif du navigateur.") + '</p>' +
      (appState.notes[course.id] ? '<section class="reader-note"><strong>Mes notes</strong><p>' + escapeHtml(appState.notes[course.id]) + '</p></section>' : '') +
    '</section>';
  setActiveNavigation("bibliotheque");
}

function isInstalledApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function canOfferInstall() {
  const secure = location.protocol === "https:" || (location.hostname === "localhost" && location.protocol === "http:");
  return secure && !isInstalledApp();
}

function renderAbout() {
  const install = canOfferInstall()
    ? '<section class="about-card featured"><span class="about-card-icon">↓</span><div class="about-card-copy"><span class="eyebrow">INSTALLATION</span><h2>Installer Académique</h2><p>Ajoute l’application à l’écran d’accueil pour la retrouver comme une application classique.</p></div><button class="small-action primary install-action" type="button" data-action="install-app">' + (deferredInstallPrompt ? "Installer" : "Instructions") + '</button></section>'
    : "";
  $("#appView").innerHTML =
    '<section class="about-layout"><header class="about-hero"><span class="about-mark">A</span><span class="eyebrow">À PROPOS</span><h1>Académique</h1><p>Un espace d’apprentissage consacré à Python, à l’intelligence artificielle et au développement Discord. Des cours progressifs, lisibles et conçus pour la pratique.</p></header>' +
    install +
    '<section class="about-card"><span class="about-card-icon">✉</span><div class="about-card-copy"><span class="eyebrow">CONTACT</span><h2>Une question ou une remarque ?</h2><p>Signale un problème ou propose une amélioration de l’application.</p><a href="mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent("Contact depuis Académique") + '">' + CONTACT_EMAIL + '</a></div></section>' +
    '<section class="about-card"><span class="about-card-icon">◈</span><div class="about-card-copy"><span class="eyebrow">FONCTIONNEMENT</span><h2>Une application installable</h2><p>Académique fonctionne comme une PWA. Les contenus déjà mis en cache peuvent être consultés hors connexion. Aucun compte n’est nécessaire dans cette version.</p></div></section>' +
    '<p class="about-legal">© ' + new Date().getFullYear() + ' Académique. Les progrès, favoris et notes sont conservés localement sur cet appareil. Cette version ne fournit pas encore de fichier APK indépendant.</p></section>';
  setActiveNavigation("");
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
  const agent = navigator.userAgent.toLowerCase();
  let instructions;
  if (/iphone|ipad|ipod/.test(agent)) {
    instructions = "Dans Safari, appuie sur Partager, puis choisis « Sur l’écran d’accueil » et confirme avec « Ajouter ».";
  } else if (/android/.test(agent)) {
    instructions = "Dans Chrome, ouvre le menu ⋮ puis choisis « Installer l’application ». Si cette option n’apparaît pas, sélectionne « Ajouter à l’écran d’accueil ».";
  } else {
    instructions = "Dans Chrome ou Edge, utilise l’icône d’installation dans la barre d’adresse ou le menu du navigateur.";
  }
  openDialog("Installer Académique", '<p>' + instructions + '</p><p class="install-note">Académique s’installe depuis le navigateur sous forme de PWA. Il ne s’agit pas d’un fichier APK indépendant.</p>');
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
    showToast(choice && choice.outcome === "accepted" ? "Installation lancée." : "Installation annulée.");
    if (location.hash === "#apropos") renderAbout();
  } catch (error) {
    console.warn("La fenêtre d’installation n’a pas pu être ouverte.", error);
    installInstructions();
  }
}

function toggleFavorite(courseId) {
  if (!courseById(courseId)) return;
  if (isFavorite(courseId)) {
    appState.favorites = appState.favorites.filter((id) => id !== courseId);
    showToast("Cours retiré des favoris.");
  } else {
    appState.favorites.push(courseId);
    showToast("Cours ajouté aux favoris.");
  }
  saveState();
  render();
}

function toggleComplete(courseId) {
  if (!courseById(courseId)) return;
  if (isCompleted(courseId)) {
    appState.completed = appState.completed.filter((id) => id !== courseId);
    showToast("Cours retiré des cours terminés.");
  } else {
    appState.completed.push(courseId);
    showToast("Cours marqué comme terminé.");
  }
  saveState();
  render();
}

function editNote(courseId) {
  const found = courseById(courseId);
  if (!found) return;
  const current = appState.notes[courseId] || "";
  openDialog("Mes notes — " + found.course.duration,
    '<p>Ces notes sont enregistrées uniquement sur cet appareil.</p><textarea class="note-input" id="noteInput" maxlength="5000" placeholder="Écris ici tes remarques, questions ou points à retenir…">' + escapeHtml(current) + '</textarea><div class="dialog-actions"><button class="small-action" type="button" data-action="close-dialog">Annuler</button><button class="small-action primary" type="button" data-action="save-note" data-course="' + courseId + '">Enregistrer</button></div>');
  $("#noteInput").focus();
}

function handleAction(action, element) {
  const courseId = element.dataset.course;
  if (action === "close-dialog") {
    closeDialog();
  } else if (action === "toggle-theme") {
    appState.theme = appState.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  } else if (action === "toggle-favorite") {
    toggleFavorite(courseId);
  } else if (action === "toggle-complete") {
    toggleComplete(courseId);
  } else if (action === "edit-note") {
    editNote(courseId);
  } else if (action === "save-note") {
    const text = $("#noteInput").value.trim();
    if (text) appState.notes[courseId] = text;
    else delete appState.notes[courseId];
    saveState();
    closeDialog();
    render();
    showToast("Notes enregistrées.");
  } else if (action === "install-app") {
    installApp();
  } else if (action === "privacy") {
    openDialog("Confidentialité et données",
      '<h3>Stockage</h3><p>La progression, les favoris, les notes et la position de lecture sont conservés dans le stockage local du navigateur.</p>' +
      '<h3>Compte et synchronisation</h3><p>Cette version ne demande pas de compte et ne synchronise pas les données entre plusieurs appareils.</p>' +
      '<h3>Documents</h3><p>Les documents sont hébergés avec l’application. Une première connexion peut être nécessaire pour les charger.</p>');
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  handleAction(button.dataset.action, button);
});

document.addEventListener("input", (event) => {
  if (event.target && event.target.id === "librarySearch") {
    const results = $("#libraryResults");
    if (results) results.innerHTML = libraryResultMarkup(event.target.value);
  }
});

window.addEventListener("message", (event) => {
  const frame = $("#courseFrame");
  if (!frame || event.origin !== location.origin || event.source !== frame.contentWindow || !event.data) return;
  if (event.data.type === "ACADEMIQUE_READER_READY") {
    frame.contentWindow.postMessage({ type: "ACADEMIQUE_READER_UNLOCK" }, location.origin);
  } else if (event.data.type === "ACADEMIQUE_READER_BACK") {
    location.hash = "#matiere/" + (event.data.subject || "python");
  }
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

window.addEventListener("hashchange", render);

$("#appDialog").addEventListener("click", (event) => {
  if (event.target === $("#appDialog")) closeDialog();
});

function render() {
  const route = decodeURIComponent(location.hash.replace(/^#/, "") || "accueil");
  const [page, id] = route.split("/");
  if (page === "matiere" && id) renderSubject(id);
  else if (page === "cours" && id) renderCourse(id);
  else if (page === "formations") renderFormations();
  else if (page === "bibliotheque") renderLibrary();
  else if (page === "progression") renderProgress();
  else if (page === "apropos") renderAbout();
  else renderHome();
}

applyTheme();
render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Le mode hors connexion n’a pas pu être initialisé.", error);
  }));
}