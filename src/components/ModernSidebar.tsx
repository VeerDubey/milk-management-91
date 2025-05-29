
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  MessageSquare,
  Truck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Store,
  Calculator,
  Clock,
  TrendingUp,
  Palette,
  UserCheck,
  Layers,
  Bell,
  Database,
  Calendar,
  FileSpreadsheet,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  Sparkles,
  ClipboardList,
  Archive,
  Award
} from 'lucide-react';

interface ModernSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ModernSidebar({ collapsed = false, onToggle }: ModernSidebarProps) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>(['customers', 'inventory', 'orders', 'delivery']);

  const toggleSection = (section: string) => {
    if (collapsed) return;
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (paths: string[]) => paths.some(path => location.pathname === path);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null,
    },
    {
      title: 'Master Data',
      icon: Database,
      path: '/master',
      badge: null,
    },
    {
      title: 'Customers',
      icon: Users,
      key: 'customers',
      badge: '7',
      children: [
        { title: 'Customer List', path: '/customer-list', icon: Users },
        { title: 'Directory', path: '/customer-directory', icon: Store },
        { title: 'Ledger', path: '/customer-ledger', icon: FileText },
        { title: 'Rates', path: '/customer-rates', icon: Calculator },
        { title: 'Reports', path: '/customer-report', icon: BarChart3 },
        { title: 'Outstanding Dues', path: '/outstanding-dues', icon: Clock },
        { title: 'Outstanding Amounts', path: '/outstanding-amounts', icon: CreditCard },
      ]
    },
    {
      title: 'Inventory',
      icon: Package,
      key: 'inventory',
      badge: '8',
      children: [
        { title: 'Inventory Dashboard', path: '/inventory-dashboard', icon: BarChart3 },
        { title: 'Product List', path: '/product-list', icon: Package },
        { title: 'Product Rates', path: '/product-rates', icon: Calculator },
        { title: 'Stock Management', path: '/stock-management', icon: Layers },
        { title: 'Stock Settings', path: '/stock-settings', icon: Settings },
        { title: 'Categories', path: '/product-categories', icon: Layers },
        { title: 'Bulk Rates', path: '/bulk-rates', icon: TrendingUp },
        { title: 'Low Stock Alerts', path: '/low-stock-alerts', icon: Bell },
      ]
    },
    {
      title: 'Orders',
      icon: ShoppingCart,
      key: 'orders',
      badge: '3',
      children: [
        { title: 'Order List', path: '/order-list', icon: ShoppingCart },
        { title: 'Order Entry', path: '/order-entry', icon: FileText },
        { title: 'Order History', path: '/order-history', icon: Clock },
      ]
    },
    {
      title: 'Payments',
      icon: CreditCard,
      key: 'payments',
      badge: '2',
      children: [
        { title: 'Payment List', path: '/payment-list', icon: CreditCard },
        { title: 'Create Payment', path: '/payment-create', icon: FileText },
      ]
    },
    {
      title: 'Invoices',
      icon: FileText,
      key: 'invoices',
      badge: '3',
      children: [
        { title: 'Invoice History', path: '/invoice-history', icon: Clock },
        { title: 'Create Invoice', path: '/invoice-create', icon: FileText },
        { title: 'Templates', path: '/invoice-templates', icon: Palette },
      ]
    },
    {
      title: 'Communication',
      icon: MessageSquare,
      key: 'communication',
      badge: '4',
      children: [
        { title: 'Messaging', path: '/messaging', icon: MessageSquare },
        { title: 'Email Templates', path: '/email-templates', icon: Mail },
        { title: 'SMS Templates', path: '/sms-templates', icon: Phone },
        { title: 'Bulk Communication', path: '/bulk-communication', icon: Bell },
      ]
    },
    {
      title: 'Delivery',
      icon: Truck,
      key: 'delivery',
      badge: '6',
      children: [
        { title: 'Delivery Challan', path: '/delivery-challan', icon: ClipboardList },
        { title: 'Advanced Track Sheet', path: '/track-sheet-advanced', icon: FileSpreadsheet },
        { title: 'Track Sheet', path: '/track-sheet', icon: FileText },
        { title: 'Track History', path: '/track-sheet-history', icon: Clock },
        { title: 'Vehicle Tracking', path: '/vehicle-tracking', icon: Truck },
        { title: 'Vehicle/Salesman', path: '/vehicle-salesman-create', icon: Users },
      ]
    },
    {
      title: 'Suppliers',
      icon: Building2,
      key: 'suppliers',
      badge: '4',
      children: [
        { title: 'Supplier Directory', path: '/supplier-directory', icon: Building2 },
        { title: 'Supplier Ledger', path: '/supplier-ledger', icon: FileText },
        { title: 'Supplier Payments', path: '/supplier-payments', icon: CreditCard },
        { title: 'Supplier Rates', path: '/supplier-rates', icon: Calculator },
      ]
    },
    {
      title: 'Reports & Analytics',
      icon: BarChart3,
      key: 'reports',
      badge: '3',
      children: [
        { title: 'Sales Analytics', path: '/sales-analytics', icon: Award },
        { title: 'Sales Report', path: '/sales-report', icon: TrendingUp },
        { title: 'Analytics', path: '/analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      key: 'settings',
      badge: '7',
      children: [
        { title: 'Company Profile', path: '/company-profile', icon: Building2 },
        { title: 'Area Management', path: '/area-management', icon: MapPin },
        { title: 'Financial Year', path: '/financial-year', icon: Calendar },
        { title: 'Tax Settings', path: '/tax-settings', icon: Calculator },
        { title: 'UI Settings', path: '/ui-settings', icon: Palette },
        { title: 'User Access', path: '/user-access', icon: UserCheck },
        { title: 'Expenses', path: '/expenses', icon: DollarSign },
      ]
    },
  ];

  return (
    <div className={cn(
      'flex h-screen flex-col modern-sidebar transition-all duration-300 ease-in-out relative overflow-hidden',
      collapsed ? 'w-16' : 'w-72'
    )}>
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5"></div>
      
      {/* Header */}
      <div className="relative flex h-16 items-center justify-between px-4 border-b border-primary/20 bg-black/10 backdrop-blur-xl">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-aurora-gradient rounded-xl flex items-center justify-center shadow-lg animate-float glow-primary">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gradient-aurora">Vikas Milk Centre</h2>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 hover:bg-primary/10 text-foreground relative z-10"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4 relative z-10">
        <div className="space-y-2">
          {menuItems.map((item) => {
            if (item.children) {
              const sectionPaths = item.children.map(child => child.path);
              const isOpen = openSections.includes(item.key) && !collapsed;
              const hasActiveChild = isSectionActive(sectionPaths);

              return (
                <div key={item.key} className="space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSection(item.key)}
                    className={cn(
                      "w-full justify-start h-11 px-3 font-medium transition-all duration-300 nav-item relative overflow-hidden group",
                      collapsed && "justify-center px-2",
                      hasActiveChild 
                        ? "bg-primary/20 text-primary border border-primary/30 shadow-lg backdrop-blur-sm" 
                        : "hover:bg-primary/10 text-foreground hover:text-primary"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <item.icon className={cn("h-5 w-5 relative z-10", !collapsed && "mr-3")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left relative z-10">{item.title}</span>
                        <div className="flex items-center space-x-2 relative z-10">
                          {item.badge && (
                            <Badge variant="secondary" className="h-5 px-2 text-xs bg-primary/20 text-primary border-primary/30">
                              {item.badge}
                            </Badge>
                          )}
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </>
                    )}
                  </Button>
                  
                  {isOpen && !collapsed && (
                    <div className="ml-4 space-y-1 border-l border-primary/20 pl-4 animate-fade-in">
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start h-9 px-3 font-normal transition-all duration-300 nav-item relative overflow-hidden group",
                              isActive(child.path)
                                ? "bg-aurora-gradient text-white shadow-lg border border-primary/30 active"
                                : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <child.icon className="h-4 w-4 mr-2 relative z-10" />
                            <span className="relative z-10">{child.title}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11 px-3 font-medium transition-all duration-300 nav-item relative overflow-hidden group",
                    collapsed && "justify-center px-2",
                    isActive(item.path)
                      ? "bg-aurora-gradient text-white shadow-lg border border-primary/30 active"
                      : "hover:bg-primary/10 text-foreground hover:text-primary"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <item.icon className={cn("h-5 w-5 relative z-10", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <span className="flex-1 text-left relative z-10">{item.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-primary/20 bg-black/10 backdrop-blur-xl relative z-10">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
            <div className="w-10 h-10 bg-aurora-gradient rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin@vikasmilk.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
