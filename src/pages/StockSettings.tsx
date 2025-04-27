
import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Package, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StockSettings = () => {
  const { products, updateProductMinStock } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // Changed from null to "all"

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" // Changed condition
      ? true
      : product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Update min stock level
  const handleMinStockChange = (productId: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProductMinStock(productId, numValue);
      toast.success("Stock level updated successfully");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Stock Settings
        </h1>
        <p className="text-muted-foreground">
          Configure minimum stock levels for your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Stock Configuration</CardTitle>
          <CardDescription>
            Set minimum stock levels to receive alerts when inventory is low
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="category-filter" className="whitespace-nowrap">
                Filter by Category:
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger id="category-filter" className="h-10 w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem> {/* Changed from empty string to "all" */}
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead className="text-right">Min Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Input
                            type="number"
                            min="0"
                            className="w-20 text-right"
                            value={product.minStockLevel || ""}
                            onChange={(e) =>
                              handleMinStockChange(product.id, e.target.value)
                            }
                          />
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
    </div>
  );
};

export default StockSettings;
