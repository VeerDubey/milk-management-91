import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Package, Plus, MoreVertical, Search } from "lucide-react";

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

const ProductCategories = () => {
  const { products } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ProductCategory[]>([
    { id: "cat1", name: "Milk", description: "Fresh dairy milk products", itemCount: 8 },
    { id: "cat2", name: "Yogurt", description: "Yogurt and curd products", itemCount: 5 },
    { id: "cat3", name: "Cheese", description: "Various cheese products", itemCount: 4 },
    { id: "cat4", name: "Butter", description: "Butter and ghee products", itemCount: 3 },
    { id: "cat5", name: "Special Items", description: "Specialty dairy products", itemCount: 7 },
  ]);
  
  // For new category form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState<ProductCategory | null>(null);

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategory.name.trim() === "") {
      toast.error("Category name cannot be empty");
      return;
    }

    const newId = `cat${categories.length + 1}`;
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategory.name,
        description: newCategory.description,
        itemCount: 0,
      },
    ]);
    setNewCategory({ name: "", description: "" });
    setIsAddDialogOpen(false);
    toast.success("Category added successfully");
  };

  const handleEditCategory = () => {
    if (!editCategory) return;
    
    if (editCategory.name.trim() === "") {
      toast.error("Category name cannot be empty");
      return;
    }

    setCategories(
      categories.map((cat) =>
        cat.id === editCategory.id ? editCategory : cat
      )
    );
    setIsEditDialogOpen(false);
    setEditCategory(null);
    toast.success("Category updated successfully");
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (category && category.itemCount > 0) {
      toast.error(`Cannot delete category with ${category.itemCount} associated products`);
      return;
    }
    
    setCategories(categories.filter((cat) => cat.id !== id));
    toast.success("Category deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-muted-foreground">
            Manage categories for organizing your products
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new product category to organize your items
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">Category Name</label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="e.g., Dairy Products"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description">Description</label>
                <Input
                  id="description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the category"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 text-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Package className="mr-2 h-5 w-5" />
            Product Categories
          </CardTitle>
          <CardDescription className="text-gray-300">
            Create and manage categories to better organize your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-white/10 border-0 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-500"
              />
            </div>
          </div>
          <div className="rounded-md border border-purple-700/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-purple-800/50">
                <TableRow>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-right text-white">Products</TableHead>
                  <TableHead className="w-[80px] text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-purple-900/30">
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-300 h-32">
                      No categories found. Create your first category to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-t border-purple-700/50 hover:bg-purple-800/30">
                      <TableCell className="font-medium text-white">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {category.itemCount}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-purple-700/50"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-purple-900 text-white border-purple-700">
                            <DropdownMenuItem
                              className="cursor-pointer hover:bg-purple-800"
                              onClick={() => {
                                setEditCategory(category);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-red-400 hover:bg-purple-800 hover:text-red-300"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details below
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name">Category Name</label>
                <Input
                  id="edit-name"
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-description">Description</label>
                <Input
                  id="edit-description"
                  value={editCategory.description}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCategories;
