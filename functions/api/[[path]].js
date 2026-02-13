const API_ORIGIN = "https://api.senawiki.com";

const PUBLIC_CACHE_PREFIXES = [
  "/api/heroes",
  "/api/pets",
  "/api/community",
  "/api/tip",
  "/api/guide-decks",
  "/api/boards",
];

const DEFAULT_CACHE_TTL = 60;
const CACHE_TTL_BY_PREFIX = [
  { prefix: "/api/heroes", ttl: 1800, swr: 3600 },
  { prefix: "/api/pets", ttl: 1800, swr: 3600 },
  { prefix: "/api/guide-decks", ttl: 300, swr: 900 },
  { prefix: "/api/community", ttl: 180, swr: 600 },
  { prefix: "/api/tip", ttl: 180, swr: 600 },
  { prefix: "/api/boards", ttl: 180, swr: 600 },
];

function isPublicCacheable(method, pathname) {
  if (method !== "GET") return false;
  return PUBLIC_CACHE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function resolveCachePolicy(pathname) {
  const matched = CACHE_TTL_BY_PREFIX.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  const ttl = matched?.ttl ?? DEFAULT_CACHE_TTL;
  const swr = matched?.swr ?? Math.max(ttl * 2, 120);
  return { ttl, swr };
}

function shouldAwaitStore(pathname) {
  return pathname === "/api/guide-decks" || pathname.startsWith("/api/guide-decks/");
}

function buildCacheKey(url) {
  const params = Array.from(url.searchParams.entries());
  if (!params.length) return url.pathname;
  params.sort((a, b) => {
    if (a[0] === b[0]) return a[1].localeCompare(b[1]);
    return a[0].localeCompare(b[0]);
  });
  const canonical = new URLSearchParams();
  for (const [k, v] of params) canonical.append(k, v);
  return `${url.pathname}?${canonical.toString()}`;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method.toUpperCase();
  const pathname = url.pathname;

  const cacheable = isPublicCacheable(method, pathname);
  const { ttl, swr } = resolveCachePolicy(pathname);
  const cacheKey = buildCacheKey(url);
  const cache = caches.default;

  if (cacheable) {
    const cacheReq = new Request("https://cache.senawiki.internal" + cacheKey);
    const cached = await cache.match(cacheReq);
    if (cached) {
      const h = new Headers(cached.headers);
      h.set("x-sena-cache", "HIT");
      h.set("x-sena-cache-ttl", String(ttl));
      h.set("x-sena-cache-store", "HIT");
      return new Response(cached.body, { status: cached.status, headers: h });
    }
  }

  const upstreamUrl = API_ORIGIN + pathname + url.search;
  const upstreamReq = new Request(upstreamUrl, context.request);

  if (cacheable) {
    const h = new Headers(upstreamReq.headers);
    h.delete("authorization");
    h.delete("cookie");

    const req2 = new Request(upstreamUrl, { method: "GET", headers: h });
    const upstreamRes = await fetch(req2);

    const rh = new Headers(upstreamRes.headers);
    rh.set(
      "cache-control",
      `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${swr}`
    );
    rh.set("x-sena-cache", "MISS");
    rh.set("x-sena-cache-ttl", String(ttl));
    // Prevent cache-store rejections for personalized responses.
    rh.delete("set-cookie");
    // Normalize Vary to reduce cache fragmentation for internal cache keys.
    rh.set("vary", "accept-encoding");
    let storeStatus = "BYPASS";

    if (upstreamRes.status === 200) {
      const cacheReq = new Request("https://cache.senawiki.internal" + cacheKey);
      try {
        const cacheRes = new Response(upstreamRes.clone().body, {
          status: upstreamRes.status,
          statusText: upstreamRes.statusText,
          headers: rh,
        });
        if (shouldAwaitStore(pathname)) {
          await cache.put(cacheReq, cacheRes);
          storeStatus = "STORED";
        } else {
          context.waitUntil(cache.put(cacheReq, cacheRes));
          storeStatus = "QUEUED";
        }
      } catch {
        storeStatus = "ERROR";
      }
    }

    const clientHeaders = new Headers(rh);
    clientHeaders.set("x-sena-cache-store", storeStatus);
    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: clientHeaders,
    });
  }

  return fetch(upstreamReq);
}
