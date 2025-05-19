
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Save, Download, FileText, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between print:hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Track Sheet</h1>
        <p className="text-muted-foreground">
          Manage delivery routes and track daily sales
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => navigate('/track-sheet-history')}>
          View History
        </Button>
        <Button variant="outline" onClick={onOpenSaveDialog}>
          <Save className="mr-2 h-4 w-4" />
          {selectedTemplate ? "Update Template" : "Save Template"}
        </Button>
        <Button variant="outline" onClick={onExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Excel
        </Button>
        <Button variant="outline" onClick={onExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
