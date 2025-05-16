
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Download, Plus, Save, Trash, Eye } from 'lucide-react';
import InvoiceTemplatePreview from '@/components/invoices/InvoiceTemplatePreview';
import { OrderItem } from '@/types';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { customers, products } = useData();
  const { 
    createInvoice, 
    generateInvoiceNumber, 
    generateInvoicePreview,
    downloadInvoice
  } = useInvoice();
  
  // Initialize invoice data
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 15)), 'yyyy-MM-dd'),
    customerId: '',
    items: [{ id: '1', productId: '', productName: '', quantity: 1, unitPrice: 0, unit: '', price: 0 }],
    notes: '',
    terms: 'Payment due within 30 days',
    discountPercentage: 0,
    taxRate: 0,
    subtotal: 0,
    totalAmount: 0
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('customer');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Generate invoice number on component mount
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber()
    }));
  }, [generateInvoiceNumber]);
  
  // Calculate subtotal whenever items change
  useEffect(() => {
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    
    // Apply discount
    const afterDiscount = subtotal * (1 - (invoiceData.discountPercentage / 100));
    
    // Apply tax
    const totalWithTax = afterDiscount * (1 + (invoiceData.taxRate / 100));
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      totalAmount: totalWithTax
    }));
  }, [invoiceData.items, invoiceData.discountPercentage, invoiceData.taxRate]);
  
  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setInvoiceData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || ''
    }));
  };
  
  // Handle product selection
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedItems = [...invoiceData.items];
    const quantity = updatedItems[index].quantity || 1;
    const price = product.price * quantity;
    
    updatedItems[index] = {
      id: updatedItems[index].id,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      unit: product.unit,
      price
    };
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...invoiceData.items];
    const unitPrice = updatedItems[index].unitPrice;
    
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      price: unitPrice * quantity
    };
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // Add new item row
  const addItemRow = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: `${prev.items.length + 1}`, productId: '', productName: '', quantity: 1, unitPrice: 0, unit: '', price: 0 }
      ]
    }));
  };
  
  // Remove item row
  const removeItemRow = (index: number) => {
    if (invoiceData.items.length <= 1) {
      toast.error("Invoice must have at least one item");
      return;
    }
    
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // Preview invoice
  const handlePreview = () => {
    if (!invoiceData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (invoiceData.items.some(item => !item.productId)) {
      toast.error("Please select products for all items");
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === invoiceData.customerId);
      if (!customer) throw new Error("Customer not found");
      
      const previewData = {
        ...invoiceData,
        id: invoiceData.invoiceNumber,
        customerName: customer.name,
        status: "draft" as const
      };
      
      const url = generateInvoicePreview(previewData);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (error) {
      toast.error("Failed to generate preview");
      console.error(error);
    }
  };
  
  // Create and save invoice
  const handleSave = () => {
    if (!invoiceData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (invoiceData.items.some(item => !item.productId)) {
      toast.error("Please select products for all items");
      return;
    }
    
    try {
      const customer = customers.find(c => c.id === invoiceData.customerId);
      if (!customer) throw new Error("Customer not found");
      
      const newInvoice = {
        id: invoiceData.invoiceNumber,
        customerId: invoiceData.customerId,
        customerName: customer.name,
        date: invoiceData.date,
        items: invoiceData.items as OrderItem[],
        subtotal: invoiceData.subtotal,
        totalAmount: invoiceData.totalAmount,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        status: "draft" as const,
        discountPercentage: invoiceData.discountPercentage,
        taxRate: invoiceData.taxRate,
        invoiceNumber: invoiceData.invoiceNumber
      };
      
      createInvoice(newInvoice);
      toast.success("Invoice created successfully!");
      navigate("/invoices");
    } catch (error) {
      toast.error("Failed to create invoice");
      console.error(error);
    }
  };
  
  // Navigate through tabs
  const nextTab = () => {
    if (activeTab === 'customer') setActiveTab('items');
    else if (activeTab === 'items') setActiveTab('details');
    else if (activeTab === 'details') setActiveTab('template');
  };
  
  const prevTab = () => {
    if (activeTab === 'template') setActiveTab('details');
    else if (activeTab === 'details') setActiveTab('items');
    else if (activeTab === 'items') setActiveTab('customer');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold tracking-tight ml-2">
            Create New Invoice
          </h1>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>New Invoice #{invoiceData.invoiceNumber}</CardTitle>
          <CardDescription>
            Fill in the details to create a new invoice
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={invoiceData.customerId}
                    onValueChange={handleCustomerChange}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {invoiceData.customerId && (
                  <div className="space-y-2">
                    <Label>Customer Address</Label>
                    <div className="p-4 bg-muted/30 rounded-md text-muted-foreground">
                      {customers.find(c => c.id === invoiceData.customerId)?.address || 'No address available'}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invoiceDate"
                        type="date"
                        className="pl-9"
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="date"
                        className="pl-9"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button onClick={nextTab}>
                  Next: Items
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button size="sm" onClick={addItemRow}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-center font-medium w-24">Quantity</th>
                        <th className="py-3 px-4 text-center font-medium w-32">Unit Price</th>
                        <th className="py-3 px-4 text-center font-medium w-24">Unit</th>
                        <th className="py-3 px-4 text-right font-medium w-32">Price</th>
                        <th className="py-3 px-4 text-right font-medium w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">
                            <Select
                              value={item.productId}
                              onValueChange={(value) => handleProductChange(index, value)}
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
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="text-center"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.unitPrice ? `₹${item.unitPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.unit || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {item.price ? `₹${item.price.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItemRow(index)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="discountPercentage">Discount (%)</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      className="w-32 text-right"
                      value={invoiceData.discountPercentage}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        discountPercentage: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      className="w-32 text-right"
                      value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        taxRate: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-lg pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">₹{invoiceData.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevTab}>
                  Previous
                </Button>
                <Button onClick={nextTab}>
                  Next: Details
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Any additional notes for the customer"
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    rows={3}
                    placeholder="Payment terms and conditions"
                    value={invoiceData.terms}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevTab}>
                  Previous
                </Button>
                <Button onClick={nextTab}>
                  Next: Template
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Invoice Template</h3>
                <InvoiceTemplatePreview />
                
                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-medium">Company Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Your company information will be displayed on the invoice.
                    You can update your company details in the settings.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevTab}>
                  Previous
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handlePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              This is a preview of how your invoice will look.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] bg-muted/30 rounded-md overflow-auto">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
