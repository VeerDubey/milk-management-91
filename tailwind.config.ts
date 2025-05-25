
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
          DEFAULT: "#FAFBFC", // Light gray-blue
          secondary: "#F1F5F9", // Slightly darker
          light: "#FFFFFF",
          dark: "#0F172A",
        },
        foreground: {
          DEFAULT: "#1E293B", // Dark slate
          muted: "#64748B",
          dark: "#0F172A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#3B82F6", // Modern blue
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
          DEFAULT: "#10B981", // Modern emerald
          foreground: "#FFFFFF",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        accent: {
          DEFAULT: "#8B5CF6", // Modern purple
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // Modern red
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B", // Modern amber
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981", // Modern emerald
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#64748B",
          light: "#F1F5F9",
        },
        border: {
          DEFAULT: "#E2E8F0", // Light slate
          light: "#F1F5F9",
        },
        // Enhanced gradient colors
        gradient: {
          from: "#3B82F6",
          via: "#8B5CF6",
          to: "#10B981",
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
        'subtle': '0 4px 20px rgba(59, 130, 246, 0.1)',
        'hover': '0 8px 30px rgba(59, 130, 246, 0.15)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'success': '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
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
            boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)"
          }
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
