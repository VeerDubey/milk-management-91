
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Percent, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface TaxSettings {
  gstEnabled: boolean;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  taxInclusive: boolean;
  gstNumber: string;
  taxDisplayName: string;
}

export default function TaxSettings() {
  const [settings, setSettings] = useState<TaxSettings>({
    gstEnabled: true,
    gstRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    taxInclusive: false,
    gstNumber: '',
    taxDisplayName: 'GST'
  });
  
  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('taxSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading tax settings:', error);
      }
    }
  }, []);
  
  const handleSave = () => {
    try {
      localStorage.setItem('taxSettings', JSON.stringify(settings));
      toast.success('Tax settings saved successfully');
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast.error('Failed to save tax settings');
    }
  };
  
  const updateSetting = (key: keyof TaxSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">Configure tax rates and GST settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              GST Configuration
            </CardTitle>
            <CardDescription>
              Configure Goods and Services Tax settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gst-enabled">Enable GST</Label>
              <Switch
                id="gst-enabled"
                checked={settings.gstEnabled}
                onCheckedChange={(checked) => updateSetting('gstEnabled', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="gst-number">GST Number</Label>
              <Input
                id="gst-number"
                value={settings.gstNumber}
                onChange={(e) => updateSetting('gstNumber', e.target.value)}
                placeholder="Enter GST number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax-display">Tax Display Name</Label>
              <Input
                id="tax-display"
                value={settings.taxDisplayName}
                onChange={(e) => updateSetting('taxDisplayName', e.target.value)}
                placeholder="GST, VAT, Tax, etc."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
              <Switch
                id="tax-inclusive"
                checked={settings.taxInclusive}
                onCheckedChange={(checked) => updateSetting('taxInclusive', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Rates</CardTitle>
            <CardDescription>
              Set tax rates for different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gst-rate">GST Rate (%)</Label>
              <Input
                id="gst-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.gstRate}
                onChange={(e) => updateSetting('gstRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cgst-rate">CGST Rate (%)</Label>
                <Input
                  id="cgst-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.cgstRate}
                  onChange={(e) => updateSetting('cgstRate', parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sgst-rate">SGST Rate (%)</Label>
                <Input
                  id="sgst-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.sgstRate}
                  onChange={(e) => updateSetting('sgstRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="igst-rate">IGST Rate (%)</Label>
              <Input
                id="igst-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.igstRate}
                onChange={(e) => updateSetting('igstRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Tax Calculation Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Intra-State (CGST + SGST)</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <div>CGST: {settings.cgstRate}%</div>
                  <div>SGST: {settings.sgstRate}%</div>
                  <div className="font-medium">Total: {settings.cgstRate + settings.sgstRate}%</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Inter-State (IGST)</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <div>IGST: {settings.igstRate}%</div>
                  <div className="font-medium">Total: {settings.igstRate}%</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">Sample Calculation</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Base Amount: ₹100</div>
                  <div>Tax ({settings.gstRate}%): ₹{(100 * settings.gstRate / 100).toFixed(2)}</div>
                  <div className="font-medium">Total: ₹{(100 + (100 * settings.gstRate / 100)).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
