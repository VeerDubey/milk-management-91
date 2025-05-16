
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/data/DataContext";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct, deleteProduct } = useData();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const foundProduct = products.find((p) => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setEditedProduct(foundProduct);
      } else {
        toast.error("Product not found");
        navigate("/products");
      }
    }
  }, [id, products, navigate]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading product...</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (type === 'number') {
      setEditedProduct({
        ...editedProduct,
        [name]: parseFloat(value) || 0
      });
    } else {
      setEditedProduct({
        ...editedProduct,
        [name]: value
      });
    }
  };

  const handleSave = () => {
    if (id) {
      updateProduct(id, editedProduct);
      setProduct({ ...product, ...editedProduct });
      setIsEditing(false);
      toast.success("Product updated successfully");
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteProduct(id);
      toast.success("Product deleted successfully");
      navigate("/products");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/product-list")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Product" : product.name}</h1>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Product Details" : "Product Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={editedProduct.name || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.name}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="price">Price (₹)</Label>
              {isEditing ? (
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={editedProduct.price || 0}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">₹{product.price.toFixed(2)}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="category">Category</Label>
              {isEditing ? (
                <Input
                  id="category"
                  name="category"
                  value={editedProduct.category || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.category || "Uncategorized"}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="unit">Unit</Label>
              {isEditing ? (
                <Input
                  id="unit"
                  name="unit"
                  value={editedProduct.unit || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.unit}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="stock">Current Stock</Label>
              {isEditing ? (
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={editedProduct.stock || 0}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.stock || 0} {product.unit}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
              {isEditing ? (
                <Input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  value={editedProduct.minStockLevel || 0}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.minStockLevel || 0} {product.unit}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="costPrice">Cost Price (₹)</Label>
              {isEditing ? (
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  value={editedProduct.costPrice || 0}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">₹{product.costPrice?.toFixed(2) || "0.00"}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="barcode">Barcode</Label>
              {isEditing ? (
                <Input
                  id="barcode"
                  name="barcode"
                  value={editedProduct.barcode || ""}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-muted/50 rounded">{product.barcode || "N/A"}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                name="description"
                rows={4}
                value={editedProduct.description || ""}
                onChange={handleInputChange}
              />
            ) : (
              <p className="p-2 bg-muted/50 rounded min-h-[100px]">
                {product.description || "No description available"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{product.name}" from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
