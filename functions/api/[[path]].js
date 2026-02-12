const API_ORIGIN = 'https://api.senawiki.com'

const PUBLIC_CACHE_PREFIXES = [
  '/api/heroes',
  '/api/pets',
  '/api/community',
  '/api/tip',
  '/api/guide-decks',
  '/api/boards',
]

const isPublicReadRequest = (method, pathname) => {
  if (method !== 'GET' && method !== 'HEAD') return false
  return PUBLIC_CACHE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

const sanitizeVaryHeader = (headers) => {
  const raw = headers.get('vary')
  if (!raw) return
  const values = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => v.toLowerCase() !== 'origin')

  if (values.length === 0) headers.delete('vary')
  else headers.set('vary', values.join(', '))
}

export async function onRequest(context) {
  const inboundUrl = new URL(context.request.url)
  const method = context.request.method.toUpperCase()
  const pathname = inboundUrl.pathname

  // /api/* 만 처리 (혹시 최상위 스플랫일 경우 대비)
  if (!pathname.startsWith('/api/')) return context.next?.() ?? fetch(context.request)

  const apiUrl = `${API_ORIGIN}${pathname}${inboundUrl.search}`
  const cacheKey = `${pathname}${inboundUrl.search}`

  const isPublicRead = isPublicReadRequest(method, pathname)

  // 공개 GET이면 캐시 먼저 조회
  if (isPublicRead) {
    const cache = caches.default
    const cacheRequest = new Request(`https://cache.senawiki.internal${cacheKey}`)
    const cached = await cache.match(cacheRequest)
    if (cached) return cached
  }

  const headers = new Headers(context.request.headers)

  // 공개 GET이면 인증/쿠키 제거(캐시 오염 방지)
  if (isPublicRead) {
    headers.delete('authorization')
    headers.delete('cookie')
  }

  const upstreamResponse = await fetch(apiUrl, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : context.request.body,
    redirect: 'follow',
  })

  // 공개가 아니면 그대로
  if (!isPublicRead) return upstreamResponse

  // 공개 GET이면 no-store 무시하고 캐시 친화 헤더로 "강제"
  const responseHeaders = new Headers(upstreamResponse.headers)
  sanitizeVaryHeader(responseHeaders)
  responseHeaders.set('cache-control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')

  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })

  // 200만 캐시
  if (upstreamResponse.status === 200) {
    const cache = caches.default
    const cacheRequest = new Request(`https://cache.senawiki.internal${cacheKey}`)
    context.waitUntil(cache.put(cacheRequest, response.clone()))
  }

  return response
}
