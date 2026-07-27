// Chaturanga v1.0.5 — Service Worker (offline bot play)
const CACHE_NAME = 'chaturanga-v1.0.5';
const ASSETS = [
  'game.html',
  'lobby.html',
  'puzzles.html',
  'puzzles/puzzle-data.js',
  'puzzles/puzzle-engine.js',
  'lessons.html',
  'lessons/acharya.html',
  'lessons/lesson-data.js',
  'lessons/lesson-engine.js',
  'tournament.html',
  'tournament/tournament-engine.js',
  'tournament/index.html',
  'army_builder.html',
  'documentation_hub.html',
  'kurukshetra.html',
  'shubh.html',
  'board-forge.html',
  'rashtra-map.html',
  'akhara.html',
  'benchmark.html',
  'benchmark-worker.js',
  'granth.html',
  'panchanga.html',
  'seer.html',
  'shastra-kosh.html',
  'vyuha_builder.html',
  'admin.html',
  'js/game.js',
  'js/ui.js',
  'js/dice.js',
  'js/seer.js',
  'js/anticheat.js',
  'js/ui-enhancements.js',
  'js/ws-client.js',
  'js/chatbot-data.js',
  'js/bot/tieredBots.js',
  'js/bot/advancedBots.js',
  'js/bot/randomMove.js',
  'engine/randomMoveGenerator.js',
  'engine/rules.js',
  'engine/gameState.js',
  'kurukshetra_days2to12.js',
  'kurukshetra_days14to17.js',
  'dharma-engine.js',
  'post-game-analysis.js',
  'vyuha-data.js',
  'css/styles.css',
  'css/animations.css',
  'css/themes.css',
  'css/website-integration.css',
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
