
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Search,
  Bell,
  User,
  Sun,
  Moon,
  Menu,
  Settings,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data/DataContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { uiSettings } = useData();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Toggle theme
  const handleToggleTheme = () => {
    toggleTheme();
    // Use alert for simplicity since toast might not be fully initialized
    alert(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2 w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 focus-visible:ring-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isOnline && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Offline Mode
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              navigate('/login');
            }}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <OfflineIndicator />
    </header>
  );
};

export default Header;
