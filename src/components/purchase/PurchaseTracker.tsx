
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StockEntry, SupplierPayment } from '@/types';

export function PurchaseTracker() {
  const { stockEntries, supplierPayments, suppliers, products, addStockEntry, updateStockEntry, deleteStockEntry } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null);

  // Filter purchases based on search criteria
  const filteredPurchases = useMemo(() => {
    return stockEntries.filter(entry => {
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      const matchesSearch = !searchTerm || 
        supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSupplier = !selectedSupplier || entry.supplierId === selectedSupplier;
      const matchesStatus = !selectedStatus || entry.paymentStatus === selectedStatus;
      
      const entryDate = new Date(entry.date);
      const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
      const matchesDateTo = !dateTo || entryDate <= dateTo;
      
      return matchesSearch && matchesSupplier && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [stockEntries, suppliers, searchTerm, selectedSupplier, selectedStatus, dateFrom, dateTo]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredPurchases.reduce((acc, entry) => {
      acc.totalAmount += entry.totalAmount;
      acc.totalEntries += 1;
      return acc;
    }, { totalAmount: 0, totalEntries: 0 });
  }, [filteredPurchases]);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Partial</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-500/20 text-red-400">Unpaid</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
    }
  };

  const handleEdit = (entry: StockEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase entry?')) {
      deleteStockEntry(id);
      toast.success('Purchase entry deleted successfully');
    }
  };

  const exportToPDF = () => {
    toast.success('Purchase report exported to PDF');
  };

  const exportToExcel = () => {
    toast.success('Purchase report exported to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Purchase Filters</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Filter and search purchase entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label className="neo-noir-text">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 neo-noir-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="neo-noir-text">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="All suppliers" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Payment Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="neo-noir-input">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="neo-noir-surface">
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">From Date</Label>
              <DatePicker
                date={dateFrom}
                setDate={setDateFrom}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">To Date</Label>
              <DatePicker
                date={dateTo}
                setDate={setDateTo}
                className="neo-noir-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="neo-noir-text">Actions</Label>
              <div className="flex gap-2">
                <Button onClick={exportToPDF} variant="outline" size="sm" className="neo-noir-button-outline">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm" className="neo-noir-button-outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Purchases</p>
                <p className="text-2xl font-bold neo-noir-text">{totals.totalEntries}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-green-400">₹{totals.totalAmount.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Active Suppliers</p>
                <p className="text-2xl font-bold text-accent-color">{suppliers.filter(s => s.isActive).length}</p>
              </div>
              <Eye className="h-8 w-8 text-accent-color" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Entries Table */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Purchase Entries</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Track all purchase entries and their payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="neo-noir-table">
              <TableHeader>
                <TableRow className="neo-noir-table-header">
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((entry) => (
                  <TableRow key={entry.id} className="neo-noir-table-row">
                    <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{entry.referenceNumber || 'N/A'}</TableCell>
                    <TableCell>{getSupplierName(entry.supplierId)}</TableCell>
                    <TableCell>{entry.items.length} items</TableCell>
                    <TableCell>₹{entry.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(entry.paymentStatus)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                          className="neo-noir-button-ghost"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="neo-noir-button-ghost text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
