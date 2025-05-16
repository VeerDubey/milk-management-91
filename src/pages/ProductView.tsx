
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Package, Trash, AlertTriangle, History } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, updateProduct, deleteProduct } = useData();
  const [isEditing, setIsEditing] = useState(false);

  // Find the product by ID
  const product = products.find((p) => p.id === id);

  const [editForm, setEditForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    unit: product?.unit || "",
    category: product?.category || "",
    stock: product?.stock?.toString() || "",
    costPrice: product?.costPrice?.toString() || "",
    minStockLevel: product?.minStockLevel?.toString() || "",
  });

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/product-list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Product List
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      deleteProduct(product.id);
      toast.success("Product deleted successfully!");
      navigate("/product-list");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      unit: product.unit,
      category: product.category || "",
      stock: product.stock?.toString() || "0",
      costPrice: product.costPrice?.toString() || "0",
      minStockLevel: product.minStockLevel?.toString() || "0",
    });
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.price || !editForm.unit) {
      toast.error("Name, price, and unit are required");
      return;
    }

    try {
      updateProduct(product.id, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        unit: editForm.unit,
        category: editForm.category,
        stock: parseInt(editForm.stock),
        costPrice: parseFloat(editForm.costPrice),
        minStockLevel: parseInt(editForm.minStockLevel),
      });

      setIsEditing(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getStockStatusBadge = () => {
    const stock = product.stock || 0;
    const minStock = product.minStockLevel || 0;
    
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < minStock) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">In Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/product-list")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight ml-2">
            Product Details
          </h1>
        </div>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        {isEditing ? (
          <>
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>
                Update the details for {product.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Product Name*</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price per Unit*</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unit*</Label>
                    <Input
                      id="edit-unit"
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock">Current Stock</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-minStock">Minimum Stock Level</Label>
                    <Input
                      id="edit-minStock"
                      type="number"
                      value={editForm.minStockLevel}
                      onChange={(e) => setEditForm({ ...editForm, minStockLevel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-costPrice">Cost Price</Label>
                    <Input
                      id="edit-costPrice"
                      type="number"
                      value={editForm.costPrice}
                      onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <div>{getStockStatusBadge()}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd className="font-medium">{product.category || "General"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Price:</dt>
                        <dd className="font-medium">₹{product.price.toFixed(2)}/{product.unit}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Cost Price:</dt>
                        <dd className="font-medium">₹{(product.costPrice || 0).toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Profit Margin:</dt>
                        <dd className="font-medium">
                          {product.costPrice ? 
                            `${(((product.price - (product.costPrice || 0)) / product.price) * 100).toFixed(2)}%` : 
                            "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Stock Information</h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Current Stock:</dt>
                        <dd className="font-medium">{product.stock || 0} {product.unit}s</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Minimum Stock Level:</dt>
                        <dd className="font-medium">{product.minStockLevel || 0} {product.unit}s</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Value in Stock:</dt>
                        <dd className="font-medium">₹{((product.stock || 0) * product.price).toFixed(2)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Additional Details</h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">ID:</dt>
                        <dd className="font-medium text-sm">{product.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">SKU:</dt>
                        <dd className="font-medium">{product.sku || "Not set"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Status:</dt>
                        <dd className="font-medium">{product.isActive !== false ? "Active" : "Inactive"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Recent Activity</h3>
                    <Separator className="my-2" />
                    <div className="rounded-md bg-muted/50 p-4 text-center">
                      <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        Purchase history will be displayed here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
