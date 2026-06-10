import AsyncStorage from "@react-native-async-storage/async-storage";
import { Preferences } from "./types";

const PREFS_KEY = "weatherWardrobe.preferences";

export const DEFAULT_PREFS: Preferences = {
  gender: "female",
  style: "casual",
  modesty: "moderate",
  notificationHour: 7,
  notificationMinute: 30,
};

export async function loadPreferences(): Promise<Preferences | null> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  if (!raw) return null;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export async function savePreferences(prefs: Preferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
