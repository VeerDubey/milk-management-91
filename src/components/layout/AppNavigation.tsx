import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Building2 } from "lucide-react";

export function AppNavigation() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Vikas Milk Centre
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}