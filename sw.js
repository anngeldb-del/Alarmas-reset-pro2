const CACHE = 'app-v4'; // Incrementar al desplegar nuevos archivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./', './index.html', './checklist.html', './manifest.json']))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  // No interceptar peticiones a Firestore, MSAL ni Graph API — solo assets estáticos
  const url = e.request.url;
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('login.microsoftonline.com') ||
    url.includes('graph.microsoft.com') ||
    url.includes('alcdn.msauth.net')
  ) {
    return; // Dejar que el navegador maneje estas peticiones directamente
  }
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
