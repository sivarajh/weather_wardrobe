# Weather Wardrobe 👗🌦

An Expo (React Native) app that sends a **daily notification** suggesting what
to wear based on your **current location and weather**, personalized by
**gender, style choice, and modesty preference** — with sample outfit images
and links to find each look at the best and cheapest price.

## Screenshots

| Onboarding | Home |
| :---: | :---: |
| <img src="screenshots/onboarding.png" width="280" alt="Onboarding: gender, style, modesty and notification time choices" /> | <img src="screenshots/home.png" width="280" alt="Home: local weather, outfit recommendation, sample looks and shopping links" /> |

## Features

- **Onboarding profile** — pick who you shop for (women / men / non-binary),
  your style (casual, formal, sporty, streetwear, bohemian, traditional), and
  modesty level (relaxed / moderate / high — high coverage swaps shorts and
  sleeveless pieces for full-length items and adds an optional headscarf).
- **Live local weather** — uses your device location with the free
  [Open-Meteo](https://open-meteo.com) API (no API key required), including
  feels-like temperature, rain probability, wind, and snow.
- **Outfit engine** — 6 temperature bands × 6 styles × 2 gender matrices with
  modesty and weather adjustments (umbrella, waterproof boots, sunscreen…).
- **Sample images** — three keyword-matched look photos per recommendation.
- **Where to buy** — one-tap links to Google Shopping (price comparison),
  Amazon sorted lowest-price-first, and H&M budget picks.
- **Daily notification** — scheduled at your chosen morning time, with the
  outfit and temperature in the message. A background task periodically
  re-fetches weather and refreshes the notification content.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

> **Note on background refresh:** `expo-background-task` and full notification
> behavior require a development build for complete fidelity:
>
> ```bash
> npx expo run:ios     # or: npx expo run:android
> ```
>
> In Expo Go the notification is still scheduled each time you open the app
> (with fresh weather), but OS-level background refresh may not run.

## Project structure

```
App.tsx                     # boot, onboarding vs home routing, notification setup
src/types.ts                # shared types
src/storage.ts              # AsyncStorage preferences
src/weather.ts              # location + Open-Meteo fetch + WMO code mapping
src/outfits.ts              # recommendation engine, images, shopping links
src/notifications.ts        # daily notification + background refresh task
src/screens/OnboardingScreen.tsx
src/screens/HomeScreen.tsx
```

## Known limitations

- Sample images come from Unsplash search (matched to the outfit pieces and
  style, re-ranked by subject), not the exact product — good for inspiration,
  not a catalog. The search endpoint is unofficial; if it ever stops working,
  the image strip hides itself and the rest of the app is unaffected.
- "Cheapest price" is delivered via lowest-price-sorted retailer searches;
  a true price-comparison API (e.g. Google Shopping Content API) would need
  API keys and a backend.
- iOS background tasks run at the OS's discretion, so notification content is
  refreshed opportunistically (and always on app open).
