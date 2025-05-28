
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackSheetDetails } from '@/components/track-sheet/TrackSheetDetails';
import { TrackSheetConverter } from '@/components/track-sheet/TrackSheetConverter';
import { Printer, Calendar, FileSpreadsheet, Search, Plus, FileDown, FileText, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateAdvancedTrackSheetPdf, secureDownloadPdf, exportAdvancedTrackSheetToCSV, printAdvancedTrackSheet } from '@/utils/advancedPdfUtils';

export default function TrackSheetHistory() {
  const navigate = useNavigate();
  const { trackSheets, vehicles, salesmen } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  
  // Filter track sheets based on search criteria
  const filteredSheets = trackSheets.filter(sheet => {
    // Filter by search term
    const matchesSearch = sheet.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sheet.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date if selected
    let matchesDate = true;
    if (selectedDate) {
      const sheetDate = new Date(sheet.date);
      matchesDate = sheetDate.toDateString() === selectedDate.toDateString();
    }
    
    // Filter by vehicle if selected
    const matchesVehicle = !selectedVehicle || sheet.vehicleId === selectedVehicle;
    
    // Filter by salesman if selected
    const matchesSalesman = !selectedSalesman || sheet.salesmanId === selectedSalesman;
    
    return matchesSearch && matchesDate && matchesVehicle && matchesSalesman;
  });
  
  // Handle creating a new track sheet
  const handleCreateNew = () => {
    navigate('/track-sheet-advanced');
  };
  
  // Handle export to PDF with enhanced functionality
  const handleExportPdf = async (trackSheet: any) => {
    try {
      const productNames: string[] = [];
      
      // Get all product names from the track sheet rows
      trackSheet.rows.forEach((row: any) => {
        if (row.quantities) {
          Object.keys(row.quantities).forEach(name => {
            if (!productNames.includes(name)) {
              productNames.push(name);
            }
          });
        }
      });
      
      // Generate and download the PDF using advanced utils
      const doc = generateAdvancedTrackSheetPdf(trackSheet, productNames);
      const filename = `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}-${trackSheet.name || 'sheet'}.pdf`;
      
      const success = secureDownloadPdf(doc, filename);
      if (success) {
        toast.success('Track sheet exported to PDF successfully');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting PDF');
    }
  };

  // Handle print functionality
  const handlePrint = async (trackSheet: any) => {
    try {
      const productNames: string[] = [];
      
      // Get all product names from the track sheet rows
      trackSheet.rows.forEach((row: any) => {
        if (row.quantities) {
          Object.keys(row.quantities).forEach(name => {
            if (!productNames.includes(name)) {
              productNames.push(name);
            }
          });
        }
      });
      
      const success = printAdvancedTrackSheet(trackSheet, productNames);
      if (success) {
        toast.success('Print dialog opened');
      } else {
        toast.error('Failed to open print dialog');
      }
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Error printing track sheet');
    }
  };

  // Handle CSV export
  const handleExportCsv = async (trackSheet: any) => {
    try {
      const productNames: string[] = [];
      
      // Get all product names from the track sheet rows
      trackSheet.rows.forEach((row: any) => {
        if (row.quantities) {
          Object.keys(row.quantities).forEach(name => {
            if (!productNames.includes(name)) {
              productNames.push(name);
            }
          });
        }
      });
      
      const success = exportAdvancedTrackSheetToCSV(trackSheet, productNames);
      if (success) {
        toast.success('Track sheet exported to CSV successfully');
      } else {
        toast.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error exporting CSV');
    }
  };

  // Preview function
  const handlePreview = async (trackSheet: any) => {
    try {
      const productNames: string[] = [];
      
      trackSheet.rows.forEach((row: any) => {
        if (row.quantities) {
          Object.keys(row.quantities).forEach(name => {
            if (!productNames.includes(name)) {
              productNames.push(name);
            }
          });
        }
      });
      
      const doc = generateAdvancedTrackSheetPdf(trackSheet, productNames);
      const pdfUrl = doc.output('bloburl');
      window.open(pdfUrl, '_blank');
      toast.success('Preview opened in new tab');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Error generating preview');
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">Track Sheet History</h1>
          <p className="text-muted-foreground">
            View and manage your delivery track sheets with advanced features
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNew} className="aurora-button">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 aurora-card">
          <TabsTrigger value="history" className="data-[state=active]:bg-aurora-gradient data-[state=active]:text-white">History</TabsTrigger>
          <TabsTrigger value="convert" className="data-[state=active]:bg-aurora-gradient data-[state=active]:text-white">Convert Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card className="aurora-card">
            <CardHeader>
              <CardTitle className="text-gradient-aurora">Filter Track Sheets</CardTitle>
              <CardDescription>
                Search and filter your track sheets by date, vehicle, or salesman
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search track sheets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle</label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="All vehicles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All vehicles</SelectItem>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salesman</label>
                  <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="All salesmen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All salesmen</SelectItem>
                      {salesmen.map(salesman => (
                        <SelectItem key={salesman.id} value={salesman.id}>
                          {salesman.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDate(undefined);
                      setSelectedVehicle('');
                      setSelectedSalesman('');
                    }}
                    className="w-full border-secondary/20 text-secondary hover:bg-secondary/10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {filteredSheets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No track sheets found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or create a new track sheet.</p>
                    <Button onClick={handleCreateNew} className="mt-4 aurora-button">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Track Sheet
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredSheets.map((sheet) => (
                      <Card key={sheet.id} className="aurora-card hover:glow-primary transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg text-gradient-aurora">{sheet.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(sheet.date), 'dd/MM/yyyy')}
                                </div>
                                {sheet.vehicleName && (
                                  <span>Vehicle: {sheet.vehicleName}</span>
                                )}
                                {sheet.salesmanName && (
                                  <span>Salesman: {sheet.salesmanName}</span>
                                )}
                                <span className="status-completed">
                                  {sheet.rows?.length || 0} orders
                                </span>
                              </div>
                              {sheet.notes && (
                                <p className="text-sm text-muted-foreground italic">
                                  {sheet.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreview(sheet)}
                                className="border-primary/20 text-primary hover:bg-primary/10"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrint(sheet)}
                                className="border-secondary/20 text-secondary hover:bg-secondary/10"
                              >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => handleExportPdf(sheet)}
                                className="aurora-button"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExportCsv(sheet)}
                                className="border-accent/20 text-accent hover:bg-accent/10"
                              >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                CSV
                              </Button>
                            </div>
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
        
        <TabsContent value="convert">
          <TrackSheetConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
