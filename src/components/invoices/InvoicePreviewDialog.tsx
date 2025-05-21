
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Download, Printer } from 'lucide-react';
import { useInvoices } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';

interface InvoicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
}

export default function InvoicePreviewDialog({ isOpen, onClose, invoiceId }: InvoicePreviewDialogProps) {
  const { getInvoiceById, generateInvoicePreview, downloadInvoice, templates } = useInvoices();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && invoiceId) {
      setIsLoading(true);
      setError(null);
      
      const generatePreview = async () => {
        try {
          const invoice = getInvoiceById(invoiceId);
          if (!invoice) {
            throw new Error('Invoice not found');
          }
          
          const preview = await generateInvoicePreview(invoice);
          setPreviewUrl(preview);
        } catch (err) {
          console.error('Error generating preview:', err);
          setError('Failed to generate preview. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      generatePreview();
    }
  }, [isOpen, invoiceId, generateInvoicePreview, getInvoiceById]);
  
  const handleDownload = async () => {
    try {
      await downloadInvoice(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice');
      console.error('Download error:', err);
    }
  };
  
  const handlePrint = () => {
    if (!previewUrl) return;
    
    const printWindow = window.open(previewUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
    } else {
      toast.error('Could not open print window. Please allow popups.');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Preview your invoice before downloading or printing
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 h-[60vh] bg-gray-100 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generating preview...</span>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => onClose()} variant="outline">Close</Button>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Invoice Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onClose()}>
            Close
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            disabled={isLoading || !previewUrl}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
