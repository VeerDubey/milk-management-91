
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Truck, 
  BarChart3, 
  Settings,
  UserPlus,
  Building2,
  ClipboardList,
  Route,
  Calendar,
  Target,
  TrendingUp,
  Bell,
  FileSpreadsheet,
  MapPin,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    category: 'Dashboard',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ]
  },
  {
    category: 'Core Management',
    items: [
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: Building2, label: 'Suppliers', path: '/suppliers' },
      { icon: Package, label: 'Products', path: '/products' },
      { icon: UserPlus, label: 'Users', path: '/users' },
    ]
  },
  {
    category: 'Orders & Sales',
    items: [
      { icon: ShoppingCart, label: 'Orders', path: '/orders' },
      { icon: CreditCard, label: 'Payments', path: '/payments' },
      { icon: Calculator, label: 'Order Calculator', path: '/order-calculator' },
    ]
  },
  {
    category: 'Delivery Operations',
    items: [
      { icon: Truck, label: 'Vehicles', path: '/vehicles' },
      { icon: Route, label: 'Delivery Management', path: '/delivery-management' },
      { icon: FileText, label: 'Delivery Challan', path: '/delivery-challan' },
      { icon: ClipboardList, label: 'Delivery Sheet', path: '/delivery-sheet' },
      { icon: Target, label: 'Track Delivery', path: '/track-delivery-sheet' },
      { icon: MapPin, label: 'Route Optimizer', path: '/route-optimizer' },
    ]
  },
  {
    category: 'Reports & Export',
    items: [
      { icon: BarChart3, label: 'Reports', path: '/reports' },
      { icon: FileSpreadsheet, label: 'Data Export', path: '/data-export' },
      { icon: Calendar, label: 'Delivery Reports', path: '/delivery-reports' },
    ]
  },
  {
    category: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

export const ModernSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={cn(
      "h-full neo-noir-surface border-r border-border-color transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 neo-noir-button-accent rounded-lg flex items-center justify-center">
              <img 
                src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
                alt="Logo" 
                className="w-5 h-5"
              />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold neo-noir-text">Vikas Milk</h2>
                <p className="text-xs neo-noir-text-muted">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {menuItems.map((category) => (
              <div key={category.category}>
                {!collapsed && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold neo-noir-text-muted uppercase tracking-wider">
                      {category.category}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <div key={item.path} className="px-2">
                        <Button
                          variant="ghost"
                          size={collapsed ? "icon" : "default"}
                          className={cn(
                            "w-full justify-start neo-noir-nav-item",
                            isActive && "neo-noir-nav-active",
                            collapsed && "h-10 w-10"
                          )}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                          {!collapsed && <span>{item.label}</span>}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
