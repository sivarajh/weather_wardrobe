import { Platform } from "react-native";

// Design language modeled on whering.co.uk: near-black ink on white,
// signature lime + lavender accents, serif display headlines (IvyMode on
// their site — closest licensed-free stand-in is the platform serif),
// Manrope body text, monospace uppercase section labels, small radii.
export const colors = {
  ink: "#242424",
  paper: "#FFFFFF",
  offWhite: "#F5F5F5",
  lime: "#C8FF00",
  lavender: "#CEB4FE",
  pink: "#FF95B8",
  border: "#E3E3E3",
  gray: "#6C757D",
};

export const radius = {
  sm: 5,
  pill: 100,
};

export const fonts = {
  serif: Platform.select({
    ios: "Georgia",
    android: "serif",
    web: "Georgia, 'Times New Roman', serif",
    default: "serif",
  }) as string,
  body: "Manrope_400Regular",
  bodySemiBold: "Manrope_600SemiBold",
  bodyBold: "Manrope_700Bold",
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    web: "'Space Mono', Menlo, monospace",
    default: "monospace",
  }) as string,
};
