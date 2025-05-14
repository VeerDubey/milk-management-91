
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";
export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accentColor?: string;
  applyTheme?: (theme: Theme, accent?: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState<string>("#0284c7");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const storedAccent = localStorage.getItem("accentColor");
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    
    if (storedAccent) {
      setAccentColor(storedAccent);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const applyTheme = (newTheme: Theme, accent?: string) => {
    setTheme(newTheme);
    
    if (accent) {
      setAccentColor(accent);
      localStorage.setItem("accentColor", accent);
      
      // Apply accent color to CSS variables
      document.documentElement.style.setProperty("--primary", accent);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accentColor, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
