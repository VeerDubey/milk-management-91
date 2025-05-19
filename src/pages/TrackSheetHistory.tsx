
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Eye, Download, Plus } from 'lucide-react';
import { format, isWithinInterval, parseISO, subDays } from 'date-fns';
import { toast } from 'sonner';

export default function TrackSheetHistory() {
  const navigate = useNavigate();
  const { trackSheets, vehicles, salesmen } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  // Add guard clause for when trackSheets is undefined
  if (!trackSheets) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
            <p className="text-muted-foreground">View and manage your past track sheets</p>
          </div>
          <Button onClick={() => navigate('/track-sheet')}>
            <Plus className="mr-2 h-4 w-4" />
            New Track Sheet
          </Button>
        </div>
        
        <div className="flex justify-center items-center h-[400px]">
          <p>Track sheet data is loading or not available.</p>
        </div>
      </div>
    );
  }
  
  // Filter track sheets based on search term and date range
  const filteredTrackSheets = trackSheets.filter(sheet => {
    const matchesSearch = 
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sheet.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const sheetDate = parseISO(sheet.date);
    const withinDateRange = startDate && endDate 
      ? isWithinInterval(sheetDate, { start: startDate, end: endDate })
      : true;
    
    return matchesSearch && withinDateRange;
  });
  
  // Get vehicle and salesman names
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };
  
  const getSalesmanName = (salesmanId: string) => {
    const salesman = salesmen?.find(s => s.id === salesmanId);
    return salesman ? salesman.name : 'Unknown Salesman';
  };
  
  const handleViewTrackSheet = (id: string) => {
    navigate(`/track-sheet-detail/${id}`);
  };
  
  const handleDownloadTrackSheet = (id: string) => {
    // This would normally trigger a download
    toast.success('Track sheet download started');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
          <p className="text-muted-foreground">View and manage your past track sheets</p>
        </div>
        <Button onClick={() => navigate('/track-sheet')}>
          <Plus className="mr-2 h-4 w-4" />
          New Track Sheet
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Track Sheets</CardTitle>
          <CardDescription>View track sheets by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="search" className="text-sm font-medium block mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="start-date" className="text-sm font-medium block mb-1">Start Date</label>
              <DatePicker
                id="start-date"
                date={startDate}
                setDate={setStartDate}
              />
            </div>
            
            <div>
              <label htmlFor="end-date" className="text-sm font-medium block mb-1">End Date</label>
              <DatePicker
                id="end-date"
                date={endDate}
                setDate={setEndDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Sheet History</CardTitle>
          <CardDescription>
            {filteredTrackSheets.length} track sheets found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrackSheets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrackSheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {sheet.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{sheet.title}</TableCell>
                    <TableCell>{getVehicleName(sheet.vehicleId)}</TableCell>
                    <TableCell>{getSalesmanName(sheet.salesmanId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewTrackSheet(sheet.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadTrackSheet(sheet.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No track sheets found for the selected criteria.</p>
              <Button onClick={() => navigate('/track-sheet')}>Create Track Sheet</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
