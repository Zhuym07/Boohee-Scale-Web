const CACHE_NAME = 'boohee-scale-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/types.ts',
  '/App.tsx',
  '/manifest.json',
  '/services/bluetoothService.ts',
  '/services/biaService.ts',
  '/services/storage.ts',
  '/components/Gauge.tsx',
  '/components/MetricCard.tsx',
  '/components/UserProfileForm.tsx',
  '/components/OnboardingWizard.tsx',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});