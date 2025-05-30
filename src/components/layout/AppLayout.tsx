
import { ReactNode, useState, useEffect } from "react";
import { ModernSidebar } from "../ModernSidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon, Bell, Search, Waves, User } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    setIsMounted(true);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`, {
      icon: theme === 'dark' ? '☀️' : '🌙',
    });
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center neo-noir-bg">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent-color border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-accent-color/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen neo-noir-bg overflow-hidden w-full">
      <ModernSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 neo-noir-surface border-b border-border-color">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 neo-noir-button-accent rounded-lg flex items-center justify-center neo-noir-float">
                <img 
                  src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                  alt="Logo" 
                  className="w-6 h-6"
                />
              </div>
              <div className="text-2xl font-bold neo-noir-gradient-text neo-noir-glow">
                Naik Milk Distributors
              </div>
              <Badge variant="secondary" className="bg-accent-color/20 text-accent-color border-accent-color/30">
                Since 1975
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Enhanced Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-accent-color transition-colors" />
                <Input
                  placeholder="Search anything..."
                  className="pl-9 w-80 h-10 neo-noir-input"
                />
              </div>
            </div>

            {/* Enhanced Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-xl neo-noir-button-outline transition-all duration-300 relative group"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-destructive-foreground text-xs animate-pulse">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Enhanced Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleTheme}
              className="h-10 w-10 rounded-xl neo-noir-button-outline transition-all duration-300 relative group overflow-hidden"
            >
              {isDarkTheme ? (
                <SunIcon className="h-5 w-5 text-accent-color relative z-10 transition-transform group-hover:rotate-180 duration-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-accent-color relative z-10 transition-transform group-hover:-rotate-12 duration-500" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl neo-noir-button-outline transition-all duration-300 relative group"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
