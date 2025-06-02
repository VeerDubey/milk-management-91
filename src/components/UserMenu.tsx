
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
import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { user, logout } = useEnhancedAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account ({user.role})</DropdownMenuLabel>
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
  );
}
