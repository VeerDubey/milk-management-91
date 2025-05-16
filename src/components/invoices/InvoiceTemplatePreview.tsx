
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useInvoice } from '@/contexts/InvoiceContext';

interface InvoiceTemplatePreviewProps {
  onSelect?: (templateId: string) => void;
  className?: string;
}

export default function InvoiceTemplatePreview({ onSelect, className = '' }: InvoiceTemplatePreviewProps) {
  const { templates, selectedTemplateId, setSelectedTemplateId } = useInvoice();
  
  const handleSelect = (id: string) => {
    setSelectedTemplateId(id);
    if (onSelect) {
      onSelect(id);
    }
  };
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {templates.map(template => (
        <Card 
          key={template.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTemplateId === template.id ? 'ring-2 ring-primary' : 'hover:border-primary'
          }`}
          onClick={() => handleSelect(template.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{template.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{template.description}</p>
              </div>
              {selectedTemplateId === template.id && (
                <div className="bg-primary rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div 
              className="mt-4 h-40 rounded-md flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: template.primaryColor + '33' }} // Add transparency
            >
              <div className="z-10 font-medium flex flex-col items-center justify-center">
                <div className="w-3/4 h-2 bg-white/80 mb-2 rounded"></div>
                <div className="w-1/2 h-2 bg-white/80 mb-4 rounded"></div>
                <div className="w-5/6 h-1 bg-white/60 mb-1 rounded"></div>
                <div className="w-5/6 h-1 bg-white/60 mb-1 rounded"></div>
                <div className="w-5/6 h-1 bg-white/60 mb-1 rounded"></div>
                <div className="w-1/3 h-2 bg-white/80 mt-2 rounded"></div>
              </div>
            </div>
            
            <div className="mt-3 flex gap-2 items-center">
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: template.primaryColor }}
              />
              <span className="text-xs text-muted-foreground">
                {template.fontFamily}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
