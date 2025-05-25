
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ElectronService } from '@/services/ElectronService';

interface InvoicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
  pdfBlob?: Blob;
}

export function InvoicePreviewDialogSafe({ 
  isOpen, 
  onClose, 
  invoiceData,
  pdfBlob 
}: InvoicePreviewDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDownload = async () => {
    if (!pdfBlob) {
      toast.error('No PDF data available');
      return;
    }

    try {
      setIsDownloading(true);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData?.invoiceNumber || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (!pdfBlob) {
      toast.error('No PDF data available');
      return;
    }

    try {
      setPrinting(true);
      
      // Open print window
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success('Print dialog opened');
      } else {
        toast.error('Failed to open print window');
      }
      
      // Clean up after delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print invoice');
    } finally {
      setPrinting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const invoiceText = `Invoice #${invoiceData?.invoiceNumber || 'N/A'} - Generated on ${new Date().toLocaleDateString()}`;
      await navigator.clipboard.writeText(invoiceText);
      toast.success('Invoice details copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Invoice Preview
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {pdfBlob ? (
            <iframe
              src={URL.createObjectURL(pdfBlob)}
              className="w-full h-96 border rounded"
              title="Invoice Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !pdfBlob}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          
          <Button
            onClick={handlePrint}
            disabled={isPrinting || !pdfBlob}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
          
          <Button
            onClick={handleCopyLink}
            disabled={!pdfBlob}
            variant="outline"
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
