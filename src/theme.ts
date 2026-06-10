import { Platform, ViewStyle } from "react-native";

// "Silk" evolution of the Whering-inspired language: lavender is now the
// primary, paired with blush pink in gradients. Hard ink outlines are
// replaced with soft shadows, hairline borders, and generous radii.
export const colors = {
  ink: "#2B2435",
  paper: "#FFFFFF",
  background: "#FAF8FD",
  primary: "#B79CED",
  primarySoft: "#CEB4FE",
  primaryFaint: "#F1EBFC",
  pink: "#FF95B8",
  border: "#EDE7F8",
  gray: "#8B8398",
};

// Blush-to-lavender, lifted from Whering's section gradient.
export const gradient = ["#FF95B8", "#CEB4FE"] as const;

export const radius = {
  sm: 14,
  lg: 22,
  pill: 100,
};

export const shadow: ViewStyle = Platform.select({
  web: { boxShadow: "0 10px 30px rgba(99, 70, 160, 0.12)" } as ViewStyle,
  default: {
    shadowColor: "#6346A0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
}) as ViewStyle;

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
