
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2 } from "lucide-react";
import { StorageService } from "@/services/StorageService";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle, 
} from "@/components/ui/alert-dialog";

export function DataBackupRestore() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const success = await StorageService.exportAllData();
      if (!success) {
        toast.error("Failed to export data. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An unexpected error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImport = async () => {
    setIsImporting(true);
    try {
      const success = await StorageService.importData();
      if (!success) {
        toast.error("Failed to import data. Please try again.");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An unexpected error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClearData = () => {
    try {
      const success = StorageService.clearAllData();
      if (success) {
        setShowClearDialog(false);
      } else {
        toast.error("Failed to clear data. Please try again.");
      }
    } catch (error) {
      console.error("Clear data error:", error);
      toast.error("An unexpected error occurred while clearing data.");
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Backup & Restore</CardTitle>
          <CardDescription>Export or import your application data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Backup Data</h3>
              <p className="text-sm text-muted-foreground">
                Export all your data to a backup file that you can use to restore later.
              </p>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Restore Data</h3>
              <p className="text-sm text-muted-foreground">
                Import data from a previously created backup file.
              </p>
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </div>
            
            <div className="flex flex-col gap-2 pt-4 border-t">
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Clear all application data. This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setShowClearDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all your data. This includes customers, products, orders, invoices, and settings.
              <p className="font-semibold mt-2">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
