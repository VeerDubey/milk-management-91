
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download,
  ChevronDown,
  Loader2,
  FileText,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useInvoices } from '@/contexts/InvoiceContext';
import { DownloadService } from '@/services/DownloadService';
import { toast } from 'sonner';

interface InvoiceDownloadButtonProps {
  invoiceId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onSuccess?: () => void;
}

export default function InvoiceDownloadButton({ 
  invoiceId, 
  variant = "default", 
  size = "default",
  className = "",
  onSuccess
}: InvoiceDownloadButtonProps) {
  const { downloadInvoice, printInvoice, selectedTemplateId, templates, getInvoiceById } = useInvoices();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const invoice = getInvoiceById(invoiceId);
  
  const handleDownload = async (templateId?: string) => {
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    
    setIsDownloading(true);
    try {
      await downloadInvoice(invoiceId, templateId);
      toast.success("Invoice downloaded successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handlePrint = async (templateId?: string) => {
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    
    setIsPrinting(true);
    try {
      await printInvoice(invoiceId, templateId);
      toast.success("Invoice sent to printer");
      onSuccess?.();
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Failed to print invoice. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };
  
  const handleExportCSV = async () => {
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    
    setIsExporting(true);
    try {
      // Convert invoice to CSV format using correct properties
      const headers = ['Item', 'Quantity', 'Unit Price', 'Amount'];
      const rows = invoice.items?.map(item => [
        item.description || 'Unknown Item',
        String(item.quantity || 0),
        String(item.unitPrice || 0),
        String(item.amount || 0)
      ]) || [];
      
      // Add totals
      rows.push(['', '', 'Total:', String(invoice.total || 0)]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const filename = `invoice-${invoice.id}.csv`;
      await DownloadService.downloadCSV(csvContent, filename);
      onSuccess?.();
    } catch (error) {
      console.error("CSV export failed:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  if (isDownloading || isPrinting || isExporting) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled
        className={`flex items-center ${className}`}
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {isDownloading ? 'Downloading...' : isPrinting ? 'Printing...' : 'Exporting...'}
      </Button>
    );
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick actions */}
          <DropdownMenuItem onClick={() => handleDownload()}>
            <Download className="h-4 w-4 mr-2" />
            <span>Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span>Export CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePrint()}>
            <Printer className="h-4 w-4 mr-2" />
            <span>Print Invoice</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Download with Template</DropdownMenuLabel>
          
          {/* Template-specific downloads */}
          {templates && templates.length > 0 ? templates.map(template => (
            <DropdownMenuItem 
              key={template.id} 
              onClick={() => handleDownload(template.id)}
              className={template.id === selectedTemplateId ? "bg-accent" : ""}
            >
              <span className="h-4 w-4 mr-2" style={{ backgroundColor: template.primaryColor, borderRadius: '50%' }} />
              <span>{template.name}</span>
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>
              No templates available
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            if (invoice && navigator.clipboard) {
              navigator.clipboard.writeText(`Invoice #${invoice.id} - Amount: ₹${invoice.total?.toFixed(2) || '0.00'}`);
              toast.success("Invoice details copied to clipboard");
            }
          }}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Copy Details</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
