
import React, { useState, useEffect } from 'react';
import { TrackSheetHeader } from '@/components/track-sheet/TrackSheetHeader';
import { TrackSheetDetails } from '@/components/track-sheet/TrackSheetDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/data/DataContext';
import { format } from 'date-fns';
import { TrackSheetAnalytics } from '@/components/track-sheet/TrackSheetAnalytics';
import { SaveTemplateDialog } from '@/components/track-sheet/SaveTemplateDialog';
import { Button } from '@/components/ui/button';
import { SaveIcon, FileIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { generateTrackSheetPdf, exportTrackSheetToExcel, savePdf, saveExcel } from '@/utils/trackSheetUtils';
import { TrackSheet as TrackSheetType } from '@/types';

const TrackSheet: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  
  const { 
    trackSheets,
    trackSheetTemplates,
    customers, 
    products,
    vehicles,
    salesmen,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet,
    saveTrackSheetTemplate
  } = useData();

  const productNames = products.map(product => product.name);
  
  const handleSaveTemplate = (name: string) => {
    if (!currentSheetId) return;
    
    const currentSheet = trackSheets.find(sheet => sheet.id === currentSheetId);
    if (!currentSheet) return;
    
    saveTrackSheetTemplate({
      name,
      date: format(new Date(), 'yyyy-MM-dd'),
      rows: currentSheet.rows,
      vehicleId: currentSheet.vehicleId,
      salesmanId: currentSheet.salesmanId,
      routeName: currentSheet.routeName,
      vehicleName: currentSheet.vehicleName,
      salesmanName: currentSheet.salesmanName
    });
    
    setShowSaveDialog(false);
    toast.success('Template saved successfully');
  };
  
  const handleExportPdf = (trackSheet: TrackSheetType) => {
    try {
      const doc = generateTrackSheetPdf(trackSheet, productNames, customers);
      savePdf(doc, `track-sheet-${trackSheet.date}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF', error);
      toast.error('Failed to export PDF');
    }
  };
  
  const handleExportExcel = (trackSheet: TrackSheetType) => {
    try {
      const workbook = exportTrackSheetToExcel(trackSheet, productNames);
      saveExcel(workbook, `track-sheet-${trackSheet.date}.xlsx`);
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Failed to export Excel', error);
      toast.error('Failed to export Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Track Sheet</h1>
        <div className="flex items-center gap-2">
          {currentSheetId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
              >
                <SaveIcon className="mr-2 h-4 w-4" />
                Save as Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const sheet = trackSheets.find(s => s.id === currentSheetId);
                  if (sheet) handleExportPdf(sheet);
                }}
              >
                <FileIcon className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const sheet = trackSheets.find(s => s.id === currentSheetId);
                  if (sheet) handleExportExcel(sheet);
                }}
              >
                <FileIcon className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create Track Sheet</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Daily Track Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackSheetHeader 
                trackSheets={trackSheets}
                templates={trackSheetTemplates}
                vehicles={vehicles}
                salesmen={salesmen}
                onCurrentSheetChange={setCurrentSheetId}
              />
            </CardContent>
          </Card>
          
          {currentSheetId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackSheetDetails 
                  sheetId={currentSheetId}
                  customers={customers}
                  products={products}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Track Sheet History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackSheets.length === 0 ? (
                  <p>No track sheets available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trackSheets.map((sheet) => (
                      <Card key={sheet.id} className="bg-card hover:bg-accent/10 cursor-pointer" onClick={() => {
                        setCurrentSheetId(sheet.id);
                        setActiveTab('create');
                      }}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{format(new Date(sheet.date), 'dd MMM yyyy')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            <p><span className="font-medium">Vehicle:</span> {sheet.vehicleName || 'N/A'}</p>
                            <p><span className="font-medium">Salesman:</span> {sheet.salesmanName || 'N/A'}</p>
                            <p><span className="font-medium">Customers:</span> {sheet.rows.length}</p>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation();
                              handleExportPdf(sheet);
                            }}>
                              <FileIcon className="h-4 w-4" />
                              <span className="sr-only">Export PDF</span>
                            </Button>
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation();
                              handleExportExcel(sheet);
                            }}>
                              <FileIcon className="h-4 w-4" />
                              <span className="sr-only">Export Excel</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Track Sheet Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackSheetAnalytics 
                trackSheets={trackSheets} 
                products={products}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SaveTemplateDialog 
        open={showSaveDialog} 
        onOpenChange={setShowSaveDialog}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};

export default TrackSheet;
