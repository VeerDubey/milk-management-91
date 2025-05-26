
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
          DEFAULT: "#0A0E1A", // Deep dark blue
          secondary: "#151B2E", // Slightly lighter navy
          light: "#FFFFFF",
          dark: "#060A14",
          card: "#1E2A44", // Dark blue card background
        },
        foreground: {
          DEFAULT: "#F1F5F9", // Light text for dark backgrounds
          muted: "#94A3B8",
          dark: "#0F172A",
        },
        card: {
          DEFAULT: "#1E2A44", // Dark blue card
          foreground: "#F1F5F9",
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#6366F1", // Indigo primary
          foreground: "#FFFFFF",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        secondary: {
          DEFAULT: "#14B8A6", // Teal secondary
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
        accent: {
          DEFAULT: "#F59E0B", // Amber accent
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // Red for errors
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber for warnings
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981", // Emerald for success
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#334155", // Slate muted
          foreground: "#94A3B8",
          light: "#475569",
        },
        border: {
          DEFAULT: "#334155", // Slate borders
          light: "#475569",
        },
        // Enhanced gradient colors
        gradient: {
          from: "#1E2A44", // Deep blue
          via: "#6366F1", // Indigo
          to: "#14B8A6", // Teal
        },
        // Status colors
        status: {
          pending: "#F59E0B",
          completed: "#10B981",
          cancelled: "#EF4444",
          processing: "#6366F1",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        'subtle': '0 4px 20px rgba(99, 102, 241, 0.1)',
        'hover': '0 8px 30px rgba(99, 102, 241, 0.15)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'success': '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #1E2A44 0%, #6366F1 50%, #14B8A6 100%)',
        'card-gradient': 'linear-gradient(145deg, #1E2A44 0%, #334155 100%)',
        'button-gradient': 'linear-gradient(135deg, #6366F1 0%, #14B8A6 100%)',
        'main-gradient': 'linear-gradient(135deg, #0A0E1A 0%, #151B2E 50%, #1E2A44 100%)',
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
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "slide-in": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(0)"
          }
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(99, 102, 241, 0.5)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.8)"
          }
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
