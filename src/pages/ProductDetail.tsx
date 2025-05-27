
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, IndianRupee, TrendingUp, Calendar, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, orders, stock } = useData();
  
  const product = products.find(p => p.id === id);
  const productStock = stock.find(s => s.productId === id);
  const productOrders = orders.filter(order => 
    order.items?.some(item => item.productId === id)
  );
  
  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gradient-moody">Product Not Found</h1>
          <Button onClick={() => navigate('/product-list')} className="mt-4 moody-button">
            Back to Product List
          </Button>
        </div>
      </div>
    );
  }

  const totalOrderQuantity = productOrders.reduce((sum, order) => {
    const productItem = order.items?.find(item => item.productId === id);
    return sum + (productItem?.quantity || 0);
  }, 0);

  const totalRevenue = productOrders.reduce((sum, order) => {
    const productItem = order.items?.find(item => item.productId === id);
    return sum + ((productItem?.quantity || 0) * (productItem?.price || 0));
  }, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/product-list')}
          className="hover:bg-primary/20 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-moody">{product.name}</h1>
          <p className="text-muted-foreground">Product Details & Analytics</p>
        </div>
      </div>

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{productStock?.quantity || 0}</div>
                <div className="text-sm text-muted-foreground">Current Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="h-8 w-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold text-secondary">₹{product.price?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-muted-foreground">Current Price</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-accent" />
              <div>
                <div className="text-2xl font-bold text-accent">{totalOrderQuantity}</div>
                <div className="text-sm text-muted-foreground">Total Sold</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="moody-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">₹{totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 moody-card">
          <TabsTrigger value="info">Details</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="orders">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-foreground">Product Name</div>
                    <div className="text-muted-foreground">{product.name}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-foreground">Description</div>
                    <div className="text-muted-foreground">{product.description || 'No description available'}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-foreground">Category</div>
                    <div className="text-muted-foreground">{product.category || 'Uncategorized'}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-foreground">Price</div>
                    <div className="text-muted-foreground">₹{product.price?.toFixed(2) || '0.00'}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-foreground">Unit</div>
                    <div className="text-muted-foreground">{product.unit || 'pcs'}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-foreground">Status</div>
                    <Badge className={product.isActive ? 'status-completed' : 'status-cancelled'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Stock Information</CardTitle>
              <CardDescription>Current stock levels and inventory details</CardDescription>
            </CardHeader>
            <CardContent>
              {productStock ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Current Stock</div>
                      <div className="text-2xl font-bold text-primary">{productStock.quantity}</div>
                    </div>
                    
                    <div className="p-4 bg-warning/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Minimum Stock</div>
                      <div className="text-2xl font-bold text-warning">{productStock.minQuantity || 0}</div>
                    </div>
                    
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="text-lg font-medium text-secondary">
                        {productStock.lastUpdated ? format(new Date(productStock.lastUpdated), 'PPP') : 'Never'}
                      </div>
                    </div>
                  </div>
                  
                  {productStock.quantity <= (productStock.minQuantity || 0) && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="font-medium text-destructive">Low Stock Alert</div>
                      <div className="text-sm text-muted-foreground">
                        Current stock is below minimum threshold. Consider restocking.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No Stock Information</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stock information is not available for this product.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Sales History</CardTitle>
              <CardDescription>Orders containing this product</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="moody-table">
                <TableHeader className="moody-table-header">
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productOrders.map((order) => {
                    const productItem = order.items?.find(item => item.productId === id);
                    return (
                      <TableRow key={order.id} className="moody-table-row">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{format(new Date(order.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{order.customerName || 'Unknown'}</TableCell>
                        <TableCell>{productItem?.quantity || 0}</TableCell>
                        <TableCell>₹{(productItem?.price || 0).toFixed(2)}</TableCell>
                        <TableCell>₹{((productItem?.quantity || 0) * (productItem?.price || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
