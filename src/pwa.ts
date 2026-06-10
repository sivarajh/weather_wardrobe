import { Platform } from "react-native";

// Expo's Metro web build doesn't expose an HTML template for classic
// (non-router) projects, so PWA wiring happens at runtime: inject the
// manifest + theme tags and register the service worker from /public.
export function registerPWA(): void {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const head = document.head;

  // Relative URLs so the app works both at the domain root (localhost dev)
  // and under a subpath (GitHub Pages serves at /weather_wardrobe/).
  if (!head.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "manifest.json";
    head.appendChild(manifest);
  }

  if (!head.querySelector('meta[name="theme-color"]')) {
    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#C8FF00";
    head.appendChild(theme);
  }

  if (!head.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "icons/icon-192.png";
    head.appendChild(appleIcon);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.warn("Service worker registration failed", err));
  }
}
