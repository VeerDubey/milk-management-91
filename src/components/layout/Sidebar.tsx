
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart,
  ShoppingCart,
  Package,
  FileText,
  User,
  Truck,
  Settings,
  CreditCard,
  Calendar,
  DollarSign,
  Banknote,
  Printer,
  ChevronDown,
  ChevronRight,
  Database,
  Car,
  Receipt,
  Users,
  Search,
  Home,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
}

interface SidebarGroupProps {
  label: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, end = false }: SidebarItemProps) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
      )
    }
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </NavLink>
);

const SidebarGroup = ({ label, icon: Icon, children, defaultOpen = false, isActive = false }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || isActive);

  return (
    <div className="space-y-1">
      <button
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className={cn("text-muted-foreground", isActive && "font-medium")}>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="pl-4">{children}</div>}
    </div>
  );
};

export function Sidebar({ collapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { uiSettings } = useData();
  const currentPath = location.pathname;
  
  // Helper function to check if a path is active
  const isPathActive = (path: string) => currentPath === path;
  
  // Helper function to check if any path in a group is active
  const isGroupActive = (paths: string[]) => paths.some(path => currentPath.startsWith(path));

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
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
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4 px-2">
        {collapsed ? (
          // Collapsed Sidebar - Icons Only
          <div className="flex flex-col items-center space-y-4 py-2">
            <NavLink to="/" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <Home className="h-5 w-5" />
            </NavLink>
            <NavLink to="/track-sheet" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <Printer className="h-5 w-5" />
            </NavLink>
            <NavLink to="/product-list" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors", 
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <Package className="h-5 w-5" />
            </NavLink>
            <NavLink to="/customer-ledger" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <User className="h-5 w-5" />
            </NavLink>
            <NavLink to="/supplier-directory" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <Truck className="h-5 w-5" />
            </NavLink>
            <NavLink to="/invoices" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <FileText className="h-5 w-5" />
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => cn(
              "p-2 rounded-lg transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            )}>
              <Settings className="h-5 w-5" />
            </NavLink>
          </div>
        ) : (
          // Expanded Sidebar - Full Menus
          <div className="space-y-1">
            <SidebarItem to="/" icon={Home} label="Dashboard" end />
            
            <SidebarItem to="/track-sheet" icon={Printer} label="Track Sheet" />
            
            <SidebarGroup 
              label="Customers" 
              icon={Users} 
              isActive={isGroupActive(['/customer-', '/outstanding-'])}
            >
              <SidebarItem to="/customer-ledger" icon={FileText} label="Customer Ledger" />
              <SidebarItem to="/outstanding-amounts" icon={DollarSign} label="Outstanding Amounts" />
            </SidebarGroup>
            
            <SidebarGroup 
              label="Products" 
              icon={Package}
              isActive={isGroupActive(['/product-'])}
            >
              <SidebarItem to="/product-list" icon={Search} label="Product List" />
              <SidebarItem to="/stock-settings" icon={Settings} label="Stock Settings" />
            </SidebarGroup>
            
            <SidebarGroup 
              label="Orders & Invoices" 
              icon={ShoppingCart}
              isActive={isGroupActive(['/invoice', '/order'])}
            >
              <SidebarItem to="/invoices" icon={FileText} label="Invoices" />
              <SidebarItem to="/invoice-create" icon={FileText} label="Create Invoice" />
            </SidebarGroup>
            
            <SidebarGroup 
              label="Payments" 
              icon={CreditCard}
              isActive={isGroupActive(['/payment'])}
            >
              <SidebarItem to="/payment-create" icon={CreditCard} label="Record Payment" />
            </SidebarGroup>
            
            <SidebarGroup 
              label="Suppliers" 
              icon={Truck}
              isActive={isGroupActive(['/supplier'])}
            >
              <SidebarItem to="/supplier-directory" icon={Truck} label="Supplier Directory" />
              <SidebarItem to="/supplier-list" icon={FileText} label="Supplier List" />
            </SidebarGroup>
            
            <SidebarGroup 
              label="Reports" 
              icon={BarChart}
              isActive={isGroupActive(['/report'])}
            >
              <SidebarItem to="/customer-report" icon={User} label="Customer Reports" />
              <SidebarItem to="/sales-report" icon={BarChart} label="Sales Reports" />
            </SidebarGroup>
            
            <SidebarItem to="/settings" icon={Settings} label="Settings" />
          </div>
        )}
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
