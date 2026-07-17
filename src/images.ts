// Fetches style-matched outfit photos. Sources, in priority order:
//   1. Unsplash napi      – best quality; no CORS headers, so native-only
//   2. Flickr public feed – no API key; its JSON is malformed (escaped
//                           single quotes) and must be sanitized before parse;
//                           no CORS headers, so native-only
//   3. Openverse          – Creative Commons API; CORS-enabled, works on web
//   4. LoremFlickr        – guaranteed filler: plain <img>-able URLs, no
//                           fetch/JSON/CORS involved, so the strip is never empty
//
// The full imageQuery ("women summer cotton midi dress casual outfit") is too
// long for tag-based APIs, so it's distilled to a short subject + style term.

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
function simplify(query: string): { subject: string; style: string } {
  const q = query.toLowerCase();

  let subject = "fashion";
  if (/\btoddler\b/.test(q)) subject = "toddler";
  else if (/\bkids?\b/.test(q)) subject = "kids";
  else if (/\bteen\b/.test(q)) subject = "teen";
  else if (/\bgirls?\b/.test(q)) subject = "girl";
  else if (/\bboys?\b/.test(q)) subject = "boy";
  else if (/\bwomen\b/.test(q)) subject = "women";
  else if (/\bmen\b/.test(q)) subject = "men";
  else if (/\bunisex\b/.test(q)) subject = "unisex";

  let style = "outfit";
  if (/\bcasual\b/.test(q)) style = "casual";
  else if (/\bformal\b/.test(q)) style = "formal";
  else if (/\bactivewear\b|\bsport/.test(q)) style = "sportswear";
  else if (/\bstreetwear\b/.test(q)) style = "streetwear";
  else if (/\bboho\b/.test(q)) style = "boho";
  else if (/\bethnic\b/.test(q)) style = "ethnic";

  return { subject, style };
}

// Boost results whose description/title matches the expected subject,
// penalise those that mention the opposite.
function subjectScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (/\b(toddler|kids?|teen)\b/.test(q)) {
    if (/\b(toddler|child|kid|girl|boy|teen|youth|junior)\b/.test(t)) return 2;
    if (/\b(adult|man|men|woman|women)\b/.test(t)) return 0;
    return 1;
  }
  if (/\b(women|girls?)\b/.test(q)) {
    if (/\b(woman|women|girl|female)\b/.test(t)) return 2;
    if (/\b(man|men)\b/.test(t)) return 0;
  } else if (/\b(men|boys?)\b/.test(q)) {
    if (/\b(man|men|boy|male)\b/.test(t)) return 2;
    if (/\b(woman|women|girl)\b/.test(t)) return 0;
  }
  return 1;
}

// Any single slow source must not stall the whole strip.
function withTimeout<T>(promise: Promise<T[]>, ms = 6000): Promise<T[]> {
  return Promise.race([
    promise,
    new Promise<T[]>((resolve) => setTimeout(() => resolve([]), ms)),
  ]);
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
      { headers: { Accept: "application/json" } }
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
      // Unsplash's imgix CDN fails inside the iOS simulator, so re-serve
      // as plain JPEG via wsrv.nl.
      .map(
        (r) =>
          `https://wsrv.nl/?url=${encodeURIComponent(r.url)}&w=600&h=750&fit=cover&output=jpg`
      );
  } catch {
    return [];
  }
}

async function fetchFlickr(query: string, need: number): Promise<string[]> {
  try {
    const { subject, style } = simplify(query);
    const url =
      `https://api.flickr.com/services/feeds/photos_public.gne` +
      `?tags=${encodeURIComponent(`${subject},${style}`)}&tag_mode=all` +
      `&format=json&nojsoncallback=1&lang=en-us`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    // Flickr's feed JSON illegally escapes single quotes (\') — res.json()
    // throws on it, so sanitize the raw text before parsing.
    const raw = await res.text();
    const data = JSON.parse(raw.replace(/\\'/g, "'"));
    const items: FlickrItem[] = data.items ?? [];
    return items
      .map((item, idx) => ({
        // _m is a 240px thumbnail; _z is 640px — better for the strip.
        url: (item.media?.m ?? "").replace(/_m\.jpg$/, "_z.jpg"),
        score: subjectScore(`${item.title ?? ""} ${item.tags ?? ""}`, query),
        idx,
      }))
      .filter((r) => r.url)
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .slice(0, need)
      .map((r) => r.url); // staticflickr.com loads fine directly
  } catch {
    return [];
  }
}

async function fetchOpenverse(query: string, need: number): Promise<string[]> {
  try {
    const { subject, style } = simplify(query);
    const params = new URLSearchParams({
      q: `${subject} ${style} clothing`,
      page_size: String(need * 3),
      category: "photograph",
    });
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: OpenverseResult[] = data.results ?? [];
    return results
      .map((r, idx) => ({
        // r.url is the direct image; r.thumbnail is an API redirect
        // endpoint that image proxies can't follow.
        url: r.url ?? "",
        score: subjectScore(r.title ?? "", query),
        idx,
      }))
      .filter((r) => r.url && r.score > 0)
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .slice(0, need)
      .map((r) => r.url);
  } catch {
    return [];
  }
}

// LoremFlickr serves a random tag-matched Flickr photo directly as an image
// response — no fetch, no JSON, no CORS. Distinct lock values give distinct
// photos. Used to fill whatever the real search sources couldn't.
function loremFlickrFill(query: string, need: number): string[] {
  const { subject, style } = simplify(query);
  const tags = encodeURIComponent(`${subject},${style}`);
  return Array.from(
    { length: need },
    (_, i) => `https://loremflickr.com/600/750/${tags}?lock=${i + 1}`
  );
}

export async function fetchOutfitImages(
  query: string,
  count = 5
): Promise<string[]> {
  const [unsplash, flickr, openverse] = await Promise.all([
    withTimeout(fetchUnsplash(query, count)),
    withTimeout(fetchFlickr(query, count)),
    withTimeout(fetchOpenverse(query, count)),
  ]);

  const seen = new Set<string>();
  const merged: string[] = [];
  for (const url of [...unsplash, ...flickr, ...openverse]) {
    if (!seen.has(url)) {
      seen.add(url);
      merged.push(url);
    }
    if (merged.length >= count) break;
  }

  // Guarantee a full strip even when every search source fails
  // (e.g. CORS on web builds, network filtering, empty results).
  if (merged.length < count) {
    merged.push(...loremFlickrFill(query, count - merged.length));
  }
  return merged;
}
