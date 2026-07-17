import { SERPAPI_KEY } from "./config";

interface SerpImageResult {
  original?: string;
  thumbnail?: string;
}

export async function fetchOutfitImages(
  query: string,
  count = 5
): Promise<string[]> {
  if (!SERPAPI_KEY) {
    console.warn("[images] SERPAPI_KEY not set — no images will load");
    return [];
  }
  try {
    const params = new URLSearchParams({
      engine: "google_images",
      q: query,
      num: String(count),
      api_key: SERPAPI_KEY,
      safe: "active",
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[images] SerpAPI responded ${res.status}`);
      return [];
    }
    const data = await res.json();
    const results: SerpImageResult[] = data.images_results ?? [];
    const urls = results
      .map((r) => r.thumbnail ?? r.original ?? "")
      .filter(Boolean)
      .slice(0, count);
    console.log(`[images] SerpAPI returned ${urls.length} images for "${query}"`);
    return urls;
  } catch (e) {
    console.warn("[images] SerpAPI fetch failed:", e);
    return [];
  }
}
