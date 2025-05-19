import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  Plus, 
  Save, 
  UserPlus, 
  Edit, 
  Trash2, 
  PackagePlus,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Order, OrderItem, Customer, Product } from "@/types";
import { exportToPdf } from "@/utils/pdfUtils";
import { exportToExcel } from "@/utils/excelUtils";

interface OrderGridCell {
  customerId: string;
  productId: string;
  quantity: string; // Using string for input, will convert to number when saving
}

const OrderEntry = () => {
  const { 
    customers, 
    products, 
    addOrder, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductRateForCustomer
  } = useData();
  
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [orderGrid, setOrderGrid] = useState<OrderGridCell[]>([]);
  const [customerTotals, setCustomerTotals] = useState<Record<string, { quantity: number, amount: number }>>({});
  
  // Customer form state
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  // Product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productUnit, setProductUnit] = useState("L");
  const [productDescription, setProductDescription] = useState("");
  
  // Initialize the grid with empty cells for each customer/product combination
  useEffect(() => {
    const initialGrid: OrderGridCell[] = [];
    
    customers.forEach(customer => {
      products.forEach(product => {
        initialGrid.push({
          customerId: customer.id,
          productId: product.id,
          quantity: ""
        });
      });
    });
    
    setOrderGrid(initialGrid);
  }, [customers, products]);
  
  // Calculate totals when orderGrid changes
  useEffect(() => {
    const newCustomerTotals: Record<string, { quantity: number, amount: number }> = {};
    
    orderGrid.forEach(cell => {
      if (cell.quantity && !isNaN(Number(cell.quantity))) {
        const quantity = Number(cell.quantity);
        // Use customer-specific rate instead of default product price
        const rate = getProductRateForCustomer(cell.customerId, cell.productId);
        
        // Add to customer totals
        if (!newCustomerTotals[cell.customerId]) {
          newCustomerTotals[cell.customerId] = { quantity: 0, amount: 0 };
        }
        
        newCustomerTotals[cell.customerId].quantity += quantity;
        newCustomerTotals[cell.customerId].amount += quantity * rate;
      }
    });
    
    setCustomerTotals(newCustomerTotals);
  }, [orderGrid, products, getProductRateForCustomer]);
  
  const handleCellChange = (customerId: string, productId: string, value: string) => {
    // Only allow numbers
    if (value !== "" && !/^\d+(\.\d{0,2})?$/.test(value)) {
      return;
    }
    
    setOrderGrid(prevGrid => 
      prevGrid.map(cell => 
        cell.customerId === customerId && cell.productId === productId
          ? { ...cell, quantity: value }
          : cell
      )
    );
  };
  
  const getCellValue = (customerId: string, productId: string): string => {
    const cell = orderGrid.find(
      cell => cell.customerId === customerId && cell.productId === productId
    );
    return cell ? cell.quantity : "";
  };
  
  const getProductRateForDisplay = (customerId: string, productId: string): number => {
    return getProductRateForCustomer(customerId, productId);
  };
  
  const saveOrder = () => {
    // Filter out empty cells
    const filledCells = orderGrid
      .filter(cell => cell.quantity && !isNaN(Number(cell.quantity)) && Number(cell.quantity) > 0);
    
    if (filledCells.length === 0) {
      toast.error("No order items to save");
      return;
    }
    
    // Get the first customer for this order (we'll use the first one as the main customer)
    const firstCell = filledCells[0];
    const mainCustomer = customers.find(c => c.id === firstCell.customerId);
    
    if (!mainCustomer) {
      toast.error("Customer not found");
      return;
    }
    
    // Create order items
    const orderItems: OrderItem[] = filledCells.map(cell => {
      const product = products.find(p => p.id === cell.productId);
      const rate = getProductRateForDisplay(cell.customerId, cell.productId);
      
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: cell.productId,
        productName: product?.name || "Unknown Product",
        quantity: Number(cell.quantity),
        unitPrice: rate,
        unit: product?.unit || "unit",
        customerId: cell.customerId
      };
    });
    
    // Calculate total
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const newOrder: Omit<Order, "id"> = {
      customerId: mainCustomer.id,
      customerName: mainCustomer.name,
      date: format(orderDate, "yyyy-MM-dd"),
      items: orderItems,
      total: totalAmount,
      vehicleId: selectedVehicle || '0', // Use a default or placeholder
      salesmanId: selectedSalesman || '0', // Use a default or placeholder
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
    };
    
    addOrder(newOrder);
    toast.success("Order saved successfully");
    
    // Clear the grid after saving
    setOrderGrid(prevGrid => 
      prevGrid.map(cell => ({ ...cell, quantity: "" }))
    );
  };
  
  const exportToCSV = () => {
    // Generate CSV content
    let csvContent = "Product,";
    customers.forEach(customer => {
      csvContent += `${customer.name},`;
    });
    csvContent += "Total Quantity,Total Amount\n";
    
    products.forEach(product => {
      csvContent += `${product.name},`;
      
      let productTotal = 0;
      customers.forEach(customer => {
        const cellValue = getCellValue(customer.id, product.id);
        csvContent += `${cellValue || "0"},`;
        productTotal += cellValue ? Number(cellValue) : 0;
      });
      
      csvContent += `${productTotal},\n`;
    });
    
    // Calculate grand totals
    const grandTotalQuantity = Object.values(customerTotals).reduce(
      (sum, customer) => sum + customer.quantity, 0
    );
    
    const grandTotalAmount = Object.values(customerTotals).reduce(
      (sum, customer) => sum + customer.amount, 0
    );
    
    csvContent += `Total,,${grandTotalQuantity},${grandTotalAmount}\n`;
    
    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `milk-order-${format(orderDate, "yyyy-MM-dd")}.csv`);
    link.click();
  };
  
  const exportOrderToPdf = () => {
    // Prepare headers
    const headers = ["Customer", "Product", "Quantity", "Rate (₹)", "Amount (₹)"];
    
    // Prepare data rows
    const data: any[][] = [];
    
    // Add each order line with customer info
    orderGrid
      .filter(cell => cell.quantity && !isNaN(Number(cell.quantity)) && Number(cell.quantity) > 0)
      .forEach(cell => {
        const customer = customers.find(c => c.id === cell.customerId);
        const product = products.find(p => p.id === cell.productId);
        const quantity = Number(cell.quantity);
        const rate = getProductRateForDisplay(cell.customerId, cell.productId);
        const amount = quantity * rate;
        
        if (customer && product) {
          data.push([
            customer.name,
            product.name,
            quantity.toString(),
            rate.toFixed(2),
            amount.toFixed(2)
          ]);
        }
      });
    
    // Export to PDF
    exportToPdf(
      headers,
      data,
      {
        title: "Daily Milk Order",
        subtitle: `Order Date: ${format(orderDate, "dd/MM/yyyy")}`,
        dateInfo: `Generated on: ${format(new Date(), "dd/MM/yyyy")}`,
        filename: `milk-order-${format(orderDate, "yyyy-MM-dd")}.pdf`,
        landscape: true
      }
    );
    
    toast.success("Order exported to PDF");
  };
  
  const exportOrderToExcel = () => {
    // Prepare headers
    const headers = ["Customer", "Product", "Quantity", "Rate (₹)", "Amount (₹)"];
    
    // Prepare data rows
    const data: any[][] = [];
    
    // Add each order line with customer info
    orderGrid
      .filter(cell => cell.quantity && !isNaN(Number(cell.quantity)) && Number(cell.quantity) > 0)
      .forEach(cell => {
        const customer = customers.find(c => c.id === cell.customerId);
        const product = products.find(p => p.id === cell.productId);
        const quantity = Number(cell.quantity);
        const rate = getProductRateForDisplay(cell.customerId, cell.productId);
        const amount = quantity * rate;
        
        if (customer && product) {
          data.push([
            customer.name,
            product.name,
            quantity.toString(),
            rate.toFixed(2),
            amount.toFixed(2)
          ]);
        }
      });
    
    // Export to Excel
    exportToExcel(
      headers,
      data,
      `milk-order-${format(orderDate, "yyyy-MM-dd")}.xlsx`
    );
    
    toast.success("Order exported to Excel");
  };

  // Customer CRUD operations
  const handleAddCustomer = () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    const newCustomer = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      outstandingBalance: 0,
      isActive: true,
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, newCustomer);
      toast.success("Customer updated successfully");
    } else {
      addCustomer(newCustomer);
      toast.success("Customer added successfully");
    }

    // Reset form
    resetCustomerForm();
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setIsAddingCustomer(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm("Are you sure you want to delete this customer? This cannot be undone.")) {
      deleteCustomer(customerId);
      toast.success("Customer deleted successfully");
    }
  };

  const resetCustomerForm = () => {
    setIsAddingCustomer(false);
    setEditingCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  // Product CRUD operations
  const handleAddProduct = () => {
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!productPrice.trim() || isNaN(Number(productPrice))) {
      toast.error("Product price must be a valid number");
      return;
    }

    const newProduct = {
      name: productName.trim(),
      price: Number(productPrice),
      description: productDescription.trim() || productCategory.trim(),
      unit: productUnit.trim() || "L",
      category: productCategory.trim() || "Other",
      sku: `${productName.trim().substring(0, 4).toUpperCase()}-${Date.now().toString().substring(9)}`
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, newProduct);
      toast.success("Product updated successfully");
    } else {
      addProduct(newProduct);
      toast.success("Product added successfully");
    }

    // Reset form
    resetProductForm();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductCategory(product.category || "");
    setProductUnit(product.unit || "L");
    setProductDescription(product.description || "");
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      deleteProduct(productId);
      toast.success("Product deleted successfully");
    }
  };

  const resetProductForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductCategory("");
    setProductUnit("L");
    setProductDescription("");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Entry</h1>
          <p className="text-muted-foreground">
            Create and manage daily milk orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportOrderToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportOrderToPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button onClick={saveOrder}>
            <Save className="mr-2 h-4 w-4" />
            Save Order
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daily Milk Order Entry</CardTitle>
            <div className="flex items-center gap-2">
              <DatePicker date={orderDate} setDate={setOrderDate} />
              
              {/* Add Customer Dialog */}
              <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCustomer ? "Edit Customer" : "Add New Customer"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCustomer 
                        ? "Update customer details below"
                        : "Add customer details to create a new customer."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input 
                        id="name" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Contact Number</Label>
                      <Input 
                        id="phone" 
                        value={customerPhone} 
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Delivery Area</Label>
                      <Input 
                        id="address" 
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Enter delivery area"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={resetCustomerForm}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button onClick={handleAddCustomer}>
                      {editingCustomer ? "Update Customer" : "Add Customer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Add Product Dialog */}
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct 
                        ? "Update product details below"
                        : "Add product details to create a new product."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input 
                        id="productName" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="productPrice">Unit Price (₹) *</Label>
                      <Input 
                        id="productPrice" 
                        value={productPrice} 
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="Enter product price"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="productCategory">Category</Label>
                      <Input 
                        id="productCategory" 
                        value={productCategory} 
                        onChange={(e) => setProductCategory(e.target.value)}
                        placeholder="e.g., Amul, Warna, Gokul"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="productUnit">Unit</Label>
                      <Input 
                        id="productUnit" 
                        value={productUnit} 
                        onChange={(e) => setProductUnit(e.target.value)}
                        placeholder="e.g., L, ml, kg"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="productDescription">Description (Optional)</Label>
                      <Textarea 
                        id="productDescription" 
                        value={productDescription} 
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={resetProductForm}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button onClick={handleAddProduct}>
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {customers.length === 0 || products.length === 0 ? (
              <div className="p-4 text-center">
                <p className="mb-2">You need to add customers and products first.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setIsAddingCustomer(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Customers
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingProduct(true)}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Add Products
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Customers management section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Customers</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {customers.map(customer => (
                      <div key={customer.id} className="flex items-center rounded-md bg-gray-100 px-3 py-2">
                        <span className="mr-2">{customer.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full text-destructive"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Products management section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center rounded-md bg-gray-100 px-3 py-2">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">₹{product.price}/{product.unit}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order entry table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="header-cell">Products</TableHead>
                      {customers.map(customer => (
                        <TableHead key={customer.id} className="header-cell text-center whitespace-nowrap">
                          {customer.name}
                          <div className="text-xs text-muted-foreground">
                            (₹{getProductRateForDisplay(customer.id, products[0]?.id)}/{products[0]?.unit || 'unit'})
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name} (₹{product.price}/{product.unit})
                        </TableCell>
                        {customers.map(customer => {
                          const customerRate = getProductRateForDisplay(customer.id, product.id);
                          const isCustomRate = customerRate !== product.price;
                          
                          return (
                            <TableCell key={customer.id} className="table-cell p-0">
                              <div className="relative">
                                <Input
                                  className={`cell-input ${isCustomRate ? 'border-primary' : ''}`}
                                  type="text"
                                  value={getCellValue(customer.id, product.id)}
                                  onChange={(e) => handleCellChange(customer.id, product.id, e.target.value)}
                                />
                                {isCustomRate && (
                                  <div className="absolute -bottom-4 left-0 right-0 text-xs text-center text-primary">
                                    Rate: ₹{customerRate}/{product.unit}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="total-cell font-semibold">Total Quantity</TableCell>
                      {customers.map(customer => (
                        <TableCell key={customer.id} className="total-cell text-center">
                          {customerTotals[customer.id]?.quantity || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="amount-cell font-semibold">Total Amount (₹)</TableCell>
                      {customers.map(customer => (
                        <TableCell key={customer.id} className="amount-cell text-center">
                          {customerTotals[customer.id]?.amount.toFixed(2) || '0.00'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderEntry;
