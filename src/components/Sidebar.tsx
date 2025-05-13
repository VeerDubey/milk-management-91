
import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  FileText,
  Truck,
  DollarSign,
  Tag,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  Database,
  Settings,
  UserRound,
  Receipt,
  Menu,
  MapPin,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isMobile = useMobile();
  
  // Memoize navigation groups to prevent unnecessary re-renders
  const navGroups: NavGroup[] = useMemo(() => [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: Home,
        }
      ]
    },
    {
      title: "Orders & Billing",
      items: [
        {
          title: "Order Entry",
          href: "/order-entry",
          icon: ClipboardList,
        },
        {
          title: "Order List",
          href: "/orders",
          icon: ClipboardList,
        },
        {
          title: "Invoice Generator",
          href: "/invoice-generator",
          icon: Receipt,
        },
        {
          title: "Invoice History",
          href: "/invoice-history",
          icon: FileText,
        },
        {
          title: "Track Sheet",
          href: "/track-sheet",
          icon: Truck,
        },
      ]
    },
    {
      title: "Assignment Management",
      items: [
        {
          title: "Vehicle Tracking",
          href: "/vehicle-tracking",
          icon: Truck,
        },
        {
          title: "Vehicle & Salesmen",
          href: "/vehicle-salesman-create",
          icon: Truck,
        },
        {
          title: "Area Management",
          href: "/area-management",
          icon: MapPin,
        },
      ]
    },
    {
      title: "Customers",
      items: [
        {
          title: "Customers",
          href: "/customers",
          icon: Users,
        },
        {
          title: "Customer Directory",
          href: "/customer-directory",
          icon: UserRound,
        },
        {
          title: "Customer Rates",
          href: "/customer-rates",
          icon: Tag,
        },
        {
          title: "Payments",
          href: "/payments",
          icon: CreditCard,
        },
        {
          title: "Customer Ledger",
          href: "/customer-ledger",
          icon: FileSpreadsheet,
        },
      ]
    },
    {
      title: "Inventory",
      items: [
        {
          title: "Stock Management",
          href: "/stock-management",
          icon: Package,
        },
        {
          title: "Products",
          href: "/products",
          icon: Package,
        },
        {
          title: "Product Rates",
          href: "/product-rates",
          icon: Tag,
        },
        {
          title: "Bulk Rate Update",
          href: "/bulk-rates",
          icon: Database,
        },
      ]
    },
    {
      title: "Suppliers",
      items: [
        {
          title: "Suppliers",
          href: "/suppliers",
          icon: Truck,
        },
        {
          title: "Supplier Directory",
          href: "/supplier-directory",
          icon: ShoppingBag,
        },
        {
          title: "Supplier Rates",
          href: "/supplier-rates",
          icon: Tag,
        },
        {
          title: "Supplier Payments",
          href: "/supplier-payments",
          icon: CreditCard,
        },
        {
          title: "Supplier Ledger",
          href: "/supplier-ledger",
          icon: FileSpreadsheet,
        },
        {
          title: "Purchase History",
          href: "/purchase-history",
          icon: ShoppingBag,
        },
      ]
    },
    {
      title: "Finance",
      items: [
        {
          title: "Expenses",
          href: "/expenses",
          icon: DollarSign,
        },
        {
          title: "Outstanding",
          href: "/outstanding",
          icon: DollarSign,
        },
        {
          title: "Reports",
          href: "/reports",
          icon: BarChart3,
        },
      ]
    },
    {
      title: "Settings",
      items: [
        {
          title: "App Settings",
          href: "/settings",
          icon: Settings,
        },
        {
          title: "Master Module",
          href: "/master",
          icon: Database,
        },
        {
          title: "Product Categories",
          href: "/product-categories",
          icon: Tag,
        },
        {
          title: "Stock Settings",
          href: "/stock-settings",
          icon: Settings,
        },
        {
          title: "User Access",
          href: "/user-access",
          icon: Users,
        },
      ]
    },
  ], []);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      <div
        className={cn(
          "fixed z-50 flex h-full flex-col border-r border-purple-800/50 bg-gradient-to-b from-indigo-900 to-purple-900 p-4 transition-all duration-300 md:relative md:z-0",
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0 w-64"
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <h1 className="text-lg font-semibold text-white">Milk Center</h1>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-purple-800/50">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="space-y-1.5 flex-1 overflow-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent pr-1">
          {navGroups.map((group, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xs uppercase tracking-wider text-indigo-300 ml-2 mb-1 opacity-80">
                {group.title}
              </h3>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={isMobile ? onClose : undefined}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-gray-300 hover:text-white hover:bg-purple-800/50",
                      location.pathname === item.href &&
                        "bg-purple-800/70 text-white"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
