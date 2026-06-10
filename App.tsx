import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import { colors } from "./src/theme";
import { Preferences } from "./src/types";
import { loadPreferences, savePreferences } from "./src/storage";
import {
  ensureNotificationPermissions,
  registerBackgroundRefresh,
  scheduleDailyOutfitNotification,
} from "./src/notifications";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { registerPWA } from "./src/pwa";

registerPWA();

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [booting, setBooting] = useState(true);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadPreferences();
      setPrefs(stored);
      setBooting(false);
      if (stored) {
        // refresh notification content + keep the background task alive
        ensureNotificationPermissions().then((granted) => {
          if (granted) {
            scheduleDailyOutfitNotification(stored);
            registerBackgroundRefresh();
          }
        });
      }
    })();
  }, []);

  const handleDone = async (next: Preferences) => {
    await savePreferences(next);
    setPrefs(next);
    setEditing(false);
    const granted = await ensureNotificationPermissions();
    if (granted) {
      await scheduleDailyOutfitNotification(next);
      await registerBackgroundRefresh();
    }
  };

  if (booting || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.paper,
        }}
      >
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {!prefs || editing ? (
        <OnboardingScreen initial={prefs ?? undefined} onDone={handleDone} />
      ) : (
        <HomeScreen prefs={prefs} onEditPrefs={() => setEditing(true)} />
      )}
    </>
  );
}
