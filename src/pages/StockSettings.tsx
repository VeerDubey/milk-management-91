
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Search, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function StockSettings() {
  const { products, updateProduct, updateProductMinStock } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [editedMinStock, setEditedMinStock] = useState<Record<string, number>>({});
  const [showLowStockAlerts, setShowLowStockAlerts] = useState(true);
  const [autoReorderLevel, setAutoReorderLevel] = useState(false);
  const [defaultMinStockLevel, setDefaultMinStockLevel] = useState(5);
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMinStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedMinStock({
        ...editedMinStock,
        [productId]: numValue
      });
    }
  };

  const updateMinStock = (productId: string) => {
    const newMinStock = editedMinStock[productId];
    if (newMinStock !== undefined) {
      updateProductMinStock(productId, newMinStock);
      
      // Reset the edited value
      const newEditedMinStock = { ...editedMinStock };
      delete newEditedMinStock[productId];
      setEditedMinStock(newEditedMinStock);
      
      toast.success("Minimum stock level updated");
    }
  };

  const updateAllMinStocks = () => {
    Object.entries(editedMinStock).forEach(([productId, minStock]) => {
      updateProductMinStock(productId, minStock);
    });
    
    toast.success(`Updated minimum stock levels for ${Object.keys(editedMinStock).length} products`);
    setEditedMinStock({});
  };

  const applyDefaultMinStock = () => {
    const updates: Record<string, number> = {};
    
    products.forEach(product => {
      if (!product.minStockLevel) {
        updates[product.id] = defaultMinStockLevel;
      }
    });
    
    // Update edited min stock state
    setEditedMinStock({
      ...editedMinStock,
      ...updates
    });
    
    toast.success(`Set default min stock level for ${Object.keys(updates).length} products`);
  };

  const saveGlobalSettings = () => {
    // In a real application, this would save to your backend or localStorage
    toast.success("Stock settings saved successfully");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Settings</h1>
          <p className="text-muted-foreground">Configure inventory management settings</p>
        </div>
        <Button onClick={saveGlobalSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Stock Settings</CardTitle>
          <CardDescription>Configure system-wide inventory settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when products fall below minimum stock level
              </p>
            </div>
            <Switch
              id="low-stock-alerts"
              checked={showLowStockAlerts}
              onCheckedChange={setShowLowStockAlerts}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reorder">Auto Reorder Suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically suggest reordering when stock is low
              </p>
            </div>
            <Switch
              id="auto-reorder"
              checked={autoReorderLevel}
              onCheckedChange={setAutoReorderLevel}
            />
          </div>
          
          <div className="flex flex-col space-y-2 py-2">
            <Label htmlFor="default-min-stock">Default Minimum Stock Level</Label>
            <div className="flex gap-4">
              <Input
                id="default-min-stock"
                type="number"
                min="0"
                value={defaultMinStockLevel}
                onChange={(e) => setDefaultMinStockLevel(parseInt(e.target.value, 10) || 0)}
                className="max-w-[120px]"
              />
              <Button onClick={applyDefaultMinStock}>
                Apply to Products Without Min Level
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Set the default minimum stock level for products that don't have one specified
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Product-Specific Minimum Stock Levels</CardTitle>
              <CardDescription>Set minimum stock levels for individual products</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {Object.keys(editedMinStock).length > 0 && (
                <Button onClick={updateAllMinStocks}>
                  Save All Changes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Current Min Stock</TableHead>
                  <TableHead className="text-right">New Min Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No products found. {searchTerm && "Try adjusting your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const isEdited = editedMinStock[product.id] !== undefined;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                          {!product.minStockLevel && (
                            <div className="flex items-center text-amber-500 text-xs mt-1">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              No min stock set
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{product.sku || "N/A"}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell className="text-right">{product.minStockLevel || 0}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            className="w-20 text-right"
                            value={editedMinStock[product.id] !== undefined 
                              ? editedMinStock[product.id] 
                              : ""}
                            onChange={(e) => handleMinStockChange(product.id, e.target.value)}
                            placeholder={String(product.minStockLevel || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateMinStock(product.id)}
                            disabled={!isEdited}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
