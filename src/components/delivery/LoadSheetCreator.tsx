
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Truck, Package, Plus, Edit, Save, Download, Printer,
  Calculator, AlertCircle, CheckCircle
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import { format } from 'date-fns';
import { exportLoadSheetToPDF, printLoadSheet, exportLoadSheetToExcel } from '@/utils/loadSheetUtils';

interface LoadSheetItem {
  productId: string;
  productName: string;
  brand: string;
  packSize: string;
  category: string;
  standingQuantity: number;
  todayQuantity: number;
  adjustedQuantity: number;
  finalQuantity: number;
  crateCount: number;
  remarks?: string;
}

interface Props {
  deliverySheetData?: any[];
  selectedDate: Date;
  selectedArea?: string;
  selectedVehicle?: string;
}

export function LoadSheetCreator({ deliverySheetData = [], selectedDate, selectedArea, selectedVehicle }: Props) {
  const { products, vehicles, orders } = useData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(selectedVehicle || '');
  const [driverName, setDriverName] = useState('');
  const [routeInfo, setRouteInfo] = useState(selectedArea || '');
  const [loadSheetItems, setLoadSheetItems] = useState<LoadSheetItem[]>([]);

  // Generate load sheet items based on delivery sheet data
  const generateLoadSheetItems = useMemo(() => {
    if (!deliverySheetData.length) return [];

    const productMap = new Map<string, LoadSheetItem>();

    deliverySheetData.forEach(deliveryRow => {
      // Process each product type in the delivery row
      const productTypes = ['GGH', 'GGH450', 'GTSF', 'GSD1KG', 'GPC', 'FL'];
      
      productTypes.forEach(type => {
        const quantity = deliveryRow[type] || 0;
        if (quantity > 0) {
          const productId = `${type}-product`;
          const existing = productMap.get(productId);
          
          if (existing) {
            existing.todayQuantity += quantity;
            existing.finalQuantity = existing.standingQuantity + existing.todayQuantity + existing.adjustedQuantity;
          } else {
            const product = products.find(p => p.code?.includes(type) || p.name.includes(type));
            productMap.set(productId, {
              productId,
              productName: product?.name || type,
              brand: product?.category || 'Dairy',
              packSize: product?.unit || 'L',
              category: product?.category || 'Milk Products',
              standingQuantity: 0,
              todayQuantity: quantity,
              adjustedQuantity: 0,
              finalQuantity: quantity,
              crateCount: Math.ceil(quantity / 20), // Assuming 20 units per crate
              remarks: ''
            });
          }
        }
      });
    });

    return Array.from(productMap.values());
  }, [deliverySheetData, products]);

  const handleCreateLoadSheet = () => {
    const items = generateLoadSheetItems;
    if (items.length === 0) {
      toast.error('No delivery data found to create load sheet');
      return;
    }

    setLoadSheetItems(items);
    
    // Auto-fill vehicle and driver info
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (vehicle) {
      setDriverName(vehicle.driverName || '');
    }
    
    setIsCreateDialogOpen(true);
  };

  const updateItemQuantity = (productId: string, field: keyof LoadSheetItem, value: number) => {
    setLoadSheetItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: value };
        
        // Recalculate final quantity
        if (field === 'standingQuantity' || field === 'adjustedQuantity') {
          updated.finalQuantity = updated.standingQuantity + updated.todayQuantity + updated.adjustedQuantity;
        }
        
        // Recalculate crate count
        if (field === 'finalQuantity' || updated.finalQuantity !== item.finalQuantity) {
          updated.crateCount = Math.ceil(updated.finalQuantity / 20);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const updateItemRemarks = (productId: string, remarks: string) => {
    setLoadSheetItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, remarks } : item
    ));
  };

  const calculateTotals = () => {
    return loadSheetItems.reduce((acc, item) => ({
      totalQuantity: acc.totalQuantity + item.finalQuantity,
      totalCrates: acc.totalCrates + item.crateCount
    }), { totalQuantity: 0, totalCrates: 0 });
  };

  const saveLoadSheet = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const totals = calculateTotals();
    
    if (!vehicle || !driverName || loadSheetItems.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const loadSheetData = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: routeInfo || selectedArea || 'General Route',
      agent: driverName,
      items: loadSheetItems,
      totalQuantity: totals.totalQuantity,
      totalCrates: totals.totalCrates
    };

    // Here you would typically save to your data context
    toast.success('Load sheet created successfully!');
    setIsCreateDialogOpen(false);
  };

  const exportToPDF = () => {
    const totals = calculateTotals();
    const loadSheetData = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: routeInfo || selectedArea || 'General Route',
      agent: driverName,
      items: loadSheetItems,
      totalQuantity: totals.totalQuantity,
      totalCrates: totals.totalCrates
    };

    try {
      exportLoadSheetToPDF(loadSheetData);
      toast.success('Load sheet PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const printLoadSheet = () => {
    const totals = calculateTotals();
    const loadSheetData = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: routeInfo || selectedArea || 'General Route',
      agent: driverName,
      items: loadSheetItems,
      totalQuantity: totals.totalQuantity,
      totalCrates: totals.totalCrates
    };

    try {
      printLoadSheet(loadSheetData);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print load sheet');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Load Sheet Generator
              </CardTitle>
              <CardDescription>
                Create load sheets from delivery sheet data
              </CardDescription>
            </div>
            <Button onClick={handleCreateLoadSheet} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Load Sheet
            </Button>
          </div>
        </CardHeader>
        
        {deliverySheetData.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span>Products: {generateLoadSheetItems.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-green-500" />
                <span>Total Qty: {generateLoadSheetItems.reduce((sum, item) => sum + item.todayQuantity, 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span>Crates: {generateLoadSheetItems.reduce((sum, item) => sum + item.crateCount, 0)}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Sheet - {format(selectedDate, 'dd/MM/yyyy')}</DialogTitle>
            <DialogDescription>
              Configure and manage load sheet details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Load Sheet Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNumber} - {vehicle.driverName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Enter driver name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Route</Label>
                <Input
                  value={routeInfo}
                  onChange={(e) => setRouteInfo(e.target.value)}
                  placeholder="Enter route information"
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{loadSheetItems.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{totals.totalQuantity}</p>
                    </div>
                    <Calculator className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Crates</p>
                      <p className="text-2xl font-bold">{totals.totalCrates}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Load Sheet Table */}
            <Card>
              <CardHeader>
                <CardTitle>Load Sheet Items</CardTitle>
                <CardDescription>Configure quantities and adjustments for each product</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Pack Size</TableHead>
                      <TableHead>Standing</TableHead>
                      <TableHead>Today's Order</TableHead>
                      <TableHead>Adjustment</TableHead>
                      <TableHead>Final Qty</TableHead>
                      <TableHead>Crates</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadSheetItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.brand}</Badge>
                        </TableCell>
                        <TableCell>{item.packSize}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.standingQuantity}
                            onChange={(e) => updateItemQuantity(item.productId, 'standingQuantity', Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-blue-600">{item.todayQuantity}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.adjustedQuantity}
                            onChange={(e) => updateItemQuantity(item.productId, 'adjustedQuantity', Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">{item.finalQuantity}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.crateCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.remarks || ''}
                            onChange={(e) => updateItemRemarks(item.productId, e.target.value)}
                            placeholder="Add remarks"
                            className="w-32"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={printLoadSheet}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveLoadSheet}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Load Sheet
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
