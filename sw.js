const CACHE = 'studycloud-v2';
const ASSETS = [
    '/', '/index.html',
    '/html/focus.html',
    '/css/style.css',
    '/js/app.js',
    '/js/planner.js',
    '/js/session.js',
    '/js/reflect.js',
    '/js/focus.js',
    '/js/timer.js',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    e.respondWith(
        caches.match(req).then(hit => hit || fetch(req).then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
            return res;
        }).catch(() => caches.match('/')))
    );
});
