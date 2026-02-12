const API_ORIGIN = 'https://api.senawiki.com';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 여기 파일은 /api/*만 들어오지만, 안전장치
  if (!url.pathname.startsWith('/api/')) {
    return context.next();
  }

  const apiUrl = `${API_ORIGIN}${url.pathname}${url.search}`;

  // 원본 request를 그대로 복제해서 업스트림으로 전달 (가장 안전)
  const req = new Request(apiUrl, context.request);

  // Host 같은 건 건드리지 말기
  return fetch(req);
}
