
import React, { useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Check,
  Palette,
  Save,
  SunMoon,
  Type,
  EyeIcon,
  LayoutGrid,
  Table2,
  Languages,
  Calendar,
  Bell,
  IndianRupee,
  Monitor,
} from 'lucide-react';

const UISettings = () => {
  const { uiSettings, updateUISettings } = useData();
  const { theme, setTheme } = useTheme();
  
  // Sync theme from ThemeContext with uiSettings.theme
  useEffect(() => {
    if (theme !== uiSettings.theme) {
      setTheme(uiSettings.theme);
    }
  }, [uiSettings.theme, setTheme, theme]);

  const handleThemeChange = (value: string) => {
    // Update both the ThemeContext and uiSettings
    setTheme(value as "light" | "dark" | "system");
    updateUISettings({ theme: value as "light" | "dark" | "system" });
    toast.success(`Theme updated to ${value} mode`);
  };

  const handleAccentColorChange = (color: string) => {
    updateUISettings({ accentColor: color });
    
    // Apply accent color as CSS variable
    let accentHue = "164"; // Teal default
    let accentSaturation = "70%";
    let accentLightness = "58%";
    
    switch (color) {
      case "teal":
        accentHue = "164";
        accentSaturation = "70%";
        accentLightness = "58%";
        break;
      case "blue":
        accentHue = "217";
        accentSaturation = "91%";
        accentLightness = "70%";
        break;
      case "purple":
        accentHue = "259";
        accentSaturation = "94%";
        accentLightness = "61%";
        break;
      case "pink":
        accentHue = "330";
        accentSaturation = "90%";
        accentLightness = "66%";
        break;
      case "orange":
        accentHue = "24";
        accentSaturation = "95%";
        accentLightness = "63%";
        break;
      case "green":
        accentHue = "142";
        accentSaturation = "71%";
        accentLightness = "45%";
        break;
    }
    
    document.documentElement.style.setProperty('--accent-hue', accentHue);
    document.documentElement.style.setProperty('--accent-saturation', accentSaturation);
    document.documentElement.style.setProperty('--accent-lightness', accentLightness);
    
    toast.success(`Accent color updated to ${color}`);
  };

  const handleFontSizeChange = (value: string) => {
    updateUISettings({ fontSize: value as "small" | "medium" | "large" | "x-large" });
    
    let fontSizeBase = "16px"; // Default medium size
    
    switch (value) {
      case "small":
        fontSizeBase = "14px";
        break;
      case "medium":
        fontSizeBase = "16px";
        break;
      case "large":
        fontSizeBase = "18px";
        break;
      case "x-large":
        fontSizeBase = "20px";
        break;
    }
    
    document.documentElement.style.setProperty('--font-size-base', fontSizeBase);
    toast.success(`Font size updated to ${value}`);
  };

  const handleSidebarStyleChange = (value: string) => {
    updateUISettings({ sidebarStyle: value });
    toast.success(`Sidebar style updated to ${value}`);
  };

  const handleSidebarColorChange = (value: string) => {
    updateUISettings({ sidebarColor: value });
    toast.success(`Sidebar color updated to ${value}`);
  };

  const handleToggleSetting = (setting: keyof typeof uiSettings, value: boolean) => {
    updateUISettings({ [setting]: value });
    
    // Apply settings that need immediate DOM changes
    if (setting === 'highContrast') {
      if (value) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    }
    
    if (setting === 'compactMode') {
      if (value) {
        document.documentElement.classList.add("compact-mode");
      } else {
        document.documentElement.classList.remove("compact-mode");
      }
    }
    
    toast.success(`${setting} ${value ? 'enabled' : 'disabled'}`);
  };

  const saveSettings = () => {
    // All settings are already saved via individual handlers, this is just for UX
    toast.success('All settings have been saved');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">UI Settings</h1>
        <p className="text-muted-foreground">
          Customize the appearance and behavior of the application
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SunMoon className="mr-2 h-5 w-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize the overall look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Color Theme</Label>
                <Select
                  value={uiSettings.theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the color theme for the application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {['teal', 'blue', 'purple', 'pink', 'orange', 'green'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-full rounded-md transition-all ${
                        uiSettings.accentColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-background'
                          : ''
                      }`}
                      style={{
                        backgroundColor: `var(--${color})`,
                      }}
                      onClick={() => handleAccentColorChange(color)}
                      aria-label={`${color} accent color`}
                    >
                      {uiSettings.accentColor === color && (
                        <Check className="h-4 w-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose the primary color for buttons and accents
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={uiSettings.fontSize}
                  onValueChange={handleFontSizeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Adjust the text size throughout the application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="high-contrast"
                    checked={uiSettings.highContrast}
                    onCheckedChange={(checked) => handleToggleSetting('highContrast', checked)}
                  />
                  <Label htmlFor="high-contrast">Enable high contrast</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5" />
              Layout Preferences
            </CardTitle>
            <CardDescription>
              Customize the layout and components of the interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sidebar-style">Sidebar Style</Label>
                <Select
                  value={uiSettings.sidebarStyle}
                  onValueChange={handleSidebarStyleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sidebar style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the appearance of the sidebar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebar-color">Sidebar Color</Label>
                <Select
                  value={uiSettings.sidebarColor}
                  onValueChange={handleSidebarColorChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sidebar color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teal">Teal</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the color for the sidebar
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="table-style">Table Style</Label>
                <Select
                  value={uiSettings.tableStyle}
                  onValueChange={(value) => updateUISettings({ tableStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select table style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="striped">Striped</SelectItem>
                    <SelectItem value="bordered">Bordered</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the appearance style for data tables
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compact-mode"
                    checked={uiSettings.compactMode}
                    onCheckedChange={(checked) => handleToggleSetting('compactMode', checked)}
                  />
                  <Label htmlFor="compact-mode">Enable compact mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing throughout the interface
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="mr-2 h-5 w-5" />
              Dashboard Settings
            </CardTitle>
            <CardDescription>
              Customize which widgets appear on your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quick-actions">Quick Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show quick action buttons on dashboard
                    </p>
                  </div>
                  <Switch
                    id="quick-actions"
                    checked={uiSettings.showQuickActions}
                    onCheckedChange={(checked) => handleToggleSetting('showQuickActions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="revenue-chart">Revenue Chart</Label>
                    <p className="text-sm text-muted-foreground">
                      Show revenue chart on dashboard
                    </p>
                  </div>
                  <Switch
                    id="revenue-chart"
                    checked={uiSettings.showRevenueChart}
                    onCheckedChange={(checked) => handleToggleSetting('showRevenueChart', checked)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recent-activities">Recent Activities</Label>
                    <p className="text-sm text-muted-foreground">
                      Show recent activities on dashboard
                    </p>
                  </div>
                  <Switch
                    id="recent-activities"
                    checked={uiSettings.showRecentActivities}
                    onCheckedChange={(checked) => handleToggleSetting('showRecentActivities', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="customer-stats">Customer Statistics</Label>
                    <p className="text-sm text-muted-foreground">
                      Show customer statistics on dashboard
                    </p>
                  </div>
                  <Switch
                    id="customer-stats"
                    checked={uiSettings.showCustomerStats}
                    onCheckedChange={(checked) => handleToggleSetting('showCustomerStats', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Notification Frequency</Label>
                <Select
                  value={uiSettings.notificationFrequency}
                  onValueChange={(value) => updateUISettings({ notificationFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How often you want to receive notifications
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about due payments
                    </p>
                  </div>
                  <Switch
                    id="payment-reminders"
                    checked={uiSettings.paymentReminders}
                    onCheckedChange={(checked) => handleToggleSetting('paymentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when inventory items are low
                    </p>
                  </div>
                  <Switch
                    id="low-stock-alerts"
                    checked={uiSettings.lowStockAlerts}
                    onCheckedChange={(checked) => handleToggleSetting('lowStockAlerts', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-notifications">Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new and updated orders
                  </p>
                </div>
                <Switch
                  id="order-notifications"
                  checked={uiSettings.orderNotifications}
                  onCheckedChange={(checked) => handleToggleSetting('orderNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="invoice-notifications">Invoice Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about invoice status changes
                  </p>
                </div>
                <Switch
                  id="invoice-notifications"
                  checked={uiSettings.invoiceNotifications}
                  onCheckedChange={(checked) => handleToggleSetting('invoiceNotifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupee className="mr-2 h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure regional preferences like date and currency formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select
                  value={uiSettings.dateFormat}
                  onValueChange={(value) => updateUISettings({ dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MMM dd, yyyy">May 14, 2023</SelectItem>
                    <SelectItem value="dd/MM/yyyy">14/05/2023</SelectItem>
                    <SelectItem value="MM/dd/yyyy">05/14/2023</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2023-05-14</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How dates will be displayed across the application
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-format">Currency Format</Label>
                <Select
                  value={uiSettings.currencyFormat}
                  onValueChange={(value) => updateUISettings({ currencyFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹#,###.##">₹1,234.56</SelectItem>
                    <SelectItem value="₹ #,###.##">₹ 1,234.56</SelectItem>
                    <SelectItem value="#,###.## ₹">1,234.56 ₹</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How currency values will be displayed
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select
                  value={uiSettings.timezone}
                  onValueChange={(value) => updateUISettings({ timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Time zone for date and time calculations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={uiSettings.defaultView}
                  onValueChange={(value) => updateUISettings({ defaultView: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  The default page shown after login
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveSettings} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UISettings;
