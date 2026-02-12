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
  const apiUrl = `${API_ORIGIN}${pathname}${inboundUrl.search}`
  const cacheKey = `${pathname}${inboundUrl.search}`

  const headers = new Headers(context.request.headers)

  const isPublicRead = isPublicReadRequest(method, pathname)
  if (isPublicRead) {
    headers.delete('authorization')
    headers.delete('cookie')

    const cache = caches.default
    const cacheRequest = new Request(`https://cache.senawiki.internal${cacheKey}`)
    const cached = await cache.match(cacheRequest)
    if (cached) return cached
  }

  const upstreamResponse = await fetch(apiUrl, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : context.request.body,
    redirect: 'follow',
  })

  if (!isPublicRead) return upstreamResponse

  const responseHeaders = new Headers(upstreamResponse.headers)
  sanitizeVaryHeader(responseHeaders)

  const cacheControl = (responseHeaders.get('cache-control') || '').toLowerCase()
  const shouldBypassCache = cacheControl.includes('no-store') || cacheControl.includes('private')

  // 공개 응답인데 캐시 금지 아니면, 브라우저/엣지 캐시 친화적으로 "항상" 설정
  if (!shouldBypassCache) {
    responseHeaders.set('cache-control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')
  }

  const response = new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })

  // 200만 캐시(더 보수적으로)
  if (!shouldBypassCache && upstreamResponse.status === 200) {
    const cache = caches.default
    const cacheRequest = new Request(`https://cache.senawiki.internal${cacheKey}`)
    context.waitUntil(cache.put(cacheRequest, response.clone()))
  }

  return response
}
