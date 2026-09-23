/* ============================================================
   TaxiDiario — Service Worker
   © 2026 TaxiDiario. Todos los derechos reservados.
   ============================================================ */

const NTFY_BASE = "https://ntfy.sh";
const ICON_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%230b0b0d'/%3E%3Ctext x='256' y='340' font-size='280' text-anchor='middle'%3E%F0%9F%9A%95%3C/text%3E%3C/svg%3E";

// ---------- Instalación: tomar control inmediato ----------
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ---------- Push entrante de ntfy ----------
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    try { data = { message: event.data ? event.data.text() : "" }; } catch (e2) { data = {}; }
  }

  // ntfy envía: { title, message, priority, tags, ... }
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
    data: {
      url: "/paradas/",
      raw: data,
    },
    actions: [
      { action: "open", title: "Abrir TaxiDiario" },
      { action: "close", title: "Ignorar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(titulo, options));
});

// ---------- Click en la notificación ----------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = (event.notification.data && event.notification.data.url) || "/paradas/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes("/paradas/") && "focus" in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ---------- Mensajes desde la app (para subscribir/desuscribir) ----------
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
