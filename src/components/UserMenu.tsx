
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { CompanySwitcher } from "@/components/auth/CompanySwitcher";
import { LogOut, Settings, User, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { user, logout, companies, currentCompany, switchCompany } = useEnhancedAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <div className="flex items-center gap-3">
      {/* Company Switcher */}
      {companies.length > 1 && (
        <CompanySwitcher
          companies={companies}
          currentCompany={currentCompany}
          onCompanySwitch={switchCompany}
        />
      )}
      
      {/* Current Company Display for Single Company */}
      {companies.length === 1 && currentCompany && (
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{currentCompany.name}</span>
        </div>
      )}
      
      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {user.role} {currentCompany && `• ${currentCompany.role}`}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate("/ui-settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
