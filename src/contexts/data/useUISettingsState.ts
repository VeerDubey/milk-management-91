
import { useState, useEffect } from 'react';
import { UISettings } from '@/types';

const defaultUISettings: UISettings = {
  theme: "dark",
  sidebarCollapsed: false,
  sidebarStyle: "gradient",
  tableStyle: "striped",
  fontSize: "medium",
  dateFormat: "MMM dd, yyyy",
  colorScheme: "teal",
  notificationFrequency: "immediate",
  accentColor: "teal",
  compactMode: false,
  highContrast: false
};

export function useUISettingsState() {
  const [uiSettings, setUISettings] = useState<UISettings>(() => {
    try {
      const saved = localStorage.getItem("uiSettings");
      return saved ? { ...defaultUISettings, ...JSON.parse(saved) } : defaultUISettings;
    } catch (error) {
      console.error("Error loading UI settings:", error);
      return defaultUISettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("uiSettings", JSON.stringify(uiSettings));
      
      // Apply theme to document
      if (uiSettings.theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else if (uiSettings.theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else if (uiSettings.theme === "system") {
        // System preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
      
      // Apply accent color as CSS variable
      let accentHue = "164"; // Teal default
      let accentSaturation = "70%";
      let accentLightness = "58%";
      
      switch (uiSettings.accentColor) {
        case "teal":
          accentHue = "164";
          accentSaturation = "70%";
          accentLightness = "58%";
          break;
        case "blue":
          accentHue = "217";
          accentSaturation = "91%";
          accentLightness = "70%";
          break;
        case "purple":
          accentHue = "259";
          accentSaturation = "94%";
          accentLightness = "61%";
          break;
        case "pink":
          accentHue = "330";
          accentSaturation = "90%";
          accentLightness = "66%";
          break;
        case "orange":
          accentHue = "24";
          accentSaturation = "95%";
          accentLightness = "63%";
          break;
        case "green":
          accentHue = "142";
          accentSaturation = "71%";
          accentLightness = "45%";
          break;
      }
      
      document.documentElement.style.setProperty('--accent-hue', accentHue);
      document.documentElement.style.setProperty('--accent-saturation', accentSaturation);
      document.documentElement.style.setProperty('--accent-lightness', accentLightness);
      
      // Apply additional theme-specific CSS variables
      if (uiSettings.theme === "light") {
        document.documentElement.style.setProperty('--background', '0 0% 100%');
        document.documentElement.style.setProperty('--foreground', '240 10% 3.9%');
        document.documentElement.style.setProperty('--card', '0 0% 100%');
        document.documentElement.style.setProperty('--card-foreground', '240 10% 3.9%');
        document.documentElement.style.setProperty('--border', '240 5.9% 90%');
        document.documentElement.style.setProperty('--input', '240 5.9% 90%');
        document.documentElement.style.setProperty('--muted', '240 4.8% 95.9%');
        document.documentElement.style.setProperty('--muted-foreground', '240 3.8% 46.1%');
      } else {
        document.documentElement.style.setProperty('--background', '240 10% 3.9%');
        document.documentElement.style.setProperty('--foreground', '0 0% 98%');
        document.documentElement.style.setProperty('--card', '240 10% 3.9%');
        document.documentElement.style.setProperty('--card-foreground', '0 0% 98%');
        document.documentElement.style.setProperty('--border', '240 3.7% 15.9%');
        document.documentElement.style.setProperty('--input', '240 3.7% 15.9%');
        document.documentElement.style.setProperty('--muted', '240 3.7% 15.9%');
        document.documentElement.style.setProperty('--muted-foreground', '240 5% 64.9%');
      }
      
      // Apply font size
      if (uiSettings.fontSize) {
        let fontSizeBase = "16px"; // Default medium size
        
        switch (uiSettings.fontSize) {
          case "small":
            fontSizeBase = "14px";
            break;
          case "medium":
            fontSizeBase = "16px";
            break;
          case "large":
            fontSizeBase = "18px";
            break;
          case "x-large":
            fontSizeBase = "20px";
            break;
        }
        
        document.documentElement.style.setProperty('--font-size-base', fontSizeBase);
      }
      
      // Apply high contrast mode if enabled
      if (uiSettings.highContrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
      
      // Apply compact mode if enabled
      if (uiSettings.compactMode) {
        document.documentElement.classList.add("compact-mode");
      } else {
        document.documentElement.classList.remove("compact-mode");
      }
      
    } catch (error) {
      console.error("Error saving UI settings:", error);
    }
  }, [uiSettings]);

  const updateUISettings = (settings: Partial<UISettings>) => {
    setUISettings({
      ...uiSettings,
      ...settings
    });
  };

  return {
    uiSettings,
    updateUISettings
  };
}
