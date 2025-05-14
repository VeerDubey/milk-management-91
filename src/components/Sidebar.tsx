
import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  DollarSign,
  Calendar,
  BarChart3
} from "lucide-react";
import { Button } from "./ui/button";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = useMemo(() => [
    {
      title: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      title: "Customers",
      icon: Users,
      path: "/customers",
    },
    // Removed missing page routes
    {
      title: "Outstanding",
      icon: DollarSign,
      path: "/outstanding",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/reports",
    },
    {
      title: "Financial Year",
      icon: Calendar,
      path: "/financial-year",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ], []);

  return (
    <div
      className={cn(
        "group relative flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            VMC
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        {!collapsed && (
          <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
            <p className="font-semibold">Vikas Milk Centre</p>
            <p>Dashboard v2.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
