// frontend/src/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Deep sapphire blue - main brand color
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
    primary: "#1F4287", // Deep sapphire blue
    accent: "#FFC300",  // Vibrant golden yellow
    neutral: {
      50: "#F5F5F5",
      100: "#E0E0E0",
      200: "#A0A0A0",
      300: "#7A7A7A",
      400: "#555555",
      500: "#333333",
    },
  },
};

const fonts = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
};

// Define button variants for consistent styling
const components = {
  Button: {
    variants: {
      brand: {
        bg: "brand.accent",
        color: "brand.primary",
        fontWeight: "bold",
      },
      brandOutline: {
        border: "2px solid",
        borderColor: "brand.accent",
        color: "brand.accent",
        bg: "transparent",
        fontWeight: "bold",
      },
      brandGhost: {
        color: "brand.accent",
        bg: "transparent",
        fontWeight: "bold",
      },
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles: {
    global: {
      body: {
        bg: "brand.neutral.50",
        color: "brand.primary",
      },
    },
  },
});

export default theme;