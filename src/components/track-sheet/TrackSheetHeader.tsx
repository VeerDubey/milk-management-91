
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Save, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface TrackSheetHeaderProps {
  selectedTemplate: string | null;
  onOpenSaveDialog: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
}

export function TrackSheetHeader({ 
  selectedTemplate, 
  onOpenSaveDialog,
  onExportExcel,
  onExportPdf,
  onPrint
}: TrackSheetHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Sheet</h1>
        <p className="text-muted-foreground">
          {selectedTemplate ? 
            'Edit your saved track sheet template' : 
            'Create and manage daily product distribution tracking sheets'}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={onOpenSaveDialog} variant="outline">
          <Save className="mr-2 h-4 w-4" />
          {selectedTemplate ? 'Save Changes' : 'Save as Template'}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
