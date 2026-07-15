export type Gender = "female" | "male" | "nonbinary" | "girl" | "boy";

export type AgeGroup = "toddler" | "kids" | "teen";

export type StyleChoice =
  | "casual"
  | "formal"
  | "sporty"
  | "streetwear"
  | "bohemian"
  | "traditional";

export type Modesty = "relaxed" | "moderate" | "high";

export interface Preferences {
  gender: Gender;
  ageGroup?: AgeGroup;
  style: StyleChoice;
  modesty: Modesty;
  notificationHour: number;
  notificationMinute: number;
}

export type TempBand = "freezing" | "cold" | "cool" | "mild" | "warm" | "hot";

export interface WeatherSnapshot {
  observedAt: string;
  temperatureC: number;
  feelsLikeC: number;
  windKph: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
  isRainy: boolean;
  isSnowy: boolean;
  isWindy: boolean;
  band: TempBand;
}

export interface ShoppingLink {
  label: string;
  url: string;
  note: string;
}

export interface OutfitRecommendation {
  title: string;
  summary: string;
  pieces: string[];
  accessories: string[];
  imageQuery: string;
  shoppingLinks: ShoppingLink[];
}
