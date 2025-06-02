
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Truck, 
  Plus, 
  Save, 
  Printer, 
  Download,
  Package,
  User,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadDeliverySheetPDF, printDeliverySheet } from '@/utils/deliverySheetUtils';

interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface DeliveryChallanData {
  id: string;
  challanNumber: string;
  date: string;
  vehicleId: string;
  vehicleName: string;
  salesmanId: string;
  salesmanName: string;
  customerIds: string[];
  customerNames: string[];
  items: ChallanItem[];
  totalQuantity: number;
  totalAmount: number;
  notes: string;
  status: 'draft' | 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveredAt?: string;
}

export default function DeliveryChallan() {
  const { vehicles, salesmen, products, orders, customers } = useData();
  const [challans, setChallans] = useState<DeliveryChallanData[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [challanItems, setChallanItems] = useState<ChallanItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallanData | null>(null);
  const [challanNumber, setChallanNumber] = useState('');
  const [editingItem, setEditingItem] = useState<ChallanItem | null>(null);

  // Generate unique challan number
  const generateChallanNumber = () => {
    const dateStr = format(new Date(), 'yyyyMMdd');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CH${dateStr}${randomNum}`;
  };

  // Auto-populate items based on selected vehicle, date, and customers
  const autoPopulateItems = () => {
    if (!selectedVehicle || !selectedDate) {
      toast.warning('Please select vehicle and date first');
      return;
    }

    // Find orders for the selected date, vehicle, and customers
    const relevantOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      const matchesDate = orderDate.toDateString() === selectedDate.toDateString();
      const matchesVehicle = !selectedVehicle || order.vehicleId === selectedVehicle;
      const matchesCustomer = selectedCustomers.length === 0 || selectedCustomers.includes(order.customerId);
      
      return matchesDate && matchesVehicle && matchesCustomer;
    });

    if (relevantOrders.length === 0) {
      toast.info('No orders found for selected criteria');
      return;
    }

    // Aggregate products from all relevant orders
    const productMap = new Map<string, ChallanItem>();
    
    relevantOrders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const key = item.productId;
          if (productMap.has(key)) {
            const existing = productMap.get(key)!;
            existing.quantity += item.quantity;
            existing.amount = existing.quantity * existing.rate;
          } else {
            productMap.set(key, {
              id: `item-${Date.now()}-${item.productId}`,
              productId: item.productId,
              productName: product.name,
              quantity: item.quantity,
              unit: product.unit || 'pcs',
              rate: item.rate || product.price || 0,
              amount: item.quantity * (item.rate || product.price || 0)
            });
          }
        }
      });
    });

    setChallanItems(Array.from(productMap.values()));
    toast.success(`Populated ${productMap.size} items from ${relevantOrders.length} orders`);
  };

  // Add manual item
  const addManualItem = () => {
    if (!editingItem?.productId || editingItem.quantity <= 0) {
      toast.error('Please select product and enter valid quantity');
      return;
    }

    const product = products.find(p => p.id === editingItem.productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    const newItem: ChallanItem = {
      id: `item-${Date.now()}`,
      productId: editingItem.productId,
      productName: product.name,
      quantity: editingItem.quantity,
      unit: product.unit || 'pcs',
      rate: editingItem.rate || product.price || 0,
      amount: editingItem.quantity * (editingItem.rate || product.price || 0)
    };

    setChallanItems(prev => [...prev, newItem]);
    setEditingItem(null);
    toast.success('Item added successfully');
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setChallanItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed');
  };

  // Calculate totals
  const totalQuantity = challanItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = challanItems.reduce((sum, item) => sum + item.amount, 0);

  // Create challan
  const handleCreateChallan = () => {
    if (!selectedVehicle || !selectedSalesman || challanItems.length === 0) {
      toast.error('Please fill all required fields and add items');
      return;
    }

    const challan: DeliveryChallanData = {
      id: `ch-${Date.now()}`,
      challanNumber: challanNumber || generateChallanNumber(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle,
      vehicleName: vehicles.find(v => v.id === selectedVehicle)?.name || '',
      salesmanId: selectedSalesman,
      salesmanName: salesmen.find(s => s.id === selectedSalesman)?.name || '',
      customerIds: selectedCustomers,
      customerNames: selectedCustomers.map(id => customers.find(c => c.id === id)?.name || 'Unknown'),
      items: challanItems,
      totalQuantity,
      totalAmount,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setChallans(prev => [...prev, challan]);
    
    // Reset form
    setSelectedVehicle('');
    setSelectedSalesman('');
    setSelectedCustomers([]);
    setChallanItems([]);
    setNotes('');
    setChallanNumber('');
    setShowCreateDialog(false);
    
    toast.success('Delivery Challan created successfully');
  };

  // Update challan status
  const updateChallanStatus = (challanId: string, newStatus: DeliveryChallanData['status']) => {
    setChallans(prev => prev.map(challan => {
      if (challan.id === challanId) {
        const updatedChallan = { ...challan, status: newStatus };
        if (newStatus === 'delivered') {
          updatedChallan.deliveredAt = new Date().toISOString();
        }
        return updatedChallan;
      }
      return challan;
    }));
    toast.success(`Challan status updated to ${newStatus}`);
  };

  // Print challan
  const handlePrint = (challan: DeliveryChallanData) => {
    try {
      const printData = {
        date: format(new Date(challan.date), 'dd/MM/yyyy'),
        area: challan.vehicleName,
        items: challan.items.map(item => ({
          customerName: item.productName,
          GGH: item.productName === 'GGH' ? item.quantity : 0,
          GGH450: item.productName === 'GGH450' ? item.quantity : 0,
          GTSF: item.productName === 'GTSF' ? item.quantity : 0,
          GSD1KG: item.productName === 'GSD1KG' ? item.quantity : 0,
          GPC: item.productName === 'GPC' ? item.quantity : 0,
          FL: item.productName === 'F&L' ? item.quantity : 0,
          totalQty: item.quantity,
          amount: item.amount
        })),
        totals: {
          GGH: challan.items.filter(i => i.productName === 'GGH').reduce((sum, i) => sum + i.quantity, 0),
          GGH450: challan.items.filter(i => i.productName === 'GGH450').reduce((sum, i) => sum + i.quantity, 0),
          GTSF: challan.items.filter(i => i.productName === 'GTSF').reduce((sum, i) => sum + i.quantity, 0),
          GSD1KG: challan.items.filter(i => i.productName === 'GSD1KG').reduce((sum, i) => sum + i.quantity, 0),
          GPC: challan.items.filter(i => i.productName === 'GPC').reduce((sum, i) => sum + i.quantity, 0),
          FL: challan.items.filter(i => i.productName === 'F&L').reduce((sum, i) => sum + i.quantity, 0),
          totalQty: challan.totalQuantity,
          amount: challan.totalAmount
        }
      };
      
      printDeliverySheet(printData);
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to print challan');
    }
  };

  // Export to PDF
  const handleExportPdf = (challan: DeliveryChallanData) => {
    try {
      const pdfData = {
        date: format(new Date(challan.date), 'dd/MM/yyyy'),
        area: challan.vehicleName,
        items: challan.items.map(item => ({
          customerName: item.productName,
          GGH: item.productName === 'GGH' ? item.quantity : 0,
          GGH450: item.productName === 'GGH450' ? item.quantity : 0,
          GTSF: item.productName === 'GTSF' ? item.quantity : 0,
          GSD1KG: item.productName === 'GSD1KG' ? item.quantity : 0,
          GPC: item.productName === 'GPC' ? item.quantity : 0,
          FL: item.productName === 'F&L' ? item.quantity : 0,
          totalQty: item.quantity,
          amount: item.amount
        })),
        totals: {
          GGH: challan.items.filter(i => i.productName === 'GGH').reduce((sum, i) => sum + i.quantity, 0),
          GGH450: challan.items.filter(i => i.productName === 'GGH450').reduce((sum, i) => sum + i.quantity, 0),
          GTSF: challan.items.filter(i => i.productName === 'GTSF').reduce((sum, i) => sum + i.quantity, 0),
          GSD1KG: challan.items.filter(i => i.productName === 'GSD1KG').reduce((sum, i) => sum + i.quantity, 0),
          GPC: challan.items.filter(i => i.productName === 'GPC').reduce((sum, i) => sum + i.quantity, 0),
          FL: challan.items.filter(i => i.productName === 'F&L').reduce((sum, i) => sum + i.quantity, 0),
          totalQty: challan.totalQuantity,
          amount: challan.totalAmount
        }
      };
      
      downloadDeliverySheetPDF(pdfData);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getStatusColor = (status: DeliveryChallanData['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Enhanced Delivery Challan
          </h1>
          <p className="text-muted-foreground">
            Create and manage delivery challans with advanced features
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="aurora-button">
                <Plus className="mr-2 h-4 w-4" />
                Create Challan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Delivery Challan</DialogTitle>
                <DialogDescription>
                  Generate a new delivery challan with auto-populated items
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="challan-number">Challan Number</Label>
                    <Input
                      id="challan-number"
                      value={challanNumber}
                      onChange={(e) => setChallanNumber(e.target.value)}
                      placeholder={generateChallanNumber()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <DatePicker
                      date={selectedDate}
                      setDate={setSelectedDate}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(vehicle => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              {vehicle.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salesman</Label>
                    <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select salesman" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesmen.map(salesman => (
                          <SelectItem key={salesman.id} value={salesman.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {salesman.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label>Select Customers (Optional - leave empty for all)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                    {customers.map(customer => (
                      <div key={customer.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleCustomerSelection(customer.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{customer.name} - {customer.area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={autoPopulateItems}
                  variant="outline"
                  className="w-full border-primary/20 text-primary hover:bg-primary/10"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Auto-Populate Items
                </Button>

                {/* Manual Item Addition */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Add Manual Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select 
                      value={editingItem?.productId || ''} 
                      onValueChange={(value) => setEditingItem(prev => ({ ...prev!, productId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={editingItem?.quantity || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev!, quantity: parseInt(e.target.value) || 0 }))}
                    />
                    
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={editingItem?.rate || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev!, rate: parseFloat(e.target.value) || 0 }))}
                    />
                    
                    <Button onClick={addManualItem} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {challanItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Challan Items ({challanItems.length})</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challanItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                            <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                            <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="flex justify-between items-center text-lg font-semibold border-t pt-4">
                      <span>Total Quantity: {totalQuantity}</span>
                      <span className="text-gradient-aurora">
                        Total Amount: ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateChallan}
                  className="aurora-button"
                  disabled={!selectedVehicle || !selectedSalesman || challanItems.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Create Challan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Challans List */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-aurora">
            <FileText className="h-5 w-5" />
            Delivery Challans
          </CardTitle>
          <CardDescription>
            View and manage all delivery challans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No challans created</h3>
              <p className="text-muted-foreground">
                Create your first delivery challan to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challan No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans.map((challan) => (
                  <TableRow key={challan.id}>
                    <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                    <TableCell>{format(new Date(challan.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{challan.vehicleName}</TableCell>
                    <TableCell>{challan.salesmanName}</TableCell>
                    <TableCell>{challan.items.length}</TableCell>
                    <TableCell>₹{challan.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(challan.status)}>
                        {challan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedChallan(challan);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(challan)}
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportPdf(challan)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        {challan.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateChallanStatus(challan.id, 'in-transit')}
                          >
                            Start
                          </Button>
                        )}
                        {challan.status === 'in-transit' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateChallanStatus(challan.id, 'delivered')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Challan Dialog */}
      {selectedChallan && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Challan Details - {selectedChallan.challanNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date:</Label>
                  <p>{format(new Date(selectedChallan.date), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <Label>Vehicle:</Label>
                  <p>{selectedChallan.vehicleName}</p>
                </div>
                <div>
                  <Label>Salesman:</Label>
                  <p>{selectedChallan.salesmanName}</p>
                </div>
                <div>
                  <Label>Status:</Label>
                  <Badge className={getStatusColor(selectedChallan.status)}>
                    {selectedChallan.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Items:</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedChallan.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                        <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {selectedChallan.notes && (
                <div>
                  <Label>Notes:</Label>
                  <p>{selectedChallan.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button onClick={() => handlePrint(selectedChallan)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
