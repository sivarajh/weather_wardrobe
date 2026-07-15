// Fetches style-matched outfit photos from two sources:
//   1. Unsplash napi (unofficial, portrait-oriented, highest quality)
//   2. Openverse (free Creative Commons API, no key required — fallback)
// Both are routed through wsrv.nl to avoid CDN / CORS issues on iOS.

interface UnsplashResult {
  alt_description?: string | null;
  urls?: { raw?: string; regular?: string; small?: string };
}

interface OpenverseResult {
  url?: string;
  thumbnail?: string;
  title?: string;
}

// Score results by how closely the alt text matches the intended subject
// so the wrong gender / age doesn't lead the strip.
function subjectScore(altText: string, query: string): number {
  const alt = altText.toLowerCase();
  const q = query.toLowerCase();

  if (q.includes("toddler") || q.includes("kids") || q.includes("teen")) {
    if (/\b(toddler|child|kid|girl|boy|teen|youth|junior)\b/.test(alt)) return 2;
    if (/\b(adult|man|woman|men|women)\b/.test(alt)) return 0;
    return 1;
  }
  if (q.includes("women") || q.includes("girl")) {
    if (/\b(woman|women|girl|female)\b/.test(alt)) return 2;
    if (/\b(man\b|men\b)/.test(alt)) return 0;
  } else if (q.includes("men") || q.includes("boy")) {
    if (/\b(man\b|men\b|boy|male)\b/.test(alt)) return 2;
    if (/\b(woman|women|girl)\b/.test(alt)) return 0;
  }
  return 1;
}

function proxyUrl(raw: string, width = 600, height = 750): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(raw)}&w=${width}&h=${height}&fit=cover&output=jpg`;
}

async function fetchUnsplash(query: string, need: number): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      query,
      per_page: String(need * 4),
      orientation: "portrait",
    });
    const res = await fetch(`https://unsplash.com/napi/search/photos?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: UnsplashResult[] = data.results ?? [];
    return results
      .map((r, idx) => ({
        url: r.urls?.small ?? r.urls?.regular ?? "",
        score: subjectScore(r.alt_description ?? "", query),
        idx,
      }))
      .filter((r) => r.url)
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .slice(0, need)
      .map((r) => proxyUrl(r.url));
  } catch {
    return [];
  }
}

async function fetchOpenverse(query: string, need: number): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      page_size: String(need * 3),
      license_type: "commercial,modification",
      source: "flickr,wikimedia",
    });
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: OpenverseResult[] = data.results ?? [];
    return results
      .map((r, idx) => ({
        url: r.thumbnail ?? r.url ?? "",
        score: subjectScore(r.title ?? "", query),
        idx,
      }))
      .filter((r) => r.url)
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .slice(0, need)
      .map((r) => proxyUrl(r.url, 600, 750));
  } catch {
    return [];
  }
}

export async function fetchOutfitImages(
  query: string,
  count = 5
): Promise<string[]> {
  // Try primary source first; fill remaining slots from fallback.
  const primary = await fetchUnsplash(query, count);
  if (primary.length >= count) return primary;

  const remaining = count - primary.length;
  const fallback = await fetchOpenverse(query, remaining);
  return [...primary, ...fallback].slice(0, count);
}
