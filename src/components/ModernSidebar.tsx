import React, { useState } from "react";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  MessageSquare,
  Truck,
  Building,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  List,
  Book,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Plus,
  History,
  BookOpen,
  Mail,
  MessageCircle,
  Send,
  File,
  MapPin,
  UserPlus,
  TestTube,
  Grid3X3,
  Calculator,
  Palette,
  Shield,
  User,
  Calendar,
  Bell,
  Key,
  Route,
  Clock
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface ModernSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface SidebarItemProps {
  title: string;
  href: string;
  icon: any;
  color: string;
  collapsed: boolean;
}

interface SidebarGroupProps {
  title: string;
  icon: any;
  color: string;
  collapsed: boolean;
  items: { title: string; href: string; icon: any }[];
}

function SidebarItem({ title, href, icon: Icon, color, collapsed }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent-color/10 hover:text-accent-color",
        isActive ? "bg-accent-color/10 text-accent-color" : "text-muted-foreground",
        collapsed ? "justify-center" : "space-x-2"
      )}
    >
      <Icon className={cn("h-4 w-4", color)} />
      {!collapsed && <span>{title}</span>}
    </Link>
  );
}

function SidebarGroup({ title, icon: Icon, color, collapsed, items }: SidebarGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const anyChildActive = items.some(item => location.pathname === item.href);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (collapsed) {
      setIsExpanded(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent-color/10 hover:text-accent-color",
          anyChildActive ? "bg-accent-color/10 text-accent-color" : "text-muted-foreground",
          collapsed ? "justify-center" : "space-x-2"
        )}
        onClick={toggleExpand}
      >
        <div className="flex items-center">
          <Icon className={cn("h-4 w-4", color)} />
          {!collapsed && <span className="ml-2">{title}</span>}
        </div>
        {!collapsed && <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
      </Button>
      {isExpanded && (
        <div className="mt-2 space-y-1">
          {items.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className={cn(
                "flex w-full items-center rounded-md px-5 py-2 text-sm font-medium transition-colors hover:bg-accent-color/10 hover:text-accent-color",
                location.pathname === item.href ? "bg-accent-color/10 text-accent-color" : "text-muted-foreground",
                collapsed ? "justify-center" : "space-x-2"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModernSidebar({ collapsed, onToggle }: ModernSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-blue-400"
    },
    {
      title: "Customers",
      icon: Users,
      color: "text-green-400",
      submenu: [
        { title: "Customer List", href: "/customer-list", icon: List },
        { title: "Customer Directory", href: "/customer-directory", icon: Book },
        { title: "Customer Ledger", href: "/customer-ledger", icon: CreditCard },
        { title: "Customer Rates", href: "/customer-rates", icon: TrendingUp },
        { title: "Customer Report", href: "/customer-report", icon: BarChart3 },
        { title: "Outstanding Dues", href: "/outstanding-dues", icon: AlertCircle },
        { title: "Outstanding Amounts", href: "/outstanding-amounts", icon: DollarSign }
      ]
    },
    {
      title: "Products & Inventory",
      icon: Package,
      color: "text-purple-400",
      submenu: [
        { title: "Inventory Dashboard", href: "/inventory-dashboard", icon: BarChart3 },
        { title: "Product List", href: "/product-list", icon: List },
        { title: "Product Rates", href: "/product-rates", icon: TrendingUp },
        { title: "Stock Management", href: "/stock-management", icon: Package },
        { title: "Stock Settings", href: "/stock-settings", icon: Settings },
        { title: "Product Categories", href: "/product-categories", icon: Grid3X3 },
        { title: "Bulk Rates", href: "/bulk-rates", icon: Calculator }
      ]
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      color: "text-orange-400",
      submenu: [
        { title: "Order List", href: "/order-list", icon: List },
        { title: "Order Entry", href: "/order-entry", icon: Plus },
        { title: "Order History", href: "/order-history", icon: History }
      ]
    },
    {
      title: "Payments & Ledger",
      icon: CreditCard,
      color: "text-green-400",
      submenu: [
        { title: "Payment Management", href: "/customer-payment-management", icon: CreditCard },
        { title: "Payment List", href: "/payment-list", icon: List },
        { title: "Payment Create", href: "/payment-create", icon: Plus },
        { title: "Customer Ledger", href: "/customer-ledger", icon: BookOpen }
      ]
    },
    {
      title: "Purchases & Suppliers",
      icon: Building,
      color: "text-yellow-400",
      submenu: [
        { title: "Purchase Management", href: "/purchase-management", icon: Building },
        { title: "Supplier Directory", href: "/supplier-directory", icon: Building },
        { title: "Supplier Ledger", href: "/supplier-ledger", icon: BookOpen },
        { title: "Supplier Payments", href: "/supplier-payments", icon: CreditCard },
        { title: "Supplier Rates", href: "/supplier-rates", icon: TrendingUp }
      ]
    },
    {
      title: "Invoices",
      icon: FileText,
      color: "text-blue-400",
      submenu: [
        { title: "Invoice History", href: "/invoice-history", icon: History },
        { title: "Invoice Create", href: "/invoice-create", icon: Plus },
        { title: "Invoice Templates", href: "/invoice-templates", icon: FileText }
      ]
    },
    {
      title: "Communication",
      icon: MessageSquare,
      color: "text-cyan-400",
      submenu: [
        { title: "Messaging", href: "/messaging", icon: MessageSquare },
        { title: "Email Templates", href: "/email-templates", icon: Mail },
        { title: "SMS Templates", href: "/sms-templates", icon: MessageCircle },
        { title: "Bulk Communication", href: "/bulk-communication", icon: Send },
        { title: "Notifications", href: "/notifications", icon: Bell },
        { title: "Delivery Notifications", href: "/delivery-notifications", icon: Bell }
      ]
    },
    {
      title: "Delivery & Track",
      icon: Truck,
      color: "text-accent-color",
      submenu: [
        { title: "Delivery Sheet", href: "/delivery-sheet", icon: FileText },
        { title: "Enhanced Delivery", href: "/enhanced-delivery-sheet", icon: Truck },
        { title: "Delivery Challan", href: "/delivery-challan", icon: Package },
        { title: "Delivery Scheduling", href: "/delivery-scheduling", icon: Clock },
        { title: "Route Management", href: "/route-management", icon: Route },
        { title: "Track Sheet Advanced", href: "/track-sheet-advanced", icon: MapPin },
        { title: "Track Sheet History", href: "/track-sheet-history", icon: History },
        { title: "Track Sheet Manager", href: "/track-sheet-manager", icon: Settings },
        { title: "Vehicle Tracking", href: "/vehicle-tracking", icon: Truck },
        { title: "Vehicle & Salesman", href: "/vehicle-salesman-create", icon: UserPlus }
      ]
    },
    {
      title: "Reports & Analytics",
      icon: BarChart3,
      color: "text-red-400",
      submenu: [
        { title: "Sales Analytics", href: "/sales-analytics", icon: BarChart3 },
        { title: "Sales Report", href: "/sales-report", icon: FileText },
        { title: "Analytics", href: "/analytics", icon: TrendingUp },
        { title: "Testing Report", href: "/testing-report", icon: TestTube }
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      color: "text-gray-400",
      submenu: [
        { title: "Company Profile", href: "/company-profile", icon: Building },
        { title: "Area Management", href: "/area-management", icon: MapPin },
        { title: "Financial Year", href: "/financial-year", icon: Calendar },
        { title: "Tax Settings", href: "/tax-settings", icon: Calculator },
        { title: "UI Settings", href: "/ui-settings", icon: Palette },
        { title: "User Access", href: "/user-access", icon: Shield },
        { title: "Role Management", href: "/role-management", icon: Key },
        { title: "Expenses", href: "/expenses", icon: DollarSign }
      ]
    }
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-72'} transition-all duration-300 neo-noir-surface border-r border-border-color flex flex-col h-screen relative z-40`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-color">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 neo-noir-button-accent rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                alt="Logo" 
                className="w-6 h-6"
              />
            </div>
            <h2 className="text-lg font-bold neo-noir-gradient-text">Vikas Milk Centre</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 neo-noir-button-outline"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-3">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <SidebarGroup 
                  title={item.title}
                  icon={item.icon}
                  color={item.color}
                  collapsed={collapsed}
                  items={item.submenu}
                />
              ) : (
                <SidebarItem 
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  color={item.color}
                  collapsed={collapsed}
                />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-color">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent-color rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium neo-noir-text">Admin User</p>
              <p className="text-xs neo-noir-text-muted">admin@vikasmilk.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
