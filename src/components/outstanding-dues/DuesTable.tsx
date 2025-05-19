
import { format } from 'date-fns';
import { ArrowUpDown, Phone, Send, History, Printer, Mail, MessageSquare, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { exportToExcel } from '@/utils/excelUtils';

type DuesItemType = {
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  outstanding: number;
  daysOverdue: number;
  latestInvoiceDate: string | null;
  latestInvoiceAmount: number;
  latestPaymentDate: string | null;
  latestPaymentAmount: number;
  invoiceCount: number;
  invoices: any[];
};

type DuesTableProps = {
  filteredData: DuesItemType[];
  duesData: DuesItemType[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  toggleSort: (column: string) => void;
  handleAddPayment: (customer: DuesItemType) => void;
  handleSendReminder: (customer: DuesItemType) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: any) => void;
  setFilterOverdue: (filter: string) => void;
  setActiveTab: (tab: string) => void;
};

export const DuesTable = ({
  filteredData,
  duesData,
  sortColumn,
  sortDirection,
  toggleSort,
  handleAddPayment,
  handleSendReminder,
  setSearchQuery,
  setDateRange,
  setFilterOverdue,
  setActiveTab
}: DuesTableProps) => {
  const clearFilters = () => {
    setSearchQuery('');
    setDateRange(undefined);
    setFilterOverdue('all');
    setActiveTab('all');
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const headers = ["Customer Name", "Phone", "Email", "Outstanding (₹)", "Days Overdue", 
                      "Latest Invoice Date", "Latest Invoice Amount (₹)"];
      
      const data = filteredData.map(item => [
        item.customerName,
        item.phone || "",
        item.email || "",
        item.outstanding,
        item.daysOverdue,
        item.latestInvoiceDate ? format(new Date(item.latestInvoiceDate), "dd/MM/yyyy") : "N/A",
        item.latestInvoiceAmount
      ]);
      
      // Export to Excel
      exportToExcel(headers, data, "Outstanding_Dues.xlsx");
      toast.success("Exported to Excel successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Outstanding Dues List</CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            disabled={filteredData.length === 0}
          >
            Export to Excel
          </Button>
          <Badge variant="outline">{filteredData.length} Records</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No outstanding dues found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer w-[200px]" onClick={() => toggleSort('customerName')}>
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('outstanding')}>
                    <div className="flex items-center justify-end">
                      Outstanding (₹)
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('latestInvoiceDate')}>
                    <div className="flex items-center">
                      Latest Invoice
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('daysOverdue')}>
                    <div className="flex items-center justify-end">
                      Days Overdue
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.customerId}>
                    <TableCell className="font-medium">{item.customerName}</TableCell>
                    <TableCell className="text-right">₹{item.outstanding.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.latestInvoiceDate ? (
                        <div>
                          <div>{format(new Date(item.latestInvoiceDate), 'dd MMM yyyy')}</div>
                          <div className="text-xs text-muted-foreground">
                            ₹{item.latestInvoiceAmount.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        "No invoices"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={
                        item.daysOverdue >= 90 ? "text-red-600 font-medium" :
                        item.daysOverdue >= 60 ? "text-orange-600 font-medium" :
                        item.daysOverdue >= 30 ? "text-amber-600 font-medium" :
                        "text-green-600 font-medium"
                      }>
                        {item.daysOverdue}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{item.phone}</span>
                        </div>
                        {item.email && (
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="text-sm">{item.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.daysOverdue >= 90 ? (
                        <Badge variant="destructive">Critical</Badge>
                      ) : item.daysOverdue >= 60 ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : item.daysOverdue >= 30 ? (
                        <Badge variant="warning">Overdue</Badge>
                      ) : (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleAddPayment(item)}
                          title="Record Payment"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleSendReminder(item)}
                          title="Send Reminder"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toast.success(`Viewing history for ${item.customerName}`)}
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toast.success(`Printing statement for ${item.customerName}`)}
                          title="Print Statement"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {duesData.length} records
        </div>
      </CardFooter>
    </Card>
  );
};
