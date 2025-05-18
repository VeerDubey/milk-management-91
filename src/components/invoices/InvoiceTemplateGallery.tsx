import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette, EyeIcon, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvoice } from '@/contexts/InvoiceContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface InvoiceTemplateGalleryProps {
  onSelect?: (templateId: string) => void;
  className?: string;
  showPreviewOption?: boolean;
  previewInvoiceId?: string;
  showControls?: boolean;
}

export default function InvoiceTemplateGallery({ 
  onSelect, 
  className = '',
  showPreviewOption = false,
  previewInvoiceId,
  showControls = true
}: InvoiceTemplateGalleryProps) {
  const { selectedTemplateId, setSelectedTemplateId, generateInvoicePreview, getInvoiceById, templates } = useInvoice();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedTemplateId);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  
  const handleSelect = (id: string) => {
    setSelectedTemplate(id);
    setSelectedTemplateId(id);
    if (onSelect) {
      onSelect(id);
    }
    toast.success(`Template "${templates.find(t => t.id === id)?.name}" selected`);
  };
  
  const handlePreview = async (templateId: string) => {
    if (!previewInvoiceId) {
      toast.error("No invoice selected for preview");
      return;
    }
    
    const invoice = getInvoiceById(previewInvoiceId);
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // We need to override the current template ID for the preview
      const previewWithTemplate = await generateInvoicePreview(invoice, templateId);
      setPreviewUrl(previewWithTemplate);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating invoice preview:', error);
      toast.error("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {showControls && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Invoice Templates</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="advanced-options"
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
              />
              <Label htmlFor="advanced-options">Show Advanced Options</Label>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:border-primary'
            }`}
            onClick={() => handleSelect(template.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-medium text-lg flex items-center gap-2">
                    {template.name}
                    {template.id === 'professional' && (
                      <Badge variant="outline" className="text-xs ml-2">Premium</Badge>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div 
                className="aspect-[1/1.414] rounded-md flex items-center justify-center relative overflow-hidden bg-card"
              >
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundColor: template.primaryColor }} 
                />
                <div 
                  className="absolute inset-0 p-4 flex flex-col opacity-80"
                  style={{
                    fontFamily: template.fontFamily,
                    color: template.primaryColor
                  }}
                >
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: template.primaryColor }}>Invoice</div>
                  <div className="text-lg font-bold mb-4" style={{ color: template.primaryColor }}>
                    Invoice #INV-2023-001
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span>Item</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Product A</span>
                    <span>₹5,000.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Product B</span>
                    <span>₹3,500.00</span>
                  </div>
                  <div className="mt-auto pt-2 border-t border-dashed flex justify-between font-bold text-sm">
                    <span>Total</span>
                    <span>₹8,500.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: template.primaryColor }}
                />
                <span className="text-xs text-muted-foreground">{template.fontFamily}</span>
              </div>
              
              {showAdvancedOptions && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">Header:</div>
                  <div>
                    {template.showHeader ? (
                      <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Visible</span>
                    ) : (
                      <span>Hidden</span>
                    )}
                  </div>
                  
                  <div className="text-muted-foreground">Footer:</div>
                  <div>
                    {template.showFooter ? (
                      <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Visible</span>
                    ) : (
                      <span>Hidden</span>
                    )}
                  </div>
                  
                  <div className="text-muted-foreground">Layout:</div>
                  <div>
                    {template.id === 'detailed' ? 'Landscape' : 'Portrait'}
                  </div>
                </div>
              )}
            </CardContent>
            {showPreviewOption && previewInvoiceId && (
              <CardFooter>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(template.id);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview With Invoice
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Invoice Preview with Selected Template</DialogTitle>
            <DialogDescription>
              This is a preview of how your invoice will look with the selected template
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-background rounded-md h-full">
            {previewUrl ? (
              <iframe 
                src={previewUrl}
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={() => setSelectedTemplateId(selectedTemplate)}>
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
