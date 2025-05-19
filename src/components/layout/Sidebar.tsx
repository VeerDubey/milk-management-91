
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const mainNavLinks: NavLink[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Invoices", href: "/invoices", icon: Receipt },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Suppliers", href: "/suppliers", icon: Store },
    { name: "Outstanding", href: "/outstanding", icon: Clock },
    { name: "Delivery", href: "/vehicle-tracking", icon: Truck },
    { name: "Reports", href: "/reports", icon: BarChart },
    { name: "Financial Year", href: "/financial-year", icon: Calendar },
    { name: "Expenses", href: "/expenses", icon: DollarSign },
    { name: "Tax Settings", href: "/tax-settings", icon: DollarSign },
    { name: "Communication", href: "/communication", icon: Phone },
    { name: "Master Data", href: "/master", icon: Database },
  ];

  const customerLinks: NavLink[] = [
    { name: "Customer Directory", href: "/customer-directory", icon: Users },
    { name: "Customer Ledger", href: "/customer-ledger", icon: FileText },
    { name: "Customer Rates", href: "/customer-rates", icon: DollarSign },
  ];

  const orderLinks: NavLink[] = [
    { name: "Order List", href: "/order-list", icon: ShoppingCart },
    { name: "Order Entry", href: "/order-entry", icon: FileText },
  ];

  const inventoryLinks: NavLink[] = [
    { name: "Product List", href: "/product-list", icon: Package },
    { name: "Product Rates", href: "/product-rates", icon: DollarSign },
    { name: "Stock Management", href: "/stock-management", icon: Database },
    { name: "Stock Settings", href: "/stock-settings", icon: Settings },
    { name: "Product Categories", href: "/product-categories", icon: Package },
  ];

  const invoiceLinks: NavLink[] = [
    { name: "All Invoices", href: "/invoices", icon: Receipt },
    { name: "Create Invoice", href: "/invoice-create", icon: FileText },
    { name: "Invoice Templates", href: "/invoice-templates", icon: FileText },
    { name: "Invoice History", href: "/invoice-history", icon: Calendar },
  ];

  const paymentLinks: NavLink[] = [
    { name: "Payment List", href: "/payments", icon: CreditCard },
    { name: "Create Payment", href: "/payment-create", icon: FileText },
  ];

  const supplierLinks: NavLink[] = [
    { name: "Supplier Directory", href: "/supplier-directory", icon: Store },
    { name: "Supplier Ledger", href: "/supplier-ledger", icon: FileText },
    { name: "Supplier Payments", href: "/supplier-payments", icon: CreditCard },
    { name: "Supplier Rates", href: "/supplier-rates", icon: DollarSign },
  ];

  const outstandingLinks: NavLink[] = [
    { name: "Outstanding Dues", href: "/outstanding-dues", icon: Clock },
    { name: "Outstanding Amounts", href: "/outstanding-amounts", icon: CreditCard },
  ];

  const deliveryLinks: NavLink[] = [
    { name: "Vehicle & Salesman", href: "/vehicle-salesman-create", icon: Truck },
    { name: "Vehicle Tracking", href: "/vehicle-tracking", icon: Truck },
    { name: "Track Sheet", href: "/track-sheet", icon: Newspaper },
    { name: "Track Sheet History", href: "/track-sheet-history", icon: Calendar },
  ];

  const reportsLinks: NavLink[] = [
    { name: "Sales Report", href: "/sales-report", icon: BarChart },
    { name: "Customer Report", href: "/customer-report", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart },
  ];

  const communicationLinks: NavLink[] = [
    { name: "Messaging", href: "/messaging", icon: MessageSquare },
    { name: "Email Templates", href: "/email-templates", icon: Mail },
    { name: "SMS Templates", href: "/sms-templates", icon: MessageSquare },
    { name: "Bulk Communication", href: "/bulk-communication", icon: Users },
  ];

  const settingsLinks: NavLink[] = [
    { name: "UI Settings", href: "/ui-settings", icon: Settings },
    { name: "User Access", href: "/user-access", icon: Users },
    { name: "Company Profile", href: "/company-profile", icon: Store },
  ];

  return (
    <div
      className={cn(
        "flex flex-col w-64 border-r bg-secondary h-screen fixed top-0 left-0",
        className
      )}
    >
      <div className="p-4">
        <Button variant="ghost" className="justify-start w-full p-0" onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Vikas Milk Center
        </Button>
      </div>
      <div className="flex-grow p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-2">
          {mainNavLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className={cn(
                "justify-start w-full",
                location.pathname === link.href
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
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
                Customers
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {customerLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="orders">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Orders
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {orderLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="inventory">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Inventory
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {inventoryLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="invoices">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Invoices
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {invoiceLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="payments">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Payments
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {paymentLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="suppliers">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Suppliers
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {supplierLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="outstanding">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Outstanding
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {outstandingLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="delivery">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Delivery
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {deliveryLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="reports">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Reports
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {reportsLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="communication">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Communication
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {communicationLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Settings
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {settingsLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "justify-start w-full pl-8",
                        location.pathname === link.href
                          ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                          : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                      )}
                      onClick={() => navigate(link.href)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
