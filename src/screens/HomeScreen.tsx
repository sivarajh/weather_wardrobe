import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import { OutfitRecommendation, Preferences, WeatherSnapshot } from "../types";
import { fetchWeather, getCurrentPlace } from "../weather";
import { recommendOutfit } from "../outfits";
import { fetchOutfitImages } from "../images";
import { colors, fonts, gradient, radius, shadow } from "../theme";
import Springy from "../components/Springy";

// Stagger for top-level blocks as the screen builds in.
const enter = (slot: number) =>
  FadeInDown.delay(60 * slot)
    .duration(450)
    .springify()
    .damping(16);

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
  const [imagesLoading, setImagesLoading] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const place = await getCurrentPlace();
      const snapshot = await fetchWeather(place.latitude, place.longitude);
      const recommendation = recommendOutfit(
        snapshot,
        prefs.gender,
        prefs.style,
        prefs.modesty,
        prefs.ageGroup
      );
      setPlaceLabel(place.label);
      setWeather(snapshot);
      setOutfit(recommendation);
      setImageUrls([]);
      setImagesLoading(true);
      fetchOutfitImages(recommendation.imageQuery)
        .then(setImageUrls)
        .finally(() => setImagesLoading(false));
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
        <Animated.View entering={FadeIn.duration(400)}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking your local weather…</Text>
        </Animated.View>
      </View>
    );
  }

  if (error || !weather || !outfit) {
    return (
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(350)}>
          <Text style={styles.errorText}>{error ?? "No data available."}</Text>
        </Animated.View>
        <Springy
          style={styles.cta}
          onPress={() => {
            setLoading(true);
            refresh();
          }}
        >
          <Text style={styles.ctaText}>Try again</Text>
        </Springy>
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
      <Animated.View entering={enter(0)} style={styles.headerRow}>
        <View>
          <Text style={styles.place}>{placeLabel}</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
        <Springy onPress={onEditPrefs} style={styles.settingsBtn}>
          <Text style={styles.settingsText}>⚙ Style</Text>
        </Springy>
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.weatherCard}
        >
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
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <Text style={styles.outfitTitle}>{outfit.title}</Text>
        <Text style={styles.summary}>{outfit.summary}</Text>
      </Animated.View>

      {(imagesLoading || imageUrls.length > 0) && (
        <Animated.View entering={FadeIn.duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageRow}
          >
            {imagesLoading && imageUrls.length === 0
              ? // Skeleton placeholders while images load
                [0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.image, styles.imageSkeleton]} />
                ))
              : imageUrls.map((url, i) => (
                  <Animated.View
                    key={url}
                    entering={FadeInRight.delay(120 * i)
                      .duration(500)
                      .springify()
                      .damping(18)}
                  >
                    <Image
                      source={{ uri: url }}
                      style={styles.image}
                      contentFit="cover"
                      transition={300}
                    />
                  </Animated.View>
                ))}
          </ScrollView>
          <Text style={styles.imageCaption}>
            Sample looks matched to your style
          </Text>
        </Animated.View>
      )}

      <Animated.View entering={enter(3)}>
        <Text style={styles.section}>What to wear</Text>
        {outfit.pieces.map((piece) => (
          <Text key={piece} style={styles.listItem}>
            •  {piece}
          </Text>
        ))}
      </Animated.View>

      {outfit.accessories.length > 0 && (
        <Animated.View entering={enter(4)}>
          <Text style={styles.section}>Weather essentials</Text>
          {outfit.accessories.map((item) => (
            <Text key={item} style={styles.listItem}>
              •  {item}
            </Text>
          ))}
        </Animated.View>
      )}

      <Animated.View entering={enter(5)}>
        <Text style={styles.section}>Where to buy — best & cheapest</Text>
        {outfit.shoppingLinks.map((link) => (
          <Springy
            key={link.url}
            style={styles.shopCard}
            onPress={() => Linking.openURL(link.url)}
          >
            <Text style={styles.shopLabel}>{link.label}</Text>
            <Text style={styles.shopNote}>{link.note}</Text>
          </Springy>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 64, paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
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
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  settingsText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    padding: 22,
    marginTop: 20,
    ...shadow,
  },
  temp: {
    fontSize: 48,
    fontFamily: fonts.serif,
    fontWeight: "400",
    color: colors.paper,
  },
  weatherMeta: { marginLeft: 18 },
  metaText: {
    color: colors.paper,
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
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
    borderRadius: radius.lg,
    marginRight: 10,
    backgroundColor: colors.primaryFaint,
  },
  imageSkeleton: {
    opacity: 0.4,
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
    color: colors.gray,
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
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 10,
    ...shadow,
  },
  shopLabel: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
    color: colors.primary,
  },
  shopNote: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 2,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    ...shadow,
  },
  ctaText: { color: colors.paper, fontSize: 15, fontFamily: fonts.bodyBold },
});
