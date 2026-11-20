const APP_CACHE = "academique-chat-ia-shell-v1";
const MODEL_RUNTIME_CACHE = "academique-chat-ia-runtime-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./chat.worker.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

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
        .filter((key) => key.startsWith("academique-chat-ia-shell-") && key !== APP_CACHE)
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  const isModelRuntime = url.hostname === "cdn.jsdelivr.net" ||
    url.hostname === "huggingface.co" ||
    url.hostname.endsWith(".huggingface.co") ||
    url.hostname === "xethub.hf.co" ||
    url.hostname.endsWith(".xethub.hf.co");

  if (isModelRuntime) {
    event.respondWith((async () => {
      const cache = await caches.open(MODEL_RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type !== "opaque") {
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return new Response(
          "Ce fichier du moteur IA n’est pas encore en cache. Connecte-toi une première fois pour terminer le téléchargement du modèle.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
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
