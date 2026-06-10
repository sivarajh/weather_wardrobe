import * as Location from "expo-location";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TempBand, WeatherSnapshot } from "./types";

// WMO weather interpretation codes used by Open-Meteo
const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

function bandFor(feelsLikeC: number): TempBand {
  if (feelsLikeC < 0) return "freezing";
  if (feelsLikeC < 8) return "cold";
  if (feelsLikeC < 15) return "cool";
  if (feelsLikeC < 22) return "mild";
  if (feelsLikeC < 29) return "warm";
  return "hot";
}

export interface LocatedPlace {
  latitude: number;
  longitude: number;
  label: string;
}

// Web path: talk to the browser's geolocation API directly. The expo-location
// web shim depends on the Permissions API (unreliable in Safari) and calls
// getCurrentPosition without a timeout, which can hang forever in Safari.
function getWebPosition(): Promise<{ latitude: number; longitude: number }> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.reject(
      new Error("This browser doesn't support location services.")
    );
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return Promise.reject(
      new Error(
        "Browsers only allow location on secure pages. Open the app over https (or http://localhost in development) and try again."
      )
    );
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission was denied. Allow location access for this site in your browser settings, then try again.",
          2: "Your location couldn't be determined. Check that Location Services are enabled for your browser, then try again.",
          3: "Finding your location took too long. Try again.",
        };
        reject(new Error(messages[err.code] ?? "Couldn't get your location."));
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

// Remember the last located place so refreshes within the TTL don't hit the
// geolocation API at all — Safari re-prompts for permission on every direct
// geolocation call, which gets annoying fast.
const PLACE_CACHE_KEY = "weatherWardrobe.lastPlace";
const PLACE_CACHE_TTL_MS = 30 * 60 * 1000;

async function loadCachedPlace(): Promise<LocatedPlace | null> {
  try {
    const raw = await AsyncStorage.getItem(PLACE_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.savedAt > PLACE_CACHE_TTL_MS) return null;
    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      label: cached.label,
    };
  } catch {
    return null;
  }
}

async function saveCachedPlace(place: LocatedPlace): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PLACE_CACHE_KEY,
      JSON.stringify({ ...place, savedAt: Date.now() })
    );
  } catch {
    // caching is best-effort
  }
}

export async function getCurrentPlace(): Promise<LocatedPlace> {
  const cached = await loadCachedPlace();
  if (cached) return cached;

  let latitude: number;
  let longitude: number;

  if (Platform.OS === "web") {
    ({ latitude, longitude } = await getWebPosition());
  } else {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error(
        "Location permission is required to fetch local weather."
      );
    }
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    ({ latitude, longitude } = position.coords);
  }

  let label = "";
  if (Platform.OS !== "web") {
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (place) {
        label = place.city ?? place.subregion ?? place.region ?? "";
      }
    } catch {
      // reverse geocoding is best-effort; the fallback below covers it
    }
  }
  if (!label) {
    label = await reverseGeocodeFallback(latitude, longitude);
  }
  const place = { latitude, longitude, label: label || "your area" };
  await saveCachedPlace(place);
  return place;
}

// Works on every platform including web (CORS-enabled, no API key).
async function reverseGeocodeFallback(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!response.ok) return "";
    const data = await response.json();
    return (
      data.locality ||
      data.city ||
      data.principalSubdivision ||
      data.countryName ||
      ""
    );
  } catch {
    return "";
  }
}

// Open-Meteo returns the observation time as a local ISO string (timezone=auto),
// e.g. "2026-06-09T20:30" — format the clock part as 12-hour time.
function formatLocalTime(isoLocal: string): string {
  const clock = isoLocal?.split("T")[1];
  if (!clock) return "";
  const [hourStr, minuteStr] = clock.split(":");
  const hour = Number(hourStr);
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${minuteStr} ${hour < 12 ? "AM" : "PM"}`;
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily: "precipitation_probability_max",
    forecast_days: "1",
    timezone: "auto",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );
  if (!response.ok) {
    throw new Error(`Weather service error (${response.status})`);
  }
  const data = await response.json();
  const current = data.current;
  const code: number = current.weather_code;
  const feelsLike: number = current.apparent_temperature;

  return {
    observedAt: formatLocalTime(current.time),
    temperatureC: current.temperature_2m,
    feelsLikeC: feelsLike,
    windKph: current.wind_speed_10m,
    precipitationMm: current.precipitation,
    precipitationProbability:
      data.daily?.precipitation_probability_max?.[0] ?? 0,
    weatherCode: code,
    condition: WMO_CONDITIONS[code] ?? "Mixed conditions",
    isRainy:
      (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95,
    isSnowy: (code >= 71 && code <= 77) || code === 85 || code === 86,
    isWindy: current.wind_speed_10m >= 30,
    band: bandFor(feelsLike),
  };
}
