import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { OutfitRecommendation, Preferences, WeatherSnapshot } from "../types";
import { fetchWeather, getCurrentPlace } from "../weather";
import { recommendOutfit } from "../outfits";
import { fetchOutfitImages } from "../images";
import { colors, fonts, radius } from "../theme";

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
        <ActivityIndicator size="large" color={colors.ink} />
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
          {weather.observedAt !== "" && (
            <Text style={styles.metaText}>As of {weather.observedAt}</Text>
          )}
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
              <Image
                key={url}
                source={{ uri: url }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
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
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  errorText: {
    color: colors.ink,
    fontSize: 15,
    fontFamily: fonts.body,
    textAlign: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  place: {
    fontSize: 30,
    fontFamily: fonts.serif,
    fontWeight: "400",
    color: colors.ink,
  },
  condition: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 2,
  },
  settingsBtn: {
    backgroundColor: colors.lime,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  settingsText: {
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.ink,
    padding: 20,
    marginTop: 20,
  },
  temp: {
    fontSize: 48,
    fontFamily: fonts.serif,
    fontWeight: "400",
    color: colors.ink,
  },
  weatherMeta: { marginLeft: 18 },
  metaText: {
    color: colors.ink,
    fontSize: 13,
    fontFamily: fonts.body,
    marginVertical: 1,
  },
  outfitTitle: {
    fontSize: 26,
    fontFamily: fonts.serif,
    fontWeight: "400",
    color: colors.ink,
    marginTop: 30,
  },
  summary: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 6,
    lineHeight: 23,
  },
  imageRow: { marginTop: 16 },
  image: {
    width: 180,
    height: 225,
    borderRadius: radius.sm,
    marginRight: 10,
    backgroundColor: colors.offWhite,
  },
  imageCaption: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.gray,
    marginTop: 8,
  },
  section: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.ink,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 30,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.ink,
    marginVertical: 3,
    lineHeight: 23,
  },
  shopCard: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: 8,
  },
  shopLabel: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.ink,
  },
  shopNote: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 2,
  },
  cta: {
    backgroundColor: colors.lime,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  ctaText: { color: colors.ink, fontSize: 15, fontFamily: fonts.bodyBold },
});
