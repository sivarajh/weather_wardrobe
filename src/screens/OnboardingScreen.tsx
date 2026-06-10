import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gender, Modesty, Preferences, StyleChoice } from "../types";
import { DEFAULT_PREFS } from "../storage";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
  { value: "nonbinary", label: "Non-binary" },
];

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
      <Text style={styles.heading}>
        {initial ? "Update your style profile" : "Welcome to Weather Wardrobe"}
      </Text>
      <Text style={styles.sub}>
        Tell us your style and we'll suggest what to wear every morning based on
        your local weather.
      </Text>

      <Text style={styles.section}>I shop for</Text>
      <View style={styles.row}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={chip(prefs.gender === g.value)}
            onPress={() => setPrefs({ ...prefs, gender: g.value })}
          >
            <Text style={chipText(prefs.gender === g.value)}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>My style</Text>
      <View style={styles.row}>
        {STYLES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={chip(prefs.style === s.value)}
            onPress={() => setPrefs({ ...prefs, style: s.value })}
          >
            <Text style={chipText(prefs.style === s.value)}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Modesty preference</Text>
      {MODESTY.map((m) => (
        <TouchableOpacity
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
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>Daily notification time</Text>
      <View style={styles.row}>
        {TIMES.map((t) => {
          const selected =
            prefs.notificationHour === t.hour &&
            prefs.notificationMinute === t.minute;
          return (
            <TouchableOpacity
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
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => onDone(prefs)}>
        <Text style={styles.ctaText}>
          {initial ? "Save changes" : "Get my daily outfit"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFBF7" },
  content: { padding: 24, paddingTop: 72, paddingBottom: 48 },
  heading: { fontSize: 28, fontWeight: "700", color: "#1F2937" },
  sub: { fontSize: 15, color: "#6B7280", marginTop: 8, lineHeight: 22 },
  section: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 10,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  chipText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  chipTextSelected: { color: "#FFFFFF" },
  modestyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  hint: { fontSize: 13, color: "#9CA3AF", marginTop: 2 },
  cta: {
    marginTop: 36,
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
