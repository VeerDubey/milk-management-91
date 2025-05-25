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
import { 
  Loader2, 
  Download, 
  Printer, 
  RefreshCw, 
  Share2,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useInvoices } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useData } from '@/contexts/data/DataContext';
import { ElectronService } from '@/services/ElectronService';

interface InvoicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
}

export default function InvoicePreviewDialog({ isOpen, onClose, invoiceId }: InvoicePreviewDialogProps) {
  const { getInvoiceById, generateInvoicePreview, downloadInvoice, printInvoice, templates } = useInvoices();
  const { customers, products } = useData();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && invoiceId) {
      refreshPreview();
    }
  }, [isOpen, invoiceId, selectedTemplateId]);
  
  const refreshPreview = async () => {
    if (!isOpen || !invoiceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      // Log the invoice data to help with debugging
      console.log('Invoice to preview:', invoice);
      
      const preview = await generateInvoicePreview(invoice, selectedTemplateId);
      setPreviewUrl(preview);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview. Please try again.');
      
      // Try a fallback approach - create HTML preview
      try {
        const invoice = getInvoiceById(invoiceId);
        if (!invoice) throw new Error('Invoice not found');
        
        const customer = customers.find(c => c.id === invoice.customerId);
        
        // Generate a simple HTML preview
        const html = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Invoice ${invoice.id || invoice.number}</h1>
                <div>
                  <p>Date: ${invoice.date || 'N/A'}</p>
                  <p>Due Date: ${invoice.dueDate || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3>Customer: ${customer?.name || invoice.customerName || 'N/A'}</h3>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${(invoice.items || []).map((item, i) => {
                    const product = products.find(p => p.id === item.productId);
                    return `
                      <tr>
                        <td>${product?.name || item.description || item.productId || `Item ${i+1}`}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
                        <td>₹${item.amount?.toFixed(2) || '0.00'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right"><strong>Total:</strong></td>
                    <td><strong>₹${invoice.total?.toFixed(2) || '0.00'}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </body>
          </html>
        `;
        
        // Convert HTML to data URL
        const encodedHtml = encodeURIComponent(html);
        const fallbackUrl = `data:text/html;charset=utf-8,${encodedHtml}`;
        
        setPreviewUrl(fallbackUrl);
        setError('Using simplified preview mode due to an error with the PDF generator.');
      } catch (fallbackErr) {
        console.error('Fallback preview also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    setIsActionInProgress(true);
    try {
      await downloadInvoice(invoiceId, selectedTemplateId);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice');
      console.error('Download error:', err);
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  const handlePrint = async () => {
    setIsActionInProgress(true);
    try {
      await printInvoice(invoiceId, selectedTemplateId);
      toast.success('Invoice sent to printer');
    } catch (err) {
      toast.error('Failed to print invoice');
      console.error('Print error:', err);
    } finally {
      setIsActionInProgress(false);
    }
  };
  
  const handleShare = async () => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;
    
    const customer = customers.find(c => c.id === invoice.customerId);
    
    const shareData = {
      title: `Invoice #${invoice.id}`,
      text: `Invoice #${invoice.id} for ${customer?.name || 'Customer'} - Amount: ₹${invoice.total?.toFixed(2) || '0.00'}`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Invoice shared successfully');
      } else {
        // Fallback to clipboard
        await ElectronService.system.copyToClipboard(shareData.text);
        toast.success('Invoice details copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };
  
  const handleSendEmail = () => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;
    
    const customer = customers.find(c => c.id === invoice.customerId);
    if (!customer?.email) {
      toast.error('Customer email not available');
      return;
    }
    
    // In a real implementation, this would integrate with your email system
    toast.success(`Ready to send email to ${customer.email}`);
  };
  
  const renderInvoiceDetails = () => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return <p>Invoice not found</p>;
    
    const customer = customers.find(c => c.id === invoice.customerId);
    
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Invoice Details</h3>
            <p className="text-lg font-medium">Invoice #{invoice.number || invoice.id}</p>
            <p className="text-sm">Date: {invoice.date || 'N/A'}</p>
            <p className="text-sm">Due Date: {invoice.dueDate || 'N/A'}</p>
            <p className="text-sm">Status: <span className={
              invoice.status === 'paid' ? 'text-green-500' : 
              invoice.status === 'overdue' ? 'text-red-500' : 
              'text-yellow-500'
            }>{invoice.status || 'Pending'}</span></p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
            <p className="text-lg font-medium">{customer?.name || 'Unknown Customer'}</p>
            <p className="text-sm">{customer?.email || 'No email available'}</p>
            <p className="text-sm">{customer?.phone || 'No phone available'}</p>
            <p className="text-sm whitespace-pre-line">{customer?.address || 'No address available'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-center">Rate</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <tr key={index} className="border-t">
                      <td className="p-2">{product?.name || item.description || item.productId}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
                      <td className="p-2 text-right">₹{item.amount?.toFixed(2) || '0.00'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-muted/50">
                <tr>
                  <td colSpan={3} className="p-2 text-right font-medium">Total:</td>
                  <td className="p-2 text-right font-medium">₹{invoice.total?.toFixed(2) || '0.00'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {invoice.notes && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
            <p className="text-sm whitespace-pre-line p-2 bg-muted/30 rounded-md">{invoice.notes}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invoice {invoiceId}</DialogTitle>
          <DialogDescription>
            Preview and manage your invoice
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="flex-1 h-full">
              <div className="h-full bg-gray-100 rounded-md overflow-hidden relative">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <span>Generating preview...</span>
                  </div>
                ) : error ? (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                    <p className="text-amber-500 mb-2 text-center">{error}</p>
                    {previewUrl ? (
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Using simplified preview mode
                      </p>
                    ) : (
                      <Button onClick={refreshPreview} variant="outline" className="mt-2">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    )}
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
                
                {!isLoading && previewUrl && (
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-md p-1 shadow">
                    <select 
                      className="text-xs p-1 border rounded"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value || undefined)}
                    >
                      <option value="">Default Template</option>
                      {templates && templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="flex-1">
              <div className="bg-white rounded-md border h-full overflow-y-auto">
                {renderInvoiceDetails()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              if (getInvoiceById(invoiceId)) {
                handleShare();
              } else {
                toast.error("Invoice not found");
              }
            }}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              if (getInvoiceById(invoiceId)) {
                handleSendEmail();
              } else {
                toast.error("Invoice not found");
              }
            }}>
              <Send className="h-4 w-4 mr-1" />
              Email
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (getInvoiceById(invoiceId)) {
                  handlePrint();
                } else {
                  toast.error("Invoice not found");
                }
              }} 
              disabled={isLoading || !previewUrl || isActionInProgress}
            >
              {isActionInProgress ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              Print
            </Button>
            <Button 
              onClick={() => {
                if (getInvoiceById(invoiceId)) {
                  handleDownload();
                } else {
                  toast.error("Invoice not found");
                }
              }} 
              disabled={isLoading || isActionInProgress}
            >
              {isActionInProgress ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
