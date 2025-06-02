import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Truck, Package, Users, FileText, Download, Printer, 
  QrCode, AlertTriangle, Plus, Minus, Save, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
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

interface LoadSheet {
  id: string;
  date: string;
  route: string;
  deliveryAgent: string;
  items: LoadSheetItem[];
  status: 'draft' | 'finalized' | 'dispatched';
  createdBy: string;
  createdAt: string;
  version: number;
}

export default function LoadSheetManagement() {
  const { customers, orders, products, salesmen, vehicles } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [loadSheetItems, setLoadSheetItems] = useState<LoadSheetItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [savedLoadSheets, setSavedLoadSheets] = useState<LoadSheet[]>([]);

  // Get unique routes from customers
  const routes = useMemo(() => {
    const routeSet = new Set(customers.map(c => c.area).filter(Boolean));
    return Array.from(routeSet);
  }, [customers]);

  // Get customers for selected route
  const routeCustomers = useMemo(() => {
    return customers.filter(c => c.area === selectedRoute);
  }, [customers, selectedRoute]);

  // Auto-fetch standing orders and today's subscriptions
  const fetchOrderData = () => {
    if (!selectedDate || !selectedRoute || selectedCustomers.length === 0) {
      toast.error('Please select date, route, and customers first');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const relevantOrders = orders.filter(order => 
      order.date === dateStr && 
      selectedCustomers.includes(order.customerId) &&
      order.status !== 'cancelled'
    );

    const itemMap = new Map<string, LoadSheetItem>();

    // Process orders
    relevantOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        const key = `${product.id}-${product.name}-${product.code}`;
        
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            productId: product.id,
            productName: product.name,
            brand: product.category || 'Generic',
            packSize: product.unit || 'piece',
            category: product.category || 'Dairy',
            standingQuantity: 0,
            todayQuantity: item.quantity,
            adjustedQuantity: 0,
            finalQuantity: item.quantity,
            crateCount: Math.ceil(item.quantity / 12), // Assuming 12 units per crate
            remarks: ''
          });
        } else {
          const existing = itemMap.get(key)!;
          existing.todayQuantity += item.quantity;
          existing.finalQuantity = existing.standingQuantity + existing.todayQuantity + existing.adjustedQuantity;
          existing.crateCount = Math.ceil(existing.finalQuantity / 12);
        }
      });
    });

    setLoadSheetItems(Array.from(itemMap.values()));
    toast.success(`Loaded ${itemMap.size} products for ${relevantOrders.length} orders`);
  };

  // Handle quantity adjustments
  const adjustQuantity = (productId: string, adjustment: number) => {
    setLoadSheetItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const newAdjusted = item.adjustedQuantity + adjustment;
        const newFinal = item.standingQuantity + item.todayQuantity + newAdjusted;
        return {
          ...item,
          adjustedQuantity: newAdjusted,
          finalQuantity: Math.max(0, newFinal),
          crateCount: Math.ceil(Math.max(0, newFinal) / 12)
        };
      }
      return item;
    }));
  };

  // Handle customer selection
  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Save load sheet
  const saveLoadSheet = (status: 'draft' | 'finalized') => {
    if (!selectedRoute || !selectedAgent || loadSheetItems.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    const loadSheet: LoadSheet = {
      id: `ls-${Date.now()}`,
      date: format(selectedDate, 'yyyy-MM-dd'),
      route: selectedRoute,
      deliveryAgent: selectedAgent,
      items: loadSheetItems,
      status,
      createdBy: 'Admin', // In real app, get from auth context
      createdAt: new Date().toISOString(),
      version: 1
    };

    setSavedLoadSheets(prev => [...prev, loadSheet]);
    toast.success(`Load sheet ${status === 'draft' ? 'saved as draft' : 'finalized'}`);
  };

  // Export functions
  const exportToPDF = () => {
    const data = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: selectedRoute,
      agent: selectedAgent,
      items: loadSheetItems,
      totalQuantity: loadSheetItems.reduce((sum, item) => sum + item.finalQuantity, 0),
      totalCrates: loadSheetItems.reduce((sum, item) => sum + item.crateCount, 0)
    };
    exportLoadSheetToPDF(data);
  };

  const exportToExcel = () => {
    const data = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: selectedRoute,
      agent: selectedAgent,
      items: loadSheetItems
    };
    exportLoadSheetToExcel(data);
  };

  const printSheet = () => {
    const data = {
      date: format(selectedDate, 'dd/MM/yyyy'),
      route: selectedRoute,
      agent: selectedAgent,
      items: loadSheetItems,
      totalQuantity: loadSheetItems.reduce((sum, item) => sum + item.finalQuantity, 0),
      totalCrates: loadSheetItems.reduce((sum, item) => sum + item.crateCount, 0)
    };
    printLoadSheet(data);
  };

  // Group items by brand and category
  const groupedItems = useMemo(() => {
    const grouped = loadSheetItems.reduce((acc, item) => {
      const key = `${item.brand}-${item.category}`;
      if (!acc[key]) {
        acc[key] = {
          brand: item.brand,
          category: item.category,
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { brand: string; category: string; items: LoadSheetItem[] }>);

    return Object.values(grouped);
  }, [loadSheetItems]);

  return (
    <div className="space-y-6 p-6 neo-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-aurora neo-glow-text">
            Load Sheet Management
          </h1>
          <p className="text-muted-foreground">
            Automate warehouse dispatch with intelligent load sheet generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="neo-glass">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={printSheet} className="neo-glass">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="neo-glass">
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportToPDF} className="neo-button-primary">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Load Sheet</TabsTrigger>
          <TabsTrigger value="history">Load Sheet History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Input Parameters */}
          <Card className="neo-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Load Sheet Parameters
              </CardTitle>
              <CardDescription>Configure delivery parameters and fetch orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Delivery Date</Label>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="w-full neo-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="route">Route</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map(route => (
                        <SelectItem key={route} value={route}>{route}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent">Delivery Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesmen.map(agent => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name} - {agent.route || 'No route assigned'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-end">
                  <Button onClick={fetchOrderData} className="w-full neo-button-primary">
                    Fetch Orders
                  </Button>
                </div>
              </div>

              {/* Customer Selection */}
              {selectedRoute && (
                <div className="space-y-3">
                  <Label>Select Customers for Route</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {routeCustomers.map(customer => (
                      <div key={customer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={customer.id}
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => toggleCustomer(customer.id)}
                        />
                        <Label htmlFor={customer.id} className="text-sm">
                          {customer.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedCustomers.length} customers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Load Sheet Items */}
          {loadSheetItems.length > 0 && (
            <Card className="neo-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Load Sheet Items
                </CardTitle>
                <CardDescription>Review and adjust quantities per product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {groupedItems.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold">
                          {group.brand}
                        </Badge>
                        <Badge variant="secondary">
                          {group.category}
                        </Badge>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">Pack Size</TableHead>
                              <TableHead className="text-center">Standing</TableHead>
                              <TableHead className="text-center">Today's Orders</TableHead>
                              <TableHead className="text-center">Adjustment</TableHead>
                              <TableHead className="text-center">Final Qty</TableHead>
                              <TableHead className="text-center">Crates</TableHead>
                              <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.items.map((item, itemIndex) => (
                              <TableRow key={itemIndex}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell className="text-center">{item.packSize}</TableCell>
                                <TableCell className="text-center">{item.standingQuantity}</TableCell>
                                <TableCell className="text-center">{item.todayQuantity}</TableCell>
                                <TableCell className="text-center">
                                  <span className={item.adjustedQuantity > 0 ? 'text-green-600' : 
                                    item.adjustedQuantity < 0 ? 'text-red-600' : ''}>
                                    {item.adjustedQuantity > 0 ? '+' : ''}{item.adjustedQuantity}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center font-semibold">
                                  {item.finalQuantity}
                                </TableCell>
                                <TableCell className="text-center">{item.crateCount}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => adjustQuantity(item.productId, -1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => adjustQuantity(item.productId, 1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => saveLoadSheet('draft')}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={() => saveLoadSheet('finalized')} className="neo-button-primary">
                    <FileText className="mr-2 h-4 w-4" />
                    Finalize Load Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="neo-card">
            <CardHeader>
              <CardTitle>Load Sheet History</CardTitle>
              <CardDescription>View and manage previously created load sheets</CardDescription>
            </CardHeader>
            <CardContent>
              {savedLoadSheets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No load sheets created yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedLoadSheets.map((sheet) => (
                        <TableRow key={sheet.id}>
                          <TableCell>{sheet.date}</TableCell>
                          <TableCell>{sheet.route}</TableCell>
                          <TableCell>{sheet.deliveryAgent}</TableCell>
                          <TableCell>{sheet.items.length} products</TableCell>
                          <TableCell>
                            <Badge variant={
                              sheet.status === 'finalized' ? 'default' :
                              sheet.status === 'dispatched' ? 'secondary' : 'outline'
                            }>
                              {sheet.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="neo-card">
            <CardHeader>
              <CardTitle>Load Sheet Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {savedLoadSheets.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Load Sheets</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {savedLoadSheets.filter(s => s.status === 'finalized').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Finalized</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {savedLoadSheets.filter(s => s.status === 'dispatched').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dispatched</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
