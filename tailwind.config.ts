
import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#F0FDFA", // teal-50
          secondary: "#CCFBF1", // teal-100
          light: "#F8F9FA",
        },
        foreground: {
          DEFAULT: "#134E4A", // teal-900
          muted: "#5F8A8B",
          dark: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#134E4A", // teal-900
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#0D9488", // teal-600
          foreground: "#FFFFFF",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        secondary: {
          DEFAULT: "#0EA5E9", // sky-500
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // red-500
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
          light: "#E2E8F0",
        },
        accent: {
          DEFAULT: "#0D9488", // teal-600
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#B2F5EA", // teal-200
          light: "#E6FFFA", // teal-50
        },
        // Enhanced teal color palette
        teal: {
          25: "#F0FDFA",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        // Print-specific colors for track sheets
        print: {
          background: "#FFFFFF",
          text: "#000000",
          border: "#CCCCCC",
          header: "#F3F4F6",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        'subtle': '0 4px 20px rgba(13, 148, 136, 0.1)',
        'hover': '0 8px 30px rgba(13, 148, 136, 0.15)',
        'teal': '0 4px 14px 0 rgba(13, 148, 136, 0.39)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
