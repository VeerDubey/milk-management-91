
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useData } from "@/contexts/data/DataContext";
import { useInvoices } from "@/contexts/InvoiceContext";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { createInvoiceFromFormData, generateInvoiceNumber, formatDateForInput, generateDueDate } from "@/utils/invoiceUtils";
import { Download, Eye, Plus, Save, Trash, X } from "lucide-react";
import { toast } from "sonner";

// Define schema for invoice form
const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(3, { message: "Invoice number is required" }),
  invoiceDate: z.string().min(1, { message: "Invoice date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  customerId: z.string().min(1, { message: "Customer is required" }),
  customerName: z.string().min(1, { message: "Customer name is required" }),
  notes: z.string().optional(),
  terms: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, { message: "Product is required" }),
      quantity: z.coerce.number().min(0.01, { message: "Quantity is required" }),
      rate: z.coerce.number().min(0.01, { message: "Rate is required" }),
      amount: z.coerce.number().min(0),
    })
  ).min(1, { message: "At least one item is required" }),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { customers, products, addInvoice } = useData();
  const { downloadInvoice, companyInfo, generateInvoicePreview } = useInvoices();
  const today = new Date();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  
  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: formatDateForInput(today),
      dueDate: generateDueDate(formatDateForInput(today), 15),
      customerId: "",
      customerName: "",
      notes: "Thank you for your business.",
      terms: "Payment due within 15 days of invoice date.",
      taxRate: 5,
      discountPercentage: 0,
      items: [
        {
          productId: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    },
  });
  
  // Setup watchers for form values
  const watchCustomerId = form.watch("customerId");
  const watchItems = form.watch("items");
  
  // Update customer name when customer ID changes
  useEffect(() => {
    if (watchCustomerId) {
      const customer = customers.find(c => c.id === watchCustomerId);
      if (customer) {
        form.setValue("customerName", customer.name);
      }
    }
  }, [watchCustomerId, customers, form]);
  
  // Calculate item amounts when quantity or rate changes
  useEffect(() => {
    const updatedItems = watchItems.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    
    form.setValue("items", updatedItems);
  }, [watchItems, form]);
  
  // Calculate subtotal of all items
  const subtotal = watchItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate discount amount
  const discountPercentage = form.watch("discountPercentage") || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;
  
  // Calculate tax amount
  const taxRate = form.watch("taxRate") || 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  
  // Calculate total
  const total = afterDiscount + taxAmount;

  // Handle adding a new item row
  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      {
        productId: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  // Handle removing an item row
  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      const updatedItems = currentItems.filter((_, i) => i !== index);
      form.setValue("items", updatedItems);
    } else {
      toast.error("Invoice must have at least one item");
    }
  };
  
  // Handle product selection change
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentItems = form.getValues("items");
      const updatedItem = {
        ...currentItems[index],
        productId,
        rate: product.price,
        amount: currentItems[index].quantity * product.price
      };
      
      const updatedItems = [...currentItems];
      updatedItems[index] = updatedItem;
      
      form.setValue("items", updatedItems);
    }
  };
  
  // Generate invoice preview
  const generatePreview = () => {
    try {
      const invoiceData = form.getValues();
      const invoice = createInvoiceFromFormData(invoiceData);
      const url = generateInvoicePreview(invoice);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate invoice preview");
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      // Create invoice object
      const invoice = createInvoiceFromFormData(data);
      
      // Add to invoices
      addInvoice(invoice);
      
      toast.success("Invoice created successfully");
      navigate("/invoice-history");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Generate a new invoice for your customer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generatePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="items">Line Items</TabsTrigger>
          <TabsTrigger value="options">Additional Options</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                  <CardDescription>
                    Enter the basic details for this invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <Input placeholder="INV-0001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Apply a percentage discount to this invoice
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Apply a tax percentage to this invoice
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>
                    Add the items included in this invoice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Rate (₹)</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.getValues().items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => handleProductChange(value, index)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {form.formState.errors.items?.[index]?.productId && (
                              <p className="text-sm font-medium text-destructive">
                                Product is required
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const currentItems = form.getValues().items;
                                currentItems[index].quantity = value;
                                currentItems[index].amount = value * currentItems[index].rate;
                                form.setValue("items", [...currentItems]);
                              }}
                              className="w-[100px] text-right"
                            />
                            {form.formState.errors.items?.[index]?.quantity && (
                              <p className="text-sm font-medium text-destructive">
                                Required
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const currentItems = form.getValues().items;
                                currentItems[index].rate = value;
                                currentItems[index].amount = value * currentItems[index].quantity;
                                form.setValue("items", [...currentItems]);
                              }}
                              className="w-[100px] text-right"
                            />
                            {form.formState.errors.items?.[index]?.rate && (
                              <p className="text-sm font-medium text-destructive">
                                Required
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={addItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                  
                  <div className="mt-8 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Discount ({discountPercentage}%)</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Tax ({taxRate}%)</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="options">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>
                    Add notes, terms, and other details to your invoice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any notes for this invoice"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          These notes will appear on the invoice
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your terms and conditions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Terms and conditions for this invoice
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>

      {showPreview && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
              <DialogDescription>
                Preview of how your invoice will look
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-[3/4] w-full border rounded overflow-auto">
              <iframe 
                src={previewUrl} 
                className="w-full h-full" 
                title="Invoice Preview"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
              <Button onClick={() => form.handleSubmit(onSubmit)()}>
                <Save className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
