
import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    toast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  if (!isMounted) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Vikas Milk Centre
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
