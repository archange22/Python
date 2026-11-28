const STATIC_CACHE = "academique-shell-v25";
const PDF_CACHE = "academique-pdf-v2";
const OUT_OF_SCOPE_ASSETS = [
  "./knowledge/discussion-global-v0.0.2.md",
  "./knowledge/imported/discussion-global-v0.0.2.md",
  "./knowledge/pdfs/sun-discussion-global-v0.0.2.pdf"
];

function validHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    const reservedHosts = ["example.com", "example.net", "example.org", "example.test", "example.invalid", "localhost"];
    const reserved = reservedHosts.some(name => host === name || host.endsWith("." + name)) ||
      /\.(?:example|test|invalid|localhost)$/.test(host);
    return parsed.protocol === "https:" && Boolean(host) &&
      !parsed.username && !parsed.password && !reserved;
  } catch (_) {
    return false;
  }
}

function validIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function hasVerifiedDocument(item) {
  const hasText = value => typeof value === "string" && value.trim().length > 0;
  if (!item || typeof item !== "object" || item.approved !== true || item.reviewed !== true) return false;
  if (item.verification_status !== "manual_review_complete_approved_for_publication") return false;
  if (!["title", "topic", "discipline", "source", "author_organization", "license"].every(key => hasText(item[key]))) return false;
  if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(String(item.language || ""))) return false;
  if (!validHttpsUrl(item.canonical_source_url) || !validHttpsUrl(item.license_url)) return false;
  if (!validIsoDate(item.collection_date)) return false;
  if (item.publication_date && !validIsoDate(item.publication_date)) return false;
  if (item.format !== "pdf" || item.extraction_status !== "text_layer_extracted") return false;
  if (!/^[a-f0-9]{64}$/i.test(String(item.sha256 || ""))) return false;
  return typeof item.path === "string" &&
    /^knowledge\/imported\/[a-z0-9][a-z0-9.-]*\.md$/i.test(item.path) &&
    !item.path.includes("..") &&
    typeof item.pdf === "string" &&
    /^knowledge\/pdfs\/(?:imported\/)?[a-z0-9][a-z0-9.-]*\.pdf$/i.test(item.pdf) &&
    !item.pdf.includes("..");
}

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
  "./knowledge/catalog.json",
  "./pdf/lecon-01.md",
  "./pdf/lecon-02.md",
  "./pdf/lecon-03.md",
  "./pdf/lecon-04.md",
  "./courses/ia/lesson-01.md",
  "./courses/ia/lesson-02.md",
  "./courses/ia/lesson-03.md",
  "./courses/ia/lesson-04.md",
  "./courses/ia/lesson-05.md",
  "./courses/ia/lesson-06.md",
  "./courses/ia/lesson-07.md",
  "./courses/ia/lesson-08.md",
  "./courses/ia/lesson-09.md",
  "./courses/ia/lesson-10.md",
  "./courses/python/lesson-05.md",
  "./courses/python/lesson-06.md",
  "./courses/python/lesson-07.md",
  "./courses/python/lesson-08.md",
  "./courses/python/lesson-09.md",
  "./courses/python/lesson-10.md",
  "./courses/python/lesson-11.md",
  "./courses/python/lesson-12.md",
  "./courses/python/lesson-13.md",
  "./courses/discord/lesson-01.md",
  "./courses/discord/lesson-02.md",
  "./courses/discord/lesson-03.md",
  "./courses/discord/lesson-04.md",
  "./courses/discord/lesson-05.md",
  "./courses/discord/lesson-06.md",
  "./courses/discord/lesson-07.md",
  "./courses/discord/lesson-08.md",
  "./courses/discord/lesson-09.md",
  "./courses/discord/lesson-10.md",
  "./courses/web/lesson-01.md",
  "./courses/web/lesson-02.md",
  "./courses/web/lesson-03.md",
  "./courses/web/lesson-04.md",
  "./courses/web/lesson-05.md",
  "./courses/web/lesson-06.md",
  "./courses/web/lesson-07.md",
  "./courses/web/lesson-08.md",
  "./courses/web/lesson-09.md",
  "./courses/web/lesson-10.md",
  "./knowledge/python-practice.md",
  "./knowledge/ia-foundations.md",
  "./knowledge/web-practices.md",
  "./knowledge/discord-development.md",
  "./knowledge/security-and-privacy.md",
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
      .then((keys) => Promise.all(keys.map(async (key) => {
        const cache = await caches.open(key);
        await Promise.all(OUT_OF_SCOPE_ASSETS.map((asset) =>
          cache.delete(new URL(asset, self.location.href).href)
        ));
        if (key.startsWith("academique-shell-") && key !== STATIC_CACHE) {
          await caches.delete(key);
        }
      })))
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

  if (url.pathname.endsWith("/knowledge/catalog.json")) {
    const update = fetch(request).then(async (response) => {
      if (!response.ok) return response;
      const catalogCopy = response.clone();
      await caches.open(STATIC_CACHE).then((cache) => cache.put(request, catalogCopy));

      let catalog;
      try {
        catalog = await response.clone().json();
      } catch (_) {
        return response;
      }
      const approved = Array.isArray(catalog.documents)
        ? catalog.documents.filter(hasVerifiedDocument)
        : [];
      const assets = [];
      approved.slice(0, 50).forEach((item) => {
        if (typeof item.path === "string" &&
            /^knowledge\/imported\/[a-z0-9][a-z0-9.-]*\.md$/i.test(item.path) &&
            !item.path.includes("..")) assets.push({ path: item.path, cache: STATIC_CACHE });
        if (typeof item.pdf === "string" &&
            /^knowledge\/pdfs\/(?:imported\/)?[a-z0-9][a-z0-9.-]*\.pdf$/i.test(item.pdf) &&
            !item.pdf.includes("..")) assets.push({ path: item.pdf, cache: PDF_CACHE });
      });

      await Promise.all(assets.map(async (asset) => {
        const target = new URL("./" + asset.path, self.location.href);
        if (target.origin !== self.location.origin) return;
        try {
          const stored = await fetch(target.href, { credentials: "same-origin" });
          if (!stored.ok) return;
          await caches.open(asset.cache).then((cache) => cache.put(target.href, stored.clone()));
        } catch (_) {
          // L'application reste utilisable même si un document supplémentaire est absent.
        }
      }));
      return response;
    });
    event.waitUntil(update.then(() => undefined).catch(() => undefined));
    event.respondWith(update.catch(() => caches.match(request).then((cached) => cached || new Response(
      '{"version":1,"documents":[]}',
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    ))));
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