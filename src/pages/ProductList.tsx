
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  ListFilter,
  ArrowUpDown,
  Edit,
  Trash2
} from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const { products, addProduct, deleteProduct } = useData();
  
  // State for product filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // State for new product dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: '',
    stock: '',
    costPrice: ''
  });
  
  // Extract all unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) uniqueCategories.add(product.category);
    });
    return ['all', ...Array.from(uniqueCategories)];
  }, [products]);
  
  // Filter and sort products based on search and filters
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filter by category
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort products
        const sortValueA = a[sortField as keyof typeof a];
        const sortValueB = b[sortField as keyof typeof b];
        
        if (sortValueA === undefined || sortValueB === undefined) return 0;
        
        if (typeof sortValueA === 'string' && typeof sortValueB === 'string') {
          return sortOrder === 'asc'
            ? sortValueA.localeCompare(sortValueB)
            : sortValueB.localeCompare(sortValueA);
        } else {
          return sortOrder === 'asc'
            ? (sortValueA > sortValueB ? 1 : -1)
            : (sortValueA < sortValueB ? 1 : -1);
        }
      });
  }, [products, searchTerm, categoryFilter, sortField, sortOrder]);
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  // Handle new product input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle product create
  const handleCreateProduct = () => {
    // Validate required fields
    if (!newProduct.name || !newProduct.price || !newProduct.unit) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const product = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        unit: newProduct.unit,
        category: newProduct.category || 'General',
        stock: parseInt(newProduct.stock || '0'),
        costPrice: newProduct.costPrice ? parseFloat(newProduct.costPrice) : 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      addProduct(product);
      toast.success('Product added successfully');
      
      // Reset form and close dialog
      setNewProduct({
        name: '',
        description: '',
        price: '',
        unit: '',
        category: '',
        stock: '',
        costPrice: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add product');
      console.error('Error adding product:', error);
    }
  };
  
  // Handle product delete
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        deleteProduct(id);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage your inventory and product catalog
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details for the new product. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={newProduct.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      placeholder="Category"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.costPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={newProduct.unit}
                      onChange={handleInputChange}
                      placeholder="e.g., kg, liter, piece"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct}>
                  Create Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              View and manage all products in your inventory
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-9 w-full md:w-[260px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full md:w-[180px] flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-medium flex items-center gap-1"
                      onClick={() => handleSort('name')}
                    >
                      Product
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-medium flex items-center gap-1"
                      onClick={() => handleSort('stock')}
                    >
                      Stock
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto font-medium flex items-center gap-1 ml-auto"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <h3 className="font-medium">No products found</h3>
                        <p className="text-muted-foreground text-sm">
                          {searchTerm || categoryFilter !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Add your first product to get started'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => (
                    <TableRow key={product.id} className="cursor-pointer" onClick={() => navigate(`/product-detail/${product.id}`)}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">{product.category}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${
                              product.stock > 10
                                ? "bg-green-500"
                                : product.stock > 0
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span>{product.stock} {product.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{product.price?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            navigate(`/product-detail/${product.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteProduct(product.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
