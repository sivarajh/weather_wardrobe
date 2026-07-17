// API keys for optional image sources.
//
// SERPAPI_KEY enables Google Shopping product images (the best-matched
// source). Get a free key (100 searches/month) at https://serpapi.com.
//
// Preferred: put it in a .env file (gitignored) as
//   EXPO_PUBLIC_SERPAPI_KEY=your_key_here
// or paste it directly into the empty string below for local testing —
// just don't commit a real key.
export const SERPAPI_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY ?? "";
