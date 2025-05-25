
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
          DEFAULT: "#0F1629", // Deep navy from the image
          secondary: "#1A2332", // Slightly lighter navy
          light: "#FFFFFF",
          dark: "#0A0F1C",
          card: "#1E293B", // Dark card background
        },
        foreground: {
          DEFAULT: "#F8FAFC", // Light text for dark backgrounds
          muted: "#94A3B8",
          dark: "#0F172A",
        },
        card: {
          DEFAULT: "#1E293B", // Dark card with slight transparency
          foreground: "#F8FAFC",
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#3B82F6", // Bright blue from gradient
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
          DEFAULT: "#06B6D4", // Teal from gradient
          foreground: "#FFFFFF",
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        accent: {
          DEFAULT: "#8B5CF6", // Purple accent
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
          DEFAULT: "#10B981", // Green for success
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#334155", // Muted backgrounds
          foreground: "#94A3B8",
          light: "#475569",
        },
        border: {
          DEFAULT: "#334155", // Borders
          light: "#475569",
        },
        // Enhanced gradient colors from the image
        gradient: {
          from: "#1E293B", // Deep navy
          via: "#0F4C75", // Mid blue
          to: "#06B6D4", // Bright teal
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
        'card': '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #1E293B 0%, #0F4C75 50%, #06B6D4 100%)',
        'card-gradient': 'linear-gradient(145deg, #1E293B 0%, #334155 100%)',
        'button-gradient': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        'main-gradient': 'linear-gradient(135deg, #0F1629 0%, #1A2332 50%, #0F4C75 100%)',
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
