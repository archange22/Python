(function () {
  "use strict";

  const STORAGE_KEY = "sun-ia-conversations-v1";
  const rootSelector = "#appView";
  let sidebarOpen = false;
  let processing = false;

  function safeRead() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.chats)) {
        return {
          activeId: typeof saved.activeId === "string" ? saved.activeId : null,
          chats: saved.chats.filter(chat =>
            chat && typeof chat.id === "string" &&
            typeof chat.title === "string" && Array.isArray(chat.messages)
          ).slice(0, 60).map(chat => ({ ...chat, pending: false }))
        };
      }
    } catch (error) {
      console.warn("L’historique Sun IA n’a pas pu être lu.", error);
    }
    return { activeId: null, chats: [] };
  }

  let state = safeRead();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("L’historique Sun IA n’a pas pu être enregistré.", error);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }

  function makeId() {
    return "sun-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function activeChat() {
    return state.chats.find(chat => chat.id === state.activeId) || null;
  }

  function createChat() {
    const chat = { id: makeId(), title: "Nouvelle conversation", updatedAt: Date.now(), messages: [] };
    state.chats.unshift(chat);
    state.chats = state.chats.slice(0, 60);
    state.activeId = chat.id;
    save();
    sidebarOpen = false;
    render();
    focusComposer();
  }

  function focusComposer() {
    window.setTimeout(() => {
      const input = document.querySelector("#sunPrompt");
      if (input) input.focus();
    }, 30);
  }

  function formatDate(timestamp) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(timestamp));
    } catch (_) { return ""; }
  }

  function historyMarkup() {
    if (!state.chats.length) return '<p class="sun-history-empty">Tes conversations apparaîtront ici.</p>';
    return state.chats.map(chat =>
      '<div class="sun-history-row">' +
        '<button class="sun-history-item ' + (chat.id === state.activeId ? "is-active" : "") + '" type="button" data-sun-action="select-chat" data-chat-id="' + escapeHtml(chat.id) + '">' +
          '<span class="sun-history-glyph" aria-hidden="true">◌</span>' +
          '<span class="sun-history-copy"><strong>' + escapeHtml(chat.title) + '</strong><small>' + formatDate(chat.updatedAt) + '</small></span>' +
        '</button>' +
        '<button class="sun-history-delete" type="button" data-sun-action="delete-chat" data-chat-id="' + escapeHtml(chat.id) + '" aria-label="Supprimer cette conversation" title="Supprimer">×</button>' +
      '</div>'
    ).join("");
  }

  function brainStatusText() {
    if (!window.SunBrain) return "Composant local indisponible";
    const status = window.SunBrain.status();
    return status.documents + "/" + status.total + " documents pédagogiques indexés";
  }

  function welcomeMarkup() {
    return '<section class="sun-welcome">' +
      '<div class="sun-emblem" aria-hidden="true"><span class="sun-emblem-core"></span><span class="sun-emblem-orbit orbit-a"></span><span class="sun-emblem-orbit orbit-b"></span></div>' +
      '<span class="sun-welcome-kicker">SUN BRAIN · VERSION LOCALE 1</span>' +
      '<h1>Bonjour, je suis<br><span>Sun IA.</span></h1>' +
      '<p>Je peux tenir une petite conversation et rechercher des explications dans les cours intégrés à cette application.</p>' +
      '<div class="sun-suggestions">' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Bonjour Sun IA !">Dire bonjour <span>↗</span></button>' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Comment ça va ?">Discuter <span>↗</span></button>' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Explique-moi le Machine Learning.">Interroger les cours <span>↗</span></button>' +
      '</div>' +
      '<div class="sun-demo-warning"><span aria-hidden="true">ⓘ</span><span><strong>Un premier cerveau local, pas encore un grand modèle.</strong> Un petit réseau neuronal classe les intentions simples. Un moteur de recherche retrouve ensuite des passages dans les fichiers de cours. Aucun service d’IA externe ni API n’est utilisé.</span></div>' +
    '</section>';
  }

  function messageMarkup(message) {
    const assistant = message.role === "assistant";
    return '<article class="sun-message ' + (assistant ? "sun-message-assistant" : "sun-message-user") + '">' +
      '<div class="sun-message-avatar" aria-hidden="true">' + (assistant ? "☼" : "T") + '</div>' +
      '<div class="sun-message-body"><span class="sun-message-label">' + (assistant ? "Sun IA" : "Toi") + '</span><div class="sun-message-text">' + escapeHtml(message.content).replace(/\n/g, "<br>") + '</div></div>' +
    '</article>';
  }

  function conversationMarkup(chat) {
    if (!chat || !chat.messages.length) return welcomeMarkup();
    return '<section class="sun-thread" aria-label="Conversation">' +
      chat.messages.map(messageMarkup).join("") +
      (chat.pending ? '<article class="sun-message sun-message-assistant sun-message-pending"><div class="sun-message-avatar" aria-hidden="true">☼</div><div class="sun-message-body"><span class="sun-message-label">Sun IA</span><div class="sun-message-text">Je consulte mes cours…</div></div></article>' : "") +
      '<div class="sun-local-notice"><span class="sun-local-notice-icon" aria-hidden="true">☼</span><div><strong>Sun Brain · traitement local</strong><p>Réseau neuronal de classification et recherche dans les documents de l’application. Les réponses restent limitées aux fonctions actuellement installées.</p></div></div>' +
    '</section>';
  }

  function render() {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    root.classList.add("sun-app-view");
    const chat = activeChat();
    root.innerHTML =
      '<div class="sun-chat-shell ' + (sidebarOpen ? "sun-sidebar-open" : "") + '">' +
        '<aside class="sun-sidebar" aria-label="Navigation Sun IA">' +
          '<div class="sun-sidebar-top">' +
            '<a class="sun-sidebar-brand" href="#sun"><span class="sun-brand-sun" aria-hidden="true">☼</span><span><strong>Sun IA</strong><small>TON ESPACE PERSONNEL</small></span></a>' +
            '<button class="sun-sidebar-close" type="button" data-sun-action="close-sidebar" aria-label="Fermer le menu">×</button>' +
          '</div>' +
          '<button class="sun-new-chat" type="button" data-sun-action="new-chat"><span aria-hidden="true">＋</span> Nouveau chat</button>' +
          '<div class="sun-side-section"><span class="sun-side-label">ESPACE DE DISCUSSION</span><div class="sun-history-list">' + historyMarkup() + '</div></div>' +
          '<div class="sun-side-bottom">' +
            '<span class="sun-side-label">APPRENDRE</span>' +
            '<a href="#formations"><span aria-hidden="true">▦</span> Formations</a>' +
            '<a href="#bibliotheque"><span aria-hidden="true">▤</span> Cours et PDF</a>' +
            '<a href="#progression" data-nav="progression"><span aria-hidden="true">◷</span> Progression</a>' +
            '<a href="./apps/python-console-3/index.html"><span aria-hidden="true">⌘</span> Console Python 3</a>' +
            '<div class="sun-local-status"><span class="sun-status-light"></span><span><strong>Sun Brain actif</strong><small>' + brainStatusText() + '</small></span></div>' +
          '</div>' +
        '</aside>' +
        '<button class="sun-sidebar-backdrop" type="button" data-sun-action="close-sidebar" aria-label="Fermer la navigation"></button>' +
        '<section class="sun-main" aria-label="Discussion Sun IA">' +
          '<header class="sun-main-header">' +
            '<div class="sun-main-heading">' +
              '<button class="sun-menu-button" type="button" data-sun-action="toggle-sidebar" aria-label="Ouvrir la navigation">☰</button>' +
              '<div><strong>Sun IA</strong><span>Sun Brain · conversation et cours locaux</span></div>' +
            '</div>' +
            '<div class="sun-main-actions"><span class="sun-mode-pill"><i></i> Réseau local v1</span><button class="sun-header-new" type="button" data-sun-action="new-chat">＋ <span>Nouveau chat</span></button></div>' +
          '</header>' +
          '<section class="sun-conversation-area" id="sunConversationArea">' + conversationMarkup(chat) + '</section>' +
          '<footer class="sun-composer-wrap">' +
            '<div class="sun-composer-box">' +
              '<form id="sunComposer" autocomplete="off">' +
                '<label class="sun-sr-only" for="sunPrompt">Écrire un message</label>' +
                '<textarea id="sunPrompt" name="message" rows="1" maxlength="8000" placeholder="Écris ton message à Sun IA…" aria-label="Écrire un message"></textarea>' +
                '<div class="sun-composer-tools"><span>Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne</span><button class="sun-send-button" type="submit" aria-label="Envoyer le message" disabled>↑</button></div>' +
              '</form>' +
            '</div>' +
            '<p class="sun-composer-disclaimer">Version locale expérimentale : réponses simples et recherche dans les cours. Pas encore de génération libre comme ChatGPT.</p>' +
          '</footer>' +
        '</section>' +
      '</div>';

    const area = document.querySelector("#sunConversationArea");
    if (area) area.scrollTop = area.scrollHeight;
    updateSendButton();
    if (window.SunBrain) {
      window.SunBrain.ready().then(() => {
        const status = document.querySelector(".sun-local-status small");
        if (status) status.textContent = brainStatusText();
      });
    }
  }

  function updateSendButton() {
    const input = document.querySelector("#sunPrompt");
    const button = document.querySelector(".sun-send-button");
    if (!input || !button) return;
    button.disabled = !input.value.trim() || processing;
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 180) + "px";
  }

  async function sendMessage() {
    const input = document.querySelector("#sunPrompt");
    if (!input || processing) return;
    const content = input.value.trim();
    if (!content) return;

    let chat = activeChat();
    if (!chat) {
      chat = { id: makeId(), title: "Nouvelle conversation", updatedAt: Date.now(), messages: [] };
      state.chats.unshift(chat);
      state.activeId = chat.id;
    }

    const chatId = chat.id;
    chat.messages.push({ role: "user", content, createdAt: Date.now() });
    if (chat.messages.length === 1) {
      chat.title = content.length > 38 ? content.slice(0, 38).trim() + "…" : content;
    }
    chat.updatedAt = Date.now();
    chat.pending = true;
    state.chats = [chat].concat(state.chats.filter(item => item.id !== chat.id)).slice(0, 60);
    processing = true;
    save();
    render();

    let answer;
    try {
      if (!window.SunBrain) throw new Error("Sun Brain n’est pas chargé.");
      answer = await window.SunBrain.reply(content, chat.messages.slice(-8));
    } catch (error) {
      answer = "Je rencontre un problème dans mon module local. Vérifie que les fichiers Sun Brain sont bien chargés, puis réessaie.";
      console.error(error);
    }

    const target = state.chats.find(item => item.id === chatId);
    if (target) {
      target.pending = false;
      target.messages.push({ role: "assistant", content: answer, createdAt: Date.now() });
      target.updatedAt = Date.now();
      state.chats = [target].concat(state.chats.filter(item => item.id !== target.id)).slice(0, 60);
    }
    processing = false;
    save();
    render();
  }

  document.addEventListener("click", event => {
    const control = event.target.closest("[data-sun-action]");
    if (!control) return;
    const action = control.dataset.sunAction;
    const chatId = control.dataset.chatId;

    if (action === "new-chat") {
      createChat();
    } else if (action === "select-chat") {
      if (state.chats.some(chat => chat.id === chatId)) {
        state.activeId = chatId;
        save();
        sidebarOpen = false;
        render();
      }
    } else if (action === "delete-chat") {
      event.stopPropagation();
      if (window.confirm("Supprimer cette conversation enregistrée sur cet appareil ?")) {
        state.chats = state.chats.filter(chat => chat.id !== chatId);
        if (state.activeId === chatId) state.activeId = state.chats.length ? state.chats[0].id : null;
        save();
        render();
      }
    } else if (action === "suggest") {
      const input = document.querySelector("#sunPrompt");
      if (input) {
        input.value = control.dataset.sunPrompt || "";
        updateSendButton();
        input.focus();
      }
    } else if (action === "toggle-sidebar") {
      sidebarOpen = !sidebarOpen;
      const shell = document.querySelector(".sun-chat-shell");
      if (shell) shell.classList.toggle("sun-sidebar-open", sidebarOpen);
    } else if (action === "close-sidebar") {
      sidebarOpen = false;
      const shell = document.querySelector(".sun-chat-shell");
      if (shell) shell.classList.remove("sun-sidebar-open");
    }
  });

  document.addEventListener("input", event => {
    if (event.target && event.target.id === "sunPrompt") updateSendButton();
  });

  document.addEventListener("keydown", event => {
    if (event.target && event.target.id === "sunPrompt" && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = document.querySelector("#sunComposer");
      if (form && typeof form.requestSubmit === "function") form.requestSubmit();
      else sendMessage();
    }
  });

  document.addEventListener("submit", event => {
    if (event.target && event.target.id === "sunComposer") {
      event.preventDefault();
      sendMessage();
    }
  });

  window.renderSunChat = render;
})();