import * as Location from "expo-location";
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

export async function getCurrentPlace(): Promise<LocatedPlace> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission is required to fetch local weather.");
  }
  const position =
    (await Location.getLastKnownPositionAsync()) ??
    (await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }));
  const { latitude, longitude } = position.coords;

  let label = "your area";
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      label = place.city ?? place.subregion ?? place.region ?? label;
    }
  } catch {
    // reverse geocoding is best-effort; weather still works with coordinates
  }
  return { latitude, longitude, label };
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
