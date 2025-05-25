import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { ElectronService } from '@/services/ElectronService';

interface InvoicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
  pdfBlob?: Blob;
}

export default function InvoicePreviewDialog({ 
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
      const dataUrl = URL.createObjectURL(pdfBlob);
      const filename = `invoice-${invoiceData?.invoiceNumber || 'unknown'}.pdf`;
      
      const result = await ElectronService.downloadInvoice(dataUrl, filename);
      
      if (result.success) {
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error(result.error || 'Failed to download invoice');
      }
      
      URL.revokeObjectURL(dataUrl);
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
      setIsPrinting(true);
      const dataUrl = URL.createObjectURL(pdfBlob);
      
      const result = await ElectronService.printInvoice(dataUrl);
      
      if (result.success) {
        toast.success('Print dialog opened');
      } else {
        toast.error(result.error || 'Failed to print invoice');
      }
      
      URL.revokeObjectURL(dataUrl);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print invoice');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!pdfBlob) {
      toast.error('No PDF data available');
      return;
    }

    try {
      const dataUrl = URL.createObjectURL(pdfBlob);
      const result = await ElectronService.copyToClipboard(dataUrl);
      
      if (result.success) {
        toast.success('Invoice link copied to clipboard');
      } else {
        toast.error('Failed to copy to clipboard');
      }
      
      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(dataUrl), 5000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy invoice link');
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
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
