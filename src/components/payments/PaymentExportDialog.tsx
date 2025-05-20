
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Payment, Customer } from '@/types';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { FilePdf, FileSpreadsheet } from 'lucide-react';
import { exportToPdf } from '@/utils/pdfUtils';

interface PaymentExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments: Payment[];
  customers: Customer[];
}

export function PaymentExportDialog({
  open,
  onOpenChange,
  payments,
  customers,
}: PaymentExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Filter payments based on date range
  const getFilteredPayments = () => {
    if (!dateRange?.from || !dateRange?.to) return payments;
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= dateRange.from! && paymentDate <= dateRange.to!;
    });
  };
  
  const handleExport = () => {
    const filteredPayments = getFilteredPayments();
    
    if (filteredPayments.length === 0) {
      toast.error("No payments found for the selected date range");
      return;
    }
    
    // Format data for export
    const exportData = filteredPayments.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      
      return {
        "Date": payment.date,
        "Customer": customer?.name || "Unknown",
        "Amount": payment.amount.toFixed(2),
        "Payment Method": payment.paymentMethod,
        "Notes": payment.notes || ""
      };
    });
    
    const fileName = `payments-${format(dateRange?.from || new Date(), 'yyyy-MM-dd')}-to-${format(dateRange?.to || new Date(), 'yyyy-MM-dd')}`;
    
    if (exportFormat === "excel") {
      exportToExcel(exportData, fileName);
      toast.success("Payments exported to Excel successfully");
    } else {
      // Export to PDF
      const headers = ["Date", "Customer", "Amount", "Payment Method", "Notes"];
      
      const rows = filteredPayments.map(payment => {
        const customer = customers.find(c => c.id === payment.customerId);
        
        return [
          payment.date,
          customer?.name || "Unknown",
          `₹${payment.amount.toFixed(2)}`,
          payment.paymentMethod,
          payment.notes || "-"
        ];
      });
      
      const dateInfo = dateRange?.from && dateRange?.to ? 
        `${format(dateRange.from, 'PP')} to ${format(dateRange.to, 'PP')}` : 
        'All dates';
      
      exportToPdf(headers, rows, {
        title: "Payment Report",
        subtitle: "Detailed Payment History",
        dateInfo: `Date Range: ${dateInfo}`,
        filename: `${fileName}.pdf`,
      });
      
      toast.success("Payments exported to PDF successfully");
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Payments</DialogTitle>
          <DialogDescription>
            Export your payment history as Excel or PDF format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              align="start"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select
              value={exportFormat}
              onValueChange={setExportFormat}
            >
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel (.xlsx)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FilePdf className="h-4 w-4" />
                    <span>PDF Document</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-muted p-3 rounded-md text-sm">
            <p>
              <span className="font-medium">Total payments in range:</span> {getFilteredPayments().length} payments
            </p>
            <p>
              <span className="font-medium">Total amount:</span> ₹
              {getFilteredPayments()
                .reduce((sum, payment) => sum + payment.amount, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={getFilteredPayments().length === 0}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
