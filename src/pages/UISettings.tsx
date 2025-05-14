import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, Monitor, Sun, Moon, PanelLeft, Table2, Calendar, Bell } from 'lucide-react';

export default function UISettings() {
  const { 
    uiSettings, 
    updateUiSettings 
  } = useData();
  
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState(uiSettings);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    setSettings(uiSettings);
  }, [uiSettings]);
  
  const handleChange = (key, value) => {
    // For font size, ensure it's a valid value
    if (key === 'fontSize') {
      const validFonts = ['small', 'medium', 'large', 'x-large'];
      if (!validFonts.includes(value)) {
        value = 'medium';
      }
    }
    
    // For sidebarStyle, ensure it's a valid value
    if (key === 'sidebarStyle') {
      const validStyles = ['default', 'compact', 'expanded', 'gradient', 'solid', 'minimal'];
      if (!validStyles.includes(value)) {
        value = 'default';
      }
    }
    
    // For tableStyle, ensure it's a valid value
    if (key === 'tableStyle') {
      const validStyles = ['default', 'compact', 'minimal', 'bordered', 'striped'];
      if (!validStyles.includes(value)) {
        value = 'default';
      }
    }
    
    // For notificationFrequency, ensure it's a valid value
    if (key === 'notificationFrequency') {
      const validFrequencies = ['weekly', 'immediate', 'hourly', 'daily'];
      if (!validFrequencies.includes(value)) {
        value = 'daily';
      }
    }
    
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(true);
      return newSettings;
    });
  };
  
  const handleSave = () => {
    updateUiSettings(settings);
    setHasChanges(false);
    toast({
      title: "Settings Saved",
      description: "Your UI preferences have been updated.",
    });
  };
  
  const handleReset = () => {
    setSettings(uiSettings);
    setHasChanges(false);
  };

  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UI Settings</h1>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of the application interface
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <PanelLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tables & Lists</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
              <CardDescription>
                Set your preferred color theme and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme Mode</Label>
                <RadioGroup 
                  value={settings.theme} 
                  onValueChange={(value) => handleChange('theme', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem 
                      value="light" 
                      id="theme-light" 
                      className="sr-only" 
                    />
                    <Label 
                      htmlFor="theme-light" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:border-accent [&:has([data-state=checked])]:border-primary"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      <span className="block w-full text-center font-normal">
                        Light
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="dark" 
                      id="theme-dark" 
                      className="sr-only" 
                    />
                    <Label 
                      htmlFor="theme-dark" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-950 p-4 hover:bg-gray-900 hover:border-accent [&:has([data-state=checked])]:border-primary"
                    >
                      <Moon className="mb-3 h-6 w-6 text-white" />
                      <span className="block w-full text-center font-normal text-white">
                        Dark
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="system" 
                      id="theme-system" 
                      className="sr-only" 
                    />
                    <Label 
                      htmlFor="theme-system" 
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-b from-white to-gray-950 p-4 hover:border-accent [&:has([data-state=checked])]:border-primary"
                    >
                      <Monitor className="mb-3 h-6 w-6" />
                      <span className="block w-full text-center font-normal">
                        System
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select 
                  value={settings.fontSize as "small" | "medium" | "large" | "x-large"}
                  onValueChange={(value) => handleChange('fontSize', value)}
                >
                  <SelectTrigger id="font-size" className="w-full">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select 
                  value={settings.colorScheme}
                  onValueChange={(value) => handleChange('colorScheme', value)}
                >
                  <SelectTrigger id="color-scheme" className="w-full">
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue (Default)</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="slate">Slate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Options</CardTitle>
              <CardDescription>
                Control the sidebar and overall layout settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="sidebar-collapsed">Sidebar Collapsed by Default</Label>
                <Switch 
                  id="sidebar-collapsed" 
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(value) => handleChange('sidebarCollapsed', value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="sidebar-style">Sidebar Style</Label>
                <Select 
                  value={settings.sidebarStyle as "default" | "compact" | "expanded" | "gradient" | "solid" | "minimal"}
                  onValueChange={(value) => handleChange('sidebarStyle', value)}
                >
                  <SelectTrigger id="sidebar-style" className="w-full">
                    <SelectValue placeholder="Select sidebar style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="expanded">Expanded</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select 
                  value={settings.dateFormat}
                  onValueChange={(value) => handleChange('dateFormat', value)}
                >
                  <SelectTrigger id="date-format" className="w-full">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (31/12/2023)</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (12/31/2023)</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2023-12-31)</SelectItem>
                    <SelectItem value="dd MMM yyyy">DD MMM YYYY (31 Dec 2023)</SelectItem>
                    <SelectItem value="MMMM d, yyyy">MMMM D, YYYY (December 31, 2023)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tables & Data Display</CardTitle>
              <CardDescription>
                Configure how tables and data are displayed throughout the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="table-style">Table Style</Label>
                <Select 
                  value={settings.tableStyle as "default" | "compact" | "minimal" | "bordered" | "striped"}
                  onValueChange={(value) => handleChange('tableStyle', value)}
                >
                  <SelectTrigger id="table-style" className="w-full">
                    <SelectValue placeholder="Select table style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bordered">Bordered</SelectItem>
                    <SelectItem value="striped">Striped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">Check Frequency</Label>
                <Select 
                  value={settings.notificationFrequency as "weekly" | "immediate" | "hourly" | "daily"}
                  onValueChange={(value) => handleChange('notificationFrequency', value)}
                >
                  <SelectTrigger id="notification-frequency" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
