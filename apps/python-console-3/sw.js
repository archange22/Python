const APP_CACHE = "academique-python-console-shell-v1";
const PYODIDE_CACHE = "academique-python-runtime-314-0-8";
const PYODIDE_ORIGIN = "https://cdn.jsdelivr.net";
const PYODIDE_PREFIX = "/pyodide/v314.0.8/full/";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./python.worker.js",
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
        .filter((key) => key.startsWith("academique-python-console-shell-") && key !== APP_CACHE)
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin === PYODIDE_ORIGIN && url.pathname.startsWith(PYODIDE_PREFIX)) {
    event.respondWith((async () => {
      const cache = await caches.open(PYODIDE_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        return new Response(
          "Le moteur Python n’a pas encore été téléchargé sur cet appareil. Connecte-toi une première fois, puis réessaie.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html"))));
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
