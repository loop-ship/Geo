/* Pole-Shift Simulator — service worker (added 2026-07-30)
 * Goal: work offline after the first visit, WITHOUT ever trapping anyone on a stale build.
 *
 * STRATEGY (deliberately split — read before changing):
 *   - HTML (geo.html / index.html / navigations) -> NETWORK-FIRST, cache as fallback.
 *     The app ships by pushing to GitHub Pages, so a returning visitor must get the new build
 *     immediately. Cache-first HTML is exactly how a PWA gets stuck showing an old version.
 *   - Everything else (terrain PNG, photoreal textures, plate_boundaries.json, and the pinned
 *     CDN modules) -> CACHE-FIRST. Large and effectively immutable (CDN deps are version-pinned
 *     in the importmap), so this is where the offline + speed win comes from.
 *   - CDN modules are cached AT RUNTIME on first fetch, never precached: three/addons pulls a
 *     transitive module graph that cannot be safely enumerated by hand.
 *   - Precache = app shell only (~0.5MB) so install is fast; the 24MB terrain fills in on use.
 *
 * TO FORCE AN UPDATE for everyone: bump CACHE_VERSION. The activate handler deletes every cache
 * that isn't the current version, and skipWaiting()/clients.claim() make it take effect promptly.
 */
const CACHE_VERSION = 'v2';   // bumped: analytics bypass + new scenario preset
// Hosts that must never be cached or served from cache (see the fetch handler). Keep in sync with the
// ANALYTICS block in geo.html — if you switch provider, add its script host AND its endpoint host.
const ANALYTICS_HOSTS = ['gc.zgo.at', 'goatcounter.com', 'static.cloudflareinsights.com', 'cloudflareinsights.com'];
const CACHE_NAME = 'poleshift-' + CACHE_VERSION;

// App shell: small, needed to boot. Relative URLs => works on localhost AND the /Geo/ subpath.
const PRECACHE = [
  './',
  './index.html',
  './geo.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './plate_boundaries.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // addAll is atomic-all-or-nothing; cache individually so one failure can't abort the install
    await Promise.all(PRECACHE.map(async (url) => {
      try { const r = await fetch(url, { cache: 'reload' }); if (r.ok) await cache.put(url, r); }
      catch (e) { /* offline/missing at install time — runtime caching will pick it up later */ }
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((n) => (n.startsWith('poleshift-') && n !== CACHE_NAME) ? caches.delete(n) : null));
    await self.clients.claim();
  })());
});

const isHTML = (req, url) =>
  req.mode === 'navigate' ||
  (req.destination === 'document') ||
  /\.html$/i.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                    // never cache non-GET
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;   // skip chrome-extension: etc.

  // ANALYTICS MUST BYPASS THE SERVICE WORKER ENTIRELY. The rule below is cache-first for everything
  // non-HTML, which would (a) freeze the beacon script at its first version and, far worse, (b) serve
  // the /count PING itself from cache — so every hit after the first would be answered locally and
  // never reach the server, silently killing analytics while looking fine. Let these hit the network,
  // and let them fail offline: a dropped count is correct behaviour, a cached one is a lie.
  if (ANALYTICS_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  if (isHTML(req, url)) {
    // NETWORK-FIRST: always prefer the freshly deployed HTML; fall back to cache when offline.
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        const cached = await caches.match(req) || await caches.match('./geo.html') || await caches.match('./index.html');
        if (cached) return cached;
        throw e;
      }
    })());
    return;
  }

  // CACHE-FIRST for assets + pinned CDN modules (immutable in practice).
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    // Only store real successes. Opaque (cross-origin no-cors) responses are still worth caching
    // for offline replay, but never cache errors/partials — that would poison the cache.
    try {
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, res.clone());
      }
    } catch (e) { /* quota or uncacheable request — serving the response still works */ }
    return res;
  })());
});
