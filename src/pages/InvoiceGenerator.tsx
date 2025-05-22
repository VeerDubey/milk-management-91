import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Check, PlusCircle, Save, Trash, FileText, 
  Download, Copy, LayoutTemplate, Eye, X, Settings 
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { INVOICE_TEMPLATES, generateInvoiceNumber, generateInvoicePreview, createInvoiceFromFormData } from "@/utils/invoiceUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function InvoiceGenerator() {
  const { customers, products, orders, addOrder } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedItems, setSelectedItems] = useState([{ productId: "", quantity: 1, rate: 0, amount: 0 }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(new Date(new Date().setDate(new Date().getDate() + 15)), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Company profile form
  const { register, watch } = useForm({
    defaultValues: {
      companyName: "Milk Center",
      address: "123 Dairy Lane, Milk City",
      contactNumber: "+91 9876543210",
      email: "info@milkcenter.com",
      gstNumber: "29ABCDE1234F1Z5",
      bankDetails: "Bank Name: ABC Bank\nAccount Number: 1234567890\nIFSC Code: ABCD0001234",
    }
  });

  const companyFormValues = watch();

  // Generate random invoice number on load
  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  // Calculate total amount whenever selected items change
  useEffect(() => {
    let subtotal = selectedItems.reduce((sum, item) => sum + item.amount, 0);
    // Apply discount if any
    const discountAmount = (subtotal * discount) / 100;
    subtotal -= discountAmount;
    
    // Apply tax if any
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setTotalAmount(total);
  }, [selectedItems, discount, taxRate]);

  // Handle product selection
  const handleProductChange = (index: number, productId: string) => {
    const newItems = [...selectedItems];
    const product = products.find(p => p.id === productId);
    const quantity = newItems[index].quantity;
    
    if (product) {
      newItems[index] = {
        productId,
        quantity,
        rate: product.price || 0,
        amount: quantity * (product.price || 0)
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        productId,
        rate: 0,
        amount: 0
      };
    }
    
    setSelectedItems(newItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...selectedItems];
    const productId = newItems[index].productId;
    const product = products.find(p => p.id === productId);
    
    newItems[index] = {
      productId,
      quantity,
      rate: product?.price || newItems[index].rate,
      amount: quantity * (product?.price || newItems[index].rate)
    };
    
    setSelectedItems(newItems);
  };

  // Handle rate change
  const handleRateChange = (index: number, rate: number) => {
    const newItems = [...selectedItems];
    newItems[index] = {
      ...newItems[index],
      rate,
      amount: newItems[index].quantity * rate
    };
    
    setSelectedItems(newItems);
  };

  // Add new item row
  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (selectedItems.length > 1) {
      const newItems = [...selectedItems];
      newItems.splice(index, 1);
      setSelectedItems(newItems);
    } else {
      toast.error("Invoice must have at least one item");
    }
  };
  
  // Update customer address when customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setCustomerAddress(customer.address);
      }
    } else {
      setCustomerAddress("");
    }
  }, [selectedCustomerId, customers]);

  // Show preview of the invoice
  const handleShowPreview = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (selectedItems.some(item => !item.productId)) {
      toast.error("Please select products for all items");
      return;
    }
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    
    if (!customer) {
      toast.error("Customer not found");
      return;
    }
    
    const invoiceData = {
      id: invoiceNumber,
      customerName: customer.name,
      date: invoiceDate,
      items: selectedItems,
      totalAmount: totalAmount,
      notes: notes,
      terms: terms,
      status: "Draft"
    };
    
    try {
      // Generate the PDF preview - this returns a jsPDF object
      const pdfDoc = generateInvoicePreview(
        invoiceData, 
        companyFormValues, 
        products,
        selectedTemplate
      );
      
      // Convert to data URI for iframe display
      const dataUri = pdfDoc.output('datauristring');
      setPreviewUrl(dataUri);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    }
  };

  // Generate and save invoice
  const generateInvoice = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (selectedItems.some(item => !item.productId)) {
      toast.error("Please select products for all items");
      return;
    }

    setIsGenerating(true);
    
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
      
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      // Create invoice object
      const invoiceData = {
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        customerId: selectedCustomerId,
        customerName: customer.name,
        items: selectedItems,
        notes: notes,
        terms: terms
      };
      
      // Create new invoice
      const newInvoice = createInvoiceFromFormData(invoiceData);
      
      // In a real app, you would save the invoice to the database here
      // For now, we'll just simulate by creating a new order
      const newOrder = {
        id: newInvoice.orderId,
        date: invoiceDate,
        customerName: customer.name,
        items: newInvoice.items,
        totalAmount: totalAmount
      };
      
      // Add the new order to the data context
      addOrder(newOrder as any);
      
      toast.success("Invoice generated successfully!");
      
      // Reset form after successful generation
      setSelectedItems([{ productId: "", quantity: 1, rate: 0, amount: 0 }]);
      setSelectedCustomerId("");
      setInvoiceNumber(generateInvoiceNumber());
      setNotes("");
      setTerms("");
      setDiscount(0);
      setTaxRate(0);
      
    } catch (error) {
      toast.error("Failed to generate invoice: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice Generator</h1>
        <p className="text-muted-foreground">
          Create professional invoices for your customers
        </p>
      </div>
      
      <Tabs defaultValue="invoice-details">
        <TabsList>
          <TabsTrigger value="invoice-details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoice Details
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Template Selection
          </TabsTrigger>
          <TabsTrigger value="company-profile" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoice-details" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Information</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input 
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input 
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCustomerId && (
                  <div>
                    <Label htmlFor="customer-address">Customer Address</Label>
                    <Textarea 
                      id="customer-address"
                      value={customerAddress}
                      readOnly
                      className="h-[80px] bg-muted/50"
                    />
                  </div>
                )}
              </div>
              
              {showAdvancedOptions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input 
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax">Tax Rate (%)</Label>
                    <Input 
                      id="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Switch id="auto-calculate" defaultChecked />
                      <Label htmlFor="auto-calculate">Auto-calculate tax</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-tax" defaultChecked />
                      <Label htmlFor="include-tax">Show tax separately on invoice</Label>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Switch id="round-amounts" defaultChecked />
                      <Label htmlFor="round-amounts">Round amounts to nearest rupee</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-qr" defaultChecked />
                      <Label htmlFor="include-qr">Include payment QR code</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right w-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={value => handleProductChange(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                            className="text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={e => handleRateChange(index, parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            disabled={selectedItems.length === 1}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {showAdvancedOptions && (
                      <>
                        {discount > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Discount ({discount}%):</TableCell>
                            <TableCell className="text-right font-medium">
                              -₹{(selectedItems.reduce((sum, item) => sum + item.amount, 0) * discount / 100).toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}
                        
                        {taxRate > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Tax ({taxRate}%):</TableCell>
                            <TableCell className="text-right font-medium">
                              +₹{(selectedItems.reduce((sum, item) => sum + item.amount, 0) * (1 - discount / 100) * taxRate / 100).toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                    
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Total:</TableCell>
                      <TableCell className="text-right font-bold">₹{totalAmount.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional notes for the customer"
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  placeholder="Payment terms and conditions"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={handleShowPreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  onClick={generateInvoice} 
                  disabled={isGenerating}
                >
                  {isGenerating ? 
                    "Generating..." : 
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Invoice
                    </>
                  }
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INVOICE_TEMPLATES.map(template => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{template.name}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="bg-primary rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">Template Preview</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#16A34A", "#3F3F46"].map(color => (
                      <div 
                        key={color}
                        className={`h-8 rounded-md cursor-pointer border-2 ${color === "#8B5CF6" ? 'border-primary' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Background Style</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {["None", "Gradient", "Pattern"].map(style => (
                      <div 
                        key={style}
                        className={`h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${style === "None" ? 'border-primary bg-muted' : 'border-transparent bg-muted/50'}`}
                      >
                        {style}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company-profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" {...register("companyName")} />
                </div>
                <div>
                  <Label htmlFor="gst-number">GST Number</Label>
                  <Input id="gst-number" {...register("gstNumber")} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <Input id="contact-number" {...register("contactNumber")} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...register("email")} type="email" />
                </div>
              </div>
              <div>
                <Label htmlFor="bank-details">Bank Details</Label>
                <Textarea 
                  id="bank-details" 
                  {...register("bankDetails")} 
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="mt-4">
                <Label>Company Logo</Label>
                <div className="mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-muted/50 rounded-md flex items-center justify-center">
                    <span className="text-muted-foreground">No logo uploaded</span>
                  </div>
                  <Button className="mt-4" variant="outline">Upload Logo</Button>
                  <p className="text-xs text-muted-foreground mt-2">Recommended size: 200x200px, PNG or JPG</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Invoice Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Default Template</h3>
                      <p className="text-sm text-muted-foreground">Last modified: {format(new Date(), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Invoice Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Invoice Preview</span>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="w-full aspect-[1/1.414] bg-white">
            {previewUrl ? (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0" 
                title="Invoice Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                Loading preview...
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={generateInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
