import { heroui } from "@heroui/theme";

export default heroui({
  defaultTheme: "light",
  themes: {
    light: {
      colors: {
        primary: {
          50: "#EEF0FA",
          100: "#DDE1F5",
          200: "#BCC4EB",
          300: "#98A2DD",
          400: "#6F7CCC",
          500: "#4A56B5",
          600: "#2F3A9C",
          700: "#1F2A87",
          800: "#111965",
          DEFAULT: "#111965",
          900: "#0B1246",
          foreground: "#FFFFFF",
        },
        focus: "#F7CE4D",
      },
    },
    dark: {
      colors: {
        primary: {
          50: "#2A2410",
          100: "#453914",
          200: "#6B5718",
          300: "#A5831F",
          400: "#D4A727",
          500: "#F7CE4D",
          600: "#F9D96F",
          700: "#FAE191",
          DEFAULT: "#F7CE4D",
          800: "#FCE9B5",
          900: "#FEF4D8",
          foreground: "#111965",
        },
        focus: "#F7CE4D",
      },
    },
  },
});
