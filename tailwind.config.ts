
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
          DEFAULT: "#FAFBFC", // Clean white background
          secondary: "#F8FAFC", // Slightly off-white
          light: "#FFFFFF",
          dark: "#0F172A", // Dark slate for dark mode
          card: "#FFFFFF", // Pure white cards
        },
        foreground: {
          DEFAULT: "#1E293B", // Dark slate text
          muted: "#64748B",
          dark: "#F1F5F9",
        },
        card: {
          DEFAULT: "#FFFFFF", // Clean white cards
          foreground: "#1E293B",
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#3B82F6", // Beautiful blue
          foreground: "#FFFFFF",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#8B5CF6", // Purple accent
          foreground: "#FFFFFF",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        accent: {
          DEFAULT: "#06B6D4", // Cyan accent
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // Clean red
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B", // Amber warning
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981", // Emerald success
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9", // Light slate muted
          foreground: "#64748B",
          light: "#F8FAFC",
        },
        border: {
          DEFAULT: "#E2E8F0", // Light borders
          light: "#F1F5F9",
        },
        // Enhanced gradient colors
        gradient: {
          from: "#3B82F6", // Blue
          via: "#8B5CF6", // Purple  
          to: "#06B6D4", // Cyan
        },
        // Status colors
        status: {
          pending: "#F59E0B",
          completed: "#10B981",
          cancelled: "#EF4444",
          processing: "#3B82F6",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.15)',
        'success': '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
        'card-gradient': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        'button-gradient': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'main-gradient': 'linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
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
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
          }
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" }
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
