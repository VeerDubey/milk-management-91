
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Truck,
  FileSpreadsheet,
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Track Sheet", path: "/track-sheet", icon: FileSpreadsheet },
    { name: "Products", path: "/product-list", icon: Package },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Suppliers", path: "/supplier-list", icon: Truck },
    { name: "Invoices", path: "/invoice/create", icon: FileText },
    { name: "Customer Ledger", path: "/customer-ledger", icon: FileText },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-10 bg-card border-r flex-shrink-0 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">Business Manager</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )
                  }
                >
                  <item.icon className="shrink-0 h-5 w-5 mr-3" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="h-16 border-t flex items-center px-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            {sidebarOpen && (
              <span className="ml-3 text-sm text-muted-foreground">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <main className="container mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
