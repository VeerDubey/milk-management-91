
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';

export default function StockSettings() {
  const { products, updateProduct } = useData();
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [enableStockAlerts, setEnableStockAlerts] = useState(true);
  
  // Function to update the minimum stock level of a product
  const updateProductMinStock = (productId, minStockLevel) => {
    updateProduct(productId, { minStockLevel: Number(minStockLevel) });
  };
  
  const handleSaveSettings = () => {
    // Example implementation - in a real app, this would save settings to context or API
    toast.success('Stock settings updated successfully');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Stock Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure stock management behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Default Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Products below this quantity will be marked as low stock (default for new products)
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="enableAlerts"
                checked={enableStockAlerts}
                onCheckedChange={setEnableStockAlerts}
              />
              <Label htmlFor="enableAlerts">Enable low stock alerts</Label>
            </div>
            
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Product-Specific Stock Levels</CardTitle>
          <CardDescription>Set minimum stock levels for each product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium">Product Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Min Stock Level</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductStockSetting
                    key={product.id}
                    product={product}
                    updateMinStock={(value) => updateProductMinStock(product.id, value)}
                  />
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductStockSetting({ product, updateMinStock }) {
  const [minStock, setMinStock] = useState(product.minStockLevel?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = () => {
    updateMinStock(minStock);
    setIsEditing(false);
    toast.success(`Min stock for ${product.name} updated`);
  };
  
  return (
    <tr className="border-b">
      <td className="p-4 align-middle">{product.name}</td>
      <td className="p-4 align-middle">
        {isEditing ? (
          <Input
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            className="w-24"
          />
        ) : (
          product.minStockLevel || 'Not set'
        )}
      </td>
      <td className="p-4 align-middle">
        {isEditing ? (
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}
