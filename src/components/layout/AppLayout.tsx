
import { ReactNode, useState, useEffect } from "react";
import { ModernSidebar } from "../ModernSidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon, Bell, Search } from "lucide-react";
import { Input } from "../ui/input";

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
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    toast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-lg px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gradient animate-float">
              Vikas Milk Centre
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 h-9 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleTheme}
              className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors"
            >
              {isDarkTheme ? (
                <SunIcon className="h-4 w-4 text-warning" />
              ) : (
                <MoonIcon className="h-4 w-4 text-primary" />
              )}
              <span className="sr-only">Toggle theme</span>
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
