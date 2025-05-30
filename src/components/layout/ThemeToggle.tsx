
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeProvider';
import { MoonIcon, SunIcon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
