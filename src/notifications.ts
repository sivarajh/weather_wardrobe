import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { loadPreferences } from "./storage";
import { fetchWeather, getCurrentPlace } from "./weather";
import { recommendOutfit } from "./outfits";
import { Preferences } from "./types";

const REFRESH_TASK = "weather-wardrobe-refresh";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-outfit", {
      name: "Daily outfit suggestion",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function nextOccurrence(hour: number, minute: number): Date {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/**
 * Cancels any pending notification and schedules the next one with content
 * built from the latest location + weather. Called on app open and from the
 * background refresh task, so the message stays current.
 */
export async function scheduleDailyOutfitNotification(
  prefs: Preferences
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  let title = "👗 Today's outfit suggestion";
  let body =
    "Open Weather Wardrobe to see what to wear for today's weather near you.";

  try {
    const place = await getCurrentPlace();
    const weather = await fetchWeather(place.latitude, place.longitude);
    const outfit = recommendOutfit(
      weather,
      prefs.gender,
      prefs.style,
      prefs.modesty
    );
    title = `${Math.round(weather.feelsLikeC)}°C in ${place.label} — ${outfit.title}`;
    body = `${weather.condition}. Wear: ${outfit.pieces.slice(0, 3).join(", ")}.${
      outfit.accessories.length ? ` Don't forget: ${outfit.accessories[0]}.` : ""
    } Tap for looks & best prices.`;
  } catch {
    // fall back to the generic reminder if location/weather is unavailable
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextOccurrence(prefs.notificationHour, prefs.notificationMinute),
      channelId: "daily-outfit",
    },
  });
}

// Background task: periodically re-fetches weather and re-schedules the next
// notification so its content reflects current conditions.
TaskManager.defineTask(REFRESH_TASK, async () => {
  try {
    const prefs = await loadPreferences();
    if (prefs) {
      await scheduleDailyOutfitNotification(prefs);
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundRefresh(): Promise<void> {
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(
    REFRESH_TASK
  );
  if (!alreadyRegistered) {
    await BackgroundTask.registerTaskAsync(REFRESH_TASK, {
      minimumInterval: 60 * 6, // minutes — OS decides exact timing
    });
  }
}
