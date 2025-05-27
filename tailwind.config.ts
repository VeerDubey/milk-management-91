
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
          DEFAULT: "#FAFBFC", // Light blue-gray
          secondary: "#F1F5F9", 
          light: "#FFFFFF",
          dark: "#0F172A", // Dark navy
          card: "#FFFFFF",
        },
        foreground: {
          DEFAULT: "#1E293B", // Dark blue-gray
          muted: "#64748B",
          dark: "#F1F5F9",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
          light: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#2563EB", // Rich blue
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
          950: "#172554",
        },
        secondary: {
          DEFAULT: "#0F172A", // Dark navy
          foreground: "#F1F5F9",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        accent: {
          DEFAULT: "#0EA5E9", // Sky blue
          foreground: "#FFFFFF",
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#059669",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
          light: "#F8FAFC",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
        },
        // Enhanced gradient colors
        gradient: {
          from: "#2563EB", // Primary blue
          via: "#0EA5E9", // Sky blue
          to: "#0284C7", // Darker blue
        },
        // Status colors
        status: {
          pending: "#D97706",
          completed: "#059669",
          cancelled: "#DC2626",
          processing: "#2563EB",
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
        'glow': '0 0 15px rgba(37, 99, 235, 0.15)',
        'blue-glow': '0 0 20px rgba(37, 99, 235, 0.3)',
        'success': '0 4px 14px 0 rgba(5, 150, 105, 0.25)',
        'warning': '0 4px 14px 0 rgba(217, 119, 6, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 50%, #0284C7 100%)',
        'card-gradient': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        'button-gradient': 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
        'main-gradient': 'linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        'dark-card': 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
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
            boxShadow: "0 0 5px rgba(37, 99, 235, 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(37, 99, 235, 0.6)"
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
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" }
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
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
