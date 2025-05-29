
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ChallanItem {
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
  items: ChallanItem[];
  totalQuantity: number;
  totalAmount: number;
  notes: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
}

export default function DeliveryChallan() {
  const { vehicles, salesmen, products, orders, customers } = useData();
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [challanItems, setChallanItems] = useState<ChallanItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [challanNumber, setChallanNumber] = useState('');

  // Generate unique challan number
  const generateChallanNumber = () => {
    const dateStr = format(new Date(), 'yyyyMMdd');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CH${dateStr}${randomNum}`;
  };

  // Auto-populate items based on selected vehicle and date
  const autoPopulateItems = () => {
    if (!selectedVehicle || !selectedDate) {
      toast.warning('Please select vehicle and date first');
      return;
    }

    // Find orders for the selected date and vehicle
    const relevantOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.toDateString() === selectedDate.toDateString() &&
             order.vehicleId === selectedVehicle;
    });

    if (relevantOrders.length === 0) {
      toast.info('No orders found for selected vehicle and date');
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
      items: challanItems,
      totalQuantity,
      totalAmount,
      notes,
      status: 'pending'
    };

    // In a real app, this would be saved to the backend
    console.log('Created Delivery Challan:', challan);
    toast.success('Delivery Challan created successfully');
    
    // Reset form
    setSelectedVehicle('');
    setSelectedSalesman('');
    setChallanItems([]);
    setNotes('');
    setChallanNumber('');
    setShowCreateDialog(false);
  };

  // Print challan
  const handlePrint = () => {
    if (challanItems.length === 0) {
      toast.warning('No items to print');
      return;
    }
    
    window.print();
    toast.success('Print dialog opened');
  };

  // Export to PDF
  const handleExportPdf = () => {
    if (challanItems.length === 0) {
      toast.warning('No items to export');
      return;
    }
    
    toast.success('PDF export functionality will be implemented');
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Delivery Challan
          </h1>
          <p className="text-muted-foreground">
            Create delivery challans for vehicles with product summaries
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="border-secondary/20 text-secondary hover:bg-secondary/10"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleExportPdf}
            variant="outline"
            className="border-accent/20 text-accent hover:bg-accent/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="aurora-button">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Challan</DialogTitle>
                <DialogDescription>
                  Generate a new delivery challan number
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="challan-number">Challan Number</Label>
                  <Input
                    id="challan-number"
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (!challanNumber) {
                    setChallanNumber(generateChallanNumber());
                  }
                  setShowCreateDialog(false);
                  toast.success('Ready to create challan');
                }}>
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challan Details */}
        <Card className="lg:col-span-1 aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <FileText className="h-5 w-5" />
              Challan Details
            </CardTitle>
            <CardDescription>
              Configure delivery challan parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Challan Number</Label>
              <Input
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

            <Button 
              onClick={autoPopulateItems}
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/10"
            >
              <Package className="mr-2 h-4 w-4" />
              Auto-Populate Items
            </Button>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            <Button 
              onClick={handleCreateChallan}
              className="w-full aurora-button"
              disabled={!selectedVehicle || !selectedSalesman || challanItems.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Challan
            </Button>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="lg:col-span-2 aurora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gradient-aurora">
              <Package className="h-5 w-5" />
              Challan Items
            </CardTitle>
            <CardDescription>
              Products to be delivered with this challan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challanItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No items added</h3>
                <p className="text-muted-foreground">
                  Use "Auto-Populate Items" to add products from orders
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challanItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <div className="flex items-center gap-4">
                      <span>Total Quantity: {totalQuantity}</span>
                      <span>Items: {challanItems.length}</span>
                    </div>
                    <span className="text-gradient-aurora">
                      Total Amount: ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
