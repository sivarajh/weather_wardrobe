import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AgeGroup, Gender, Modesty, Preferences, StyleChoice } from "../types";
import { DEFAULT_PREFS } from "../storage";
import { colors, fonts, radius, shadow } from "../theme";
import Springy from "../components/Springy";

// Stagger for top-level blocks as the screen builds in.
const enter = (slot: number) =>
  FadeInDown.delay(60 * slot)
    .duration(450)
    .springify()
    .damping(16);

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "girl", label: "Girl" },
  { value: "boy", label: "Boy" },
];

const AGE_GROUPS: { value: AgeGroup; label: string; hint: string }[] = [
  { value: "toddler", label: "Toddler", hint: "Ages 2–5" },
  { value: "kids", label: "Kids", hint: "Ages 6–12" },
  { value: "teen", label: "Teen", hint: "Ages 13–17" },
];

const KIDS_GENDERS: Gender[] = ["girl", "boy"];

const STYLES: { value: StyleChoice; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal / Office" },
  { value: "sporty", label: "Sporty" },
  { value: "streetwear", label: "Streetwear" },
  { value: "bohemian", label: "Bohemian" },
  { value: "traditional", label: "Traditional / Ethnic" },
];

const MODESTY: { value: Modesty; label: string; hint: string }[] = [
  { value: "relaxed", label: "Relaxed", hint: "No restrictions" },
  { value: "moderate", label: "Moderate", hint: "Knee-length+, covered shoulders" },
  { value: "high", label: "High", hint: "Full coverage, optional headscarf" },
];

const TIMES: { hour: number; minute: number }[] = [
  { hour: 6, minute: 0 },
  { hour: 6, minute: 30 },
  { hour: 7, minute: 0 },
  { hour: 7, minute: 30 },
  { hour: 8, minute: 0 },
  { hour: 8, minute: 30 },
];

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

interface Props {
  initial?: Preferences;
  onDone: (prefs: Preferences) => void;
}

export default function OnboardingScreen({ initial, onDone }: Props) {
  const [prefs, setPrefs] = useState<Preferences>(initial ?? DEFAULT_PREFS);

  const chip = (selected: boolean) => [
    styles.chip,
    selected && styles.chipSelected,
  ];
  const chipText = (selected: boolean) => [
    styles.chipText,
    selected && styles.chipTextSelected,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={enter(0)}>
        <Text style={styles.heading}>
          {initial ? "Update your style profile" : "Welcome to Weather Wardrobe"}
        </Text>
        <Text style={styles.sub}>
          Tell us your style and we'll suggest what to wear every morning based
          on your local weather.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <Text style={styles.section}>I shop for</Text>
        <View style={styles.row}>
          {GENDERS.map((g) => (
            <Springy
              key={g.value}
              style={chip(prefs.gender === g.value)}
              onPress={() =>
                setPrefs({
                  ...prefs,
                  gender: g.value,
                  ageGroup: KIDS_GENDERS.includes(g.value)
                    ? prefs.ageGroup ?? "kids"
                    : undefined,
                })
              }
            >
              <Text style={chipText(prefs.gender === g.value)}>{g.label}</Text>
            </Springy>
          ))}
        </View>
      </Animated.View>

      {KIDS_GENDERS.includes(prefs.gender) && (
        <Animated.View entering={enter(2)}>
          <Text style={styles.section}>Age group</Text>
          {AGE_GROUPS.map((ag) => (
            <Springy
              key={ag.value}
              style={[
                styles.modestyCard,
                prefs.ageGroup === ag.value && styles.chipSelected,
              ]}
              onPress={() => setPrefs({ ...prefs, ageGroup: ag.value })}
            >
              <Text style={chipText(prefs.ageGroup === ag.value)}>{ag.label}</Text>
              <Text
                style={[
                  styles.hint,
                  prefs.ageGroup === ag.value && styles.chipTextSelected,
                ]}
              >
                {ag.hint}
              </Text>
            </Springy>
          ))}
        </Animated.View>
      )}

      <Animated.View entering={enter(3)}>
        <Text style={styles.section}>My style</Text>
        <View style={styles.row}>
          {STYLES.map((s) => (
            <Springy
              key={s.value}
              style={chip(prefs.style === s.value)}
              onPress={() => setPrefs({ ...prefs, style: s.value })}
            >
              <Text style={chipText(prefs.style === s.value)}>{s.label}</Text>
            </Springy>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={enter(4)}>
        <Text style={styles.section}>Modesty preference</Text>
        {MODESTY.map((m) => (
          <Springy
            key={m.value}
            style={[
              styles.modestyCard,
              prefs.modesty === m.value && styles.chipSelected,
            ]}
            onPress={() => setPrefs({ ...prefs, modesty: m.value })}
          >
            <Text style={chipText(prefs.modesty === m.value)}>{m.label}</Text>
            <Text
              style={[
                styles.hint,
                prefs.modesty === m.value && styles.chipTextSelected,
              ]}
            >
              {m.hint}
            </Text>
          </Springy>
        ))}
      </Animated.View>

      <Animated.View entering={enter(5)}>
        <Text style={styles.section}>Daily notification time</Text>
        <View style={styles.row}>
          {TIMES.map((t) => {
            const selected =
              prefs.notificationHour === t.hour &&
              prefs.notificationMinute === t.minute;
            return (
              <Springy
                key={`${t.hour}:${t.minute}`}
                style={chip(selected)}
                onPress={() =>
                  setPrefs({
                    ...prefs,
                    notificationHour: t.hour,
                    notificationMinute: t.minute,
                  })
                }
              >
                <Text style={chipText(selected)}>
                  {formatTime(t.hour, t.minute)}
                </Text>
              </Springy>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={enter(6)}>
        <Springy style={styles.cta} onPress={() => onDone(prefs)}>
          <Text style={styles.ctaText}>
            {initial ? "Save changes" : "Get my daily outfit"}
          </Text>
        </Springy>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 72, paddingBottom: 48 },
  heading: {
    fontSize: 34,
    fontFamily: fonts.serif,
    fontWeight: "400",
    color: colors.ink,
    lineHeight: 42,
  },
  sub: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 12,
    lineHeight: 23,
  },
  section: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 32,
    marginBottom: 12,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.bodySemiBold,
  },
  chipTextSelected: { color: colors.paper },
  modestyCard: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 10,
  },
  hint: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.gray,
    marginTop: 2,
  },
  cta: {
    marginTop: 36,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 17,
    alignItems: "center",
    ...shadow,
  },
  ctaText: {
    color: colors.paper,
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.3,
  },
});
