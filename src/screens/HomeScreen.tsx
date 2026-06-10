import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OutfitRecommendation, Preferences, WeatherSnapshot } from "../types";
import { fetchWeather, getCurrentPlace } from "../weather";
import { recommendOutfit } from "../outfits";
import { fetchOutfitImages } from "../images";

interface Props {
  prefs: Preferences;
  onEditPrefs: () => void;
}

export default function HomeScreen({ prefs, onEditPrefs }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placeLabel, setPlaceLabel] = useState("");
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [outfit, setOutfit] = useState<OutfitRecommendation | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const place = await getCurrentPlace();
      const snapshot = await fetchWeather(place.latitude, place.longitude);
      const recommendation = recommendOutfit(
        snapshot,
        prefs.gender,
        prefs.style,
        prefs.modesty
      );
      setPlaceLabel(place.label);
      setWeather(snapshot);
      setOutfit(recommendation);
      setImageUrls([]);
      fetchOutfitImages(recommendation.imageQuery).then(setImageUrls);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [prefs]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Checking your local weather…</Text>
      </View>
    );
  }

  if (error || !weather || !outfit) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "No data available."}</Text>
        <TouchableOpacity style={styles.cta} onPress={refresh}>
          <Text style={styles.ctaText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refresh} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.place}>{placeLabel}</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
        <TouchableOpacity onPress={onEditPrefs} style={styles.settingsBtn}>
          <Text style={styles.settingsText}>⚙ Style</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weatherCard}>
        <Text style={styles.temp}>{Math.round(weather.temperatureC)}°C</Text>
        <View style={styles.weatherMeta}>
          <Text style={styles.metaText}>
            Feels like {Math.round(weather.feelsLikeC)}°C
          </Text>
          <Text style={styles.metaText}>
            💨 {Math.round(weather.windKph)} km/h · ☔{" "}
            {weather.precipitationProbability}% rain
          </Text>
        </View>
      </View>

      <Text style={styles.outfitTitle}>{outfit.title}</Text>
      <Text style={styles.summary}>{outfit.summary}</Text>

      {imageUrls.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageRow}
          >
            {imageUrls.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.image} />
            ))}
          </ScrollView>
          <Text style={styles.imageCaption}>
            Sample looks matched to your style (via Unsplash)
          </Text>
        </>
      )}

      <Text style={styles.section}>What to wear</Text>
      {outfit.pieces.map((piece) => (
        <Text key={piece} style={styles.listItem}>
          •  {piece}
        </Text>
      ))}

      {outfit.accessories.length > 0 && (
        <>
          <Text style={styles.section}>Weather essentials</Text>
          {outfit.accessories.map((item) => (
            <Text key={item} style={styles.listItem}>
              •  {item}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.section}>Where to buy — best & cheapest</Text>
      {outfit.shoppingLinks.map((link) => (
        <TouchableOpacity
          key={link.url}
          style={styles.shopCard}
          onPress={() => Linking.openURL(link.url)}
        >
          <Text style={styles.shopLabel}>{link.label}</Text>
          <Text style={styles.shopNote}>{link.note}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFBF7",
    padding: 24,
  },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 15 },
  errorText: {
    color: "#B91C1C",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  place: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  condition: { fontSize: 15, color: "#6B7280", marginTop: 2 },
  settingsBtn: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  settingsText: { color: "#4F46E5", fontWeight: "600" },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
  },
  temp: { fontSize: 44, fontWeight: "800", color: "#FFFFFF" },
  weatherMeta: { marginLeft: 18 },
  metaText: { color: "#E0E7FF", fontSize: 14, marginVertical: 1 },
  outfitTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 28,
  },
  summary: { fontSize: 15, color: "#6B7280", marginTop: 6, lineHeight: 22 },
  imageRow: { marginTop: 16 },
  image: {
    width: 180,
    height: 225,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "#E5E7EB",
  },
  imageCaption: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 8,
  },
  listItem: { fontSize: 15, color: "#374151", marginVertical: 3, lineHeight: 22 },
  shopCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  shopLabel: { fontSize: 15, fontWeight: "600", color: "#4F46E5" },
  shopNote: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  cta: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
