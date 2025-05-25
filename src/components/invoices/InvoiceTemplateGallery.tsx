
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/contexts/InvoiceContext';
import { useData } from '@/contexts/data/DataContext';
import { Eye, Download, Check, Palette } from 'lucide-react';
import { toast } from 'sonner';
import InvoicePreviewDialog from './InvoicePreviewDialog';

interface InvoiceTemplateGalleryProps {
  showPreviewOption?: boolean;
  previewInvoiceId?: string;
}

export default function InvoiceTemplateGallery({ 
  showPreviewOption = false, 
  previewInvoiceId 
}: InvoiceTemplateGalleryProps) {
  const { templates, selectedTemplateId, setSelectedTemplateId, invoices } = useInvoices();
  const { customers } = useData();
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewInvoiceForDialog, setPreviewInvoiceForDialog] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    toast.success(`Template "${templates.find(t => t.id === templateId)?.name}" selected`);
  };

  const handlePreviewWithInvoice = (templateId: string) => {
    // Use provided previewInvoiceId or find the first available invoice
    let invoiceToPreview = previewInvoiceId;
    
    if (!invoiceToPreview && invoices.length > 0) {
      invoiceToPreview = invoices[0].id;
    }
    
    if (!invoiceToPreview) {
      // Create a sample invoice for preview
      const sampleInvoice = {
        id: 'SAMPLE-001',
        number: 'SAMPLE-001',
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: customers[0]?.id || 'sample-customer',
        customerName: customers[0]?.name || 'Sample Customer',
        items: [
          {
            productId: 'sample-product',
            description: 'Sample Product',
            quantity: 2,
            unitPrice: 100,
            amount: 200
          }
        ],
        subtotal: 200,
        taxRate: 18,
        taxAmount: 36,
        total: 236,
        status: 'draft' as const,
        notes: 'This is a sample invoice for preview',
        termsAndConditions: 'Sample terms and conditions',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Temporarily add to invoices for preview
      invoiceToPreview = sampleInvoice.id;
    }
    
    // Set the template first, then open preview
    setSelectedTemplateId(templateId);
    setPreviewInvoiceForDialog(invoiceToPreview);
    setPreviewDialogOpen(true);
  };

  if (!templates || templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Templates Available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            No invoice templates are currently available. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {selectedTemplateId === template.id && (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-white border rounded-md p-4 shadow-sm">
                <div className="h-full flex flex-col text-xs">
                  <div 
                    className="border-b-2 pb-2 mb-2"
                    style={{ borderColor: template.primaryColor }}
                  >
                    <div 
                      className="font-bold text-sm"
                      style={{ color: template.primaryColor }}
                    >
                      INVOICE
                    </div>
                    <div className="text-gray-600 mt-1">
                      Company Name<br />
                      Address Line
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-2">
                      <div className="font-medium">Bill To:</div>
                      <div className="text-gray-600">Customer Name</div>
                    </div>
                    
                    <div className="border border-gray-200 rounded">
                      <div 
                        className="p-1 text-white text-xs font-medium"
                        style={{ backgroundColor: template.primaryColor }}
                      >
                        Items
                      </div>
                      <div className="p-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Product 1</span>
                          <span>₹100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Product 2</span>
                          <span>₹200</span>
                        </div>
                      </div>
                      <div 
                        className="p-1 border-t font-medium flex justify-between"
                        style={{ backgroundColor: template.primaryColor + '10' }}
                      >
                        <span>Total:</span>
                        <span>₹300</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                  <span className="text-sm text-gray-600">
                    {template.primaryColor}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Font: {template.fontFamily}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant={selectedTemplateId === template.id ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {selectedTemplateId === template.id ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Selected
                    </>
                  ) : (
                    'Select'
                  )}
                </Button>
                
                {showPreviewOption && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewWithInvoice(template.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      {previewDialogOpen && previewInvoiceForDialog && (
        <InvoicePreviewDialog
          isOpen={previewDialogOpen}
          onClose={() => {
            setPreviewDialogOpen(false);
            setPreviewInvoiceForDialog(null);
          }}
          invoiceId={previewInvoiceForDialog}
        />
      )}
    </>
  );
}
