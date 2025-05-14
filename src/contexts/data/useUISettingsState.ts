import { useState, useEffect } from 'react';
import { UISettings } from '@/types';

const defaultSettings: UISettings = {
  theme: 'system',
  sidebarCollapsed: false,
  fontSize: 'medium',
  tableStyle: 'default',
  sidebarStyle: 'default',
  dateFormat: 'dd/MM/yyyy',
  colorScheme: 'blue',
  notificationFrequency: 'daily',
};

export function useUISettingsState() {
  const [uiSettings, setUISettings] = useState<UISettings>(() => {
    const saved = localStorage.getItem("uiSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("uiSettings", JSON.stringify(uiSettings));
  }, [uiSettings]);

  const updateUISettings = (newSettings: Partial<UISettings>) => {
    setUISettings(prevSettings => {
      const updatedSettings: UISettings = { ...prevSettings, ...newSettings };
      localStorage.setItem("uiSettings", JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  return {
    uiSettings,
    updateUISettings
  };
}
