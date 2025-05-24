
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OfflineStorageService } from '@/services/OfflineStorageService';

export function OfflineBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportData = await OfflineStorageService.exportAllData();
      
      // Create and download file using web APIs
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `milk-center-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      await OfflineStorageService.importAllData(text);
      
      toast.success('Data imported successfully! Please refresh the page.');
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateAutoBackup = async () => {
    try {
      await OfflineStorageService.createAutoBackup();
      toast.success('Auto-backup created successfully!');
    } catch (error) {
      console.error('Auto-backup failed:', error);
      toast.error('Failed to create auto-backup');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Offline Data Management
        </CardTitle>
        <CardDescription>
          Export and import your data for backup and transfer purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Export Data</Label>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-file">Import Data</Label>
            <div className="relative">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={isImporting}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
              />
              {isImporting && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <span className="text-sm">Importing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <Button 
            onClick={handleCreateAutoBackup}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            <Database className="mr-2 h-4 w-4" />
            Create Auto-Backup
          </Button>
        </div>
        
        <div className="flex items-start space-x-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded">
          <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">PWA Storage Active</p>
            <p>Your data is stored locally in your browser and works offline.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
