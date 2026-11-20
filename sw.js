const STATIC_CACHE = "academique-shell-v4";
const PDF_CACHE = "academique-pdf-v1";
const APP_FILES = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "./pdf/lecon-01-reader.html", "./pdf/lecon-01-content.md.gz.b64"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("academique-shell-") && key !== STATIC_CACHE).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const isPdf = new URL(request.url).pathname.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(PDF_CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || new Response(
      "Ce PDF n'a pas encore été téléchargé sur cet appareil. Reconnecte-toi pour l'ouvrir.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    ))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});