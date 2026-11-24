const STATIC_CACHE = "academique-shell-v18";
const PDF_CACHE = "academique-pdf-v2";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./sun-ia.css",
  "./sun-brain.js",
  "./sun-ia.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./pdf/lecon-01-reader.html",
  "./pdf/lecon-01-content.md.gz.b64",
  "./pdf/reader.html",
  "./courses/catalog.json",
  "./pdf/lecon-01.md",
  "./pdf/lecon-02.md",
  "./pdf/lecon-03.md",
  "./pdf/lecon-04.md",
  "./courses/ia/lesson-01.md",
  "./courses/ia/lesson-02.md",
  "./courses/ia/lesson-03.md",
  "./courses/ia/lesson-04.md",
  "./courses/python/lesson-05.md",
  "./courses/python/lesson-06.md",
  "./courses/python/lesson-07.md",
  "./courses/discord/lesson-01.md",
  "./courses/discord/lesson-02.md",
  "./courses/discord/lesson-03.md",
  "./courses/discord/lesson-04.md",
  "./courses/web/lesson-01.md",
  "./courses/web/lesson-02.md",
  "./courses/web/lesson-03.md",
  "./courses/web/lesson-04.md",
  "./apps/python-console-3/index.html",
  "./apps/python-console-3/styles.css",
  "./apps/python-console-3/app.js",
  "./apps/python-console-3/python.worker.js",
  "./apps/python-console-3/sw.js",
  "./apps/python-console-3/manifest.webmanifest",
  "./apps/python-console-3/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("academique-shell-") && key !== STATIC_CACHE)
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith("/courses/catalog.json")) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || new Response(
        '{"version":1,"subjects":[]}',
        { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
      )))
    );
    return;
  }

  if (url.pathname.toLowerCase().endsWith(".pdf")) {
    const update = fetch(request).then((response) => {
      if (response.ok) {
        return caches.open(PDF_CACHE).then((cache) => cache.put(request, response.clone())).then(() => response);
      }
      return response;
    }).catch(() => null);

    event.waitUntil(update.then(() => undefined));
    event.respondWith(
      caches.open(PDF_CACHE).then((cache) => cache.match(request)).then((cached) => {
        if (cached) return cached;
        return update.then((response) => response || new Response(
          "Ce document n’est pas encore disponible hors connexion. Reconnecte-toi pour le télécharger.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        ));
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});