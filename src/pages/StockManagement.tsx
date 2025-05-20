import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Product, StockEntry, StockEntryItem, Supplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, PackagePlus, Truck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const StockManagement = () => {
  const { suppliers, products, addStockEntry } = useData();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState<Date | undefined>(new Date());
  const [stockItems, setStockItems] = useState<
    { productId: string; quantity: number; rate: number }[]
  >([]);
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Calculate total amount
  const calculateTotal = () => {
    return stockItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  // Add a new stock item
  const addStockItem = () => {
    if (products.length === 0) {
      toast.error("Please add products first");
      return;
    }
    setStockItems([
      ...stockItems,
      { productId: products[0].id, quantity: 0, rate: 0 },
    ]);
  };

  // Update stock item
  const updateStockItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newStockItems = [...stockItems];
    newStockItems[index][field] =
      field === "quantity" || field === "rate" ? Number(value) : value;
    setStockItems(newStockItems);
  };

  // Remove stock item
  const removeStockItem = (index: number) => {
    const newStockItems = [...stockItems];
    newStockItems.splice(index, 1);
    setStockItems(newStockItems);
  };

  // Reset form
  const resetForm = () => {
    setSelectedSupplierId(null);
    setEntryDate(new Date());
    setStockItems([]);
    setReferenceNumber("");
    setNotes("");
  };

  // Convert rate to unitPrice when saving stock entries
  const handleSaveStockEntry = () => {
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (stockItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    // Convert stockItems with rate to items with unitPrice and total
    const convertedItems: StockEntryItem[] = stockItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.rate, // Use rate as unitPrice
      total: item.quantity * item.rate
    }));

    const entry: StockEntry = {
      id: `se${Date.now()}`, // Add an ID to the entry
      date: format(entryDate || new Date(), "yyyy-MM-dd"),
      supplierId: selectedSupplierId,
      totalAmount: calculateTotal(),
      items: convertedItems,
      notes: notes,
      referenceNumber: referenceNumber // Now properly part of StockEntry type
    };

    addStockEntry(entry);
    toast.success("Stock entry added successfully");
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground">
          Manage incoming stock and track purchase history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Stock Entry</CardTitle>
          <CardDescription>
            Record new stock entries with supplier and product details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="supplier" className="text-sm font-medium">
                Select Supplier
              </label>
              <Select
                value={selectedSupplierId || ""}
                onValueChange={setSelectedSupplierId}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center">
                        <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{supplier.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Entry Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {entryDate ? format(entryDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={setEntryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="reference" className="text-sm font-medium">
                Reference Number
              </label>
              <Input
                id="reference"
                placeholder="Enter reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <h4 className="text-sm font-medium">Stock Items</h4>
            {stockItems.map((item, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <label
                    htmlFor={`product-${index}`}
                    className="text-sm font-medium"
                  >
                    Product
                  </label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) =>
                      updateStockItem(index, "productId", value)
                    }
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`quantity-${index}`}
                    className="text-sm font-medium"
                  >
                    Quantity
                  </label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    placeholder="Enter quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      updateStockItem(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor={`rate-${index}`}
                    className="text-sm font-medium"
                  >
                    Rate
                  </label>
                  <Input
                    id={`rate-${index}`}
                    type="number"
                    placeholder="Enter rate"
                    value={item.rate}
                    onChange={(e) =>
                      updateStockItem(index, "rate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeStockItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addStockItem}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Input
              id="notes"
              placeholder="Enter notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveStockEntry}>Save Stock Entry</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagement;
