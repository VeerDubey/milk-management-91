
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/data/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Folder, Plus, Edit, Trash, Search, Pencil } from 'lucide-react';

// This is a placeholder until you implement product categories in your data context
interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  productCount: number;
}

export default function ProductCategories() {
  const { products, updateProduct } = useData();
  const [categories, setCategories] = useState<ProductCategory[]>([
    { 
      id: 'cat_milk', 
      name: 'Milk', 
      description: 'Different varieties of milk products', 
      slug: 'milk',
      productCount: products.filter(p => p.category === 'milk').length
    },
    { 
      id: 'cat_curd', 
      name: 'Curd', 
      description: 'Yogurt and curd products', 
      slug: 'curd',
      productCount: products.filter(p => p.category === 'curd').length
    },
    { 
      id: 'cat_butter', 
      name: 'Butter', 
      description: 'Butter and butter-based products', 
      slug: 'butter',
      productCount: products.filter(p => p.category === 'butter').length
    },
    { 
      id: 'cat_cheese', 
      name: 'Cheese', 
      description: 'Various cheese products', 
      slug: 'cheese',
      productCount: products.filter(p => p.category === 'cheese').length
    },
    { 
      id: 'cat_paneer', 
      name: 'Paneer', 
      description: 'Cottage cheese and paneer products', 
      slug: 'paneer',
      productCount: products.filter(p => p.category === 'paneer').length
    },
    { 
      id: 'cat_ghee', 
      name: 'Ghee', 
      description: 'Clarified butter products', 
      slug: 'ghee',
      productCount: products.filter(p => p.category === 'ghee').length
    },
    { 
      id: 'cat_ice_cream', 
      name: 'Ice Cream', 
      description: 'Frozen dessert products', 
      slug: 'ice_cream',
      productCount: products.filter(p => p.category === 'ice_cream').length
    },
    { 
      id: 'cat_other', 
      name: 'Other', 
      description: 'Other dairy products', 
      slug: 'other',
      productCount: products.filter(p => p.category === 'other').length
    }
  ]);
  
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    slug: ''
  });
  
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );
  
  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    // Generate slug if not provided
    const slug = newCategory.slug.trim() || newCategory.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check for duplicate slugs
    if (categories.some(c => c.slug === slug)) {
      toast.error('A category with this slug already exists');
      return;
    }
    
    const category = {
      id: `cat_${uuidv4().slice(0, 8)}`,
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      slug,
      productCount: 0
    };
    
    setCategories([...categories, category]);
    setNewCategory({
      name: '',
      description: '',
      slug: ''
    });
    
    setIsAddDialogOpen(false);
    toast.success(`Category "${category.name}" created successfully`);
  };
  
  const handleEditCategory = () => {
    if (!selectedCategory) return;
    
    if (!selectedCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    // Generate slug if not provided
    const slug = selectedCategory.slug.trim() || selectedCategory.name.toLowerCase().replace(/\s+/g, '_');
    
    // Check for duplicate slugs (excluding the current category)
    if (categories.some(c => c.slug === slug && c.id !== selectedCategory.id)) {
      toast.error('A category with this slug already exists');
      return;
    }
    
    setCategories(categories.map(c => 
      c.id === selectedCategory.id 
        ? { ...selectedCategory, slug } 
        : c
    ));
    
    setIsEditDialogOpen(false);
    toast.success(`Category "${selectedCategory.name}" updated successfully`);
  };
  
  const initiateDelete = (category: ProductCategory) => {
    setCategoryToDelete(category);
    
    // If has products, show reassign dialog, otherwise confirm delete
    if (category.productCount > 0) {
      setIsReassignDialogOpen(true);
    } else {
      // No products to reassign, proceed with deletion
      handleDeleteCategory(category.id, null);
    }
  };
  
  const handleDeleteCategory = (categoryId: string, reassignToCategoryId: string | null) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.productCount > 0 && reassignToCategoryId) {
      // Reassign products to another category
      const targetCategory = categories.find(c => c.id === reassignToCategoryId);
      if (!targetCategory) return;
      
      // Get the slug of the category to reassign to
      const targetSlug = targetCategory.slug;
      
      // Update all products in this category
      products
        .filter(p => p.category === category.slug)
        .forEach(product => {
          updateProduct(product.id, { category: targetSlug });
        });
        
      // Update product counts
      setCategories(categories.map(c => {
        if (c.id === reassignToCategoryId) {
          return { ...c, productCount: c.productCount + category.productCount };
        }
        return c;
      }));
    }
    
    // Remove the category
    setCategories(categories.filter(c => c.id !== categoryId));
    
    setCategoryToDelete(null);
    setIsReassignDialogOpen(false);
    setReassignTo('');
    
    toast.success(`Category "${category.name}" deleted successfully`);
  };
  
  const handleEditClick = (category: ProductCategory) => {
    setSelectedCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">Organize your products with categories</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories</CardDescription>
            </div>
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search categories..." 
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No categories found. {search && "Try adjusting your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.description || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell className="text-center">{category.productCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => initiateDelete(category)}
                            disabled={category.slug === 'other'} // Prevent deleting the "Other" category
                          >
                            <Trash className="h-4 w-4" />
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
      </Card>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="e.g., Dairy Products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Brief description of the category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                placeholder="category-slug"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly version of name. Generated automatically if left blank.
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                  placeholder="e.g., Dairy Products"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedCategory.description || ''}
                  onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
                  placeholder="Brief description of the category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={selectedCategory.slug}
                  onChange={(e) => setSelectedCategory({...selectedCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  placeholder="category-slug"
                  className="font-mono"
                  disabled={selectedCategory.slug === 'other'}
                />
                {selectedCategory.slug === 'other' && (
                  <p className="text-xs text-muted-foreground">
                    The "other" category cannot be renamed as it's used as a default category.
                  </p>
                )}
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium">Products in this category: {selectedCategory.productCount}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Products</DialogTitle>
            <DialogDescription>
              {categoryToDelete && (
                <>
                  Category "{categoryToDelete.name}" has {categoryToDelete.productCount} products. 
                  Choose where to move them before deleting the category.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reassign-to">Reassign to Category</Label>
              <select
                id="reassign-to"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {categories
                  .filter(c => categoryToDelete && c.id !== categoryToDelete.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id, reassignTo)}
              disabled={!reassignTo}
            >
              Reassign and Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
