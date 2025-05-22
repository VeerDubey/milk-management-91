
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download,
  ChevronDown,
  Loader2,
  FileText,
  Printer
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
  
  if (isDownloading || isPrinting) {
    return (
      <Button 
        variant={variant} 
        size={size}
        disabled
        className={`flex items-center ${className}`}
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {isDownloading ? 'Downloading...' : 'Printing...'}
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
          {/* Quick download with selected template */}
          <DropdownMenuItem onClick={() => handleDownload()}>
            <Download className="h-4 w-4 mr-2" />
            <span>Download with Current Template</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePrint()}>
            <Printer className="h-4 w-4 mr-2" />
            <span>Print with Current Template</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Download with Template</DropdownMenuLabel>
          {/* Download with specific template */}
          {templates.length > 0 ? templates.map(template => (
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
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => {
            if (invoice && navigator.clipboard) {
              navigator.clipboard.writeText(`Invoice #${invoice.id} - Amount: ₹${invoice.total?.toFixed(2) || '0.00'}`);
              toast.success("Invoice details copied to clipboard");
            }
          }}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Copy Invoice Details</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
