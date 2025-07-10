
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { 
  Settings, AlertTriangle, Bell, Package, Warehouse, 
  Plus, Edit, Trash, Save, RefreshCw
} from 'lucide-react';

interface StockSetting {
  id: string;
  productId: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  autoReorder: boolean;
  location: string;
  supplierIds: string[];
  lowStockAlert: boolean;
  overstockAlert: boolean;
}

export default function StockSettings() {
  const { products, suppliers } = useData();
  const [globalSettings, setGlobalSettings] = useState({
    defaultMinStock: 10,
    defaultMaxStock: 100,
    defaultReorderLevel: 20,
    autoReorderEnabled: false,
    lowStockNotifications: true,
    overstockNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    defaultLocation: 'Main Warehouse'
  });

  const [stockSettings, setStockSettings] = useState<StockSetting[]>([]);
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<StockSetting | null>(null);
  const [newSetting, setNewSetting] = useState<Partial<StockSetting>>({
    productId: '',
    minStock: 10,
    maxStock: 100,
    reorderLevel: 20,
    reorderQuantity: 50,
    autoReorder: false,
    location: 'Main Warehouse',
    supplierIds: [],
    lowStockAlert: true,
    overstockAlert: true
  });

  const [locations, setLocations] = useState([
    'Main Warehouse',
    'Secondary Warehouse',
    'Cold Storage',
    'Retail Store'
  ]);
  const [newLocation, setNewLocation] = useState('');

  const handleSaveGlobalSettings = () => {
    // In real app, this would save to backend/localStorage
    toast.success('Global settings saved successfully');
  };

  const handleCreateSetting = () => {
    if (!newSetting.productId) {
      toast.error('Please select a product');
      return;
    }

    const setting: StockSetting = {
      id: `setting-${Date.now()}`,
      productId: newSetting.productId!,
      minStock: newSetting.minStock || 10,
      maxStock: newSetting.maxStock || 100,
      reorderLevel: newSetting.reorderLevel || 20,
      reorderQuantity: newSetting.reorderQuantity || 50,
      autoReorder: newSetting.autoReorder || false,
      location: newSetting.location || 'Main Warehouse',
      supplierIds: newSetting.supplierIds || [],
      lowStockAlert: newSetting.lowStockAlert || true,
      overstockAlert: newSetting.overstockAlert || true
    };

    setStockSettings([...stockSettings, setting]);
    setNewSetting({
      productId: '',
      minStock: 10,
      maxStock: 100,
      reorderLevel: 20,
      reorderQuantity: 50,
      autoReorder: false,
      location: 'Main Warehouse',
      supplierIds: [],
      lowStockAlert: true,
      overstockAlert: true
    });
    setIsSettingDialogOpen(false);
    toast.success('Stock setting created successfully');
  };

  const handleUpdateSetting = () => {
    if (!editingSetting) return;

    setStockSettings(stockSettings.map(setting => 
      setting.id === editingSetting.id ? editingSetting : setting
    ));
    setEditingSetting(null);
    setIsSettingDialogOpen(false);
    toast.success('Stock setting updated successfully');
  };

  const handleDeleteSetting = (settingId: string) => {
    setStockSettings(stockSettings.filter(setting => setting.id !== settingId));
    toast.success('Stock setting deleted successfully');
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
      toast.success('Location added successfully');
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getSupplierNames = (supplierIds: string[]) => {
    return supplierIds.map(id => {
      const supplier = suppliers.find(s => s.id === id);
      return supplier ? supplier.name : 'Unknown';
    }).join(', ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Settings</h1>
          <p className="text-muted-foreground">Configure inventory parameters and alerts</p>
        </div>
        <Button onClick={handleSaveGlobalSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="product-specific">Product Settings</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Default Stock Levels</CardTitle>
                <CardDescription>
                  Default values applied to new products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultMinStock">Default Minimum Stock</Label>
                  <Input
                    id="defaultMinStock"
                    type="number"
                    value={globalSettings.defaultMinStock}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultMinStock: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMaxStock">Default Maximum Stock</Label>
                  <Input
                    id="defaultMaxStock"
                    type="number"
                    value={globalSettings.defaultMaxStock}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultMaxStock: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultReorderLevel">Default Reorder Level</Label>
                  <Input
                    id="defaultReorderLevel"
                    type="number"
                    value={globalSettings.defaultReorderLevel}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultReorderLevel: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLocation">Default Location</Label>
                  <select
                    id="defaultLocation"
                    value={globalSettings.defaultLocation}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      defaultLocation: e.target.value
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configure automatic reordering and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Reorder</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create purchase orders when stock is low
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.autoReorderEnabled}
                    onCheckedChange={(checked) => setGlobalSettings({
                      ...globalSettings,
                      autoReorderEnabled: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products reach minimum stock level
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.lowStockNotifications}
                    onCheckedChange={(checked) => setGlobalSettings({
                      ...globalSettings,
                      lowStockNotifications: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overstock Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products exceed maximum stock level
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.overstockNotifications}
                    onCheckedChange={(checked) => setGlobalSettings({
                      ...globalSettings,
                      overstockNotifications: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send stock alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.emailNotifications}
                    onCheckedChange={(checked) => setGlobalSettings({
                      ...globalSettings,
                      emailNotifications: checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send stock alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.smsNotifications}
                    onCheckedChange={(checked) => setGlobalSettings({
                      ...globalSettings,
                      smsNotifications: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product-specific" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product-Specific Settings</CardTitle>
                  <CardDescription>Configure individual product stock parameters</CardDescription>
                </div>
                <Button onClick={() => setIsSettingDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Setting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Min/Max Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Auto Reorder</TableHead>
                      <TableHead>Suppliers</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockSettings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No product-specific settings configured. Click "Add Setting" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stockSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-medium">
                            {getProductName(setting.productId)}
                          </TableCell>
                          <TableCell>
                            {setting.minStock} / {setting.maxStock}
                          </TableCell>
                          <TableCell>{setting.reorderLevel}</TableCell>
                          <TableCell>{setting.location}</TableCell>
                          <TableCell>
                            {setting.autoReorder ? (
                              <span className="text-green-600">Enabled</span>
                            ) : (
                              <span className="text-muted-foreground">Disabled</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {getSupplierNames(setting.supplierIds) || 'None'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingSetting(setting);
                                  setIsSettingDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteSetting(setting.id)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Locations</CardTitle>
              <CardDescription>Manage storage locations for inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location name"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <Button onClick={handleAddLocation}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span>{location}</span>
                    </div>
                    {location !== 'Main Warehouse' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setLocations(locations.filter((_, i) => i !== index))}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>Configure when and how you receive stock alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                Advanced alert configuration will be available soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Setting Dialog */}
      <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? 'Edit Stock Setting' : 'Add Stock Setting'}
            </DialogTitle>
            <DialogDescription>
              Configure stock parameters for a specific product
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <select
                  value={editingSetting?.productId || newSetting.productId}
                  onChange={(e) => {
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, productId: e.target.value});
                    } else {
                      setNewSetting({...newSetting, productId: e.target.value});
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  disabled={!!editingSetting}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <select
                  value={editingSetting?.location || newSetting.location}
                  onChange={(e) => {
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, location: e.target.value});
                    } else {
                      setNewSetting({...newSetting, location: e.target.value});
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Minimum Stock</Label>
                <Input
                  type="number"
                  value={editingSetting?.minStock || newSetting.minStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, minStock: value});
                    } else {
                      setNewSetting({...newSetting, minStock: value});
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Stock</Label>
                <Input
                  type="number"
                  value={editingSetting?.maxStock || newSetting.maxStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, maxStock: value});
                    } else {
                      setNewSetting({...newSetting, maxStock: value});
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={editingSetting?.reorderLevel || newSetting.reorderLevel}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, reorderLevel: value});
                    } else {
                      setNewSetting({...newSetting, reorderLevel: value});
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Reorder</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically reorder when stock reaches reorder level
                  </p>
                </div>
                <Switch
                  checked={editingSetting?.autoReorder || newSetting.autoReorder}
                  onCheckedChange={(checked) => {
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, autoReorder: checked});
                    } else {
                      setNewSetting({...newSetting, autoReorder: checked});
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alert</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alert when stock is low
                  </p>
                </div>
                <Switch
                  checked={editingSetting?.lowStockAlert || newSetting.lowStockAlert}
                  onCheckedChange={(checked) => {
                    if (editingSetting) {
                      setEditingSetting({...editingSetting, lowStockAlert: checked});
                    } else {
                      setNewSetting({...newSetting, lowStockAlert: checked});
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSettingDialogOpen(false);
              setEditingSetting(null);
            }}>
              Cancel
            </Button>
            <Button onClick={editingSetting ? handleUpdateSetting : handleCreateSetting}>
              {editingSetting ? 'Update Setting' : 'Create Setting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
