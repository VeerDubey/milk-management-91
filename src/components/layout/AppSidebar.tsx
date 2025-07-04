import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  DollarSign,
  FileText,
  Truck,
  Settings,
  BarChart3,
  MessageSquare,
  Clipboard,
  Factory,
  UserCog,
  TrendingUp,
  Mail,
  Building2
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Products", url: "/products", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Outstanding", url: "/outstanding", icon: DollarSign },
  { title: "Invoices", url: "/invoices", icon: FileText },
];

const operationsItems = [
  { title: "Track Sheet", url: "/track-sheet", icon: Clipboard },
  { title: "Delivery Sheet", url: "/delivery-sheet", icon: Truck },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Suppliers", url: "/suppliers", icon: Building2 },
];

const reportsItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
];

const communicationItems = [
  { title: "Communication", url: "/communication", icon: Mail },
  { title: "Messaging", url: "/messaging", icon: MessageSquare },
];

const managementItems = [
  { title: "Master", url: "/master", icon: Factory },
  { title: "Advanced", url: "/advanced", icon: Settings },
  { title: "Role Management", url: "/role-management", icon: UserCog },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/70 transition-colors";

  const renderMenuSection = (items: typeof mainMenuItems, label: string) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {state === 'expanded' && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className={getNavCls}>
                  <item.icon className="h-4 w-4" />
                  {state === 'expanded' && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar
      className={`${state === 'collapsed' ? "w-14" : "w-64"} border-r border-border/40 bg-card/50 backdrop-blur-sm`}
      collapsible="icon"
    >
      <SidebarContent className="py-2">
        {renderMenuSection(mainMenuItems, "Main")}
        {renderMenuSection(operationsItems, "Operations")}
        {renderMenuSection(reportsItems, "Reports")}
        {renderMenuSection(communicationItems, "Communication")}
        {renderMenuSection(managementItems, "Management")}
      </SidebarContent>
    </Sidebar>
  );
}