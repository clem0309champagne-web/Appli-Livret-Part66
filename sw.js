/* Mode hors ligne : l'appli est gardée en cache sur l'appareil.
   Change VERSION à chaque mise à jour des fichiers pour que les appareils récupèrent la nouvelle version. */
const VERSION = "livret-p66-2026-11-14a";
const FICHIERS = ["./", "index.html", "livret-pdf.js", "pdf-lib.min.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-512-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(rep => {
      if (rep && rep.ok) { const copie = rep.clone(); caches.open(VERSION).then(c => c.put(r, copie)); }
      return rep;
    }).catch(() => caches.match("index.html")))
  );
});
