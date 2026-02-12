const API_ORIGIN = "https://api.senawiki.com";

const PUBLIC_CACHE_PREFIXES = [
  "/api/heroes",
  "/api/pets",
  "/api/community",
  "/api/tip",
  "/api/guide-decks",
  "/api/boards",
];

function isPublicCacheable(method, pathname) {
  if (method !== "GET") return false;
  return PUBLIC_CACHE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method.toUpperCase();
  const pathname = url.pathname;

  const cacheable = isPublicCacheable(method, pathname);
  const cacheKey = pathname + url.search; // ✅ query 포함
  const cache = caches.default;

  // 1) 캐시 먼저 확인 (공개 GET만)
  if (cacheable) {
    const cacheReq = new Request("https://cache.senawiki.internal" + cacheKey);
    const cached = await cache.match(cacheReq);
    if (cached) {
      // 디버깅용 표시(원하면 삭제 가능)
      const h = new Headers(cached.headers);
      h.set("x-sena-cache", "HIT");
      return new Response(cached.body, { status: cached.status, headers: h });
    }
  }

  // 2) 업스트림 요청 만들기 (스트림 안전하게)
  const upstreamUrl = API_ORIGIN + pathname + url.search;
  const upstreamReq = new Request(upstreamUrl, context.request);

  // 공개 캐시 대상은 인증/쿠키 제거(캐시 오염 방지)
  if (cacheable) {
    const h = new Headers(upstreamReq.headers);
    h.delete("authorization");
    h.delete("cookie");
    // 새 Request로 헤더만 교체 (body는 GET이라 없음)
    // GET 아닌건 cacheable=false라 여기 안옴
    const req2 = new Request(upstreamUrl, { method: "GET", headers: h });
    const upstreamRes = await fetch(req2);

    // 3) 응답을 캐시 친화로 “강제” (백엔드 no-store 무시)
    const rh = new Headers(upstreamRes.headers);
    rh.set(
      "cache-control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
    );
    rh.set("x-sena-cache", "MISS");

    const res = new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: rh,
    });

    // 200만 캐시 저장
    if (upstreamRes.status === 200) {
      const cacheReq = new Request("https://cache.senawiki.internal" + cacheKey);
      context.waitUntil(cache.put(cacheReq, res.clone()));
    }

    return res;
  }

  // 공개 캐시 대상 아니면 그냥 프록시만 (로그인/변경 API는 캐시 X)
  return fetch(upstreamReq);
}
