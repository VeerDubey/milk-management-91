
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileText, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { exportToPdf } from "@/utils/pdfUtils";
import { exportToExcel } from "@/utils/excelUtils";
import { toast } from "sonner";

export default function CustomerRates() {
  const { customers, products, customerProductRates, addCustomerProductRate, updateCustomerProductRate } = useData();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [editingRates, setEditingRates] = useState<Record<string, Record<string, number>>>({});
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer: Customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRateChange = (customerId: string, productId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingRates(prev => ({
      ...prev,
      [customerId]: {
        ...(prev[customerId] || {}),
        [productId]: numValue
      }
    }));
  };

  const saveRates = (customerId: string) => {
    if (!editingRates[customerId]) return;

    Object.entries(editingRates[customerId]).forEach(([productId, rate]) => {
      // Check if rate already exists
      const existingRate = customerProductRates.find(
        r => r.customerId === customerId && r.productId === productId
      );

      if (existingRate) {
        updateCustomerProductRate(existingRate.id, { rate });
      } else {
        addCustomerProductRate({
          customerId,
          productId,
          rate,
          effectiveDate: new Date().toISOString()
        });
      }
    });

    // Clear edited rates for this customer
    setEditingRates(prev => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });

    toast.success("Customer rates updated successfully");
  };

  const getCustomerRate = (customerId: string, productId: string) => {
    const existingRate = customerProductRates.find(
      r => r.customerId === customerId && r.productId === productId
    );
    
    if (existingRate) {
      return existingRate.rate;
    }
    
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  const getCurrentRate = (customerId: string, productId: string) => {
    if (editingRates[customerId]?.[productId] !== undefined) {
      return editingRates[customerId][productId];
    }
    return getCustomerRate(customerId, productId);
  };

  const exportRatesToPdf = () => {
    try {
      // Prepare headers and data for PDF
      const headers = ["Customer Name", "Mobile", "Product", "Rate (₹)"];
      
      const data: any[][] = [];
      filteredCustomers.forEach(customer => {
        products.forEach(product => {
          const rate = getCustomerRate(customer.id, product.id);
          data.push([
            customer.name,
            customer.phone || "-",
            product.name,
            rate.toFixed(2)
          ]);
        });
      });
      
      // Export to PDF
      exportToPdf(
        headers,
        data,
        {
          title: "Customer Product Rates",
          subtitle: "Rate sheet for all customers",
          dateInfo: new Date().toLocaleDateString(),
          filename: "customer-rates.pdf",
          landscape: true
        }
      );
      
      toast.success("Customer rates exported to PDF");
    } catch (error) {
      console.error("Error exporting rates:", error);
      toast.error("Failed to export customer rates");
    }
  };
  
  const exportRatesToExcel = () => {
    try {
      // Prepare headers and data for Excel
      const headers = ["Customer Name", "Mobile", "Product", "Rate (₹)"];
      
      const data: any[][] = [];
      filteredCustomers.forEach(customer => {
        products.forEach(product => {
          const rate = getCustomerRate(customer.id, product.id);
          data.push([
            customer.name,
            customer.phone || "-",
            product.name,
            rate.toFixed(2)
          ]);
        });
      });
      
      // Export to Excel
      exportToExcel(
        headers,
        data,
        "customer-rates.xlsx"
      );
      
      toast.success("Customer rates exported to Excel");
    } catch (error) {
      console.error("Error exporting rates:", error);
      toast.error("Failed to export customer rates");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Rates</h1>
          <p className="text-muted-foreground">
            Manage product rates for each customer
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRatesToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={exportRatesToPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredCustomers
          .filter(c => !selectedCustomer || selectedCustomer === "all" || c.id === selectedCustomer)
          .map((customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle>{customer.name}</CardTitle>
                  {editingRates[customer.id] && (
                    <Button size="sm" onClick={() => saveRates(customer.id)}>
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Product</TableHead>
                      <TableHead className="w-1/3">Default Price (₹)</TableHead>
                      <TableHead className="w-1/3">Customer Rate (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const currentRate = getCurrentRate(customer.id, product.id);
                      const isDefaultRate = currentRate === product.price;
                      
                      return (
                        <TableRow key={`${customer.id}-${product.id}`}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={currentRate}
                                onChange={(e) => handleRateChange(customer.id, product.id, e.target.value)}
                                className={isDefaultRate ? "" : "border-primary text-primary"}
                                step="0.01"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
