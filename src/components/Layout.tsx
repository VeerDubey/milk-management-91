
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { uiSettings } = useData();
  const isDarkTheme = theme === 'dark';

  const handleToggleTheme = () => {
    toggleTheme();
    toast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png" 
              alt="Vikas Milk Centre Logo" 
              className="h-10 w-10"
            />
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Vikas Milk Centre
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleTheme}
              className="rounded-full hover:bg-muted"
            >
              {isDarkTheme ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
