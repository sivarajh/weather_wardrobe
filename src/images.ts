// Fetches style-matched outfit photos from three sources in order:
//   1. Flickr public feed  – no API key, no auth, very reliable
//   2. Unsplash napi       – unofficial but high quality; needs browser headers
//   3. Openverse           – Creative Commons, no API key
// Images are proxied through wsrv.nl so they load reliably on iOS (avoids
// CDN TLS issues and re-encodes to plain JPEG).
//
// The full imageQuery ("women summer cotton midi dress casual outfit") is too
// long for tag-based APIs, so it's distilled to a short subject + style term
// before being sent to Flickr and Openverse.

interface FlickrItem {
  title?: string;
  media?: { m?: string };
  tags?: string;
}

interface UnsplashResult {
  alt_description?: string | null;
  urls?: { small?: string; regular?: string };
}

interface OpenverseResult {
  title?: string;
  thumbnail?: string;
  url?: string;
}

// Distil a long outfit query into a short subject + style pair that
// works well with tag-based and keyword-limited APIs.
function simplify(query: string): string {
  const q = query.toLowerCase();

  let subject = "fashion";
  if (/\btoddler\b/.test(q)) subject = "toddler";
  else if (/\bkids?\b/.test(q)) subject = "kids";
  else if (/\bteen\b/.test(q)) subject = "teen";
  else if (/\bgirls?\b/.test(q)) subject = "girls";
  else if (/\bboys?\b/.test(q)) subject = "boys";
  else if (/\bwomen\b/.test(q)) subject = "women";
  else if (/\bmen\b/.test(q)) subject = "men";
  else if (/\bunisex\b/.test(q)) subject = "unisex";

  let style = "outfit";
  if (/\bcasual\b/.test(q)) style = "casual outfit";
  else if (/\bformal\b/.test(q)) style = "formal outfit";
  else if (/\bactivewear\b/.test(q)) style = "activewear";
  else if (/\bstreetswear\b/.test(q)) style = "streetwear";
  else if (/\bboho\b/.test(q)) style = "boho outfit";
  else if (/\bethnic\b/.test(q)) style = "ethnic wear";

  return `${subject} ${style}`;
}

function proxyUrl(raw: string): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(raw)}&w=600&h=750&fit=cover&output=jpg`;
}

// Boost results whose description/title matches the expected subject,
// penalise those that mention the opposite.
function subjectScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (/\b(toddler|kids?|teen)\b/.test(q)) {
    if (/\b(toddler|child|kid|girl|boy|teen|youth|junior)\b/.test(t)) return 2;
    if (/\b(adult|man\b|men\b|woman|women)\b/.test(t)) return 0;
    return 1;
  }
  if (/\b(women|girl)\b/.test(q)) {
    if (/\b(woman|women|girl|female)\b/.test(t)) return 2;
    if (/\b(man\b|men\b)\b/.test(t)) return 0;
  } else if (/\b(men|boy)\b/.test(q)) {
    if (/\b(man\b|men\b|boy|male)\b/.test(t)) return 2;
    if (/\b(woman|women|girl)\b/.test(t)) return 0;
  }
  return 1;
}

async function fetchFlickr(query: string, need: number): Promise<string[]> {
  try {
    // Flickr tag searches are too restrictive with long queries — distil to
    // subject + style, use tag_mode=any so any matching tag returns results.
    const short = simplify(query);
    const tags = short.trim().replace(/\s+/g, ",");
    const url =
      `https://api.flickr.com/services/feeds/photos_public.gne` +
      `?tags=${encodeURIComponent(tags)}&tag_mode=any&format=json&nojsoncallback=1&lang=en-us`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: FlickrItem[] = data.items ?? [];
    return items
      .map((item, idx) => ({
        // Replace _m (240px thumbnail) with _z (640px) for display quality.
        url: (item.media?.m ?? "").replace(/_m\.jpg$/, "_z.jpg"),
        score: subjectScore(`${item.title ?? ""} ${item.tags ?? ""}`, query),
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

async function fetchUnsplash(query: string, need: number): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      query,
      per_page: String(need * 3),
      orientation: "portrait",
    });
    const res = await fetch(
      `https://unsplash.com/napi/search/photos?${params}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://unsplash.com/",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        },
      }
    );
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
      q: simplify(query),
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
        // Use the direct image URL — thumbnail is an Openverse API redirect
        // that wsrv.nl cannot proxy. Fall back to thumbnail only if url absent.
        url: r.url ?? r.thumbnail ?? "",
        score: subjectScore(r.title ?? "", query),
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

export async function fetchOutfitImages(
  query: string,
  count = 5
): Promise<string[]> {
  // Run all three sources in parallel; merge in priority order.
  const [flickr, unsplash, openverse] = await Promise.all([
    fetchFlickr(query, count),
    fetchUnsplash(query, count),
    fetchOpenverse(query, count),
  ]);

  // De-duplicate by URL and fill up to count, preferring Flickr → Unsplash → Openverse.
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const url of [...flickr, ...unsplash, ...openverse]) {
    if (!seen.has(url)) {
      seen.add(url);
      merged.push(url);
    }
    if (merged.length >= count) break;
  }
  return merged;
}
