
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
import { Palette, Monitor, Type, Layout, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

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
  const [settings, setSettings] = useState<UISettings>({
    theme: 'dark',
    compactMode: false,
    fontSize: 'medium',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    sidebarCollapsed: false,
    colorScheme: 'green',
    tableStyle: 'bordered',
    notificationFrequency: 'medium',
    language: 'en'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('ui-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  }, []);

  const saveSettings = async (newSettings: UISettings) => {
    setIsLoading(true);
    try {
      setSettings(newSettings);
      localStorage.setItem('ui-settings', JSON.stringify(newSettings));
      
      // Apply settings immediately
      applySettingsToDOM(newSettings);
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const applySettingsToDOM = (newSettings: UISettings) => {
    try {
      const root = document.documentElement;
      
      // Apply theme
      root.classList.remove('light', 'dark');
      root.classList.add(newSettings.theme === 'system' ? 'dark' : newSettings.theme);
      
      // Apply font size
      root.style.fontSize = newSettings.fontSize === 'small' ? '14px' : 
                           newSettings.fontSize === 'large' ? '18px' : '16px';
      
      // Apply compact mode
      if (newSettings.compactMode) {
        root.classList.add('compact-mode');
      } else {
        root.classList.remove('compact-mode');
      }
      
      // Apply color scheme
      root.setAttribute('data-color-scheme', newSettings.colorScheme);
      
    } catch (error) {
      console.error('Error applying settings to DOM:', error);
    }
  };

  const handleSettingChange = (key: keyof UISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = async () => {
    const defaultSettings: UISettings = {
      theme: 'dark',
      compactMode: false,
      fontSize: 'medium',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      sidebarCollapsed: false,
      colorScheme: 'green',
      tableStyle: 'bordered',
      notificationFrequency: 'medium',
      language: 'en'
    };
    await saveSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  const colorSchemes = [
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'teal', name: 'Teal', color: '#14b8a6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">UI Settings</h1>
          <p className="text-muted-foreground">Customize the application interface to your preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
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
              <div className="grid grid-cols-6 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={`w-full h-10 rounded-md border-2 transition-all ${
                      settings.colorScheme === scheme.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
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
                  <SelectItem value="small">Small (14px)</SelectItem>
                  <SelectItem value="medium">Medium (16px)</SelectItem>
                  <SelectItem value="large">Large (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compactMode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
              </div>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-secondary" />
              Layout & Navigation
            </CardTitle>
            <CardDescription>
              Configure layout and navigation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebarCollapsed">Collapsed Sidebar</Label>
                <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
              </div>
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
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-accent" />
              Regional Settings
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
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-warning" />
              Live Preview
            </CardTitle>
            <CardDescription>
              See how your settings will look in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  settings.fontSize === 'small' ? 'text-sm' :
                  settings.fontSize === 'large' ? 'text-lg' : 'text-base'
                }`}>
                  Sample Text Preview
                </span>
                <span className="text-muted-foreground">
                  {settings.currency === 'INR' ? '₹1,234.56' :
                   settings.currency === 'USD' ? '$1,234.56' :
                   settings.currency === 'EUR' ? '€1,234.56' : '£1,234.56'}
                </span>
              </div>
              
              <div className={`p-3 rounded-md ${
                settings.tableStyle === 'bordered' ? 'border border-border' :
                settings.tableStyle === 'striped' ? 'bg-muted/30' : 'bg-transparent'
              }`}>
                <div className="text-sm">Sample table row with your styling</div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Date Format: {settings.dateFormat === 'DD/MM/YYYY' ? '25/05/2024' :
                             settings.dateFormat === 'MM/DD/YYYY' ? '05/25/2024' : '2024-05-25'}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Theme: {settings.theme} | Color: {settings.colorScheme} | Size: {settings.fontSize}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
