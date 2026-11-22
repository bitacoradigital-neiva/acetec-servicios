// Guarda la app en el celular para que abra sin señal.
// Si cambias algún archivo, sube el número de versión para que todos reciban la actualización.
const VERSION = 'acetec-v12';
const ARCHIVOS = ['./', 'index.html', 'config.js', 'vendor/jspdf.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Las llamadas a la base de datos siempre van a internet (la app maneja el modo sin señal).
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Primero intenta internet (para tener la última versión); si no hay señal, usa la copia guardada.
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
