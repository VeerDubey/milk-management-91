
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Palette, Monitor, Type, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeProvider';

interface UISettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  currency: string;
  dateFormat: string;
  sidebarCollapsed: boolean;
  colorScheme: string;
  tableStyle: 'bordered' | 'minimal' | 'striped';
  notificationFrequency: 'high' | 'medium' | 'low' | 'off';
  language: string;
}

export default function UISettings() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UISettings>({
    theme: 'system',
    compactMode: false,
    fontSize: 'medium',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    sidebarCollapsed: false,
    colorScheme: 'blue',
    tableStyle: 'bordered',
    notificationFrequency: 'medium',
    language: 'en'
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('ui-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = (newSettings: UISettings) => {
    setSettings(newSettings);
    localStorage.setItem('ui-settings', JSON.stringify(newSettings));
    toast.success('Settings saved successfully');
  };

  const handleSettingChange = (key: keyof UISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: UISettings = {
      theme: 'system',
      compactMode: false,
      fontSize: 'medium',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      sidebarCollapsed: false,
      colorScheme: 'blue',
      tableStyle: 'bordered',
      notificationFrequency: 'medium',
      language: 'en'
    };
    saveSettings(defaultSettings);
  };

  const colorSchemes = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UI Settings</h1>
          <p className="text-muted-foreground">Customize the application interface</p>
        </div>
        <Button variant="outline" onClick={resetToDefaults}>
          Reset to Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  handleSettingChange('theme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={`w-full h-10 rounded-md border-2 ${
                      settings.colorScheme === scheme.id 
                        ? 'border-foreground' 
                        : 'border-muted'
                    }`}
                    style={{ backgroundColor: scheme.color }}
                    onClick={() => handleSettingChange('colorScheme', scheme.id)}
                    title={scheme.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value: 'small' | 'medium' | 'large') => 
                  handleSettingChange('fontSize', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compactMode">Compact Mode</Label>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Layout
            </CardTitle>
            <CardDescription>
              Configure layout and navigation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="sidebarCollapsed">Collapsed Sidebar</Label>
              <Switch
                id="sidebarCollapsed"
                checked={settings.sidebarCollapsed}
                onCheckedChange={(checked) => handleSettingChange('sidebarCollapsed', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Table Style</Label>
              <Select
                value={settings.tableStyle}
                onValueChange={(value: 'bordered' | 'minimal' | 'striped') => 
                  handleSettingChange('tableStyle', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bordered">Bordered</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="striped">Striped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select
                value={settings.notificationFrequency}
                onValueChange={(value: 'high' | 'medium' | 'low' | 'off') => 
                  handleSettingChange('notificationFrequency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Regional
            </CardTitle>
            <CardDescription>
              Configure regional and formatting preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => handleSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your settings will look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  settings.fontSize === 'small' ? 'text-sm' :
                  settings.fontSize === 'large' ? 'text-lg' : 'text-base'
                }`}>
                  Sample Text
                </span>
                <span className="text-muted-foreground">
                  {settings.currency === 'INR' ? '₹1,234.56' :
                   settings.currency === 'USD' ? '$1,234.56' :
                   settings.currency === 'EUR' ? '€1,234.56' : '£1,234.56'}
                </span>
              </div>
              
              <div className={`p-2 rounded ${
                settings.tableStyle === 'bordered' ? 'border' :
                settings.tableStyle === 'striped' ? 'bg-muted/50' : ''
              }`}>
                <div className="text-sm">Sample table row</div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Date: {settings.dateFormat === 'DD/MM/YYYY' ? '25/05/2024' :
                       settings.dateFormat === 'MM/DD/YYYY' ? '05/25/2024' : '2024-05-25'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
