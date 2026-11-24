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
    if (!window.SunBrain) return "Moteur local indisponible";
    const status = window.SunBrain.status();
    if (!status.documents && status.total) return "Chargement de l’index documentaire…";
    const summary = status.documents + "/" + status.total + " documents indexés";
    return status.failed ? summary + " · " + status.failed + " indisponible(s)" : summary + " · local";
  }

  function inlineMarkup(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function renderTextBlock(value) {
    const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let paragraph = [];
    let listTag = "";
    const listItems = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      html += "<p>" + inlineMarkup(paragraph.join(" ")) + "</p>";
      paragraph = [];
    }

    function flushList() {
      if (!listTag) return;
      html += "<" + listTag + ">" + listItems.map(item => "<li>" + inlineMarkup(item) + "</li>").join("") + "</" + listTag + ">";
      listItems.length = 0;
      listTag = "";
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      if (/^Sources?\s*:/i.test(trimmed)) {
        flushParagraph();
        flushList();
        const paths = trimmed.match(/(?:courses|knowledge|pdf)\/[A-Za-z0-9._/-]+\.md/g) || [];
        const safePaths = paths.filter(source => !source.includes("..") && !source.startsWith("/"));
        if (safePaths.length) {
          html += '<div class="sun-source-citations"><span>Sources documentaires</span>' +
            safePaths.map(source => '<a href="./' + escapeHtml(source) + '" target="_blank" rel="noopener">' + escapeHtml(source) + '</a>').join("") +
            "</div>";
        } else {
          html += "<p>" + inlineMarkup(trimmed) + "</p>";
        }
        return;
      }

      const unordered = trimmed.match(/^[-*]\s+(.+)$/);
      const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
      const match = unordered || ordered;
      const nextTag = unordered ? "ul" : ordered ? "ol" : "";
      if (match) {
        flushParagraph();
        if (listTag && listTag !== nextTag) flushList();
        if (!listTag) listTag = nextTag;
        listItems.push(match[1]);
        return;
      }

      flushList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();
    return html;
  }

  function richMessageContent(value) {
    const parts = String(value || "").split(/```([A-Za-z0-9_+-]*)[ \t]*\r?\n([\s\S]*?)```/g);
    let html = "";
    for (let index = 0; index < parts.length; index += 3) {
      html += renderTextBlock(parts[index]);
      if (index + 2 < parts.length) {
        const language = parts[index + 1] || "code";
        const code = parts[index + 2].replace(/\n$/, "");
        html += '<div class="sun-code-panel"><div class="sun-code-toolbar"><span>' + escapeHtml(language) +
          '</span><button class="sun-copy-code" type="button" data-sun-action="copy-code" data-code="' + escapeHtml(code) +
          '" aria-label="Copier le code">Copier</button></div><pre><code>' + escapeHtml(code) + '</code></pre></div>';
      }
    }
    return html || "<p></p>";
  }

  async function copyCode(control) {
    const code = control.dataset.code || "";
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const helper = document.createElement("textarea");
        helper.value = code;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Copie non disponible");
      }
      const previous = control.textContent;
      control.textContent = "Copié";
      window.setTimeout(() => { control.textContent = previous; }, 1500);
    } catch (error) {
      control.textContent = "Échec";
      window.setTimeout(() => { control.textContent = "Copier"; }, 1500);
    }
  }

  function welcomeMarkup() {
    return '<section class="sun-welcome">' +
      '<div class="sun-emblem" aria-hidden="true"><span class="sun-emblem-core"></span><span class="sun-emblem-orbit orbit-a"></span><span class="sun-emblem-orbit orbit-b"></span></div>' +
      '<span class="sun-welcome-kicker">SUN BRAIN · SYSTÈME NEURONAL 0.0.2</span>' +
      '<h1>Bonjour, je suis<br><span>Sun IA.</span></h1>' +
      '<p>Pose une question sur Python, l’IA, Discord ou le Web. Sun recherche les passages utiles dans sa bibliothèque locale et indique les documents utilisés.</p>' +
      '<div class="sun-welcome-stats" aria-label="Fonctionnement de Sun">' +
        '<div><strong id="sunWelcomeDocumentCount">…</strong><span>documents dans l’index</span></div>' +
        '<div><strong>Sans API</strong><span>traitement documentaire local</span></div>' +
        '<div><strong>Sources</strong><span>références dans les réponses</span></div>' +
      '</div>' +
      '<div class="sun-suggestions">' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Explique-moi les fonctions Python avec un exemple."><span aria-hidden="true">⌘</span> Exemple Python <span>↗</span></button>' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Explique les réseaux de neurones simplement."><span aria-hidden="true">◈</span> Comprendre l’IA <span>↗</span></button>' +
        '<button type="button" data-sun-action="suggest" data-sun-prompt="Comment créer un bot Discord sécurisé ?"><span aria-hidden="true">◉</span> Bot Discord <span>↗</span></button>' +
        '<a href="#bibliotheque"><span aria-hidden="true">▤</span> Parcourir les cours et PDF <span>↗</span></a>' +
      '</div>' +
      '<div class="sun-demo-warning"><span aria-hidden="true">ⓘ</span><span><strong>Un assistant documentaire local.</strong> Sun utilise un petit réseau neuronal pour classer des intentions et un moteur de recherche pour retrouver des preuves dans les documents intégrés. Ce n’est pas un grand modèle génératif : lorsque les sources ne suffisent pas, il doit le signaler.</span></div>' +
    '</section>';
  }

  function messageMarkup(message) {
    const assistant = message.role === "assistant";
    return '<article class="sun-message ' + (assistant ? "sun-message-assistant" : "sun-message-user") + '">' +
      '<div class="sun-message-avatar" aria-hidden="true">' + (assistant ? "☼" : "T") + '</div>' +
      '<div class="sun-message-body"><span class="sun-message-label">' + (assistant ? "Sun IA" : "Toi") + '</span><div class="sun-message-text">' + (assistant ? richMessageContent(message.content) : "<p>" + escapeHtml(message.content).replace(/\n/g, "<br>") + "</p>") + '</div></div>' +
    '</article>';
  }

  function conversationMarkup(chat) {
    if (!chat || !chat.messages.length) return welcomeMarkup();
    return '<section class="sun-thread" aria-label="Conversation">' +
      chat.messages.map(messageMarkup).join("") +
      (chat.pending ? '<article class="sun-message sun-message-assistant sun-message-pending"><div class="sun-message-avatar" aria-hidden="true">☼</div><div class="sun-message-body"><span class="sun-message-label">Sun IA</span><div class="sun-message-text">Je consulte mes cours…</div></div></article>' : "") +
      '<div class="sun-local-notice"><span class="sun-local-notice-icon" aria-hidden="true">☼</span><div><strong>Recherche documentaire sur cet appareil</strong><p>Les messages de discussion ne sont pas ajoutés au corpus et ne servent pas à entraîner le réseau. Sun répond à partir des documents disponibles et peut reconnaître qu’une information manque.</p></div></div>' +
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
            '<div class="sun-local-status"><span class="sun-status-light"></span><span><strong>Sun Brain</strong><small class="sun-brain-status-text">' + brainStatusText() + '</small></span></div>' +
          '</div>' +
        '</aside>' +
        '<button class="sun-sidebar-backdrop" type="button" data-sun-action="close-sidebar" aria-label="Fermer la navigation"></button>' +
        '<section class="sun-main" aria-label="Discussion Sun IA">' +
          '<header class="sun-main-header">' +
            '<div class="sun-main-heading">' +
              '<button class="sun-menu-button" type="button" data-sun-action="toggle-sidebar" aria-label="Ouvrir la navigation">☰</button>' +
              '<div><strong>Sun IA</strong><span>Sun Brain · conversation et cours locaux</span></div>' +
            '</div>' +
            '<div class="sun-main-actions"><span class="sun-mode-pill"><i></i> Assistant documentaire local · 0.0.2</span><button class="sun-header-new" type="button" data-sun-action="new-chat">＋ <span>Nouveau chat</span></button></div>' +
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
            '<p class="sun-composer-disclaimer">Aucune API payante · pas d’apprentissage à partir des conversations privées · réponses limitées aux documents indexés.</p>' +
          '</footer>' +
        '</section>' +
      '</div>';

    const area = document.querySelector("#sunConversationArea");
    if (area) area.scrollTop = area.scrollHeight;
    updateSendButton();
    if (window.SunBrain) {
      window.SunBrain.ready().then(() => {
        document.querySelectorAll(".sun-brain-status-text").forEach(status => {
          status.textContent = brainStatusText();
        });
        const count = document.querySelector("#sunWelcomeDocumentCount");
        if (count) count.textContent = window.SunBrain.status().documents;
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

    if (action === "copy-code") {
      copyCode(control);
    } else if (action === "new-chat") {
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
    if (event.key === "Escape" && sidebarOpen) {
      sidebarOpen = false;
      const shell = document.querySelector(".sun-chat-shell");
      if (shell) shell.classList.remove("sun-sidebar-open");
      return;
    }
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