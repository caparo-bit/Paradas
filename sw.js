/* ============================================================
   TaxiDiario — Service Worker unificado
   Push + Cache + Offline
   © 2026 TaxiDiario. Todos los derechos reservados.
   ============================================================ */

const CACHE = "taxidiario-v1";

// Icono real (los data:URI no funcionan bien en notificaciones)
const ICON_URL = new URL("icon-192.png", self.registration.scope).href;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

/* ---------- Instalación ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activación ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch / cache ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // ⛔ Nunca cachear ntfy (rompe SSE/poll)
  if (url.hostname === "ntfy.sh" || url.hostname.endsWith(".ntfy.sh")) return;

  // ⛔ Nunca cachear geocoding
  if (url.hostname.includes("nominatim")) return;

  // ⛔ Nunca cachear tiles de mapas
  if (url.hostname.includes("google.com")) return;
  if (url.hostname.includes("tile.openstreetmap.org")) return;

  // Mismo origen → network-first, cache de respaldo, fallback a index
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("./index.html"))
        )
    );
    return;
  }

  // Terceros (CDNs) → cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      });
    })
  );
});

/* ---------- Push entrante ---------- */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try { data = { message: event.data ? event.data.text() : "" }; } catch (e2) { data = {}; }
  }

  const titulo = data.title || "🔥 Hay público";
  const cuerpo = data.message || "Nuevo aviso en tu zona";

  const options = {
    body: cuerpo,
    icon: ICON_URL,
    badge: ICON_URL,
    tag: data.id || "taxidiario-aviso",
    renotify: true,
    requireInteraction: (data.priority >= 4),
    vibrate: [200, 100, 200],
    data: { url: self.registration.scope, raw: data },
    actions: [
      { action: "open", title: "Abrir TaxiDiario" },
      { action: "close", title: "Ignorar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(titulo, options));
});

/* ---------- Click en notificación ---------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;

  const urlToOpen = (event.notification.data && event.notification.data.url)
    || self.registration.scope;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});

/* ---------- Mensajes desde la app ---------- */
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "SKIP_WAITING") self.skipWaiting();
});
