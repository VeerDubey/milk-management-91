
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { exportToPdf } from "@/utils/pdfUtils";
import { exportToExcel } from "@/utils/excelUtils";
import { toast } from "sonner";

export default function CustomerDirectory() {
  const { customers } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    // Generate CSV content
    let csvContent = "Name,Phone,Address,Email,Outstanding Balance,Last Payment\n";
    
    filteredCustomers.forEach((customer) => {
      const lastPaymentInfo = customer.lastPaymentDate 
        ? `${customer.lastPaymentAmount} on ${customer.lastPaymentDate}` 
        : "No payments";
      
      csvContent += `"${customer.name}","${customer.phone || ''}","${customer.address || ''}","${customer.email || ''}","${customer.outstandingBalance || 0}","${lastPaymentInfo}"\n`;
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customer-directory-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.click();
    
    toast.success("Customer directory exported to CSV");
  };
  
  const exportToPdfFile = () => {
    // Generate PDF
    const headers = ["Name", "Phone", "Address", "Email", "Outstanding Balance", "Last Payment"];
    
    const data = filteredCustomers.map(customer => {
      const lastPaymentInfo = customer.lastPaymentDate 
        ? `₹${customer.lastPaymentAmount} on ${customer.lastPaymentDate}` 
        : "No payments";
      
      return [
        customer.name,
        customer.phone || "-",
        customer.address || "-",
        customer.email || "-",
        `₹${customer.outstandingBalance || 0}`,
        lastPaymentInfo
      ];
    });
    
    exportToPdf(
      headers,
      data,
      {
        title: "Customer Directory",
        subtitle: "Complete customer database",
        dateInfo: format(new Date(), "dd/MM/yyyy"),
        filename: `customer-directory-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        landscape: true
      }
    );
    
    toast.success("Customer directory exported to PDF");
  };
  
  const exportToExcelFile = () => {
    // Generate Excel
    const headers = ["Name", "Phone", "Address", "Email", "Outstanding Balance", "Last Payment"];
    
    const data = filteredCustomers.map(customer => {
      const lastPaymentInfo = customer.lastPaymentDate 
        ? `₹${customer.lastPaymentAmount} on ${customer.lastPaymentDate}` 
        : "No payments";
      
      return [
        customer.name,
        customer.phone || "-",
        customer.address || "-",
        customer.email || "-",
        customer.outstandingBalance || 0,
        lastPaymentInfo
      ];
    });
    
    exportToExcel(
      headers,
      data,
      `customer-directory-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
    
    toast.success("Customer directory exported to Excel");
  };

  const printDirectory = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Directory</h1>
          <p className="text-muted-foreground">
            View and manage your customer database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToExcelFile}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportToPdfFile}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={printDirectory}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                Complete customer database with contact information
              </CardDescription>
            </div>
            <div className="relative w-64 print:hidden">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Outstanding Balance</TableHead>
                  <TableHead className="text-right">Last Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.address || '-'}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell className="text-right">₹{customer.outstandingBalance || 0}</TableCell>
                      <TableCell className="text-right">
                        {customer.lastPaymentDate
                          ? `₹${customer.lastPaymentAmount} on ${customer.lastPaymentDate}`
                          : "No payments"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No customers found. {searchQuery ? 'Try a different search term.' : 'Add customers to see them here.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
