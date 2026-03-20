// Chaturanga v1.0.4 — Service Worker (offline bot play)
const CACHE_NAME = 'chaturanga-v1.0.4';
const ASSETS = [
  'game.html',
  'puzzles.html',
  'lessons.html',
  'tournament.html',
  'army_builder.html',
  'documentation_hub.html',
  'js/game.js',
  'js/ui.js',
  'js/dice.js',
  'js/seer.js',
  'js/anticheat.js',
  'js/ui-enhancements.js',
  'js/ws-client.js',
  'js/bot/tieredBots.js',
  'js/bot/advancedBots.js',
  'js/bot/randomMove.js',
  'engine/randomMoveGenerator.js',
  'engine/rules.js',
  'engine/gameState.js',
  'css/styles.css',
  'css/animations.css',
  'css/themes.css',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
