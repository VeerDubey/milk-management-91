
import { ReactNode, useState, useEffect } from "react";
import { ModernSidebar } from "../ModernSidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon, Bell, Search, Sparkles, Palette } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

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
    toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`, {
      icon: theme === 'dark' ? '☀️' : '🌙',
    });
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-primary/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <ModernSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-6 bg-card/80 backdrop-blur-xl border-b border-primary/20 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-aurora-gradient rounded-lg flex items-center justify-center animate-float">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gradient-aurora animate-glow">
                Vikas Milk Centre
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Advanced
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Enhanced Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search anything..."
                  className="pl-9 w-80 h-10 bg-card/50 border-primary/20 focus:border-primary transition-all duration-300 backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </div>

            {/* Enhanced Notifications */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-300 relative group"
            >
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
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
              className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isDarkTheme ? (
                <SunIcon className="h-5 w-5 text-warning relative z-10 transition-transform group-hover:rotate-180 duration-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-primary relative z-10 transition-transform group-hover:-rotate-12 duration-500" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Color Scheme Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-accent/10 transition-all duration-300 relative group"
            >
              <Palette className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              <span className="sr-only">Color schemes</span>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-primary/5">
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
