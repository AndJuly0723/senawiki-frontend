const DEFAULT_TARGET = "https://senawiki.com";
const target = String(process.env.PREWARM_TARGET ?? DEFAULT_TARGET).replace(/\/+$/, "");

const endpoints = [
  "/api/heroes",
  "/api/pets",
  "/api/community?page=0&size=8&sort=createdAt,desc",
  "/api/tip?page=0&size=8&sort=createdAt,desc",
  "/api/guide-decks?category=ADVENTURE&page=0&size=8&sort=createdAt,desc",
];

async function prewarm(path) {
  const url = `${target}${path}`;
  const started = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "cache-control": "no-cache",
      },
    });
    const elapsed = Date.now() - started;
    const cache = res.headers.get("x-sena-cache") ?? "-";
    const ttl = res.headers.get("x-sena-cache-ttl") ?? "-";
    console.log(`[${res.status}] ${elapsed}ms cache=${cache} ttl=${ttl} ${path}`);
  } catch (error) {
    const elapsed = Date.now() - started;
    console.error(`[ERR] ${elapsed}ms ${path} ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}

console.log(`[prewarm] target=${target}`);
for (const path of endpoints) {
  await prewarm(path);
}
