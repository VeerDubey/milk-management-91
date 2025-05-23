
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Pencil, Trash2, ArrowUpDown, Download, FilterX
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ElectronService } from '@/services/ElectronService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function SupplierRates() {
  const { toast } = useToast();
  const { 
    suppliers, products,
    supplierProductRates, addSupplierProductRate, updateSupplierProductRate, deleteSupplierProductRate 
  } = useData();
  
  // State for filters and sorting
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<string>('productName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for rate dialog
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [rateFormData, setRateFormData] = useState({
    id: '',
    supplierId: '',
    productId: '',
    rate: 0,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    isActive: true,
    notes: ''
  });
  
  // Get unique product categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [products]);
  
  // Get product rates for selected supplier
  const supplierRates = useMemo(() => {
    if (!selectedSupplierId) return [];
    
    const rates = supplierProductRates.filter(
      rate => rate.supplierId === selectedSupplierId
    );
    
    // Enrich with product data
    return rates.map(rate => {
      const product = products.find(p => p.id === rate.productId);
      return {
        ...rate,
        productName: product?.name || 'Unknown Product',
        productCategory: product?.category || 'Unknown Category',
        productInfo: product
      };
    });
  }, [selectedSupplierId, supplierProductRates, products]);
  
  // Apply search and category filters
  const filteredRates = useMemo(() => {
    let filtered = supplierRates;
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(rate => 
        rate.productName.toLowerCase().includes(search) ||
        rate.productCategory.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(rate => 
        rate.productCategory === categoryFilter
      );
    }
    
    return filtered;
  }, [supplierRates, searchTerm, categoryFilter]);
  
  // Sort rates
  const sortedRates = useMemo(() => {
    return [...filteredRates].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortColumn) {
        case 'productName':
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
          break;
        case 'productCategory':
          valueA = a.productCategory.toLowerCase();
          valueB = b.productCategory.toLowerCase();
          break;
        case 'rate':
          valueA = a.rate;
          valueB = b.rate;
          break;
        case 'effectiveDate':
          valueA = new Date(a.effectiveDate).getTime();
          valueB = new Date(b.effectiveDate).getTime();
          break;
        default:
          valueA = a.productName.toLowerCase();
          valueB = b.productName.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [filteredRates, sortColumn, sortDirection]);
  
  // Get products that don't have rates for the selected supplier
  const productsWithoutRates = useMemo(() => {
    if (!selectedSupplierId) return [];
    
    const productIdsWithRates = new Set(
      supplierRates.map(rate => rate.productId)
    );
    
    let availableProducts = products.filter(
      product => !productIdsWithRates.has(product.id)
    );
    
    // Apply category filter for consistency
    if (categoryFilter !== 'all') {
      availableProducts = availableProducts.filter(
        product => product.category === categoryFilter
      );
    }
    
    return availableProducts;
  }, [selectedSupplierId, supplierRates, products, categoryFilter]);
  
  // Selected supplier
  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId);
  }, [suppliers, selectedSupplierId]);
  
  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Function to open dialog for adding new rate
  const openAddRateDialog = () => {
    setRateFormData({
      id: '',
      supplierId: selectedSupplierId,
      productId: '',
      rate: 0,
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      notes: ''
    });
    setIsRateDialogOpen(true);
  };
  
  // Function to open dialog for editing rate
  const openEditRateDialog = (rate: any) => {
    setRateFormData({
      id: rate.id,
      supplierId: rate.supplierId,
      productId: rate.productId,
      rate: rate.rate,
      effectiveDate: rate.effectiveDate,
      isActive: rate.isActive,
      notes: rate.notes || ''
    });
    setIsRateDialogOpen(true);
  };
  
  // Function to handle form changes
  const handleRateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setRateFormData({
      ...rateFormData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'rate' 
        ? parseFloat(value) || 0 
        : value
    });
  };
  
  // Function to handle form submission
  const handleRateFormSubmit = () => {
    if (!rateFormData.supplierId || !rateFormData.productId) {
      toast({
        title: "Validation Error",
        description: "Supplier and product are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (rateFormData.id) {
        // Update existing rate
        updateSupplierProductRate(rateFormData.id, rateFormData);
        toast({
          title: "Rate Updated",
          description: "Supplier product rate has been updated successfully"
        });
      } else {
        // Add new rate
        const product = products.find(p => p.id === rateFormData.productId);
        addSupplierProductRate(rateFormData);
        toast({
          title: "Rate Added",
          description: `Rate for ${product?.name || 'product'} has been added successfully`
        });
      }
      
      setIsRateDialogOpen(false);
    } catch (error) {
      console.error("Error saving rate:", error);
      toast({
        title: "Error",
        description: "Failed to save supplier product rate",
        variant: "destructive"
      });
    }
  };
  
  // Function to confirm delete
  const confirmDelete = (rateId: string) => {
    setSelectedRateId(rateId);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to handle delete
  const handleDeleteRate = () => {
    if (!selectedRateId) return;
    
    try {
      deleteSupplierProductRate(selectedRateId);
      toast({
        title: "Rate Deleted",
        description: "Supplier product rate has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
      setSelectedRateId(null);
    } catch (error) {
      console.error("Error deleting rate:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier product rate",
        variant: "destructive"
      });
    }
  };
  
  // Function to export rates
  const exportRates = async () => {
    if (!selectedSupplier) {
      toast({
        title: "Export Failed",
        description: "Please select a supplier to export rates",
        variant: "destructive"
      });
      return;
    }
    
    const headers = [
      'Product Name', 'Category', 'Rate', 'Effective Date', 'Status', 'Notes'
    ];
    
    const rows = sortedRates.map(rate => [
      rate.productName,
      rate.productCategory,
      rate.rate.toFixed(2),
      rate.effectiveDate,
      rate.isActive ? 'Active' : 'Inactive',
      rate.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    try {
      await ElectronService.exportData(csvData, `supplier-rates-${selectedSupplier.name}-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "Rates Exported",
        description: "Supplier rates have been exported successfully"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the rates",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Rates</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Supplier selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Supplier Selection</CardTitle>
            <CardDescription>Select a supplier to view and manage their product rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium mb-1">Supplier</label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">Category Filter</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rates management */}
        {selectedSupplier && (
          <Card>
            <CardHeader>
              <CardTitle>Product Rates for {selectedSupplier.name}</CardTitle>
              <CardDescription>Manage purchase rates for products from this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="w-full pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1"
                      onClick={() => setSearchTerm('')}
                    >
                      <FilterX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportRates}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Rates
                  </Button>
                  <Button onClick={openAddRateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rate
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('productName')}
                      >
                        Product
                        {sortColumn === 'productName' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('productCategory')}
                      >
                        Category
                        {sortColumn === 'productCategory' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort('rate')}
                      >
                        Rate (₹)
                        {sortColumn === 'rate' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('effectiveDate')}
                      >
                        Effective Date
                        {sortColumn === 'effectiveDate' && (
                          <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No rates found for the selected supplier and filters.
                          {productsWithoutRates.length > 0 && (
                            <div className="mt-2">
                              <Button variant="outline" onClick={openAddRateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product Rate
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell>{rate.productName}</TableCell>
                          <TableCell>{rate.productCategory}</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{rate.rate.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(rate.effectiveDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditRateDialog(rate)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(rate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-muted-foreground">
                  {sortedRates.length} rates • {productsWithoutRates.length} products without rates
                </span>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Rate dialog */}
      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{rateFormData.id ? 'Edit Product Rate' : 'Add Product Rate'}</DialogTitle>
            <DialogDescription>
              {rateFormData.id ? 'Update the product rate for this supplier.' : 'Set a new product rate for this supplier.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!rateFormData.id && (
              <div>
                <Label htmlFor="productId">Product</Label>
                <Select
                  value={rateFormData.productId}
                  onValueChange={(value) => setRateFormData({...rateFormData, productId: value})}
                >
                  <SelectTrigger id="productId">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsWithoutRates.map((product) => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="rate">Rate (₹)</Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                value={rateFormData.rate}
                onChange={handleRateFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={rateFormData.effectiveDate}
                onChange={handleRateFormChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={rateFormData.isActive}
                onChange={(e) => setRateFormData({...rateFormData, isActive: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={rateFormData.notes}
                onChange={handleRateFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRateFormSubmit}>
              {rateFormData.id ? 'Update Rate' : 'Add Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this supplier rate.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRate} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
