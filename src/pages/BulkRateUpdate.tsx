import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function BulkRates() {
  const { products, customers, customerProductRates, updateProduct, addCustomerProductRate, updateCustomerProductRate } = useData();
  
  // For product rate updates
  const [updateType, setUpdateType] = useState<"fixed" | "percentage">("fixed");
  const [updateValue, setUpdateValue] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // For customer rate updates
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerUpdateType, setCustomerUpdateType] = useState<"fixed" | "percentage">("fixed");
  const [customerUpdateValue, setCustomerUpdateValue] = useState<string>("");

  // Get unique product categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter products by category
  const filteredProducts = categoryFilter === "all" 
    ? products 
    : products.filter(p => p.category === categoryFilter);

  const applyProductRateUpdate = () => {
    const value = parseFloat(updateValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    let updatedCount = 0;
    filteredProducts.forEach(product => {
      let newPrice: number;
      
      if (updateType === "fixed") {
        newPrice = value;
      } else { // percentage
        newPrice = product.price * (1 + value / 100);
        newPrice = Math.round(newPrice * 100) / 100; // Round to 2 decimal places
      }
      
      updateProduct(product.id, { price: newPrice });
      updatedCount++;
    });

    toast.success(`Updated prices for ${updatedCount} products`);
    setUpdateValue("");
  };

  const applyCustomerRateUpdate = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    const value = parseFloat(customerUpdateValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    let updatedCount = 0;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    products.forEach(product => {
      let newRate: number;
      const existingRate = customerProductRates.find(
        rate => rate.customerId === selectedCustomerId && rate.productId === product.id
      );
      
      // Base price to apply percentage to (either custom rate or product price)
      const basePrice = existingRate ? existingRate.rate : product.price;
      
      if (customerUpdateType === "fixed") {
        newRate = value;
      } else { // percentage
        newRate = basePrice * (1 + value / 100);
        newRate = Math.round(newRate * 100) / 100; // Round to 2 decimal places
      }
      
      if (existingRate) {
        updateCustomerProductRate(existingRate.id, { rate: newRate });
      } else {
        addCustomerProductRate({
          customerId: selectedCustomerId,
          productId: product.id,
          rate: newRate,
          effectiveDate: date,
          isActive: true // Adding the missing isActive property
        });
      }
      
      updatedCount++;
    });

    toast.success(`Updated custom rates for ${updatedCount} products`);
    setCustomerUpdateValue("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Update</h1>
        <p className="text-muted-foreground">
          Apply price changes to multiple products at once
        </p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Product Rates</TabsTrigger>
          <TabsTrigger value="customers">Customer Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Update Product Rates</CardTitle>
              <CardDescription>
                Apply a fixed rate or percentage change to multiple products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Filter by Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: string) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-type">Update Type</Label>
                  <Select value={updateType} onValueChange={(value) => setUpdateType(value as "fixed" | "percentage")}>
                    <SelectTrigger id="update-type">
                      <SelectValue placeholder="Select update type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="percentage">Percentage Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-value">
                    {updateType === "fixed" ? "New Price (₹)" : "Percentage Change (%)"}
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="update-value"
                      type="number"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder={updateType === "fixed" ? "0.00" : "0"}
                    />
                    <Button onClick={applyProductRateUpdate}>Apply</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <p>Selected category: <span className="font-semibold">{categoryFilter === "all" ? "All Categories" : categoryFilter}</span></p>
                <p>Products affected: <span className="font-semibold">{filteredProducts.length}</span></p>
                {updateValue && (
                  <p>
                    {updateType === "fixed" 
                      ? `New price will be: ₹${updateValue}` 
                      : `Prices will ${parseFloat(updateValue) >= 0 ? "increase" : "decrease"} by ${updateValue}%`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Update Customer-Specific Rates</CardTitle>
              <CardDescription>
                Apply custom rates for a specific customer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-select">Select Customer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="customer-select">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-update-type">Update Type</Label>
                  <Select 
                    value={customerUpdateType} 
                    onValueChange={(value) => setCustomerUpdateType(value as "fixed" | "percentage")}
                  >
                    <SelectTrigger id="customer-update-type">
                      <SelectValue placeholder="Select update type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="percentage">Percentage Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-update-value">
                    {customerUpdateType === "fixed" ? "New Price (₹)" : "Percentage Change (%)"}
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="customer-update-value"
                      type="number"
                      value={customerUpdateValue}
                      onChange={(e) => setCustomerUpdateValue(e.target.value)}
                      placeholder={customerUpdateType === "fixed" ? "0.00" : "0"}
                    />
                    <Button 
                      onClick={applyCustomerRateUpdate}
                      disabled={!selectedCustomerId}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <p>
                  Selected customer: 
                  <span className="font-semibold">
                    {selectedCustomerId 
                      ? customers.find(c => c.id === selectedCustomerId)?.name 
                      : "None selected"}
                  </span>
                </p>
                <p>Products affected: <span className="font-semibold">{products.length}</span></p>
                {customerUpdateValue && selectedCustomerId && (
                  <p>
                    {customerUpdateType === "fixed" 
                      ? `All custom rates will be set to: ₹${customerUpdateValue}` 
                      : `Custom rates will ${parseFloat(customerUpdateValue) >= 0 ? "increase" : "decrease"} by ${customerUpdateValue}%`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
