
import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { FileDown, FileText, Plus, History } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SupplierProductRate, Supplier, Product } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Form schema for adding/editing a supplier rate
const rateFormSchema = z.object({
  supplierId: z.string().min(1, { message: "Please select a supplier" }),
  productId: z.string().min(1, { message: "Please select a product" }),
  rate: z.coerce.number().min(0, { message: "Rate must be a positive number" }),
  effectiveDate: z.date(),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RateFormValues = z.infer<typeof rateFormSchema>;

// Form schema for adding a supplier
const supplierFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  category: z.string().min(1, { message: "Category is required" }),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const SupplierRates = () => {
  const { 
    suppliers, 
    products, 
    supplierProductRates, 
    addSupplierProductRate, 
    updateSupplierProductRate,
    deleteSupplierProductRate,
    getSupplierProductRates,
    getSupplierRateHistory,
    addSupplier,
    uiSettings
  } = useData();
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [showRateHistory, setShowRateHistory] = useState(false);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [currentRateId, setCurrentRateId] = useState<string | null>(null);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  
  // Forms
  const rateForm = useForm<RateFormValues>({
    resolver: zodResolver(rateFormSchema),
    defaultValues: {
      supplierId: "",
      productId: "",
      rate: 0,
      effectiveDate: new Date(),
      remarks: "",
      isActive: true,
    },
  });
  
  const supplierForm = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      email: "",
      category: "Dairy",
    },
  });
  
  // Filtered supplier rates
  const filteredRates = useMemo(() => {
    if (!selectedSupplierId) return [];
    return getSupplierProductRates(selectedSupplierId);
  }, [selectedSupplierId, supplierProductRates, getSupplierProductRates]);
  
  // Rate history for a specific product and supplier
  const rateHistory = useMemo(() => {
    if (!selectedSupplierId || !selectedProductId) return [];
    return getSupplierRateHistory(selectedSupplierId, selectedProductId);
  }, [selectedSupplierId, selectedProductId, getSupplierRateHistory]);
  
  // Handler for adding a new rate
  const handleAddRate = (data: RateFormValues) => {
    addSupplierProductRate({
      supplierId: data.supplierId,
      productId: data.productId,
      rate: data.rate,
      effectiveDate: format(data.effectiveDate, "yyyy-MM-dd"),
      remarks: data.remarks || "",
      isActive: data.isActive,
    });
    
    toast.success("Supplier rate added successfully");
    setIsAddingRate(false);
    rateForm.reset();
  };
  
  // Handler for editing a rate
  const handleEditRate = (data: RateFormValues) => {
    if (!currentRateId) return;
    
    updateSupplierProductRate(currentRateId, {
      rate: data.rate,
      effectiveDate: format(data.effectiveDate, "yyyy-MM-dd"),
      remarks: data.remarks,
      isActive: data.isActive,
    });
    
    toast.success("Supplier rate updated successfully");
    setIsEditingRate(false);
    setCurrentRateId(null);
    rateForm.reset();
  };
  
  // Set up form for editing
  const editRate = (rate: SupplierProductRate) => {
    setCurrentRateId(rate.id);
    rateForm.reset({
      supplierId: rate.supplierId,
      productId: rate.productId,
      rate: rate.rate,
      effectiveDate: new Date(rate.effectiveDate),
      remarks: rate.remarks || "",
      isActive: rate.isActive,
    });
    setIsEditingRate(true);
  };
  
  // Handle adding a new supplier
  const handleAddSupplier = (data: SupplierFormValues) => {
    addSupplier({
      name: data.name,
      phone: data.phone,
      address: data.address,
      email: data.email || undefined,
      category: data.category,
      outstandingBalance: 0,
    });
    
    toast.success("Supplier added successfully");
    setIsAddingSupplier(false);
    supplierForm.reset();
  };
  
  // Export rate history as PDF
  const exportRateHistoryPDF = () => {
    if (!selectedSupplierId || !selectedProductId || rateHistory.length === 0) {
      toast.error("No rate history to export");
      return;
    }
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const product = products.find(p => p.id === selectedProductId);
    
    if (!supplier || !product) {
      toast.error("Supplier or product not found");
      return;
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // Teal color
    doc.text("Supplier Rate History", 14, 22);
    
    // Add supplier and product info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Supplier: ${supplier.name}`, 14, 32);
    doc.text(`Product: ${product.name}`, 14, 40);
    doc.text(`Generated on: ${format(new Date(), "dd MMM yyyy")}`, 14, 48);
    
    // Table data
    const tableColumn = ["Date", "Rate (₹)", "Remarks", "Status"];
    const tableRows = rateHistory.map(rate => [
      format(new Date(rate.effectiveDate), "dd MMM yyyy"),
      rate.rate.toString(),
      rate.remarks || "-",
      rate.isActive ? "Active" : "Inactive"
    ]);
    
    // Generate the PDF table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      theme: 'grid'
    });
    
    // Save the PDF
    doc.save(`rate-history-${supplier.name}-${product.name}.pdf`);
    toast.success("PDF exported successfully");
  };
  
  // Export all rates for a supplier as CSV
  const exportRatesCSV = () => {
    if (!selectedSupplierId || filteredRates.length === 0) {
      toast.error("No rates to export");
      return;
    }
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    
    if (!supplier) {
      toast.error("Supplier not found");
      return;
    }
    
    // Generate CSV content
    let csvContent = "Product,Rate (₹),Effective Date,Remarks,Status\n";
    
    filteredRates.forEach(rate => {
      const product = products.find(p => p.id === rate.productId);
      csvContent += `"${product?.name || 'Unknown'}"`;
      csvContent += `,${rate.rate}`;
      csvContent += `,${format(new Date(rate.effectiveDate), "dd/MM/yyyy")}`;
      csvContent += `,"${rate.remarks || ''}"`;
      csvContent += `,${rate.isActive ? 'Active' : 'Inactive'}\n`;
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `supplier-rates-${supplier.name}.csv`);
    link.click();
  };
  
  // Get theme-based style classes
  const getCardClass = () => {
    return uiSettings.theme === "dark" 
      ? "bg-gradient-to-br from-teal-900/90 to-teal-800/90 text-white" 
      : "bg-gradient-to-br from-teal-100 to-emerald-100";
  };
  
  const getTabsClass = () => {
    return uiSettings.theme === "dark"
      ? "bg-teal-800/50 text-white"
      : "bg-teal-600/20";
  };
  
  const getTableHeaderClass = () => {
    return uiSettings.theme === "dark"
      ? "bg-teal-800/50"
      : "bg-teal-600/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Rate Management</h1>
          <p className="text-muted-foreground">
            Manage product rates for each supplier
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter the details of the new supplier. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...supplierForm}>
                <form onSubmit={supplierForm.handleSubmit(handleAddSupplier)} className="space-y-4 py-4">
                  <FormField
                    control={supplierForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={supplierForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={supplierForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={supplierForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={supplierForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dairy">Dairy</SelectItem>
                            <SelectItem value="Transport">Transport</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save Supplier</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            onClick={exportRatesCSV}
            disabled={!selectedSupplierId || filteredRates.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Supplier selection sidebar */}
        <Card className={`md:col-span-4 ${getCardClass()} border-0 shadow-lg rounded-xl`}>
          <CardHeader>
            <CardTitle>Select Supplier</CardTitle>
            <CardDescription className="text-inherit/70">
              Choose a supplier to view and manage rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger id="supplier" className="w-full">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSupplierId && (
              <div className="space-y-4">
                <div className="border-t border-teal-300/20 pt-4">
                  <h3 className="font-medium mb-2">Supplier Details</h3>
                  
                  {(() => {
                    const supplier = suppliers.find(s => s.id === selectedSupplierId);
                    if (!supplier) return null;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-inherit/70">Name:</span> {supplier.name}</p>
                        <p><span className="text-inherit/70">Phone:</span> {supplier.phone}</p>
                        <p><span className="text-inherit/70">Category:</span> {supplier.category}</p>
                        <p><span className="text-inherit/70">Address:</span> {supplier.address}</p>
                        {supplier.email && (
                          <p><span className="text-inherit/70">Email:</span> {supplier.email}</p>
                        )}
                        <p>
                          <span className="text-inherit/70">Outstanding:</span> ₹
                          {supplier.outstandingBalance?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                
                <Dialog open={isAddingRate} onOpenChange={setIsAddingRate}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Rate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Product Rate</DialogTitle>
                      <DialogDescription>
                        Set pricing for a product from this supplier.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...rateForm}>
                      <form onSubmit={rateForm.handleSubmit(handleAddRate)} className="space-y-4 py-4">
                        <FormField
                          control={rateForm.control}
                          name="supplierId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Supplier</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={selectedSupplierId}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a supplier" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {suppliers.map(supplier => (
                                    <SelectItem key={supplier.id} value={supplier.id}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                          defaultValue={selectedSupplierId}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} ({product.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the rate per unit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="effectiveDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Effective Date</FormLabel>
                              <DatePicker
                                date={field.value}
                                setDate={(date) => field.onChange(date)}
                              />
                              <FormDescription>
                                The date from which this rate is applicable
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="remarks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remarks (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Summer Rate, Festive Offer" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Active
                                </FormLabel>
                                <FormDescription>
                                  Enable if this rate is currently applicable
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                            Save Rate
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isEditingRate} onOpenChange={setIsEditingRate}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Product Rate</DialogTitle>
                      <DialogDescription>
                        Update the pricing information for this product.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...rateForm}>
                      <form onSubmit={rateForm.handleSubmit(handleEditRate)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Supplier</Label>
                            <p className="text-sm mt-1">
                              {suppliers.find(s => s.id === rateForm.getValues().supplierId)?.name}
                            </p>
                          </div>
                          
                          <div>
                            <Label>Product</Label>
                            <p className="text-sm mt-1">
                              {products.find(p => p.id === rateForm.getValues().productId)?.name}
                            </p>
                          </div>
                        </div>
                        
                        <FormField
                          control={rateForm.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="effectiveDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Effective Date</FormLabel>
                              <DatePicker
                                date={field.value}
                                setDate={(date) => field.onChange(date)}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="remarks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remarks (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={rateForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Active
                                </FormLabel>
                                <FormDescription>
                                  Enable if this rate is currently applicable
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                            Update Rate
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Rates display area */}
        <div className="md:col-span-8">
          {selectedSupplierId ? (
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle>Product Rates</CardTitle>
                <CardDescription>
                  Manage prices for products supplied by {suppliers.find(s => s.id === selectedSupplierId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className={`w-full ${getTabsClass()}`}>
                    <TabsTrigger value="current" className="flex-1">Current Rates</TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">Rate History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="pt-4">
                    {filteredRates.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg">
                        <Table>
                          <TableHeader className={getTableHeaderClass()}>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Rate (₹)</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Effective From</TableHead>
                              <TableHead>Remarks</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRates.map(rate => {
                              const product = products.find(p => p.id === rate.productId);
                              return (
                                <TableRow key={rate.id}>
                                  <TableCell className="font-medium">{product?.name}</TableCell>
                                  <TableCell>₹{rate.rate}</TableCell>
                                  <TableCell>{product?.unit}</TableCell>
                                  <TableCell>{format(new Date(rate.effectiveDate), "dd MMM yyyy")}</TableCell>
                                  <TableCell>{rate.remarks || "-"}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={rate.isActive ? "default" : "secondary"}
                                      className={rate.isActive ? "bg-teal-600" : "bg-gray-400"}
                                    >
                                      {rate.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedProductId(rate.productId);
                                          setShowRateHistory(true);
                                        }}
                                      >
                                        <History className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => editRate(rate)}
                                        className="bg-teal-600 hover:bg-teal-700 text-white"
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">
                          No product rates defined for this supplier yet
                        </p>
                        <Button
                          onClick={() => setIsAddingRate(true)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Rate
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="history" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 max-w-md">
                          <Label htmlFor="product-history">Select Product</Label>
                          <Select
                            value={selectedProductId}
                            onValueChange={setSelectedProductId}
                          >
                            <SelectTrigger id="product-history">
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedProductId && rateHistory.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={exportRateHistoryPDF}
                            className="bg-teal-700 text-white hover:bg-teal-800 hover:text-white"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Export PDF
                          </Button>
                        )}
                      </div>
                      
                      {selectedProductId ? (
                        rateHistory.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg">
                            <Table>
                              <TableCaption>
                                Rate history for {products.find(p => p.id === selectedProductId)?.name}
                              </TableCaption>
                              <TableHeader className={getTableHeaderClass()}>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Rate (₹)</TableHead>
                                  <TableHead>Remarks</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rateHistory.map(rate => (
                                  <TableRow key={rate.id}>
                                    <TableCell>
                                      {format(new Date(rate.effectiveDate), "dd MMM yyyy")}
                                    </TableCell>
                                    <TableCell className="font-medium">₹{rate.rate}</TableCell>
                                    <TableCell>{rate.remarks || "-"}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={rate.isActive ? "default" : "secondary"}
                                        className={rate.isActive ? "bg-teal-600" : "bg-gray-400"}
                                      >
                                        {rate.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-muted-foreground">
                              No rate history found for this product
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">
                            Select a product to view its rate history
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md rounded-xl">
              <CardContent className="pt-6">
                <div className="text-center py-10">
                  <h3 className="text-xl font-medium mb-2">Select a Supplier</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a supplier from the list to view and manage their product rates
                  </p>
                  <div className="max-w-xs mx-auto">
                    <Select
                      value={selectedSupplierId}
                      onValueChange={setSelectedSupplierId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {suppliers.length === 0 && (
                    <div className="mt-6">
                      <p className="text-muted-foreground mb-4">No suppliers found</p>
                      <Button 
                        onClick={() => setIsAddingSupplier(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Supplier
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierRates;
