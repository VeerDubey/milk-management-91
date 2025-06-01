
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronsDown,
  Coins,
  Receipt,
  FileText,
  Truck,
  BarChart,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Store,
  Database,
  CreditCard,
  Clock,
  DollarSign,
  Newspaper,
  FileSpreadsheet,
  Package2,
  MapPin,
  Plus,
  TrendingUp,
  Building,
  UserCheck,
  Bell,
  Shield,
  ClipboardCheck,
} from "lucide-react";

interface NavLink {
  name: string;
  href: string;
  icon: any;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const mainNavLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Master Data", href: "/master", icon: Database },
  ];

  const customerLinks: NavLink[] = [
    { name: "Customer List", href: "/customer-list", icon: Users },
    { name: "Customer Directory", href: "/customer-directory", icon: Users },
    { name: "Customer Ledger", href: "/customer-ledger", icon: FileText },
    { name: "Customer Rates", href: "/customer-rates", icon: DollarSign },
    { name: "Customer Report", href: "/customer-report", icon: BarChart },
    { name: "Payment Management", href: "/customer-payment-management", icon: CreditCard },
  ];

  const productLinks: NavLink[] = [
    { name: "Inventory Dashboard", href: "/inventory-dashboard", icon: Package },
    { name: "Product List", href: "/product-list", icon: Package },
    { name: "Product Rates", href: "/product-rates", icon: DollarSign },
    { name: "Stock Management", href: "/stock-management", icon: Database },
    { name: "Stock Settings", href: "/stock-settings", icon: Settings },
    { name: "Product Categories", href: "/product-categories", icon: Package2 },
    { name: "Bulk Rates", href: "/bulk-rates", icon: FileSpreadsheet },
  ];

  const orderLinks: NavLink[] = [
    { name: "Order List", href: "/order-list", icon: ShoppingCart },
    { name: "Order Entry", href: "/order-entry", icon: Plus },
    { name: "Order History", href: "/order-history", icon: Calendar },
  ];

  const paymentLinks: NavLink[] = [
    { name: "Payment List", href: "/payment-list", icon: CreditCard },
    { name: "Create Payment", href: "/payment-create", icon: Plus },
  ];

  const invoiceLinks: NavLink[] = [
    { name: "Invoice History", href: "/invoice-history", icon: Receipt },
    { name: "Create Invoice", href: "/invoice-create", icon: Plus },
    { name: "Invoice Templates", href: "/invoice-templates", icon: FileText },
  ];

  const deliveryLinks: NavLink[] = [
    { name: "Delivery Sheet", href: "/delivery-sheet", icon: Truck },
    { name: "Create Delivery Sheet", href: "/delivery-sheet-create", icon: Plus },
    { name: "Enhanced Delivery Sheet", href: "/enhanced-delivery-sheet", icon: FileSpreadsheet },
    { name: "Track Delivery Sheet", href: "/track-delivery-sheet", icon: MapPin },
    { name: "Delivery Challan", href: "/delivery-challan", icon: FileText },
    { name: "Track Sheet Advanced", href: "/track-sheet-advanced", icon: ClipboardCheck },
    { name: "Track Sheet History", href: "/track-sheet-history", icon: Calendar },
    { name: "Track Sheet Manager", href: "/track-sheet-manager", icon: Settings },
    { name: "Vehicle Tracking", href: "/vehicle-tracking", icon: Truck },
    { name: "Vehicle & Salesman", href: "/vehicle-salesman-create", icon: UserCheck },
  ];

  const supplierLinks: NavLink[] = [
    { name: "Supplier Directory", href: "/supplier-directory", icon: Store },
    { name: "Supplier Ledger", href: "/supplier-ledger", icon: FileText },
    { name: "Supplier Payments", href: "/supplier-payments", icon: CreditCard },
    { name: "Supplier Rates", href: "/supplier-rates", icon: DollarSign },
    { name: "Purchase Management", href: "/purchase-management", icon: ShoppingCart },
  ];

  const outstandingLinks: NavLink[] = [
    { name: "Outstanding Dues", href: "/outstanding-dues", icon: Clock },
    { name: "Outstanding Amounts", href: "/outstanding-amounts", icon: CreditCard },
  ];

  const reportsLinks: NavLink[] = [
    { name: "Sales Analytics", href: "/sales-analytics", icon: TrendingUp },
    { name: "Sales Report", href: "/sales-report", icon: BarChart },
    { name: "Analytics", href: "/analytics", icon: BarChart },
    { name: "Testing Report", href: "/testing-report", icon: ClipboardCheck },
  ];

  const communicationLinks: NavLink[] = [
    { name: "Messaging", href: "/messaging", icon: MessageSquare },
    { name: "Email Templates", href: "/email-templates", icon: Mail },
    { name: "SMS Templates", href: "/sms-templates", icon: MessageSquare },
    { name: "Bulk Communication", href: "/bulk-communication", icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const settingsLinks: NavLink[] = [
    { name: "Company Profile", href: "/company-profile", icon: Building },
    { name: "Area Management", href: "/area-management", icon: MapPin },
    { name: "Financial Year", href: "/financial-year", icon: Calendar },
    { name: "Tax Settings", href: "/tax-settings", icon: DollarSign },
    { name: "UI Settings", href: "/ui-settings", icon: Settings },
    { name: "User Access", href: "/user-access", icon: Users },
    { name: "Role Management", href: "/role-management", icon: Shield },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
  ];

  return (
    <div
      className={cn(
        "flex flex-col w-64 border-r bg-secondary h-screen fixed top-0 left-0 overflow-y-auto",
        className
      )}
    >
      <div className="p-4">
        <Button variant="ghost" className="justify-start w-full p-0" onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Vikas Milk Centre
        </Button>
      </div>
      <div className="flex-grow p-4 space-y-2">
        {mainNavLinks.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            className={cn(
              "justify-start w-full",
              location.pathname === link.href
                ? "bg-accent text-accent-foreground"
                : "hover:bg-secondary-foreground hover:text-secondary-foreground"
            )}
            onClick={() => navigate(link.href)}
          >
            <link.icon className="mr-2 h-4 w-4" />
            {link.name}
          </Button>
        ))}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="customers">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Customers
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {customerLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="products">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Products & Inventory
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {productLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="orders">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Orders
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {orderLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payments">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {paymentLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invoices">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                Invoices
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {invoiceLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4" />
                Delivery & Tracking
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {deliveryLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="suppliers">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Store className="mr-2 h-4 w-4" />
                Suppliers
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {supplierLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="outstanding">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Outstanding
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {outstandingLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reports">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                Reports & Analytics
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {reportsLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="communication">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Communication
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {communicationLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="settings">
            <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
              <div className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pl-4">
                {settingsLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-sm",
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                    )}
                    onClick={() => navigate(link.href)}
                  >
                    <link.icon className="mr-2 h-3 w-3" />
                    {link.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
