import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useInvoice } from '@/contexts/InvoiceContext';

interface InvoiceDownloadButtonProps {
  invoiceId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function InvoiceDownloadButton({ 
  invoiceId, 
  variant = "default", 
  size = "default",
  className = ""
}: InvoiceDownloadButtonProps) {
  const { downloadInvoice, selectedTemplateId, templates } = useInvoice();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = async (templateId?: string) => {
    setIsDownloading(true);
    try {
      await downloadInvoice(invoiceId);
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            disabled={isDownloading}
            className="flex items-center"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select Template</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Quick download with selected template */}
          <DropdownMenuItem onClick={() => handleDownload()}>
            <Download className="h-4 w-4 mr-2" />
            <span>Download with Current Template</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Download with specific template */}
          {templates.map(template => (
            <DropdownMenuItem 
              key={template.id} 
              onClick={() => handleDownload(template.id)}
              className={template.id === selectedTemplateId ? "bg-accent" : ""}
            >
              <span className="h-4 w-4 mr-2" style={{ backgroundColor: template.primaryColor, borderRadius: '50%' }} />
              <span>{template.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
