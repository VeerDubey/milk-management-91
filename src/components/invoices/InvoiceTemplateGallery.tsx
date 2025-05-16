import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvoice } from '@/contexts/InvoiceContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceTemplateGalleryProps {
  onSelect?: (templateId: string) => void;
  className?: string;
  showPreviewOption?: boolean;
  previewInvoiceId?: string;
}

export default function InvoiceTemplateGallery({ 
  onSelect, 
  className = '',
  showPreviewOption = false,
  previewInvoiceId,
}: InvoiceTemplateGalleryProps) {
  const { selectedTemplateId, setSelectedTemplateId, generateInvoicePreview, getInvoiceById, templates } = useInvoice();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedTemplateId);
  
  const handleSelect = (id: string) => {
    setSelectedTemplate(id);
    setSelectedTemplateId(id);
    if (onSelect) {
      onSelect(id);
    }
  };
  
  const handlePreview = (templateId: string) => {
    if (!previewInvoiceId) return;
    
    const invoice = getInvoiceById(previewInvoiceId);
    if (!invoice) return;
    
    try {
      // We need to override the current template ID for the preview
      const previewWithTemplate = generateInvoicePreview(invoice, templateId);
      setPreviewUrl(previewWithTemplate);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error generating invoice preview:', error);
    }
  };
  
  return (
    <div className={className}>
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
                <CardTitle className="font-medium text-lg">{template.name}</CardTitle>
                {selectedTemplate === template.id && (
                  <div className="bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{template.description}</p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="aspect-[1/1.414] bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-50"
                  style={{ backgroundColor: template.primaryColor }} 
                />
                <div className="z-10 text-white font-medium flex flex-col items-center justify-center">
                  <Palette className="h-8 w-8 mb-2" />
                  <span>Template Preview</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: template.primaryColor }}
                />
                <span className="text-xs text-muted-foreground">{template.fontFamily}</span>
              </div>
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
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview With Invoice
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
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-100 rounded-md h-full">
            {previewUrl && (
              <iframe 
                src={previewUrl}
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
