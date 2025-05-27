
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
import { Printer, Calendar, FileSpreadsheet, Search, Plus, FileDown, FileText } from 'lucide-react';
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
    navigate('/track-sheet');
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
      const doc = generateAdvancedTrackSheetPdf(trackSheet, productNames, []);
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
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-moody">Track Sheet History</h1>
          <p className="text-muted-foreground">
            View and manage your delivery track sheets
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNew} className="moody-button">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 moody-card">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="convert">Convert Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card className="moody-card">
            <CardHeader>
              <CardTitle className="text-gradient-moody">Filter Track Sheets</CardTitle>
              <CardDescription>
                Search and filter your track sheets by date, vehicle, or salesman
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search track sheets..."
                    className="pl-10 moody-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="w-full"
                    placeholderText="Select date..."
                  />
                </div>
                
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="moody-input">
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent className="moody-card">
                    <SelectItem value="">All vehicles</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedSalesman} onValueChange={setSelectedSalesman}>
                  <SelectTrigger className="moody-input">
                    <SelectValue placeholder="All salesmen" />
                  </SelectTrigger>
                  <SelectContent className="moody-card">
                    <SelectItem value="">All salesmen</SelectItem>
                    {salesmen.map(salesman => (
                      <SelectItem key={salesman.id} value={salesman.id}>
                        {salesman.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {filteredSheets.length === 0 ? (
                  <div className="text-center py-10">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No track sheets found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No track sheets match your current filters.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedDate(undefined);
                        setSelectedVehicle('');
                        setSelectedSalesman('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredSheets.map(sheet => (
                    <Card key={sheet.id} className="overflow-hidden moody-card">
                      <CardHeader className="bg-primary/10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <CardTitle className="text-xl text-gradient-moody">{sheet.name || 'Track Sheet'}</CardTitle>
                              <CardDescription>
                                {format(new Date(sheet.date), 'PPP')}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="hover:bg-primary/20 hover:text-primary"
                              onClick={() => handleExportPdf(sheet)}
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="hover:bg-secondary/20 hover:text-secondary"
                              onClick={() => handleExportCsv(sheet)}
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-1" />
                              CSV
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="hover:bg-accent/20 hover:text-accent"
                              onClick={() => handlePrint(sheet)}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <TrackSheetDetails trackSheet={sheet} />
                      </CardContent>
                    </Card>
                  ))
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
