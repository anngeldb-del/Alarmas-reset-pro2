const CACHE = 'app-v10';
const STATIC = ['./', './index.html', './checklist.html', './manifest.json'];

// ── Firebase Cloud Messaging (notificaciones push) ──
// Mismo firebaseConfig público que index.html/checklist.html.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
try {
  firebase.initializeApp({
    apiKey: "AIzaSyAOUGIWvrPtdKf9pnoYlh3NIHHiBO_R7mE",
    authDomain: "alarmas-reset-e3484.firebaseapp.com",
    projectId: "alarmas-reset-e3484",
    storageBucket: "alarmas-reset-e3484.firebasestorage.app",
    messagingSenderId: "1096561116547",
    appId: "1:1096561116547:web:b13df05c092785723aa2b6"
  });
  firebase.messaging();
  // El SDK compat de Messaging muestra automáticamente las notificaciones
  // en segundo plano que llegan con payload "notification" (ver functions/index.js).
} catch(e) {
  console.warn('FCM no disponible en el service worker:', e);
}
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
