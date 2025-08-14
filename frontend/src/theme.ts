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
  // Override default Chakra colors to use brand colors
  blue: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  green: {
    50: "#FFF8E6",
    100: "#FFE8B3",
    200: "#FFD880",
    300: "#FFC84D",
    400: "#FFB81A",
    500: "#FFC300", // Use brand accent
    600: "#E6B000",
    700: "#CC9D00",
    800: "#B38A00",
    900: "#997700",
  },
  // Override other color schemes to use brand colors
  purple: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  teal: {
    50: "#FFF8E6",
    100: "#FFE8B3",
    200: "#FFD880",
    300: "#FFC84D",
    400: "#FFB81A",
    500: "#FFC300", // Use brand accent
    600: "#E6B000",
    700: "#CC9D00",
    800: "#B38A00",
    900: "#997700",
  },
  cyan: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  indigo: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  // Add more color scheme overrides for consistency
  orange: {
    50: "#FFF8E6",
    100: "#FFE8B3",
    200: "#FFD880",
    300: "#FFC84D",
    400: "#FFB81A",
    500: "#FFC300", // Use brand accent
    600: "#E6B000",
    700: "#CC9D00",
    800: "#B38A00",
    900: "#997700",
  },
  yellow: {
    50: "#FFF8E6",
    100: "#FFE8B3",
    200: "#FFD880",
    300: "#FFC84D",
    400: "#FFB81A",
    500: "#FFC300", // Use brand accent
    600: "#E6B000",
    700: "#CC9D00",
    800: "#B38A00",
    900: "#997700",
  },
  red: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  pink: {
    50: "#E6F0FF",
    100: "#B3D1FF",
    200: "#80B3FF",
    300: "#4D94FF",
    400: "#1A75FF",
    500: "#1F4287", // Use brand primary
    600: "#1A3A7A",
    700: "#15326D",
    800: "#102A60",
    900: "#0B2253",
  },
  gray: {
    50: "#F5F5F5",
    100: "#E0E0E0",
    200: "#A0A0A0",
    300: "#7A7A7A",
    400: "#555555",
    500: "#333333",
    600: "#2A2A2A",
    700: "#1F1F1F",
    800: "#151515",
    900: "#0A0A0A",
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
        _hover: {
          bg: "brand.accent",
          opacity: 0.9,
        },
      },
      brandOutline: {
        border: "2px solid",
        borderColor: "brand.accent",
        color: "brand.accent",
        bg: "transparent",
        fontWeight: "bold",
        _hover: {
          bg: "brand.accent",
          color: "brand.primary",
        },
      },
      brandGhost: {
        color: "brand.accent",
        bg: "transparent",
        fontWeight: "bold",
        _hover: {
          bg: "brand.accent",
          color: "brand.primary",
        },
      },
      brandSolid: {
        bg: "brand.primary",
        color: "white",
        fontWeight: "bold",
        _hover: {
          bg: "brand.600",
        },
      },
    },
    defaultProps: {
      colorScheme: "brand",
    },
  },
  Badge: {
    defaultProps: {
      colorScheme: "brand",
    },
  },
  Progress: {
    defaultProps: {
      colorScheme: "brand",
    },
  },
  Select: {
    defaultProps: {
      colorScheme: "brand",
    },
    baseStyle: {
      field: {
        zIndex: 1,
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        zIndex: 9999,
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
      // Fix z-index issues for dropdowns and modals
      ".chakra-menu__menu-list": {
        zIndex: "9999 !important",
      },
      ".chakra-select__menu": {
        zIndex: "9999 !important",
      },
      ".chakra-modal__content": {
        zIndex: "9999 !important",
      },
    },
  },
});

export default theme;