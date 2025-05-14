import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Supplier, Product } from "@/types";
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
import { CalendarIcon, Truck, Package2 } from "lucide-react";
import { format } from "date-fns";
import { addDays } from "date-fns";
import { toast } from "sonner";

const SupplierRates = () => {
  const {
    suppliers,
    products,
    addSupplierProductRate,
    supplierProductRates,
  } = useData();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [rate, setRate] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");

  // Get the list of rates for the selected supplier
  const supplierRates = selectedSupplierId
    ? supplierProductRates.filter(
        (rate) => rate.supplierId === selectedSupplierId
      )
    : [];

  // Get the selected supplier
  const selectedSupplier = selectedSupplierId
    ? suppliers.find((s) => s.id === selectedSupplierId)
    : null;

  // Get the selected product
  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
    : null;

  const handleAddRate = () => {
    if (!selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    if (!rate) {
      toast.error("Please enter a valid rate");
      return;
    }

    const newRate = {
      supplierId: selectedSupplierId,
      productId: selectedProductId,
      rate: parseFloat(rate),
      effectiveDate: format(effectiveDate, "yyyy-MM-dd"),
      isActive: true,
      notes: notes // Use notes instead of remarks
    };

    addSupplierProductRate(newRate);
    toast.success("Supplier rate added successfully");
    
    // Reset form
    setSelectedProductId("");
    setRate("");
    setEffectiveDate(new Date());
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Supplier Rates
        </h1>
        <p className="text-muted-foreground">
          Manage product rates for different suppliers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Rate</CardTitle>
          <CardDescription>
            Specify the rate for a product from a particular supplier
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
              <label htmlFor="product" className="text-sm font-medium">
                Select Product
              </label>
              <Select
                value={selectedProductId || ""}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{product.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="rate" className="text-sm font-medium">
                Rate (₹)
              </label>
              <Input
                type="number"
                id="rate"
                placeholder="Enter rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="effectiveDate" className="text-sm font-medium">
                Effective Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveDate ? (
                      format(effectiveDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={effectiveDate}
                    onSelect={setEffectiveDate}
                    disabled={(date) =>
                      date > addDays(new Date(), 0)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <Input
                type="text"
                id="notes"
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddRate} disabled={!selectedSupplierId || !selectedProductId || !rate}>
            Add Rate
          </Button>
        </CardContent>
      </Card>

      {selectedSupplier && (
        <Card>
          <CardHeader>
            <CardTitle>
              Rates for {selectedSupplier.name}
            </CardTitle>
            <CardDescription>
              List of product rates for the selected supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Rate (₹)</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierRates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No rates found for this supplier.
                      </TableCell>
                    </TableRow>
                  ) : (
                    supplierRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>
                          {products.find((p) => p.id === rate.productId)?.name ||
                            "Unknown"}
                        </TableCell>
                        <TableCell>{rate.rate.toFixed(2)}</TableCell>
                        <TableCell>
                          {format(new Date(rate.effectiveDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{rate.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierRates;
