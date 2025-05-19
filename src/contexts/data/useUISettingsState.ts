
import { useState, useEffect } from 'react';
import { UISettings } from '@/types';

export function useUISettingsState() {
  const [uiSettings, setUISettings] = useState<UISettings>(() => {
    const saved = localStorage.getItem("uiSettings");
    return saved ? JSON.parse(saved) : {
      theme: "light" as const,
      language: "en" as const,
      currency: "USD" as const,
    };
  });

  useEffect(() => {
    localStorage.setItem("uiSettings", JSON.stringify(uiSettings));
  }, [uiSettings]);

  const updateUISettings = (settings: Partial<UISettings>) => {
    setUISettings({
      ...uiSettings,
      ...settings,
    });
  };

  return {
    uiSettings,
    updateUISettings,
  };
}
