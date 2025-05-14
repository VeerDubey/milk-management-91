
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
  BarChart,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Database,
  Truck,
  Banknote,
  Layers,
  Receipt
} from "lucide-react";
import { Button } from "./ui/button";
import { useData } from "@/contexts/data/DataContext";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { uiSettings } = useData();
  
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
      children: [
        { title: "Customer Directory", path: "/customer-directory" },
        { title: "Customer Ledger", path: "/customer-ledger" },
        { title: "Customer Rates", path: "/customer-rates" }
      ]
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      path: "/orders",
      children: [
        { title: "Order Entry", path: "/order-entry" },
        { title: "Order List", path: "/order-list" },
      ]
    },
    {
      title: "Inventory",
      icon: Package,
      path: "/inventory",
      children: [
        { title: "Product List", path: "/product-list" },
        { title: "Product Rates", path: "/product-rates" },
        { title: "Stock Management", path: "/stock-management" },
        { title: "Stock Settings", path: "/stock-settings" },
      ]
    },
    {
      title: "Invoices",
      icon: FileText,
      path: "/invoices",
      children: [
        { title: "Create Invoice", path: "/invoice-create" },
        { title: "Invoice History", path: "/invoice-history" },
      ]
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/payments",
      children: [
        { title: "Record Payment", path: "/payment-create" },
        { title: "Payment List", path: "/payments" },
      ]
    },
    {
      title: "Outstanding",
      icon: DollarSign,
      path: "/outstanding",
      children: [
        { title: "Due Amounts", path: "/outstanding-dues" },
        { title: "Outstanding Summary", path: "/outstanding-amounts" },
      ]
    },
    {
      title: "Suppliers",
      icon: Truck,
      path: "/suppliers",
      children: [
        { title: "Supplier Directory", path: "/supplier-directory" },
        { title: "Supplier Ledger", path: "/supplier-ledger" },
        { title: "Supplier Payments", path: "/supplier-payments" },
        { title: "Supplier Rates", path: "/supplier-rates" },
      ]
    },
    {
      title: "Expenses",
      icon: Banknote,
      path: "/expenses",
    },
    {
      title: "Reports",
      icon: BarChart,
      path: "/reports",
      children: [
        { title: "Customer Report", path: "/customer-report" },
        { title: "Sales Report", path: "/sales-report" },
      ]
    },
    {
      title: "Track Sheet",
      icon: Truck,
      path: "/track-sheet",
    },
    {
      title: "Master",
      icon: Database,
      path: "/master",
      children: [
        { title: "Vehicle & Salesman", path: "/vehicle-salesman-create" },
        { title: "Vehicle Tracking", path: "/vehicle-tracking" },
      ]
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
      children: [
        { title: "UI Settings", path: "/ui-settings" },
        { title: "User Access", path: "/user-access" },
        { title: "Company Profile", path: "/company-profile" },
      ]
    },
  ], []);

  // Helper to check if a path or its children are active
  const isPathActive = (item: any) => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child: any) => location.pathname === child.path);
    }
    return false;
  };

  return (
    <div
      className={cn(
        "group relative flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      style={uiSettings.sidebarStyle === "gradient" 
        ? { backgroundImage: `linear-gradient(to bottom, hsl(var(--card)), hsl(var(--background)))` } 
        : {}
      }
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png" 
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VMC
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("", collapsed ? "ml-auto" : "")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const active = isPathActive(item);
            
            return (
              <div key={item.path} className="relative">
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.children && (
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform", 
                            active && "rotate-90"
                          )} 
                        />
                      )}
                    </>
                  )}
                </NavLink>
                
                {/* Render children if not collapsed and either active or hovering */}
                {!collapsed && item.children && active && (
                  <div className="ml-6 mt-1 space-y-1 border-l pl-2">
                    {item.children.map((child: any) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center text-sm py-1.5 px-3 rounded-md transition-all",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

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
