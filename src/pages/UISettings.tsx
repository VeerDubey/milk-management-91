import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data/DataContext';
import { useTheme } from '@/contexts/ThemeProvider';
import { Moon, Sun, Palette } from 'lucide-react';

export default function UISettings() {
  const { uiSettings, updateUISettings } = useData();
  const { theme, accentColor, applyTheme } = useTheme();
  
  const handleThemeChange = (value: string) => {
    applyTheme(value as 'light' | 'dark' | 'system', accentColor);
  };
  
  const handleAccentColorChange = (value: string) => {
    applyTheme(theme, value as 'teal' | 'blue' | 'purple' | 'pink' | 'orange' | 'green');
  };
  
  const handleCompactChange = (checked: boolean) => {
    updateUISettings({ compactMode: checked });
  };
  
  const handleHighContrastChange = (checked: boolean) => {
    updateUISettings({ highContrast: checked });
  };
  
  const handleFontSizeChange = (value: "small" | "medium" | "large" | "x-large") => {
    updateUISettings({ fontSize: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UI Settings</h1>
        <p className="text-muted-foreground">
          Customize the appearance and behavior of the application.
        </p>
      </div>
      
      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>
                Choose your preferred theme and accent color.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Color Theme</Label>
                <RadioGroup 
                  defaultValue={theme} 
                  onValueChange={handleThemeChange}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem 
                      value="light" 
                      id="light" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="light" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      Light
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="dark" 
                      id="dark" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="dark" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      Dark
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="system" 
                      id="system" 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor="system" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="mb-3 flex gap-1">
                        <Sun className="h-6 w-6" />
                        <Moon className="h-6 w-6" />
                      </div>
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Accent Color</Label>
                <RadioGroup 
                  defaultValue={accentColor} 
                  onValueChange={handleAccentColorChange}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'teal', label: 'Teal', color: 'bg-teal-500' },
                    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
                    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
                    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
                    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
                    { value: 'green', label: 'Green', color: 'bg-green-500' }
                  ].map((item) => (
                    <div key={item.value}>
                      <RadioGroupItem 
                        value={item.value} 
                        id={item.value} 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor={item.value} 
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className={`${item.color} mb-3 h-6 w-6 rounded-full`} />
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Text & Density</CardTitle>
              <CardDescription>
                Adjust font size and layout density to your preference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Font Size</Label>
                <RadioGroup 
                  defaultValue={uiSettings.fontSize || "medium"} 
                  onValueChange={handleFontSizeChange}
                  className="grid grid-cols-4 gap-4"
                >
                  {[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                    { value: 'x-large', label: 'X-Large' }
                  ].map((item) => (
                    <div key={item.value}>
                      <RadioGroupItem 
                        value={item.value} 
                        id={`font-${item.value}`} 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor={`font-${item.value}`} 
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce padding and spacing throughout the interface
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={uiSettings?.compactMode || false}
                  onCheckedChange={handleCompactChange}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Badge variant="outline">Accessibility</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better readability
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={uiSettings?.highContrast || false}
                  onCheckedChange={handleHighContrastChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="behavior" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Alerts</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payment-reminders">Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming and overdue payments
                  </p>
                </div>
                <Switch
                  id="payment-reminders"
                  checked={uiSettings?.paymentReminders !== false}
                  onCheckedChange={(checked) => updateUISettings({ paymentReminders: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when products are running low
                  </p>
                </div>
                <Switch
                  id="low-stock"
                  checked={uiSettings?.lowStockAlerts !== false}
                  onCheckedChange={(checked) => updateUISettings({ lowStockAlerts: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Use motion effects throughout the interface
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={uiSettings?.enableAnimations !== false}
                  onCheckedChange={(checked) => updateUISettings({ enableAnimations: checked })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Preferences</CardTitle>
              <CardDescription>
                Control what information appears on your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="revenue-chart">Revenue Chart</Label>
                  <p className="text-sm text-muted-foreground">
                    Show revenue chart on dashboard
                  </p>
                </div>
                <Switch
                  id="revenue-chart"
                  checked={uiSettings?.showRevenueChart !== false}
                  onCheckedChange={(checked) => updateUISettings({ showRevenueChart: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recent-activity">Recent Activities</Label>
                  <p className="text-sm text-muted-foreground">
                    Show recent activities on dashboard
                  </p>
                </div>
                <Switch
                  id="recent-activity"
                  checked={uiSettings?.showRecentActivities !== false}
                  onCheckedChange={(checked) => updateUISettings({ showRecentActivities: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="customer-stats">Customer Statistics</Label>
                  <p className="text-sm text-muted-foreground">
                    Show customer statistics on dashboard
                  </p>
                </div>
                <Switch
                  id="customer-stats"
                  checked={uiSettings?.showCustomerStats !== false}
                  onCheckedChange={(checked) => updateUISettings({ showCustomerStats: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Format & Regional Settings</CardTitle>
              <CardDescription>
                Customize date, time and currency formats.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Date Format</Label>
                <RadioGroup 
                  defaultValue={uiSettings?.dateFormat || "MMM dd, yyyy"} 
                  onValueChange={(value) => updateUISettings({ dateFormat: value })}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'MMM dd, yyyy', label: 'May 10, 2025' },
                    { value: 'dd/MM/yyyy', label: '10/05/2025' },
                    { value: 'yyyy-MM-dd', label: '2025-05-10' }
                  ].map((item) => (
                    <div key={item.value}>
                      <RadioGroupItem 
                        value={item.value} 
                        id={`date-${item.value}`} 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor={`date-${item.value}`} 
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Currency Format</Label>
                <RadioGroup 
                  defaultValue={uiSettings?.currencyFormat || "₹#,###.##"} 
                  onValueChange={(value) => updateUISettings({ currencyFormat: value })}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: '₹#,###.##', label: '₹1,234.56' },
                    { value: '₹ #,###.##', label: '₹ 1,234.56' },
                    { value: '#,###.## ₹', label: '1,234.56 ₹' }
                  ].map((item) => (
                    <div key={item.value}>
                      <RadioGroupItem 
                        value={item.value} 
                        id={`currency-${item.value}`} 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor={`currency-${item.value}`} 
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Customize invoice generation defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-invoices">Auto-Generate Invoices</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate invoices at month end
                  </p>
                </div>
                <Switch
                  id="auto-invoices"
                  checked={uiSettings?.autoGenerateInvoices || false}
                  onCheckedChange={(checked) => updateUISettings({ autoGenerateInvoices: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Invoice Template</Label>
                <RadioGroup 
                  defaultValue={uiSettings?.defaultInvoiceTemplate || "standard"} 
                  onValueChange={(value) => updateUISettings({ defaultInvoiceTemplate: value })}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'modern', label: 'Modern' },
                    { value: 'minimal', label: 'Minimal' }
                  ].map((item) => (
                    <div key={item.value}>
                      <RadioGroupItem 
                        value={item.value} 
                        id={`template-${item.value}`} 
                        className="peer sr-only" 
                      />
                      <Label 
                        htmlFor={`template-${item.value}`} 
                        className="flex items-center justify-center rounded-md border-2 border-muted bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
