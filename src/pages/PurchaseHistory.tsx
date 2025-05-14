import React, { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
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
import { CalendarIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockEntry } from "@/types";

const PurchaseHistory = () => {
  const { suppliers, products, stockEntries } = useData();
  const [date, setDate] = useState<Date | undefined>(undefined);

  // When creating stock entries, ensure items use unitPrice instead of rate
  const data1 = {
    id: uuidv4(),
    date: "2023-05-15",
    supplierId: "supplier-1",
    totalAmount: 12500,
    items: [
      { productId: "product-1", quantity: 50, unitPrice: 150, total: 7500 },
      { productId: "product-2", quantity: 25, unitPrice: 200, total: 5000 }
    ]
  };

  const data2 = {
    id: uuidv4(),
    date: "2023-05-10",
    supplierId: "supplier-2",
    totalAmount: 8500,
    items: [
      { productId: "product-1", quantity: 30, unitPrice: 150, total: 4500 },
      { productId: "product-3", quantity: 20, unitPrice: 200, total: 4000 }
    ]
  };

  const data3 = {
    id: uuidv4(),
    date: "2023-05-05",
    supplierId: "supplier-3",
    totalAmount: 7000,
    items: [
      { productId: "product-2", quantity: 15, unitPrice: 200, total: 3000 },
      { productId: "product-3", quantity: 20, unitPrice: 200, total: 4000 }
    ]
  };

  // Mock stock entries data
  const mockStockEntries: StockEntry[] = [data1 as StockEntry, data2 as StockEntry, data3 as StockEntry];

  // Filter stock entries by date
  const filteredStockEntries = date
    ? mockStockEntries.filter(
        (entry) =>
          format(new Date(entry.date), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      )
    : mockStockEntries;

  // Reference cell component
  const ReferenceCell = ({ entry }: { entry: StockEntry }) => (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      {entry.referenceNumber || "-"}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Purchase History
        </h1>
        <p className="text-muted-foreground">
          Track and manage your purchase history from suppliers
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            View and filter your purchase history by date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Filter by Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <ReferenceCell entry={entry} />
                    </TableCell>
                    <TableCell>
                      {
                        suppliers.find((supplier) => supplier.id === entry.supplierId)?.name
                      }
                    </TableCell>
                    <TableCell>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.items.map((item, index) => {
                            const product = products.find((product) => product.id === item.productId);
                            return (
                              <TableRow key={`${product.id}-${index}`}>
                                <TableCell>{product?.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell key={`${product.id}-${index}`} className="text-right">
                                  {item.unitPrice.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(item.quantity * item.unitPrice).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableCell>
                    <TableCell>{entry.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;
