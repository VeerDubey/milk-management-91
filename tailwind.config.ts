
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        tertiary: "hsl(var(--tertiary))",
        
        // Moody Minimal Dark theme specific colors
        'jet-black': '#0B0B0F',
        'onyx-gray': '#16161C', 
        'iron-shadow': '#2C2C35',
        'cloud-white': '#E1E1E6',
        'fog-gray': '#8F8F9C',
        'slate-blue': '#5A5DFF',
        'dusty-rose': '#C47A95',
        'sage-green': '#A3C9A8',
        'blue-steel': '#4144B5',
        'clay-red': '#D16363',
        'forest-mist': '#6DB28B',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'moody': ['Inter', 'Nunito', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'moody': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'moody-lg': '0 12px 40px rgba(0, 0, 0, 0.5)',
        'moody-glow': '0 0 30px hsl(var(--primary) / 0.4)',
        'moody-glow-secondary': '0 0 30px hsl(var(--secondary) / 0.4)',
        'moody-glow-accent': '0 0 30px hsl(var(--accent) / 0.4)',
      },
      backgroundImage: {
        'moody-gradient': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)',
        'moody-card-gradient': 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.3) 100%)',
        'moody-button-gradient': 'linear-gradient(135deg, hsl(var(--button-primary)) 0%, hsl(var(--primary)) 100%)',
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
        "moody-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--primary) / 0.6)"
          }
        },
        "moody-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "moody-pulse": "moody-pulse 3s ease-in-out infinite",
        "moody-float": "moody-float 4s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
