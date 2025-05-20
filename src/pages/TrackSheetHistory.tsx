import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrackSheetDetails } from '@/components/track-sheet/TrackSheetDetails';

export default function TrackSheetHistory() {
  const { trackSheets, vehicles, salesmen, deleteTrackSheet } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterSalesman, setFilterSalesman] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTrackSheet, setSelectedTrackSheet] = useState<any>(null);

  // Filter track sheets
  const filteredTrackSheets = trackSheets.filter(ts => {
    const matchesSearch = 
      searchQuery === '' || 
      (ts.name || ts.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ts.routeName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVehicle = filterVehicle === 'all' || ts.vehicleId === filterVehicle;
    const matchesSalesman = filterSalesman === 'all' || ts.salesmanId === filterSalesman;
    
    // Period filtering logic
    if (selectedPeriod === 'all') return matchesSearch && matchesVehicle && matchesSalesman;
    
    const tsDate = new Date(ts.date);
    const today = new Date();
    
    if (selectedPeriod === 'today') {
      return matchesSearch && matchesVehicle && matchesSalesman && 
        tsDate.toDateString() === today.toDateString();
    }
    
    if (selectedPeriod === 'thisWeek') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return matchesSearch && matchesVehicle && matchesSalesman && 
        tsDate >= startOfWeek;
    }
    
    if (selectedPeriod === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return matchesSearch && matchesVehicle && matchesSalesman && 
        tsDate >= startOfMonth;
    }
    
    return matchesSearch && matchesVehicle && matchesSalesman;
  });
  
  // Sort by most recent
  const sortedTrackSheets = [...filteredTrackSheets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleViewDetails = (trackSheet: any) => {
    setSelectedTrackSheet(trackSheet);
    setDetailsOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this track sheet?")) {
      deleteTrackSheet(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
          <p className="text-muted-foreground">View and manage all track sheets</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search track sheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesman">Salesman</Label>
              <Select value={filterSalesman} onValueChange={setFilterSalesman}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by salesman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesmen</SelectItem>
                  {salesmen.map(salesman => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrackSheets.length > 0 ? (
                  sortedTrackSheets.map(sheet => {
                    const vehicle = vehicles.find(v => v.id === sheet.vehicleId);
                    const salesman = salesmen.find(s => s.id === sheet.salesmanId);
                    const totalItems = sheet.rows.reduce((total: number, row: any) => total + row.total, 0);
                    
                    return (
                      <TableRow key={sheet.id}>
                        <TableCell>{format(new Date(sheet.date), 'yyyy-MM-dd')}</TableCell>
                        <TableCell className="font-medium">{sheet.name || sheet.title || 'Untitled'}</TableCell>
                        <TableCell>{vehicle?.name || 'Not assigned'}</TableCell>
                        <TableCell>{salesman?.name || 'Not assigned'}</TableCell>
                        <TableCell>{sheet.rows.length}</TableCell>
                        <TableCell>{totalItems}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(sheet)}>
                              View
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(sheet.id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No track sheets found. Create a new track sheet first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Track Sheet Details</DialogTitle>
          </DialogHeader>
          {selectedTrackSheet && (
            <TrackSheetDetails trackSheet={selectedTrackSheet} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
