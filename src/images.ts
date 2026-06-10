// Fetches real, style-matched outfit photos from Unsplash's public search
// endpoint (no API key). Unofficial endpoint, so callers must tolerate an
// empty result — the UI hides the image strip if nothing comes back.

interface UnsplashResult {
  alt_description?: string | null;
  urls?: { raw?: string; regular?: string; small?: string };
}

// Search results occasionally lead with the wrong subject (e.g. a man for a
// "women ..." query), so results whose description mentions the expected
// subject are ranked first.
function subjectScore(result: UnsplashResult, query: string): number {
  const alt = (result.alt_description ?? "").toLowerCase();
  if (query.includes("women")) {
    if (/\bwoman|women|girl\b/.test(alt)) return 2;
    if (/\bman\b|\bmen\b/.test(alt)) return 0;
  } else if (query.includes("men")) {
    if (/\bman\b|\bmen\b/.test(alt)) return 2;
    if (/\bwoman|women\b/.test(alt)) return 0;
  }
  return 1;
}

export async function fetchOutfitImages(
  query: string,
  count = 3
): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      query,
      per_page: String(count * 4),
      orientation: "portrait",
    });
    const response = await fetch(
      `https://unsplash.com/napi/search/photos?${params}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const results: UnsplashResult[] = data.results ?? [];
    const lowerQuery = query.toLowerCase();
    return results
      .map((r, index) => ({ r, index, score: subjectScore(r, lowerQuery) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(({ r }) => r.urls?.small ?? r.urls?.regular)
      .filter((url): url is string => Boolean(url))
      .slice(0, count)
      // Unsplash's image CDN (imgix) fails to load inside the iOS simulator
      // ("cannot parse response"), so serve via the wsrv.nl proxy, which
      // re-encodes to plain JPEG on a different CDN.
      .map(
        (url) =>
          `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=600&h=750&fit=cover&output=jpg`
      );
  } catch {
    return [];
  }
}
