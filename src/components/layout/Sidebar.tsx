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
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Invoices", href: "/invoices", icon: Receipt },
    { 
      name: "Messaging",
      href: "/messaging",
      icon: MessageSquare
    },
  ];

  const ledgerLinks: NavLink[] = [
    { name: "Customer Ledger", href: "/customer-ledger", icon: FileText },
    { name: "Supplier Ledger", href: "/supplier-ledger", icon: Truck },
  ];

  const reportsLinks: NavLink[] = [
    { name: "Sales Report", href: "/sales-report", icon: BarChart },
    { name: "Outstanding Dues", href: "/outstanding-dues", icon: Coins },
    { name: "Daily Track Sheet", href: "/track-sheet", icon: Calendar },
  ];

  const settingsLinks: NavLink[] = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div
      className={cn(
        "flex flex-col w-64 border-r bg-secondary h-screen fixed top-0 left-0",
        className
      )}
    >
      <div className="p-4">
        <Button variant="ghost" className="justify-start w-full p-0">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Vikas Milk Center
        </Button>
      </div>
      <div className="flex-grow p-4 flex flex-col justify-between">
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
            <AccordionItem value="ledgers">
              <AccordionTrigger className="hover:bg-secondary-foreground hover:text-secondary-foreground">
                Ledgers
                <ChevronsDown className="mr-2 h-4 w-4" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {ledgerLinks.map((link) => (
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
        </div>

        <div>
          {settingsLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className={cn(
                "justify-start w-full",
                location.pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : ""
              )}
              onClick={() => navigate(link.href)}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
