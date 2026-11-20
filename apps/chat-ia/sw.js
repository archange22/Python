const APP_CACHE = "academique-sun-shell-v4";
const LIBRARY_CACHE = "academique-chat-ia-library-v3";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./chat.worker.js",
  "./knowledge.js",
  "./conversation.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

const MAX_CDN_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryable(status) {
  return status === 408 || status === 425 || status === 429 ||
    status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchLibrary(request) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_CDN_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(request);
      if (!retryable(response.status) || attempt === MAX_CDN_ATTEMPTS) return response;
      try { await response.body?.cancel(); } catch (error) {}
    } catch (error) {
      lastError = error;
      if (attempt === MAX_CDN_ATTEMPTS) throw error;
    }
    await sleep(500 * Math.pow(2, attempt - 1));
  }
  throw lastError || new Error("Bibliothèque IA indisponible.");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) =>
          ((key.startsWith("academique-sun-shell-") || key.startsWith("academique-chat-ia-shell-")) && key !== APP_CACHE) ||
          (key.startsWith("academique-chat-ia-library-") && key !== LIBRARY_CACHE)
        )
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Cache only the Transformers.js runtime library here. Model weights are
  // cached by Transformers.js in its own Cache Storage namespace.
  if (url.hostname === "cdn.jsdelivr.net") {
    event.respondWith((async () => {
      const cache = await caches.open(LIBRARY_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetchLibrary(request);
        if (response.ok && response.type !== "opaque") {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return new Response(
          "La bibliothèque IA n’est pas encore disponible hors connexion. Connecte-toi pour la charger.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Course source files are refreshed from the network first and kept for offline use.
  if (/\/courses\/(?:catalog\.json|.+\.md)$/.test(url.pathname) ||
      /\/pdf\/lecon-0[1-4]\.md$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        return cached || new Response("Cette leçon n’est pas encore disponible hors connexion.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match("./index.html"))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});