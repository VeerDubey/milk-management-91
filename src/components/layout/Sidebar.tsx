
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Car,
  FileText,
  User,
  Settings,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart,
  UserPlus,
  PackagePlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

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

const SidebarGroup = ({ label, icon: Icon, children, defaultOpen = false }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{label}</span>
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
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-background">
      <div className="flex-1 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <div className="space-y-1">
            <SidebarItem
              to="/"
              icon={BarChart}
              label="Dashboard"
              end
            />
            <SidebarItem 
              to="/order-entry" 
              icon={ShoppingCart} 
              label="Order Entry" 
            />
          </div>
          
          <h2 className="mt-6 mb-2 px-4 text-lg font-semibold tracking-tight">
            Management
          </h2>
          <div className="space-y-1">
            <SidebarGroup label="Customers" icon={User} defaultOpen>
              <SidebarItem
                to="/customer-directory"
                icon={User}
                label="Directory"
              />
              <SidebarItem
                to="/customer-ledger"
                icon={FileText}
                label="Ledger"
              />
              <SidebarItem
                to="/customer-rates"
                icon={CreditCard}
                label="Rates"
              />
            </SidebarGroup>
            
            <SidebarGroup label="Products" icon={Package} defaultOpen>
              <SidebarItem
                to="/product-rates"
                icon={Package}
                label="Product Rates"
              />
            </SidebarGroup>
            
            <SidebarGroup label="Suppliers" icon={Truck} defaultOpen>
              <SidebarItem
                to="/supplier-directory"
                icon={Truck}
                label="Directory"
              />
              <SidebarItem
                to="/supplier-ledger"
                icon={FileText}
                label="Ledger"
              />
              <SidebarItem
                to="/supplier-rates"
                icon={CreditCard}
                label="Rates"
              />
              <SidebarItem
                to="/supplier-payments"
                icon={CreditCard}
                label="Payments"
              />
            </SidebarGroup>
            
            <SidebarGroup label="Logistics" icon={Car} defaultOpen>
              <SidebarItem
                to="/vehicle-salesman-create"
                icon={Car}
                label="Vehicle & Salesmen"
              />
              <SidebarItem
                to="/vehicle-tracking"
                icon={Car}
                label="Tracking"
              />
            </SidebarGroup>
          </div>
          
          <h2 className="mt-6 mb-2 px-4 text-lg font-semibold tracking-tight">
            Settings
          </h2>
          <div className="space-y-1">
            <SidebarItem to="/settings" icon={Settings} label="App Settings" />
          </div>
        </div>
      </div>
    </div>
  );
}
