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
import { TrackSheetConverter } from '@/components/track-sheet/TrackSheetConverter';
import { downloadTrackSheetPDF, printTrackSheetPDF } from '@/utils/trackSheetPdfGenerator';
import { 
  Printer, 
  Calendar, 
  FileSpreadsheet, 
  Search, 
  Plus, 
  FileDown, 
  FileText, 
  Eye, 
  Download,
  BarChart3,
  TrendingUp,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function TrackSheetHistory() {
  const navigate = useNavigate();
  const { trackSheets, vehicles, salesmen } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  
  // Filter track sheets based on search criteria
  const filteredSheets = trackSheets.filter(sheet => {
    const matchesSearch = sheet.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sheet.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate) {
      const sheetDate = new Date(sheet.date);
      matchesDate = sheetDate.toDateString() === selectedDate.toDateString();
    }
    
    const matchesVehicle = !selectedVehicle || sheet.vehicleId === selectedVehicle;
    const matchesSalesman = !selectedSalesman || sheet.salesmanId === selectedSalesman;
    
    return matchesSearch && matchesDate && matchesVehicle && matchesSalesman;
  });

  // Transform track sheet data for PDF generation
  const transformTrackSheetForPdf = (trackSheet: any) => {
    console.log('Transforming track sheet for PDF:', trackSheet);
    
    return {
      title: 'NAIK MILK DISTRIBUTORS',
      area: trackSheet.routeName || trackSheet.area || 'EICHER',
      date: format(new Date(trackSheet.date), 'dd/MM/yyyy'),
      rows: (trackSheet.rows || []).map((row: any) => ({
        name: row.customerName || row.name || 'Unknown Customer',
        quantities: row.quantities || {},
        totalQuantity: row.total || row.totalQuantity || 0,
        totalAmount: row.amount || row.totalAmount || 0
      }))
    };
  };

  // Enhanced PDF generation
  const handleExportPdf = async (trackSheet: any) => {
    if (!trackSheet) {
      toast.error('Invalid track sheet data');
      return;
    }

    setIsGeneratingPdf(trackSheet.id);
    
    try {
      console.log('Generating PDF for track sheet:', trackSheet);
      
      const pdfData = transformTrackSheetForPdf(trackSheet);
      const filename = `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}-${(trackSheet.name || 'sheet').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      await downloadTrackSheetPDF(pdfData, filename);
      toast.success('Track sheet PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please check your data and try again.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  // Enhanced print functionality
  const handlePrint = async (trackSheet: any) => {
    if (!trackSheet) {
      toast.error('Invalid track sheet data');
      return;
    }

    setIsGeneratingPdf(trackSheet.id);

    try {
      console.log('Printing track sheet:', trackSheet);
      
      const pdfData = transformTrackSheetForPdf(trackSheet);
      await printTrackSheetPDF(pdfData);
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Failed to print track sheet. Please try again.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  // Enhanced CSV export
  const handleExportCsv = async (trackSheet: any) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      csvContent += "S.No.,Customer,Date,Vehicle,Salesman,Products,Total Amount\n";
      
      // Add data rows
      (trackSheet.rows || []).forEach((row: any, index: number) => {
        const products = row.quantities ? Object.keys(row.quantities).filter(key => row.quantities[key] > 0).join('; ') : '';
        const vehicleName = vehicles.find(v => v.id === trackSheet.vehicleId)?.name || '';
        const salesmanName = salesmen.find(s => s.id === trackSheet.salesmanId)?.name || '';
        
        csvContent += `${index + 1},"${row.customerName || row.name || ''}","${format(new Date(trackSheet.date), 'dd/MM/yyyy')}","${vehicleName}","${salesmanName}","${products}","₹${row.totalAmount || row.amount || 0}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}-${(trackSheet.name || 'sheet').replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Track sheet exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Analytics data
  const totalSheets = filteredSheets.length;
  const totalOrders = filteredSheets.reduce((sum, sheet) => sum + (sheet.rows?.length || 0), 0);
  const totalAmount = filteredSheets.reduce((sum, sheet) => 
    sum + ((sheet.rows || []).reduce((rowSum: number, row: any) => rowSum + (row.totalAmount || row.amount || 0), 0)), 0
  );
  
  return (
    <div className="page-background">
      <div className="container mx-auto py-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              Track Sheet History
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your delivery track sheets with advanced features
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/track-sheet-advanced')} className="modern-button">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sheets</p>
                  <p className="text-3xl font-bold gradient-text">{totalSheets}</p>
                </div>
                <FileText className="h-10 w-10 text-primary animate-float" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold gradient-text">{totalOrders}</p>
                </div>
                <Package className="h-10 w-10 text-secondary animate-float" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-3xl font-bold gradient-text">₹{totalAmount.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-accent animate-float" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg per Sheet</p>
                  <p className="text-3xl font-bold gradient-text">
                    ₹{totalSheets > 0 ? (totalAmount / totalSheets).toFixed(2) : '0.00'}
                  </p>
                </div>
                <BarChart3 className="h-10 w-10 text-success animate-float" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 glass-card">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="convert">Convert Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="gradient-text">Filter Track Sheets</CardTitle>
                <CardDescription>
                  Search and filter your track sheets by various criteria
                </CardDescription>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search track sheets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 modern-input"
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                      className="w-full"
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
                      <Button onClick={() => navigate('/track-sheet-advanced')} className="mt-4 modern-button">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Track Sheet
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredSheets.map((sheet) => (
                        <Card key={sheet.id} className="glass-card hover-lift">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-xl gradient-text">{sheet.name}</h3>
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
                                  <Badge className="status-completed">
                                    {sheet.rows?.length || 0} orders
                                  </Badge>
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
                                  onClick={() => handlePrint(sheet)}
                                  disabled={isGeneratingPdf === sheet.id}
                                >
                                  <Printer className="mr-2 h-4 w-4" />
                                  {isGeneratingPdf === sheet.id ? 'Printing...' : 'Print'}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleExportPdf(sheet)}
                                  className="modern-button"
                                  disabled={isGeneratingPdf === sheet.id}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  {isGeneratingPdf === sheet.id ? 'Generating...' : 'PDF'}
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportCsv(sheet)}
                                  disabled={isGeneratingPdf === sheet.id}
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
    </div>
  );
}
