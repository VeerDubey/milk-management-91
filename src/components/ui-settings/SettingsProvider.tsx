
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UISettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  currency: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  colorScheme: string;
  tableStyle: 'bordered' | 'minimal' | 'striped';
  notificationFrequency: 'high' | 'medium' | 'low' | 'off';
  language: string;
}

interface SettingsContextType {
  settings: UISettings;
  updateSetting: (key: keyof UISettings, value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: UISettings = {
  theme: 'dark',
  compactMode: false,
  fontSize: 'medium',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  sidebarCollapsed: false,
  colorScheme: 'violet',
  tableStyle: 'bordered',
  notificationFrequency: 'medium',
  language: 'en'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UISettings>(() => {
    try {
      const saved = localStorage.getItem('ui-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ui-settings', JSON.stringify(settings));
      
      // Apply settings to document
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.documentElement.setAttribute('data-font-size', settings.fontSize);
      document.documentElement.setAttribute('data-color-scheme', settings.colorScheme);
      
      if (settings.compactMode) {
        document.documentElement.classList.add('compact-mode');
      } else {
        document.documentElement.classList.remove('compact-mode');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSetting = (key: keyof UISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
