
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UISettingsContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined);

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <UISettingsContext.Provider value={{ theme, setTheme }}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  const context = useContext(UISettingsContext);
  if (context === undefined) {
    throw new Error('useUISettings must be used within a UISettingsProvider');
  }
  return context;
}
