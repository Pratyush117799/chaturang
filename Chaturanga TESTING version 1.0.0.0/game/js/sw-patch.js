/**
 * sw-patch.js — Chaturanga v1.0.5.2
 * PASTE THE CONTENTS OF THIS FILE INTO YOUR EXISTING sw.js
 * Replace or extend the relevant sections as noted.
 * ─────────────────────────────────────────────────────────
 */

// ── 1. ADD offline.html TO YOUR INSTALL CACHE LIST ───────────────────────────
// In your existing `install` event, add 'offline.html' to the array.
// Example:
//
// const CACHE_NAME = 'chaturanga-v1052';
// const PRECACHE = [
//   '/',
//   'game.html',
//   'shubh.html',
//   'akhara.html',
//   'itihasa.html',
//   'offline.html',        // ← ADD THIS
//   'js/game.js',
//   'js/ui.js',
//   // ... rest of your list
// ];


// ── 2. REPLACE YOUR fetch HANDLER WITH THIS ONE ──────────────────────────────
// This adds: offline fallback + background sync queue for shubh solves.

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Pass-through non-GET and cross-origin
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Shubh leaderboard POST — queue for background sync
  if (url.pathname.includes('/api/leaderboard') && req.method === 'POST') {
    event.respondWith(
      fetch(req.clone()).catch(async () => {
        await queueShubhSync(req);
        return new Response(JSON.stringify({ queued: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Navigation requests — serve from cache, fall back to offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).catch(() => caches.match('offline.html'));
      })
    );
    return;
  }

  // Assets — cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (!res || res.status !== 200 || res.type === 'opaque') return res;
      const clone = res.clone();
      caches.open('chaturanga-v1052').then(c => c.put(req, clone));
      return res;
    }))
  );
});


// ── 3. BACKGROUND SYNC — Shubh solve queue ───────────────────────────────────

async function queueShubhSync(request) {
  try {
    const body = await request.clone().json();
    const queue = await getQueue();
    queue.push({ url: request.url, body, ts: Date.now() });
    await saveQueue(queue);
    // Register sync if supported
    if (self.registration?.sync) {
      await self.registration.sync.register('shubh-leaderboard-sync');
    }
  } catch {}
}

self.addEventListener('sync', event => {
  if (event.tag === 'shubh-leaderboard-sync') {
    event.waitUntil(flushShubhQueue());
  }
});

async function flushShubhQueue() {
  const queue = await getQueue();
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body)
      });
      if (!res.ok) remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }
  await saveQueue(remaining);
}

// Simple IndexedDB-free queue using Cache API as storage
const SYNC_CACHE = 'cha-sync-queue';

async function getQueue() {
  try {
    const c   = await caches.open(SYNC_CACHE);
    const res = await c.match('/_queue');
    if (!res) return [];
    return await res.json();
  } catch { return []; }
}

async function saveQueue(queue) {
  try {
    const c = await caches.open(SYNC_CACHE);
    await c.put('/_queue', new Response(JSON.stringify(queue), {
      headers: { 'Content-Type': 'application/json' }
    }));
  } catch {}
}
