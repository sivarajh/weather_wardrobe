import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { loadPreferences } from "./storage";
import { fetchWeather, getCurrentPlace } from "./weather";
import { recommendOutfit } from "./outfits";
import { Preferences } from "./types";

const REFRESH_TASK = "weather-wardrobe-refresh";
const isWeb = Platform.OS === "web";

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (isWeb) {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
  }
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

async function buildNotificationContent(
  prefs: Preferences
): Promise<{ title: string; body: string }> {
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
  return { title, body };
}

// --- Web: in-page daily scheduler -----------------------------------------
// Browsers can't run client-only scheduled notifications when the page is
// fully closed (that needs a Web Push server). While the app or installed
// PWA is open — including in a background tab — this timer fires the daily
// notification at the chosen time and re-arms itself for the next day.

let webTimer: ReturnType<typeof setTimeout> | null = null;

async function showWebNotification(title: string, body: string): Promise<void> {
  const options: NotificationOptions = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "daily-outfit",
  };
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  } catch {
    // no service worker — fall through to a plain Notification
  }
  new Notification(title, options);
}

function scheduleWebDaily(prefs: Preferences): void {
  if (webTimer !== null) clearTimeout(webTimer);
  const fireAt = nextOccurrence(prefs.notificationHour, prefs.notificationMinute);
  webTimer = setTimeout(async () => {
    if (Notification.permission === "granted") {
      const { title, body } = await buildNotificationContent(prefs);
      await showWebNotification(title, body);
    }
    scheduleWebDaily(prefs); // re-arm for the next day
  }, fireAt.getTime() - Date.now());
}

// ---------------------------------------------------------------------------

/**
 * Cancels any pending notification and schedules the next one with content
 * built from the latest location + weather. Called on app open and from the
 * background refresh task, so the message stays current.
 */
export async function scheduleDailyOutfitNotification(
  prefs: Preferences
): Promise<void> {
  if (isWeb) {
    scheduleWebDaily(prefs);
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const { title, body } = await buildNotificationContent(prefs);
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
// notification so its content reflects current conditions. Native only.
if (!isWeb) {
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
}

export async function registerBackgroundRefresh(): Promise<void> {
  if (isWeb) return;
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
