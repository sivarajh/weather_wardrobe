// Fetches style-matched outfit photos. Sources, in priority order:
//   1. Unsplash napi      – best quality and most style-relevant search
//   2. Flickr public feed – no API key; its JSON is malformed (escaped
//                           single quotes) and must be sanitized before parse
//   3. Openverse          – Creative Commons API; CORS-enabled
//   4. LoremFlickr        – guaranteed filler: plain <img>-able URLs, no
//                           fetch/JSON/CORS involved, so the strip is never empty
//
// Unsplash and Flickr send no CORS headers, so on web builds their requests
// are routed through the allorigins.win CORS proxy; on native they go direct.
//
// The full imageQuery ("women summer cotton midi dress casual outfit") is too
// long for tag-based APIs, so it's distilled to a short subject + style term.

import { Platform } from "react-native";
import { SERPAPI_KEY } from "./config";

interface SerpShoppingResult {
  title?: string;
  thumbnail?: string;
}

// Wrap non-CORS endpoints in a public CORS proxy on web builds only.
function corsSafe(url: string): string {
  return Platform.OS === "web"
    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    : url;
}

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

// Flickr's fashion community tags photos with these compound tags far more
// consistently than with plain words like "men" or "casual" — using them
// keeps random archive/travel photos out of tag-based results.
function fashionTags(query: string): string[] {
  const { subject, style } = simplify(query);
  const subjectTag =
    {
      women: "womensfashion",
      men: "mensfashion",
      girl: "kidsfashion",
      boy: "kidsfashion",
      kids: "kidsfashion",
      toddler: "kidsfashion",
      teen: "kidsfashion",
      unisex: "fashion",
      fashion: "fashion",
    }[subject] ?? "fashion";
  const styleTag =
    {
      casual: "casualstyle",
      formal: "formalwear",
      sportswear: "activewear",
      streetwear: "streetstyle",
      boho: "bohostyle",
      ethnic: "ethnicwear",
      outfit: "ootd",
    }[style] ?? "ootd";
  return [subjectTag, styleTag, "outfit"];
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
      corsSafe(`https://unsplash.com/napi/search/photos?${params}`),
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
    // tag_mode=any + fashion community tags: photos tagged with e.g.
    // "womensfashion" or "streetstyle" are overwhelmingly outfit shots.
    const tags = fashionTags(query).join(",");
    const url =
      `https://api.flickr.com/services/feeds/photos_public.gne` +
      `?tags=${encodeURIComponent(tags)}&tag_mode=any` +
      `&format=json&nojsoncallback=1&lang=en-us`;
    const res = await fetch(corsSafe(url), {
      headers: { Accept: "application/json" },
    });
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
      // Openverse is archive-heavy; drop score-0 results (opposite gender/age)
      // but allow score-1 (neutral) so the strip isn't over-filtered.
      .filter((r) => r.url && r.score >= 1)
      .sort((a, b) => b.score - a.score || a.idx - b.idx)
      .slice(0, need)
      .map((r) => r.url);
  } catch {
    return [];
  }
}

// Google Shopping product images via SerpAPI — the most style-relevant
// source since results are actual retail listings for the recommended
// pieces. Only active when SERPAPI_KEY is set in src/config.ts.
async function fetchGoogleShopping(
  query: string,
  need: number
): Promise<string[]> {
  if (!SERPAPI_KEY) {
    console.warn("[images] SerpAPI key not set — skipping Google Shopping");
    return [];
  }
  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      num: String(need * 2),
      api_key: SERPAPI_KEY,
    });
    const res = await fetch(
      corsSafe(`https://serpapi.com/search.json?${params}`),
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) {
      console.warn(`[images] SerpAPI responded ${res.status}`);
      return [];
    }
    const data = await res.json();
    const results: SerpShoppingResult[] = data.shopping_results ?? [];
    const urls = results
      .map((r) => r.thumbnail ?? "")
      .filter(Boolean)
      .slice(0, need);
    console.log(`[images] SerpAPI returned ${urls.length} images`);
    return urls;
  } catch (e) {
    console.warn("[images] SerpAPI fetch failed:", e);
    return [];
  }
}

// LoremFlickr serves a random tag-matched Flickr photo directly as an image
// response — no fetch, no JSON, no CORS. Distinct lock values give distinct
// photos. Used to fill whatever the real search sources couldn't.
function loremFlickrFill(query: string, need: number): string[] {
  const tags = encodeURIComponent(fashionTags(query).join(","));
  return Array.from(
    { length: need },
    (_, i) => `https://loremflickr.com/600/750/${tags}?lock=${i + 1}`
  );
}

function dedupe(urls: string[], count: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (!seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
    if (out.length >= count) break;
  }
  return out;
}

export async function fetchOutfitImages(
  query: string,
  count = 5
): Promise<string[]> {
  // Google Shopping goes first and alone: it's the most relevant source
  // (actual product listings for the recommended pieces), and running it
  // ahead of the rest avoids burning SerpAPI's limited free quota on every
  // refresh when it can already fill the strip by itself.
  const shopping = dedupe(await withTimeout(fetchGoogleShopping(query, count)), count);
  if (shopping.length >= count) return shopping;

  const remaining = count - shopping.length;
  const [unsplash, flickr, openverse] = await Promise.all([
    withTimeout(fetchUnsplash(query, remaining)),
    withTimeout(fetchFlickr(query, remaining)),
    withTimeout(fetchOpenverse(query, remaining)),
  ]);

  console.log(
    `[images] sources: shopping=${shopping.length} unsplash=${unsplash.length}` +
    ` flickr=${flickr.length} openverse=${openverse.length}`
  );

  const merged = dedupe(
    [...shopping, ...unsplash, ...flickr, ...openverse],
    count
  );

  // Guarantee a full strip even when every search source fails.
  if (merged.length < count) {
    console.warn(`[images] Filling ${count - merged.length} slots with LoremFlickr`);
    merged.push(...loremFlickrFill(query, count - merged.length));
  }
  return merged;
}
