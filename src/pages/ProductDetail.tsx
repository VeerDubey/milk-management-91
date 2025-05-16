
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  BarChart3,
  ArrowUpDown,
  Grid3x3,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, orders, updateProduct, deleteProduct } = useData();
  
  const [product, setProduct] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setName(foundProduct.name || '');
        setDescription(foundProduct.description || '');
        setPrice(foundProduct.price?.toString() || '');
        setCostPrice(foundProduct.costPrice?.toString() || '');
        setUnit(foundProduct.unit || '');
        setCategory(foundProduct.category || '');
        setStock(foundProduct.stock?.toString() || '');
        setSku(foundProduct.sku || '');
        setStatus(foundProduct.isActive ? 'active' : 'inactive');
      } else {
        toast.error('Product not found');
        navigate('/product-list');
      }
    }
  }, [id, products, navigate]);
  
  // Get product sales data from orders
  const productSales = React.useMemo(() => {
    if (!product) return [];
    
    const sales = orders.filter(order => 
      order.items && order.items.some(item => item.productId === product.id)
    ).map(order => {
      const item = order.items.find(item => item.productId === product.id);
      return {
        orderId: order.id,
        date: order.date,
        quantity: item?.quantity || 0,
        unitPrice: item?.unitPrice || 0,
        total: (item?.quantity || 0) * (item?.unitPrice || 0),
        customerName: order.customerName || 'Unknown'
      };
    });
    
    // Sort by date (most recent first)
    return sales.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [product, orders]);
  
  // Calculate total sales
  const totalSales = React.useMemo(() => {
    return productSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [productSales]);
  
  // Calculate total quantity sold
  const totalQuantitySold = React.useMemo(() => {
    return productSales.reduce((sum, sale) => sum + sale.quantity, 0);
  }, [productSales]);
  
  const handleSave = () => {
    setIsLoading(true);
    
    // Validate required fields
    if (!name || !price || !unit) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    try {
      const updatedProduct = {
        ...product,
        name,
        description,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        unit,
        category,
        stock: stock ? parseInt(stock) : 0,
        sku,
        isActive: status === 'active'
      };
      
      updateProduct(id!, updatedProduct);
      setProduct(updatedProduct);
      setIsEditing(false);
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        deleteProduct(id!);
        toast.success('Product deleted successfully');
        navigate('/product-list');
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };
  
  if (!product) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/product-list')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" />
              {isEditing ? 'Edit Product' : product.name}
            </h1>
            <p className="text-muted-foreground">
              View and manage product details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="default"
                className="flex items-center gap-2"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid gap-6">
              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>
                    Basic product details and properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter product name"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          {product.name || 'N/A'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU / Product Code</Label>
                      {isEditing ? (
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Enter product SKU"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          {product.sku || 'N/A'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      {isEditing ? (
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Enter category"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          {product.category || 'General'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      {isEditing ? (
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter product description"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/20 min-h-[80px]">
                        {product.description || 'No description provided'}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Selling Price (₹)</Label>
                      {isEditing ? (
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          ₹{product.price?.toFixed(2) || '0.00'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price (₹)</Label>
                      {isEditing ? (
                        <Input
                          id="costPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          ₹{product.costPrice?.toFixed(2) || '0.00'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profit">Profit Margin</Label>
                      <div className="p-2 border rounded-md bg-muted/20">
                        {product.price && product.costPrice && product.costPrice > 0
                          ? `${(((product.price - product.costPrice) / product.costPrice) * 100).toFixed(2)}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      {isEditing ? (
                        <Input
                          id="unit"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="e.g., kg, liter, piece"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          {product.unit || 'N/A'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stock">Current Stock</Label>
                      {isEditing ? (
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="0"
                        />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/20">
                          {product.stock?.toString() || '0'} {product.unit}s
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              {/* Product Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">Product ID</div>
                    <div className="font-mono text-sm bg-muted/20 p-2 rounded-md overflow-auto">
                      {product.id}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-muted-foreground text-sm">Created</div>
                      <div className="font-medium">
                        {product.createdAt
                          ? format(new Date(product.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-sm">Last Updated</div>
                      <div className="font-medium">
                        {product.updatedAt
                          ? format(new Date(product.updatedAt), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">Sales Statistics</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/20 p-3 rounded-md">
                        <div className="text-muted-foreground text-xs">Quantity Sold</div>
                        <div className="font-medium text-lg">{totalQuantitySold}</div>
                      </div>
                      <div className="bg-muted/20 p-3 rounded-md">
                        <div className="text-muted-foreground text-xs">Revenue</div>
                        <div className="font-medium text-lg">₹{totalSales.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">Stock Status</div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          product.stock > 10
                            ? "bg-green-500"
                            : product.stock > 0
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        {product.stock > 10
                          ? "In Stock"
                          : product.stock > 0
                          ? "Low Stock"
                          : "Out of Stock"}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 flex flex-col items-start gap-2">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Sales Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Sales History</span>
                <div className="text-sm font-normal text-muted-foreground">
                  Total Sales: ₹{totalSales.toFixed(2)}
                </div>
              </CardTitle>
              <CardDescription>
                Recent sales history and transactions for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productSales.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/10">
                  <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Sales Data</h3>
                  <p className="text-sm text-muted-foreground">
                    This product has not been sold yet.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productSales.map((sale) => (
                        <TableRow key={`${sale.orderId}-${product.id}`}>
                          <TableCell>
                            {format(new Date(sale.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/invoice-detail/${sale.orderId}`}
                              className="text-primary underline hover:text-primary/80"
                            >
                              {sale.orderId}
                            </Link>
                          </TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell className="text-center">
                            {sale.quantity} {product.unit}s
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{sale.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{sale.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing {productSales.length} transactions
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
