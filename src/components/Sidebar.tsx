
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Truck,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Database,
  Calendar,
  Newspaper,
  Store,
  User,
  DollarSign,
  MessageSquare,
  Mail,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface SidebarProps {
  collapsed?: boolean;
}

interface SidebarItemProps {
  icon: React.ElementType;
  title: string;
  to: string;
  children?: React.ReactNode;
  collapsed?: boolean;
}

const SidebarItem = ({ icon: Icon, title, to, children, collapsed }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const [open, setOpen] = useState(false);

  // If there are children and the current location is part of this section, open by default
  const isSection = children && (location.pathname.startsWith(to) || open);

  return children ? (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          isSection ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setOpen(!open)}
      >
        <Icon className="h-4 w-4" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{title}</span>
            {open ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </>
        )}
      </Button>
      {(open || isSection) && !collapsed && (
        <div className="pl-9 space-y-1">{children}</div>
      )}
    </div>
  ) : (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 font-normal",
        isActive ? "bg-muted/50 text-primary" : "text-muted-foreground hover:text-foreground",
        isActive && "font-medium"
      )}
    >
      <Link to={to}>
        <Icon className="h-4 w-4" />
        {!collapsed && <span>{title}</span>}
      </Link>
    </Button>
  );
};

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <div
      className={cn(
        "border-r bg-card flex-shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-center">
          {collapsed ? (
            <img
              src="/lovable-uploads/94882b07-d7b1-4949-8dcb-7a750fd17c6b.png"
              alt="Logo"
              className="h-8 w-8"
            />
          ) : (
            <div className="font-bold text-xl">Vikas Milk Centre</div>
          )}
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            <SidebarItem icon={Home} title="Dashboard" to="/dashboard" collapsed={collapsed} />
            
            <SidebarItem icon={Users} title="Customers" to="/customers" collapsed={collapsed}>
              <SidebarItem icon={Users} title="Customer Directory" to="/customer-directory" collapsed={false} />
              <SidebarItem icon={CreditCard} title="Customer Ledger" to="/customer-ledger" collapsed={false} />
              <SidebarItem icon={FileText} title="Customer Rates" to="/customer-rates" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={ShoppingCart} title="Orders" to="/orders" collapsed={collapsed}>
              <SidebarItem icon={ShoppingCart} title="Order List" to="/order-list" collapsed={false} />
              <SidebarItem icon={FileText} title="Order Entry" to="/order-entry" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Package} title="Inventory" to="/inventory" collapsed={collapsed}>
              <SidebarItem icon={Package} title="Product List" to="/product-list" collapsed={false} />
              <SidebarItem icon={FileText} title="Product Rates" to="/product-rates" collapsed={false} />
              <SidebarItem icon={Database} title="Stock Management" to="/stock-management" collapsed={false} />
              <SidebarItem icon={Settings} title="Stock Settings" to="/stock-settings" collapsed={false} />
              <SidebarItem icon={Layout} title="Product Categories" to="/product-categories" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={FileText} title="Invoices" to="/invoices" collapsed={collapsed}>
              <SidebarItem icon={FileText} title="Create Invoice" to="/invoice-create" collapsed={false} />
              <SidebarItem icon={Clock} title="Invoice History" to="/invoice-history" collapsed={false} />
              <SidebarItem icon={Layout} title="Invoice Templates" to="/invoice-templates" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={CreditCard} title="Payments" to="/payments" collapsed={collapsed}>
              <SidebarItem icon={CreditCard} title="Payment List" to="/payments" collapsed={false} />
              <SidebarItem icon={FileText} title="Create Payment" to="/payment-create" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Store} title="Suppliers" to="/suppliers" collapsed={collapsed}>
              <SidebarItem icon={Users} title="Supplier Directory" to="/supplier-directory" collapsed={false} />
              <SidebarItem icon={CreditCard} title="Supplier Ledger" to="/supplier-ledger" collapsed={false} />
              <SidebarItem icon={CreditCard} title="Supplier Payments" to="/supplier-payments" collapsed={false} />
              <SidebarItem icon={FileText} title="Supplier Rates" to="/supplier-rates" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Clock} title="Outstanding" to="/outstanding" collapsed={collapsed}>
              <SidebarItem icon={Clock} title="Outstanding Dues" to="/outstanding-dues" collapsed={false} />
              <SidebarItem icon={CreditCard} title="Outstanding Amounts" to="/outstanding-amounts" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Truck} title="Delivery" to="/vehicle-tracking" collapsed={collapsed}>
              <SidebarItem icon={User} title="Vehicle & Salesman" to="/vehicle-salesman-create" collapsed={false} />
              <SidebarItem icon={Truck} title="Vehicle Tracking" to="/vehicle-tracking" collapsed={false} />
              <SidebarItem icon={Newspaper} title="Track Sheet" to="/track-sheet" collapsed={false} />
              <SidebarItem icon={Newspaper} title="Track Sheet History" to="/track-sheet-history" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={BarChart3} title="Reports" to="/reports" collapsed={collapsed}>
              <SidebarItem icon={Users} title="Customer Report" to="/customer-report" collapsed={false} />
              <SidebarItem icon={BarChart3} title="Sales Report" to="/sales-report" collapsed={false} />
              <SidebarItem icon={BarChart3} title="Analytics" to="/analytics" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Calendar} title="Financial Year" to="/financial-year" collapsed={collapsed} />
            <SidebarItem icon={DollarSign} title="Expenses" to="/expenses" collapsed={collapsed} />
            <SidebarItem icon={DollarSign} title="Tax Settings" to="/tax-settings" collapsed={collapsed} />
            
            <SidebarItem icon={MessageSquare} title="Communication" to="/communication" collapsed={collapsed}>
              <SidebarItem icon={MessageSquare} title="Messaging" to="/messaging" collapsed={false} />
              <SidebarItem icon={Mail} title="Email Templates" to="/email-templates" collapsed={false} />
              <SidebarItem icon={MessageSquare} title="SMS Templates" to="/sms-templates" collapsed={false} />
              <SidebarItem icon={Users} title="Bulk Communication" to="/bulk-communication" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Settings} title="Settings" to="/settings" collapsed={collapsed}>
              <SidebarItem icon={Settings} title="UI Settings" to="/ui-settings" collapsed={false} />
              <SidebarItem icon={Users} title="User Access" to="/user-access" collapsed={false} />
              <SidebarItem icon={Store} title="Company Profile" to="/company-profile" collapsed={false} />
            </SidebarItem>
            
            <SidebarItem icon={Database} title="Master Data" to="/master" collapsed={collapsed} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
