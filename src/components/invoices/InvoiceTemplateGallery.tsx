
import React, { useState } from 'react';
import { useInvoices } from '@/contexts/InvoiceContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import InvoicePreviewDialog from './InvoicePreviewDialog';

interface InvoiceTemplateGalleryProps {
  showPreviewOption?: boolean;
  previewInvoiceId?: string;
}

const InvoiceTemplateGallery: React.FC<InvoiceTemplateGalleryProps> = ({
  showPreviewOption = false,
  previewInvoiceId
}) => {
  const { templates, selectedTemplateId, setSelectedTemplateId } = useInvoices();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    toast.success(`Template "${templates[templateId].name}" selected as default`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    if (!previewInvoiceId) {
      toast.error("No invoice selected for preview");
      return;
    }
    
    setPreviewTemplateId(templateId);
    setIsPreviewOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([id, template]) => (
          <Card key={id} className={`overflow-hidden ${selectedTemplateId === id ? 'ring-2 ring-primary' : ''}`}>
            <div className="aspect-[8.5/11] bg-muted/20 relative">
              {/* Template preview image */}
              <img 
                src={template.previewImage || '/placeholder.svg'} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
              
              {selectedTemplateId === id && (
                <div className="absolute top-2 right-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Current
                  </span>
                </div>
              )}
            </div>
            
            <CardContent className="pt-4">
              <h3 className="font-medium text-lg">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardContent>
            
            <CardFooter className="flex gap-2 justify-end">
              {showPreviewOption && previewInvoiceId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreviewTemplate(id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant={selectedTemplateId === id ? "outline" : "default"}
                onClick={() => handleSelectTemplate(id)}
              >
                {selectedTemplateId === id ? 'Selected' : 'Select Template'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {showPreviewOption && previewInvoiceId && (
        <InvoicePreviewDialog 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          invoiceId={previewInvoiceId}
        />
      )}
    </div>
  );
};

export default InvoiceTemplateGallery;
