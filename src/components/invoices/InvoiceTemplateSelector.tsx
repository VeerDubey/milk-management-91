
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Palette } from 'lucide-react';
import { useInvoices } from '@/contexts/InvoiceContext';

interface InvoiceTemplateSelectorProps {
  onSelect?: (templateId: string) => void;
  className?: string;
}

export default function InvoiceTemplateSelector({ onSelect, className = '' }: InvoiceTemplateSelectorProps) {
  const { selectedTemplateId, setSelectedTemplateId, templates } = useInvoices();
  
  const handleSelect = (id: string) => {
    setSelectedTemplateId(id);
    if (onSelect) {
      onSelect(id);
    }
  };
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
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
            <div className="mt-4 aspect-[1/1.414] bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
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
        </Card>
      ))}
    </div>
  );
}
